#!/usr/bin/env python3
"""Train a quadruped locomotion policy using PPO in Isaac Sim.

Uses rl_games for PPO with asymmetric actor-critic. The actor observes
proprioception only; the critic receives privileged sim state (terrain
heightfield, contact forces) for faster convergence.
"""

import argparse
import os
from dataclasses import dataclass, field

import numpy as np
import torch


@dataclass
class TrainConfig:
    env_name: str = "QuadrupedLocomotion"
    num_envs: int = 4096
    max_iterations: int = 3000
    learning_rate: float = 3e-4
    gamma: float = 0.99
    lam: float = 0.95
    clip_range: float = 0.2
    entropy_coef: float = 0.01
    batch_size: int = 16384
    mini_epochs: int = 5
    checkpoint_dir: str = "weights"
    headless: bool = True
    terrain_curriculum: bool = True
    domain_randomization: bool = True
    dr_config: dict = field(default_factory=lambda: {
        "friction_range": [0.4, 1.5],
        "mass_scale_range": [0.85, 1.15],
        "motor_strength_range": [0.9, 1.1],
        "latency_range_ms": [0, 20],
        "push_interval_s": 8,
        "push_force_range": [0, 50],
    })


@dataclass
class RewardConfig:
    linear_velocity_tracking: float = 1.0
    angular_velocity_tracking: float = 0.5
    body_orientation_penalty: float = -5.0
    joint_torque_penalty: float = -0.0002
    action_rate_penalty: float = -0.01
    foot_slip_penalty: float = -0.1
    air_time_reward: float = 0.5
    survival_reward: float = 0.2


def compute_reward(state: dict, cmd: dict, reward_cfg: RewardConfig) -> float:
    """Compute per-step reward from simulation state and velocity command."""
    vel_error = np.linalg.norm(
        np.array([state["base_lin_vel"][0], state["base_lin_vel"][1]])
        - np.array([cmd["vx"], cmd["vy"]])
    )
    ang_error = abs(state["base_ang_vel"][2] - cmd["wz"])

    reward = (
        reward_cfg.linear_velocity_tracking * np.exp(-vel_error / 0.25)
        + reward_cfg.angular_velocity_tracking * np.exp(-ang_error / 0.25)
        + reward_cfg.body_orientation_penalty * (state["orientation_error"] ** 2)
        + reward_cfg.joint_torque_penalty * np.sum(np.square(state["torques"]))
        + reward_cfg.action_rate_penalty * np.sum(np.square(state["action_diff"]))
        + reward_cfg.foot_slip_penalty * state["foot_slip_sum"]
        + reward_cfg.air_time_reward * state["feet_air_time_bonus"]
        + reward_cfg.survival_reward
    )
    return float(reward)


def make_env(cfg: TrainConfig):
    """Create the Isaac Sim vectorized quadruped environment.

    This is a placeholder — the real implementation wraps
    omni.isaac.lab or OmniIsaacGymEnvs with the appropriate
    task configuration.
    """
    raise NotImplementedError(
        "Requires Isaac Sim + OmniIsaacGymEnvs. "
        "See https://github.com/NVIDIA-Omniverse/OmniIsaacGymEnvs "
        "for environment setup."
    )


def train(cfg: TrainConfig):
    os.makedirs(cfg.checkpoint_dir, exist_ok=True)

    print(f"Training {cfg.env_name} with {cfg.num_envs} parallel envs")
    print(f"  Max iterations: {cfg.max_iterations}")
    print(f"  Domain randomization: {cfg.domain_randomization}")
    print(f"  Terrain curriculum: {cfg.terrain_curriculum}")
    print(f"  Checkpoint dir: {cfg.checkpoint_dir}")

    env = make_env(cfg)  # noqa: F841 — used by rl_games runner


def main():
    parser = argparse.ArgumentParser(description="Train quadruped locomotion policy")
    parser.add_argument("--env", default="QuadrupedLocomotion")
    parser.add_argument("--num_envs", type=int, default=4096)
    parser.add_argument("--max_iterations", type=int, default=3000)
    parser.add_argument("--headless", action="store_true")
    parser.add_argument("--no-dr", action="store_true", help="Disable domain randomization")
    parser.add_argument("--no-curriculum", action="store_true", help="Disable terrain curriculum")
    args = parser.parse_args()

    cfg = TrainConfig(
        env_name=args.env,
        num_envs=args.num_envs,
        max_iterations=args.max_iterations,
        headless=args.headless,
        domain_randomization=not args.no_dr,
        terrain_curriculum=not args.no_curriculum,
    )
    train(cfg)


if __name__ == "__main__":
    main()
