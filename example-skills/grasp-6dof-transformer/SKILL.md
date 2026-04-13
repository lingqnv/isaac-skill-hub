---
name: grasp-6dof-transformer
version: "1.2.0"
display_name: 6-DOF Grasp Planning Transformer
description: "Plan 6-DOF grasps on point clouds using transformer-based pose estimation and deep reinforcement learning validation"
license: "Apache-2.0"
compatibility: ">=Isaac Sim 2024.1"
author: "NVIDIA Isaac Robotics"
domain: "manipulation"
tags: ["grasping", "point-cloud", "transformer", "6dof", "manipulation"]
execution: "hybrid"
inputs:
  - name: "point_cloud"
    type: "sensor_msgs/PointCloud2"
    description: "Input point cloud from depth camera or lidar"
  - name: "rgb_image"
    type: "sensor_msgs/Image"
    description: "Optional RGB image for visual context (8UC3, 640x480 or higher)"
    optional: true
outputs:
  - name: "grasp_poses"
    type: "geometry_msgs/PoseArray"
    description: "Top-N grasp poses ranked by confidence (0-1)"
  - name: "grasp_scores"
    type: "std_msgs/Float32MultiArray"
    description: "Confidence scores for each grasp"
  - name: "joint_trajectory"
    type: "trajectory_msgs/JointTrajectory"
    description: "Optimal joint trajectory to execute best grasp"
parameters:
  - name: "num_grasps"
    type: "integer"
    default: 5
    min: 1
    max: 50
    description: "Number of grasp candidates to return"
  - name: "confidence_threshold"
    type: "float"
    default: 0.6
    min: 0.0
    max: 1.0
    description: "Minimum confidence score to include grasp"
  - name: "model_path"
    type: "string"
    default: "/opt/isaac/models/grasp_transformer_v2.onnx"
    description: "Path to transformer model weights"
  - name: "gripper_width_mm"
    type: "float"
    default: 100.0
    min: 50.0
    max: 200.0
    description: "Parallel gripper max opening width in mm"
  - name: "planning_time_ms"
    type: "integer"
    default: 200
    min: 50
    max: 1000
    description: "Max planning time; 50-100ms for inference, rest for validation"
platforms:
  - "x86_64"
  - "arm64"
dependencies:
  - name: "cuda"
    version: ">=11.8"
  - name: "cudnn"
    version: ">=8.6"
  - name: "ros2"
    version: ">=Humble"
  - name: "onnxruntime-gpu"
    version: ">=1.16"
  - name: "point-cloud-processing"
    version: ">=1.0"
validation:
  - type: "hardware"
    requirement: "GPU with 4GB+ VRAM"
    description: "NVIDIA T4 or better recommended"
  - type: "ros_topic"
    requirement: "Input point cloud topic publishing at >=5Hz"
  - type: "calibration"
    requirement: "Camera intrinsics and extrinsics must be calibrated"
---

# 6-DOF Grasp Planning Transformer

Plan collision-free 6-DOF grasps on arbitrary objects using deep learning and grasp quality metrics validated via physics simulation.

## Quick Reference

| Aspect | Detail |
|--------|--------|
| **Execution** | Hybrid (GPU inference + CPU planning) |
| **Latency** | 150-300ms (varies with point cloud size) |
| **GPU Memory** | ~2.5GB |
| **Throughput** | 3-5 grasp plans per second |
| **Input Rate** | 5-10 Hz recommended |

## Getting Started

```bash
# Launch the skill node
ros2 launch grasp_6dof_transformer grasp_planner.launch.py \
  input_topic:=/camera/depth/points \
  output_topic:=/grasp_planner/grasps

# Test with sample point cloud
ros2 run grasp_6dof_transformer test_grasp_client.py \
  --num_grasps 5 \
  --confidence_threshold 0.65
```

## Parameters

| Parameter | Type | Range | Default | Notes |
|-----------|------|-------|---------|-------|
| `num_grasps` | int | 1-50 | 5 | Reduce for faster planning on edge devices |
| `confidence_threshold` | float | 0.0-1.0 | 0.6 | Use 0.7+ for high-precision tasks |
| `gripper_width_mm` | float | 50-200 | 100 | Must match physical gripper |
| `planning_time_ms` | int | 50-1000 | 200 | Increase if grasps are suboptimal |

## Common Workflows

### High-Precision Bin Picking
Configure for maximum quality over speed:
```yaml
num_grasps: 10
confidence_threshold: 0.75
planning_time_ms: 400
```

### Fast Assembly-Line Picking
Optimize for throughput:
```yaml
num_grasps: 3
confidence_threshold: 0.55
planning_time_ms: 100
```

### Large Object Handling
Increase gripper aperture for bulky items:
```yaml
gripper_width_mm: 150
num_grasps: 8
confidence_threshold: 0.65
```

## Troubleshooting

**Q: Grasps are poor quality or colliding with surface**
- Check point cloud density; minimum 10k points recommended
- Increase `planning_time_ms` to 300-400ms
- Verify gripper CAD model in collision checker
- Ensure camera calibration is recent

**Q: GPU memory errors or out-of-memory crashes**
- Reduce `num_grasps` to 3-5
- Downsample input point cloud to 50k points
- Check for memory leaks with `nvidia-smi dmon`

**Q: Inconsistent results between runs**
- Model is stochastic by design; use ensemble voting with `num_grasps >= 5`
- Set random seed via `ROS_RANDOM_SEED` for reproducibility
