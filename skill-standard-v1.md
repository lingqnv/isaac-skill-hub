# Isaac Skill Standard v1.0

**Based on the Anthropic Skill Format** — extended for physical AI and robotics workflows.

---

## Overview

The Isaac Skill Standard extends Anthropic's directory-based skill format (SKILL.md + frontmatter + progressive disclosure) with robotics-specific fields for hardware compatibility, sim/real execution contexts, typed I/O interfaces, and automated validation.

Every Isaac skill is **a directory** — not a single file. The directory is the atomic unit. It can be zipped as a `.skill` package for distribution (same as Anthropic's packaging convention).

---

## Directory Structure

```
my-skill/
├── SKILL.md                     # [REQUIRED] Core contract — frontmatter + instructions
├── LICENSE.txt                  # [REQUIRED] SPDX-compatible license
├── scripts/                     # Executable code
│   ├── main.py                  #   Entry point
│   └── utils.py                 #   Supporting code
├── references/                  # Detailed documentation (progressive disclosure)
│   ├── api.md                   #   API reference
│   ├── tuning-guide.md          #   Parameter tuning guide
│   └── ros-integration.md       #   ROS2 integration notes
├── tests/                       # Validation & testing
│   ├── test_unit.py             #   Unit tests
│   ├── test_sim.py              #   Isaac Sim integration tests
│   └── warehouse_scene.usd      #   Test scene file
├── examples/                    # Usage examples
│   ├── basic_usage.py
│   └── advanced_pipeline.py
├── assets/                      # Models, configs, templates
│   ├── default_config.yaml
│   └── trained_model.onnx
└── launch/                      # ROS2 launch files (if applicable)
    └── main.launch.py
```

**Minimum viable skill:** `SKILL.md` + `LICENSE.txt` + at least one file in `scripts/`.

---

## SKILL.md Format

The SKILL.md is the core contract. It uses **YAML frontmatter** (matching Anthropic's convention) extended with robotics-specific fields, followed by Markdown documentation.

### Frontmatter Schema

```yaml
---
# ─── ANTHROPIC STANDARD FIELDS ───────────────────────────────────────────────
name: nav-slam-lidar                      # [REQUIRED] kebab-case identifier
description: >-                           # [REQUIRED] Triggering description — when should
  Real-time LiDAR SLAM for warehouse        an agent select this skill? Be specific about
  navigation. Use when the robot needs       contexts, inputs, and capabilities.
  to build a map and localize in indoor
  environments with LiDAR sensors.
license: Apache-2.0                       # [REQUIRED] SPDX identifier or "Proprietary"
compatibility: >-                         # Tool/system dependencies
  Requires Isaac SDK >=3.0, ROS2 Humble,
  NVIDIA GPU with >=4GB VRAM

# ─── ISAAC EXTENSIONS ─────────────────────────────────────────────────────────
version: 1.2.0                            # [REQUIRED] Semantic version
display_name: LiDAR SLAM Navigation       # Human-readable name (for hub display)

# Author & provenance
author:
  name: Jane Chen
  email: jane@robolabs.com
  organization: RoboLabs Inc.
  url: https://github.com/janechen

# Domain classification
domain: navigation                        # [REQUIRED] Primary domain
  # One of: navigation | manipulation | perception | data_training
  #         simulation | control | safety | integration
tags:                                     # Secondary tags for discovery
  - slam
  - lidar
  - mapping
  - warehouse

# Execution context
execution:
  context: hybrid                         # [REQUIRED] sim | real | hybrid
  entry_point: scripts/main.py            # [REQUIRED] Relative to skill root
  runtime: python                         # python | cpp | ros2_node | bash
  launch_file: launch/main.launch.py      # Optional ROS2 launch
  resources:                              # Hardware requirements
    gpu: true
    min_gpu_memory: 4GB
    min_ram: 8GB

# Typed interfaces (how this skill connects to the robot/pipeline)
inputs:
  - name: lidar_scan
    type: sensor_msgs/LaserScan
    description: 2D or 3D LiDAR scan data
    required: true
  - name: odometry
    type: nav_msgs/Odometry
    description: Robot odometry for motion estimation
    required: true

outputs:
  - name: occupancy_map
    type: nav_msgs/OccupancyGrid
    description: Generated occupancy grid
  - name: robot_pose
    type: geometry_msgs/PoseStamped
    description: Current pose in map frame

# Configurable parameters
parameters:
  - name: map_resolution
    type: float
    default: 0.05
    range: [0.01, 1.0]
    unit: meters
    description: Grid cell resolution
  - name: loop_closure
    type: bool
    default: true
    description: Enable loop closure detection

# Platform compatibility
platforms:
  isaac_sdk: ">=3.0.0, <4.0.0"
  isaac_sim: ">=4.0.0"
  ros:
    - ros2-humble
    - ros2-iron
  hardware:
    - NVIDIA Jetson Orin
    - x86_64 + NVIDIA RTX

# Skill dependencies
dependencies:
  skills:
    - name: perception-pointcloud-filter
      version: ">=1.0.0"
  packages:
    - name: open3d
      source: pip
      version: ">=0.17.0"

# Sim validation criteria (for automated testing in Isaac Sim)
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
```

### Markdown Body

After frontmatter, the SKILL.md body follows Anthropic's progressive disclosure pattern:

```markdown
# LiDAR SLAM Navigation

One-paragraph summary of what this skill does and when to use it.

## Quick Reference

| Task | Guide |
|------|-------|
| Basic SLAM mapping | See examples/basic_usage.py |
| Multi-floor navigation | See references/tuning-guide.md |
| ROS2 integration | See references/ros-integration.md |
| Custom environments | See references/api.md |

## Getting Started

Step-by-step quickstart with the simplest useful invocation.

## Parameters

Table of tunable parameters with recommended values for common scenarios.

## Common Workflows

2-3 most common usage patterns with code snippets.

## Troubleshooting

Known issues, failure modes, and how to debug.
```

---

## Key Design Principles

### 1. SKILL.md Is the Contract

Everything flows from the SKILL.md. No skill exists without a valid one. The frontmatter is machine-readable; the body is human-readable. Both are required.

### 2. Progressive Disclosure (Anthropic Pattern)

Three levels of detail, loaded on demand:

| Level | Content | When Loaded |
|-------|---------|-------------|
| **Metadata** | name + description (~100 words) | Always — used for skill selection/search |
| **SKILL.md body** | Instructions + quick reference (<500 lines) | When skill is selected/triggered |
| **references/** | Deep docs, API details, tuning guides | On-demand when specific guidance needed |

### 3. Description Is the Trigger

The `description` field is the most important field for discovery. It should be written from the perspective of "when should an agent or user reach for this skill?" — not a marketing blurb. Be specific about inputs, contexts, and capabilities.

### 4. Compatibility With Anthropic Ecosystem

Isaac skills are valid Anthropic skills. An Isaac skill can be installed in Claude Code or Cowork and work as a knowledge/instruction skill. The robotics extensions (inputs, outputs, execution, validation) are additional metadata that Isaac Claw and the hub understand, but they don't break standard skill loading.

### 5. `.skill` Packaging

A skill directory zipped with a `.skill` extension is the distribution format. Same as Anthropic's convention:

```bash
# Package
cd my-skill && zip -r ../my-skill.skill .

# Install via CLI
isaac-hub install my-skill.skill

# Or install from hub
isaac-hub install nav-slam-lidar
```

---

## Field Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique kebab-case identifier |
| `description` | string | Triggering description — when to use this skill |
| `license` | string | SPDX identifier or "Proprietary" |
| `version` | string | Semantic version (MAJOR.MINOR.PATCH) |
| `domain` | enum | Primary domain classification |
| `execution.context` | enum | sim, real, or hybrid |
| `execution.entry_point` | string | Path to main executable |

### Robotics-Specific Fields

| Field | Type | Description |
|-------|------|-------------|
| `inputs` | array | Typed input interfaces (ROS msg types or custom) |
| `outputs` | array | Typed output interfaces |
| `parameters` | array | Configurable parameters with types, defaults, ranges |
| `platforms` | object | Isaac SDK, Isaac Sim, ROS, hardware compatibility |
| `validation` | object | Isaac Sim test scene + success criteria |
| `execution.resources` | object | GPU, RAM, CPU requirements |
| `dependencies.skills` | array | Other Isaac skills this depends on |

### Hub-Populated Fields (read-only)

These are set by the Isaac Skill Hub upon publication. Authors do not set these.

| Field | Description |
|-------|-------------|
| `hub.published_at` | Publication timestamp |
| `hub.hub_score` | Composite quality/usage score (0-100) |
| `hub.downloads` | Total and 30-day download counts |
| `hub.active_deployments` | Opt-in deployment telemetry count |
| `hub.rating` | Community rating (1-5 stars) |
| `hub.validation_badge` | Passed automated sim testing |
| `hub.certified_badge` | NVIDIA domain expert review |
| `hub.maintenance_status` | active / maintained / deprecated / archived |

---

## Versioning

Semantic versioning with robotics semantics:

- **MAJOR**: Breaking changes to inputs, outputs, or parameters
- **MINOR**: New capabilities, new optional parameters, backward-compatible
- **PATCH**: Bug fixes, documentation, performance improvements

---

## Domains

| Domain | Description | Examples |
|--------|-------------|----------|
| `navigation` | Movement, mapping, localization | SLAM, path planning, multi-robot coordination |
| `manipulation` | Object interaction | Grasp planning, assembly, force control |
| `perception` | Understanding the world | Detection, pose estimation, scene understanding |
| `data_training` | Data generation and ML | Domain randomization, annotation, curriculum learning |
| `simulation` | Virtual environments | Scene generation, physics tuning, digital twins |
| `control` | Low-level control | PID, RL policies, MPC |
| `safety` | Safety systems | Zone monitoring, e-stop, compliance |
| `integration` | Connecting systems | ROS bridges, cloud, edge deployment |
