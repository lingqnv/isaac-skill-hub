---
name: rl-quadruped-locomotion
version: 1.0.0
description: >-
  Reinforcement-learning locomotion policy for quadruped robots.
  Use when a legged robot needs to walk, trot, or traverse uneven terrain
  with adaptive gait selection. Trains in Isaac Sim and deploys
  sim-to-real on NVIDIA Jetson-powered quadrupeds.
license: Apache-2.0
domain: control
execution:
  context: hybrid
  entry_point: scripts/deploy_policy.py
inputs:
  - name: joint_states
    type: sensor_msgs/JointState
    description: Current joint positions, velocities, and efforts for all 12 leg joints
    required: true
  - name: imu_data
    type: sensor_msgs/Imu
    description: Body IMU reading (orientation, angular velocity, linear acceleration)
    required: true
  - name: velocity_command
    type: geometry_msgs/Twist
    description: Desired base velocity command (linear x/y, angular z)
    required: true
  - name: terrain_heightmap
    type: sensor_msgs/Image
    description: Local elevation map around the robot for terrain-aware locomotion
    required: false
outputs:
  - name: joint_position_targets
    type: std_msgs/Float64MultiArray
    description: Target joint positions (12-DOF) sent to the low-level PD controller
  - name: gait_phase
    type: std_msgs/String
    description: "Active gait label: walk, trot, pace, bound, or stand"
  - name: locomotion_status
    type: diagnostic_msgs/DiagnosticStatus
    description: Policy health — inference latency, stability margin, foot slip alerts
parameters:
  - name: policy_checkpoint
    type: string
    default: weights/locomotion_latest.pt
    description: Path to the trained PyTorch policy checkpoint
  - name: control_frequency_hz
    type: int
    default: 50
    range: [20, 200]
    unit: Hz
    description: Policy inference rate — higher values improve smoothness at the cost of compute
  - name: max_linear_velocity
    type: float
    default: 1.5
    range: [0.1, 3.0]
    unit: m/s
    description: Velocity clamp for safety; reduce for indoor or payload-heavy operation
  - name: terrain_aware
    type: bool
    default: true
    description: Enable terrain heightmap integration for adaptive foot placement
  - name: gait_mode
    type: string
    default: auto
    description: "Gait selection — auto (policy chooses), or force: walk, trot, pace, bound"
  - name: action_smoothing
    type: float
    default: 0.8
    range: [0.0, 1.0]
    description: Exponential smoothing factor on action outputs to reduce jitter (0 = none, 1 = max)
  - name: sim_to_real_adaptation
    type: bool
    default: true
    description: Enable online domain adaptation layer for bridging sim-to-real gap
platforms:
  isaac_sim: ">=4.0.0"
  isaac_sdk: ">=3.0.0"
  ros: [ros2-humble, ros2-iron]
  hardware:
    - NVIDIA Jetson Orin
    - NVIDIA Jetson AGX Xavier
    - x86_64 + NVIDIA RTX
dependencies:
  packages:
    - name: torch
      source: pip
      version: ">=2.1.0"
    - name: numpy
      source: pip
      version: ">=1.24.0"
    - name: rl_games
      source: pip
      version: ">=1.6.0"
    - name: isaac-sim
      source: omniverse
      version: ">=4.0.0"
validation:
  sim_scene: tests/flat_terrain_scene.usd
  criteria:
    - metric: forward_velocity_tracking_error
      threshold: 0.15
      operator: "<="
      unit: m/s
    - metric: body_orientation_deviation
      threshold: 10.0
      operator: "<="
      unit: degrees
    - metric: mean_episode_length
      threshold: 500
      operator: ">="
      unit: steps
    - metric: foot_slip_rate
      threshold: 0.05
      operator: "<="
---

# RL Quadruped Locomotion

Reinforcement-learning locomotion controller for quadruped robots trained in Isaac Sim using PPO with asymmetric actor-critic. The policy maps proprioceptive observations (joint states, IMU, velocity commands) to 12-DOF joint position targets, enabling robust walking and trotting across varied terrain.

## Quick Reference

| Task | How |
|------|-----|
| Deploy on a real robot | `python scripts/deploy_policy.py --config config/unitree_go2.yaml` |
| Train a new policy | `python scripts/train.py --env QuadrupedLocomotion --headless` |
| Evaluate in sim | `python scripts/evaluate.py --checkpoint weights/locomotion_latest.pt` |
| Run validation tests | `python -m pytest tests/ -v` |

## Getting Started

### 1. Deploy a Pre-Trained Policy

```bash
# Source your ROS 2 workspace
source /opt/ros/humble/setup.bash

# Launch the locomotion controller
ros2 launch rl_quadruped_locomotion locomotion.launch.py \
    checkpoint:=weights/locomotion_latest.pt \
    robot:=unitree_go2
```

The node subscribes to `/joint_states`, `/imu/data`, and `/cmd_vel`, then publishes joint targets to `/joint_position_targets` at 50 Hz.

### 2. Train from Scratch in Isaac Sim

```bash
python scripts/train.py \
    --env QuadrupedLocomotion \
    --num_envs 4096 \
    --max_iterations 3000 \
    --headless
```

Training runs ~4096 parallel environments on a single RTX 4090. Expect convergence in roughly 30 minutes for flat terrain policies, 2-3 hours with rough terrain curriculum.

### 3. Sim-to-Real Transfer

The policy uses domain randomization during training (friction, mass, motor strength, latency injection) and an optional online adaptation module at deploy time:

```yaml
sim_to_real_adaptation: true   # Enables residual adaptation network
action_smoothing: 0.8          # Reduces high-frequency jitter from sim-real gap
```

## Parameters

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| `policy_checkpoint` | `weights/locomotion_latest.pt` | — | Trained model path |
| `control_frequency_hz` | 50 | 20–200 | Inference rate (Hz) |
| `max_linear_velocity` | 1.5 | 0.1–3.0 | Velocity clamp (m/s) |
| `terrain_aware` | true | — | Use heightmap for foot placement |
| `gait_mode` | auto | auto/walk/trot/pace/bound | Gait selection strategy |
| `action_smoothing` | 0.8 | 0.0–1.0 | Output smoothing factor |
| `sim_to_real_adaptation` | true | — | Online domain adaptation |

## Common Workflows

### Flat Indoor Navigation

For warehouse or office environments on flat ground:

```yaml
terrain_aware: false
gait_mode: trot
max_linear_velocity: 1.0
action_smoothing: 0.6
```

### Rough Outdoor Terrain

For construction sites, trails, or rubble:

```yaml
terrain_aware: true
gait_mode: auto
max_linear_velocity: 0.8
action_smoothing: 0.9
control_frequency_hz: 100
```

### Payload-Heavy Operation

When the robot carries significant additional mass:

```yaml
max_linear_velocity: 0.5
action_smoothing: 0.9
gait_mode: walk
```

## Architecture

```
Observations (dim=48)          Action (dim=12)
┌─────────────────────┐        ┌──────────────────┐
│ Joint pos (12)      │        │ Joint pos targets │
│ Joint vel (12)      │──MLP──▶│ (12 DOF)         │
│ Body orientation (3)│  256   │                  │
│ Body ang. vel (3)   │  128   └──────────────────┘
│ Cmd velocity (3)    │  64
│ Gait phase (4)      │
│ Previous action (12)│
└─────────────────────┘
```

The actor is a 3-layer MLP (256→128→64) with ELU activations, outputting joint position deltas. The critic receives privileged information (ground-truth terrain, contact forces) during training only.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Robot falls immediately | Wrong URDF joint ordering | Verify joint name mapping in `config/` matches your robot |
| Jerky motion | Smoothing too low or control rate too low | Increase `action_smoothing` to 0.9, `control_frequency_hz` to 100 |
| Won't walk on slopes | Terrain-aware mode disabled | Set `terrain_aware: true`, ensure heightmap topic is published |
| High latency warnings | GPU contention or slow checkpoint | Use TensorRT export: `python scripts/export_trt.py` |
| Drifts sideways | IMU miscalibrated or frame mismatch | Check IMU frame orientation matches `base_link` convention |
