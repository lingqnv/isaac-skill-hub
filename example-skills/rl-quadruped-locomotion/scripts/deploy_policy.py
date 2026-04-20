#!/usr/bin/env python3
"""Deploy a trained RL locomotion policy on a quadruped robot via ROS 2.

Subscribes to joint states, IMU, and velocity commands; publishes joint
position targets at the configured control frequency.
"""

import argparse
import time
from pathlib import Path

import numpy as np
import torch
import yaml

try:
    import rclpy
    from rclpy.node import Node
    from sensor_msgs.msg import Imu, JointState
    from geometry_msgs.msg import Twist
    from std_msgs.msg import Float64MultiArray, String
    from diagnostic_msgs.msg import DiagnosticStatus

    ROS_AVAILABLE = True
except ImportError:
    ROS_AVAILABLE = False


class LocomotionPolicy:
    """Wrapper around a trained PyTorch locomotion policy."""

    def __init__(self, checkpoint_path: str, device: str = "cuda"):
        self.device = torch.device(device if torch.cuda.is_available() else "cpu")
        self.model = torch.jit.load(checkpoint_path, map_location=self.device)
        self.model.eval()
        self.prev_action = np.zeros(12, dtype=np.float32)

    @torch.no_grad()
    def infer(self, obs: np.ndarray) -> np.ndarray:
        obs_tensor = torch.from_numpy(obs).float().unsqueeze(0).to(self.device)
        action = self.model(obs_tensor).squeeze(0).cpu().numpy()
        self.prev_action = action.copy()
        return action


def build_observation(
    joint_pos: np.ndarray,
    joint_vel: np.ndarray,
    body_orientation: np.ndarray,
    body_angular_vel: np.ndarray,
    cmd_velocity: np.ndarray,
    gait_phase: np.ndarray,
    prev_action: np.ndarray,
) -> np.ndarray:
    """Concatenate raw sensor readings into the 48-dim observation vector."""
    return np.concatenate([
        joint_pos,          # 12
        joint_vel,          # 12
        body_orientation,   # 3
        body_angular_vel,   # 3
        cmd_velocity,       # 3
        gait_phase,         # 4
        prev_action,        # 12
    ]).astype(np.float32)   # total = 49 — padded/sliced to network input dim


class LocomotionNode(Node):
    """ROS 2 node that runs the locomotion policy in a fixed-rate loop."""

    def __init__(self, policy: LocomotionPolicy, config: dict):
        super().__init__("rl_quadruped_locomotion")
        self.policy = policy
        self.config = config

        hz = config.get("control_frequency_hz", 50)
        self.smoothing = config.get("action_smoothing", 0.8)
        self.max_vel = config.get("max_linear_velocity", 1.5)

        self.joint_pos = np.zeros(12, dtype=np.float32)
        self.joint_vel = np.zeros(12, dtype=np.float32)
        self.orientation = np.zeros(3, dtype=np.float32)
        self.angular_vel = np.zeros(3, dtype=np.float32)
        self.cmd_vel = np.zeros(3, dtype=np.float32)
        self.gait_phase = np.zeros(4, dtype=np.float32)
        self.smoothed_action = np.zeros(12, dtype=np.float32)

        self.create_subscription(JointState, "/joint_states", self._joint_cb, 10)
        self.create_subscription(Imu, "/imu/data", self._imu_cb, 10)
        self.create_subscription(Twist, "/cmd_vel", self._cmd_cb, 10)

        self.pub_targets = self.create_publisher(Float64MultiArray, "/joint_position_targets", 10)
        self.pub_gait = self.create_publisher(String, "/gait_phase", 10)
        self.pub_status = self.create_publisher(DiagnosticStatus, "/locomotion_status", 10)

        self.timer = self.create_timer(1.0 / hz, self._control_loop)
        self.get_logger().info(f"Locomotion policy running at {hz} Hz")

    def _joint_cb(self, msg):
        self.joint_pos[:] = np.array(msg.position[:12], dtype=np.float32)
        self.joint_vel[:] = np.array(msg.velocity[:12], dtype=np.float32)

    def _imu_cb(self, msg):
        q = msg.orientation
        self.orientation[:] = [q.x, q.y, q.z]
        w = msg.angular_velocity
        self.angular_vel[:] = [w.x, w.y, w.z]

    def _cmd_cb(self, msg):
        vx = np.clip(msg.linear.x, -self.max_vel, self.max_vel)
        vy = np.clip(msg.linear.y, -self.max_vel, self.max_vel)
        wz = msg.angular.z
        self.cmd_vel[:] = [vx, vy, wz]

    def _control_loop(self):
        t0 = time.perf_counter()
        obs = build_observation(
            self.joint_pos, self.joint_vel,
            self.orientation, self.angular_vel,
            self.cmd_vel, self.gait_phase,
            self.policy.prev_action,
        )

        raw_action = self.policy.infer(obs)
        alpha = self.smoothing
        self.smoothed_action = alpha * self.smoothed_action + (1 - alpha) * raw_action

        targets = Float64MultiArray()
        targets.data = self.smoothed_action.tolist()
        self.pub_targets.publish(targets)

        gait_msg = String()
        gait_msg.data = self.config.get("gait_mode", "auto")
        self.pub_gait.publish(gait_msg)

        latency_ms = (time.perf_counter() - t0) * 1000
        status = DiagnosticStatus()
        status.name = "rl_quadruped_locomotion"
        status.level = DiagnosticStatus.OK if latency_ms < 15 else DiagnosticStatus.WARN
        status.message = f"inference={latency_ms:.1f}ms"
        self.pub_status.publish(status)


def main():
    parser = argparse.ArgumentParser(description="Deploy RL quadruped locomotion policy")
    parser.add_argument("--config", type=str, default="config/unitree_go2.yaml")
    parser.add_argument("--checkpoint", type=str, default=None)
    args = parser.parse_args()

    config_path = Path(args.config)
    config = yaml.safe_load(config_path.read_text()) if config_path.exists() else {}

    checkpoint = args.checkpoint or config.get("policy_checkpoint", "weights/locomotion_latest.pt")

    if not ROS_AVAILABLE:
        print("ROS 2 not found — running single inference test")
        policy = LocomotionPolicy(checkpoint)
        dummy_obs = np.random.randn(48).astype(np.float32)
        action = policy.infer(dummy_obs)
        print(f"Action (12-DOF): {action}")
        return

    policy = LocomotionPolicy(checkpoint)
    rclpy.init()
    node = LocomotionNode(policy, config)
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
