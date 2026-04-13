---
name: nav-slam-lidar
display_name: LiDAR SLAM Navigation
version: 1.2.0
description: >-
  Real-time LiDAR SLAM for warehouse navigation. Use when the robot needs
  to simultaneously build a map and localize in indoor environments using
  2D or 3D LiDAR sensors. Supports loop closure, multi-floor mapping,
  and dynamic obstacle handling. Triggers on: SLAM, LiDAR navigation,
  mapping, indoor localization, warehouse navigation.
license: Apache-2.0
compatibility: >-
  Requires Isaac SDK >=3.0, ROS2 Humble or Iron,
  NVIDIA GPU with >=4GB VRAM, open3d >=0.17

author:
  name: Jane Chen
  email: jane@nvidia.com
  organization: NVIDIA
  url: https://github.com/janechen

domain: navigation
tags:
  - slam
  - lidar
  - mapping
  - warehouse
  - logistics
  - localization

execution:
  context: hybrid
  entry_point: scripts/slam_nav.py
  runtime: python
  launch_file: launch/slam_nav.launch.py
  resources:
    gpu: true
    min_gpu_memory: 4GB
    min_ram: 8GB

inputs:
  - name: lidar_scan
    type: sensor_msgs/LaserScan
    description: 2D or 3D LiDAR point cloud data
    required: true
  - name: odometry
    type: nav_msgs/Odometry
    description: Robot odometry for motion estimation
    required: true
  - name: initial_pose
    type: geometry_msgs/PoseWithCovarianceStamped
    description: Optional initial pose hint
    required: false

outputs:
  - name: occupancy_map
    type: nav_msgs/OccupancyGrid
    description: Generated 2D occupancy grid
  - name: robot_pose
    type: geometry_msgs/PoseStamped
    description: Current robot pose in map frame
  - name: planned_path
    type: nav_msgs/Path
    description: Planned path to goal

parameters:
  - name: map_resolution
    type: float
    default: 0.05
    range: [0.01, 1.0]
    unit: meters
    description: Occupancy grid cell size
  - name: max_lidar_range
    type: float
    default: 30.0
    unit: meters
    description: Maximum LiDAR range to consider
  - name: loop_closure
    type: bool
    default: true
    description: Enable loop closure detection
  - name: update_rate
    type: float
    default: 10.0
    unit: hz
    description: Map update frequency

platforms:
  isaac_sdk: ">=3.0.0, <4.0.0"
  isaac_sim: ">=4.0.0"
  ros:
    - ros2-humble
    - ros2-iron
  hardware:
    - NVIDIA Jetson Orin
    - NVIDIA Jetson AGX
    - x86_64 + NVIDIA RTX

dependencies:
  skills:
    - name: perception-pointcloud-filter
      version: ">=1.0.0"
  packages:
    - name: open3d
      source: pip
      version: ">=0.17.0"
    - name: numpy
      source: pip
      version: ">=1.24.0"

validation:
  sim_scene: tests/warehouse_scene.usd
  criteria:
    - metric: map_coverage
      threshold: 0.85
      operator: ">="
    - metric: localization_rmse
      threshold: 0.15
      operator: "<="
      unit: meters
    - metric: completion_time
      threshold: 120
      operator: "<="
      unit: seconds
---

# LiDAR SLAM Navigation

Real-time SLAM navigation using LiDAR point clouds. Builds occupancy grid maps while simultaneously localizing the robot. Optimized for structured indoor environments like warehouses, factories, and logistics centers.

## Quick Reference

| Task | Guide |
|------|-------|
| Basic warehouse mapping | See `examples/basic_usage.py` |
| Multi-floor navigation | See `references/tuning-guide.md` |
| ROS2 integration | See `references/ros-integration.md` |
| Parameter tuning | See Parameters section below |
| Custom environments | See `references/api.md` |

## Getting Started

```python
from nav_slam_lidar import SlamNavigator

# Initialize with default warehouse config
navigator = SlamNavigator(
    map_resolution=0.05,
    loop_closure=True
)

# Start mapping
navigator.start(lidar_topic="/scan", odom_topic="/odom")

# Get current map and pose
current_map = navigator.get_map()
current_pose = navigator.get_pose()

# Navigate to a goal
navigator.go_to(x=5.0, y=3.0, theta=0.0)
```

## Parameters

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| `map_resolution` | 0.05m | 0.01-1.0m | Grid cell size. Lower = more detail, higher compute |
| `max_lidar_range` | 30.0m | — | Points beyond this range are discarded |
| `loop_closure` | true | — | Detects when robot revisits an area; corrects drift |
| `update_rate` | 10 Hz | 1-50 Hz | How often the map updates |

**Warehouse recommendation:** 0.05m resolution, loop closure on, 10Hz update.
**Large factory:** 0.1m resolution for lower compute, 5Hz update.

## Common Workflows

### 1. Map a New Warehouse
Run the skill in mapping-only mode, drive the robot through the full space, then save the map.

### 2. Localize in Known Map
Load a pre-built map and localize the robot within it — useful for daily operations after initial mapping.

### 3. Dynamic Re-mapping
Run in hybrid mode where the map continuously updates to handle rearranged racks or new obstacles.

## Troubleshooting

- **Map drift after long runs**: Enable loop closure and reduce update rate
- **Poor localization near glass**: Glass is LiDAR-transparent; add reflective tape or switch to radar
- **High CPU usage**: Increase map_resolution (larger cells = less compute)
