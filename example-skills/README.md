# Isaac Skill Hub Example Skills

Production-quality robotics skills demonstrating the extended SKILL.md format for Isaac Sim and ROS2 integration.

## Skills Created

### 1. Grasp 6-DOF Transformer
**Location:** `grasp-6dof-transformer/SKILL.md`
- **Domain:** Manipulation
- **Type:** Hybrid execution (GPU + CPU)
- **Inputs:** PointCloud2, optional RGB image
- **Outputs:** GraspPose array, confidence scores, JointTrajectory
- **Key Features:** Transformer-based 6-DOF grasp planning, collision checking, DRL validation
- **Latency:** 150-300ms | **Throughput:** 3-5 plans/sec

### 2. Perception YOLO ROS2
**Location:** `perception-yolo-ros2/SKILL.md`
- **Domain:** Perception  
- **Type:** Hybrid execution (GPU inference + CPU post-processing)
- **Inputs:** Image, CameraInfo
- **Outputs:** DetectedObjects, BoundingBoxes, labeled image
- **Key Features:** YOLOv8/v9 support, multi-scale inference, NMS filtering, tensorrt optimization
- **Latency:** 30-100ms | **Throughput:** 10-30 FPS

### 3. Safety Zone Monitor
**Location:** `safety-zone-monitor/SKILL.md`
- **Domain:** Safety
- **Type:** Real-world execution only
- **Inputs:** OccupancyGrid, PoseStamped, PointCloud2
- **Outputs:** SafetyZoneStatus, EmergencyStop
- **Key Features:** ISO 13482 compliance, 3-zone monitoring, human detection, <100ms e-stop
- **Monitor Frequency:** 100+ Hz | **E-Stop Latency:** <100ms

### 4. Domain Randomization Factory
**Location:** `domain-rand-factory/SKILL.md`
- **Domain:** Data & Training
- **Type:** Sim-only execution
- **Inputs:** USD scene, randomization config
- **Outputs:** Randomized scenes, RGB/depth images, annotation JSON
- **Key Features:** Material/lighting/pose randomization, semantic segmentation, synthetic data generation
- **Throughput:** 50-200 images/sec | **Typical Scale:** 10k-100k images

## SKILL.md Format Specification

Each skill includes:

### Frontmatter (YAML)
- **Basic:** name, version, display_name, description, license, author
- **Technical:** domain, tags, execution, inputs/outputs with ROS message types
- **Config:** parameters with type, range, default, description
- **Requirements:** platforms, dependencies, validation rules
- **Metadata:** compatibility, description (trigger-oriented for skill discovery)

### Body (Markdown)
- **Summary:** What problem does it solve?
- **Quick Reference:** Key specs in table format
- **Getting Started:** Copy-paste launch commands and test snippets
- **Parameters Table:** Practical ranges and tuning guidance
- **Common Workflows:** 2-3 real-world configuration examples
- **Troubleshooting:** Q&A format addressing typical issues

## File Structure

```
example-skills/
├── grasp-6dof-transformer/
│   ├── SKILL.md          (161 lines)
│   └── LICENSE.txt       (Apache 2.0)
├── perception-yolo-ros2/
│   ├── SKILL.md          (170 lines)
│   └── LICENSE.txt
├── safety-zone-monitor/
│   ├── SKILL.md          (180 lines)
│   └── LICENSE.txt
└── domain-rand-factory/
    ├── SKILL.md          (193 lines)
    └── LICENSE.txt
```

## Key Design Patterns

### Robotics-Specific Inputs/Outputs
- Real ROS message types (sensor_msgs, geometry_msgs, trajectory_msgs)
- Practical data formats (PointCloud2 for 3D, Image for vision, OccupancyGrid for nav)
- Annotation/metadata as JSON or file directories

### Production-Quality Parameters
- Sensible defaults tuned for common scenarios
- Min/max ranges reflecting real hardware constraints
- Parameter descriptions include units and typical ranges
- Enum fields for discrete choices (model variants, backends)

### Execution Models
- **Hybrid:** GPU inference + CPU planning (compute-intensive perception/planning)
- **Real-world:** Safety-critical monitoring, hardware-dependent
- **Sim-only:** Synthetic data generation, training pipeline

### Practical Documentation
- Quick reference tables for at-a-glance key metrics
- Bash command examples (ROS2 launch syntax)
- Configuration examples for real workflows (bin picking, cobot safety, etc.)
- Troubleshooting tied to actual deployment issues (memory, latency, calibration)

## Validation & Compliance

Each skill documents validation requirements:
- Hardware constraints (GPU memory, CPU threads)
- ROS2 topic publish rates and formats
- Safety certifications (ISO 13482 for safety-zone-monitor)
- Calibration requirements (camera intrinsics, odometry)

## Integration with Isaac Skill Hub Registry

These example skills demonstrate:
1. Extended metadata for robotics domain
2. Clear trigger-phrase descriptions for skill discovery
3. ROS2 message type specifications
4. Practical parameter tuning guidance
5. Real-world workflow examples
6. Deployment troubleshooting

Use as templates when adding new skills to the hub.
