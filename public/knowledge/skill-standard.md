# Isaac Skill Standard v1.0

Based on the Anthropic Skill Format — extended for physical AI and robotics workflows.

## Core Concept

Every Isaac skill is **a directory** with a `SKILL.md` at its root. The SKILL.md uses YAML frontmatter (machine-readable) followed by Markdown documentation (human-readable). The directory is the atomic unit — it can be zipped as a `.skill` package for distribution.

## Minimum Viable Skill

```
my-skill/
├── SKILL.md          # Required — the contract
├── LICENSE.txt        # Required — SPDX license
└── scripts/
    └── main.py        # At least one executable
```

## Required Frontmatter Fields

```yaml
---
name: my-skill                    # Unique kebab-case identifier
version: 1.0.0                    # Semantic version
description: >-                   # Trigger-oriented: when should an agent use this?
  Brief description.
license: Apache-2.0               # SPDX identifier
domain: navigation                # Primary domain
execution:
  context: hybrid                 # sim | real | hybrid
  entry_point: scripts/main.py    # Main executable
---
```

The `description` field is the most important for discovery. Write it from the perspective of "when should an agent reach for this skill?" — not marketing copy.

## Robotics Extensions (Optional but Recommended)

### Typed I/O Interfaces

```yaml
inputs:
  - name: lidar_scan
    type: sensor_msgs/LaserScan
    description: 2D or 3D LiDAR scan data
    required: true
outputs:
  - name: occupancy_map
    type: nav_msgs/OccupancyGrid
    description: Generated occupancy grid
```

### Parameters

```yaml
parameters:
  - name: map_resolution
    type: float
    default: 0.05
    range: [0.01, 1.0]
    unit: meters
    description: Grid cell resolution
```

### Platform Compatibility

```yaml
platforms:
  isaac_sdk: ">=3.0.0, <4.0.0"
  isaac_sim: ">=4.0.0"
  ros: [ros2-humble, ros2-iron]
  hardware: [NVIDIA Jetson Orin, x86_64 + NVIDIA RTX]
```

### Validation Criteria

```yaml
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
```

### Dependencies

```yaml
dependencies:
  skills:
    - name: perception-pointcloud-filter
      version: ">=1.0.0"
  packages:
    - name: open3d
      source: pip
      version: ">=0.17.0"
```

## Markdown Body Pattern

After frontmatter, follow progressive disclosure:

1. **Quick Reference** — table of common tasks with guide links
2. **Getting Started** — simplest useful invocation
3. **Parameters** — tunable values with recommendations
4. **Common Workflows** — 2-3 typical usage patterns
5. **Troubleshooting** — known issues and fixes

Put deep documentation in `references/` — loaded on-demand, not upfront.

## Progressive Disclosure (3 Levels)

| Level | Content | When Loaded |
|-------|---------|-------------|
| Metadata | name + description (~100 words) | Always — for discovery/search |
| SKILL.md body | Instructions + quick reference (<500 lines) | When skill is selected |
| references/ | Deep docs, API details, tuning guides | On-demand |

## Versioning

- **MAJOR**: Breaking changes to inputs, outputs, or parameters
- **MINOR**: New capabilities, new optional parameters, backward-compatible
- **PATCH**: Bug fixes, documentation, performance improvements

## Hub-Populated Fields (Read-Only)

These are set by the hub upon publication — authors do not set them:

`hub.published_at`, `hub.hub_score`, `hub.downloads`, `hub.active_deployments`, `hub.rating`, `hub.validation_badge`, `hub.certified_badge`, `hub.maintenance_status`
