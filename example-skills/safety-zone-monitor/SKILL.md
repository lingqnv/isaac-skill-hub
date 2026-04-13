---
name: safety-zone-monitor
version: "1.5.0"
display_name: Dynamic Safety Zone Monitor
description: "Real-time monitoring of ISO 13482 safety zones with dynamic collision detection and emergency stop capability"
license: "Apache-2.0"
compatibility: ">=Isaac Sim 2024.1, ROS2 Humble+"
author: "NVIDIA Isaac Robotics"
domain: "safety"
tags: ["safety", "iso-13482", "collision-detection", "e-stop", "occupancy-grid"]
execution: "real-world"
inputs:
  - name: "occupancy_grid"
    type: "nav_msgs/OccupancyGrid"
    description: "Local costmap from navigation stack or custom occupancy map"
  - name: "robot_pose"
    type: "geometry_msgs/PoseStamped"
    description: "Current robot pose from odometry or TF"
  - name: "point_cloud"
    type: "sensor_msgs/PointCloud2"
    description: "Real-time point cloud from depth sensors or lidar for immediate threat detection"
outputs:
  - name: "safety_status"
    type: "std_msgs/Bool"
    description: "True = safe, False = violation or emergency"
  - name: "zone_status"
    type: "geometry_msgs/TwistStamped"
    description: "Distance to nearest obstacle; zero twist if unsafe"
  - name: "emergency_stop"
    type: "std_msgs/Bool"
    description: "True triggers motor controllers and brake engagement"
parameters:
  - name: "nominal_zone_radius_m"
    type: "float"
    default: 2.0
    min: 0.5
    max: 10.0
    description: "Safe operating radius around robot (ISO 13482 default = 2m)"
  - name: "warning_zone_radius_m"
    type: "float"
    default: 1.0
    min: 0.2
    max: 5.0
    description: "Reduced-speed zone; must be < nominal_zone_radius"
  - name: "emergency_zone_radius_m"
    type: "float"
    default: 0.3
    min: 0.1
    max: 2.0
    description: "Triggers immediate emergency stop"
  - name: "monitoring_frequency_hz"
    type: "float"
    default: 100.0
    min: 10.0
    max: 200.0
    description: "Safety check frequency; 100+ Hz for certification"
  - name: "enable_human_presence_detection"
    type: "boolean"
    default: true
    description: "Enable thermal or depth-based human detection in zones"
  - name: "dwell_time_ms"
    type: "integer"
    default: 100
    min: 0
    max: 500
    description: "Time to confirm violation before emergency stop (human reaction time)"
platforms:
  - "x86_64"
  - "arm64"
  - "jetson-orin"
dependencies:
  - name: "ros2"
    version: ">=Humble"
  - name: "tf2"
    version: ">=0.13"
  - name: "nav2"
    version: ">=1.0"
  - name: "pcl"
    version: ">=1.13"
validation:
  - type: "certification"
    requirement: "ISO 13482:2014 collaborative robot safety"
    description: "Tested with human detection; emergency stop latency <100ms"
  - type: "ros_topic"
    requirement: "Input topics must publish at >=10Hz"
  - type: "real_world"
    requirement: "Must be deployed on actual robot hardware"
---

# Dynamic Safety Zone Monitor

Certifiable real-time safety monitoring for collaborative robots with ISO 13482 compliance and sub-100ms emergency stop latency.

## Quick Reference

| Aspect | Detail |
|--------|--------|
| **Execution** | Real-world only (no simulation) |
| **Monitor Frequency** | 100+ Hz (safety critical) |
| **E-Stop Latency** | <100ms (typical 50-80ms) |
| **Zones** | Nominal (2m), Warning (1m), Emergency (0.3m) |
| **Compliance** | ISO 13482:2014 collaborative robot safety |

## Getting Started

```bash
# Launch safety monitoring with robot hardware
ros2 launch safety_zone_monitor monitor.launch.py \
  robot_name:=manipulator \
  enable_e_stop:=true \
  dwell_time_ms:=100

# Verify safety status
ros2 topic echo /safety_zone_monitor/status
# Output: data: true (safe) or false (violation)
```

## Parameters

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `nominal_zone_radius_m` | float | 2.0 | ISO 13482 default for collaborative robots |
| `warning_zone_radius_m` | float | 1.0 | Robot reduces speed in this zone |
| `emergency_zone_radius_m` | float | 0.3 | Immediate e-stop triggers |
| `monitoring_frequency_hz` | float | 100.0 | Never reduce below 50 Hz for safety |
| `dwell_time_ms` | int | 100 | Allows human to react and retreat |

## Common Workflows

### Industrial Cobot Integration (ABB IRB1200)
Full ISO 13482 compliance with human monitoring:
```yaml
nominal_zone_radius_m: 2.0
warning_zone_radius_m: 1.0
emergency_zone_radius_m: 0.3
monitoring_frequency_hz: 100.0
enable_human_presence_detection: true
dwell_time_ms: 100
```

### Research Lab (No humans nearby)
Larger nominal zone, faster operation:
```yaml
nominal_zone_radius_m: 3.5
warning_zone_radius_m: 2.0
emergency_zone_radius_m: 0.5
monitoring_frequency_hz: 50.0
enable_human_presence_detection: false
dwell_time_ms: 0
```

### Mobile Manipulation Platform
Layered safety with costmap and point cloud fusion:
```yaml
nominal_zone_radius_m: 1.5
warning_zone_radius_m: 0.8
emergency_zone_radius_m: 0.25
enable_human_presence_detection: true
dwell_time_ms: 150
```

## Troubleshooting

**Q: Emergency stop triggers too frequently (false positives)**
- Increase `dwell_time_ms` to 150-200ms
- Check point cloud noise; apply voxel filtering
- Verify odometry/TF transforms are accurate
- Increase `emergency_zone_radius_m` slightly if environment is cluttered

**Q: Safety status updates lag or stutter**
- Confirm input topics publish at >=20Hz (prefer 50Hz+)
- Check CPU load; safety monitor should use <5% on modern hardware
- Reduce point cloud resolution if >100k points/frame
- Use faster occupancy grid (Nav2 costmap preferable to custom)

**Q: Human detection not working**
- Verify depth camera calibration and field of view coverage
- Check that `enable_human_presence_detection: true`
- Ensure human body heights are configured (0.5-2.0m typical)
- Test with optical marker or known test object in zone
