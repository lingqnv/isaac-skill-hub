# Isaac Skill Hub

**The open registry for robotics skills.** Discover, share, and deploy modular robotic capabilities — built on the [Anthropic Skill Standard](https://docs.anthropic.com), extended for physical AI.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-247-green.svg)](#skills)
[![Contributors](https://img.shields.io/badge/contributors-89-orange.svg)](#contributing)

---

## What Is This?

Isaac Skill Hub is an open-source ecosystem for packaging, sharing, and discovering robotics skills. A **skill** is a self-contained unit of robotic capability — SLAM navigation, grasp planning, safety monitoring, sim-to-real transfer — that any Isaac-compatible agent can discover and use at runtime.

The hub is built on the **Isaac Skill Standard**, which extends [Anthropic's SKILL.md format](https://docs.anthropic.com) with robotics-specific fields for typed I/O interfaces, hardware compatibility, sim/real execution contexts, and automated validation.

### Why?

Every robotics team rebuilds the same capabilities from scratch. A standardized, quality-gated skill ecosystem means:

- **Roboticists** find production-ready components instead of reinventing them
- **Researchers** publish reusable implementations alongside papers
- **Companies** share non-differentiating capabilities and focus on what matters
- **Agents** (like Isaac Claw) automatically discover and compose skills at runtime

---

## Quick Start

### Browse Skills

Visit **[hub.isaac.nvidia.com](https://hub.isaac.nvidia.com)** or search from the CLI:

```bash
# Install the CLI
pip install isaac-hub

# Search for skills
isaac-hub search "warehouse navigation"

# Get skill details
isaac-hub info nav-slam-lidar

# Install a skill
isaac-hub install nav-slam-lidar
```

### Use a Skill

```python
from isaac_hub import load_skill

# Load and configure
slam = load_skill("nav-slam-lidar", map_resolution=0.05)

# Run in your pipeline
slam.start(lidar_topic="/scan", odom_topic="/odom")
```

### Create a Skill

```bash
# Scaffold a new skill
isaac-hub init my-awesome-skill

# Validate locally
isaac-hub validate ./my-awesome-skill

# Publish to the hub
isaac-hub publish ./my-awesome-skill
```

---

## Repository Structure

```
isaac-skill-hub/
├── README.md                          # You are here
├── LICENSE                            # Apache 2.0
├── CONTRIBUTING.md                    # How to contribute skills
├── CODE_OF_CONDUCT.md                 # Community standards
│
├── standard/                          # The Isaac Skill Standard
│   ├── skill-standard-v1.md           #   Full specification
│   ├── agent-discovery-protocol.md    #   How agents find & select skills
│   └── schema/                        #   Machine-readable schemas
│       ├── skill-frontmatter.json     #     JSON Schema for SKILL.md frontmatter
│       └── skill-index.json           #     JSON Schema for registry index
│
├── skills/                            # Community-contributed skills
│   ├── navigation/
│   │   ├── nav-slam-lidar/
│   │   │   ├── SKILL.md
│   │   │   ├── LICENSE.txt
│   │   │   ├── scripts/
│   │   │   ├── tests/
│   │   │   └── examples/
│   │   └── multi-robot-coord/
│   ├── manipulation/
│   │   └── grasp-6dof-transformer/
│   ├── perception/
│   │   ├── perception-yolo-ros2/
│   │   └── pose-estimation-foundationpose/
│   ├── data_training/
│   │   ├── domain-rand-factory/
│   │   └── synthetic-data-annotator/
│   ├── simulation/
│   │   └── isaac-sim-warehouse/
│   ├── control/
│   │   ├── pid-auto-tuner/
│   │   └── rl-locomotion-anymal/
│   ├── safety/
│   │   └── safety-zone-monitor/
│   └── integration/
│       └── ros2-cloud-bridge/
│
├── hub-web/                           # Hub website (React)
│   └── isaac-skill-hub.jsx
│
├── cli/                               # isaac-hub CLI tool
│   ├── README.md
│   └── src/
│
├── registry/                          # Self-hostable registry server
│   ├── README.md
│   └── src/
│
└── docs/                              # Extended documentation
    ├── getting-started.md
    ├── authoring-skills.md
    ├── running-a-registry.md
    └── agent-integration.md
```

---

## The Isaac Skill Standard

Every skill is a directory with a `SKILL.md` at its root. The SKILL.md uses YAML frontmatter (extending Anthropic's format) followed by Markdown documentation.

### Minimum Viable Skill

```
my-skill/
├── SKILL.md          # Required — the contract
├── LICENSE.txt        # Required — SPDX license
└── scripts/
    └── main.py        # At least one executable
```

### SKILL.md Frontmatter (Required Fields)

```yaml
---
name: my-skill                    # Unique kebab-case identifier
version: 1.0.0                    # Semantic version
description: >-                   # When should an agent use this skill?
  Brief, trigger-oriented description.
license: Apache-2.0               # SPDX identifier
domain: navigation                # Primary domain
execution:
  context: hybrid                 # sim | real | hybrid
  entry_point: scripts/main.py    # Main executable
---
```

### Robotics Extensions (Optional)

```yaml
inputs:                           # Typed I/O (ROS msg types)
outputs:
parameters:                       # Tunable params with types, defaults, ranges
platforms:                         # Isaac SDK, ROS, hardware compatibility
validation:                        # Isaac Sim test criteria
dependencies:                      # Other skills and packages
```

**Full spec:** [`standard/skill-standard-v1.md`](standard/skill-standard-v1.md)

---

## Domains

| Domain | Description | Example Skills |
|--------|-------------|----------------|
| 🧭 `navigation` | Movement, mapping, localization | SLAM, path planning, fleet coordination |
| 🦾 `manipulation` | Object interaction | Grasp planning, assembly, force control |
| 👁️ `perception` | Understanding the world | Detection, pose estimation, scene understanding |
| 📊 `data_training` | Data generation & ML | Domain randomization, annotation, curriculum |
| 🌐 `simulation` | Virtual environments | Scene generation, physics tuning, digital twins |
| 🎛️ `control` | Low-level control | PID, RL policies, MPC |
| 🛡️ `safety` | Safety systems | Zone monitoring, e-stop, ISO compliance |
| 🔌 `integration` | Connecting systems | ROS bridges, cloud, edge deployment |

---

## Quality & Traction

Every skill gets a **HubScore** (0-100) based on:

| Signal | Weight | What It Measures |
|--------|--------|-----------------|
| Usage | 35% | Downloads, active deployments, workflow completions |
| Quality | 30% | Test coverage, documentation, maintenance frequency |
| Rating | 20% | Community reviews (1-5 stars) |
| Maintenance | 15% | How recently the skill was updated |

Skills can earn badges:

- ✅ **Sim Validated** — Passed automated testing in Isaac Sim
- 🏆 **NVIDIA Certified** — Reviewed by NVIDIA domain experts

---

## Contributing

We welcome contributions from everyone. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the full guide.

**TL;DR:**

1. Fork this repo
2. Create your skill in `skills/<domain>/my-skill/`
3. Run `isaac-hub validate ./my-skill`
4. Open a PR

### Contributor Tiers

| Tier | Requirements | Perks |
|------|-------------|-------|
| 🌱 Community | GitHub account | Submit, rate, review |
| ✓ Verified | 3+ published skills | Priority review, badge |
| 🏅 Certified | NVIDIA partner or track record | Fast-track publishing |
| ⭐ Core | Maintainers | Full admin |

---

## Running Your Own Registry

The Isaac Skill Standard is open. You can run a private registry for proprietary skills:

```bash
# Self-host a registry
docker run -p 8080:8080 isaac-skill-registry

# Point the CLI at it
isaac-hub registry add mycompany https://skills.mycompany.com

# Search across all registries
isaac-hub search "grasp planning" --all-registries
```

See [`docs/running-a-registry.md`](docs/running-a-registry.md).

---

## Agent Integration

Isaac skills are designed for agent-driven discovery, not just human browsing. See [`standard/agent-discovery-protocol.md`](standard/agent-discovery-protocol.md) for the full protocol.

```python
from isaac_hub import SkillIndex

# Agent discovers skills by intent
index = SkillIndex.load()
results = index.discover(
    intent="navigate a warehouse with LiDAR",
    platform="jetson-orin",
    sensors=["lidar_2d", "imu"]
)

# Ranked results
for skill in results:
    print(f"{skill.name} (score: {skill.match_score})")
```

---

## Roadmap

| Phase | Status | Scope |
|-------|--------|-------|
| **Alpha** | 🟢 Now | Internal teams, seed skills, manual curation |
| **Beta** | 🟡 Q3 2026 | Partner access, automated review, public API |
| **GA** | ⬚ Q4 2026 | Open registration, CLI, community council |
| **Scale** | ⬚ 2027 | Federation, marketplace, IDE integrations |

---

## License

Apache 2.0 — see [LICENSE](LICENSE).

The Isaac Skill Standard, discovery protocol, CLI, and reference registry implementation are all open source. Individual skills may have their own licenses (specified in each skill's `SKILL.md`).

---

## Links

- 🌐 **Hub Website:** [hub.isaac.nvidia.com](https://hub.isaac.nvidia.com)
- 📖 **Skill Standard:** [`standard/skill-standard-v1.md`](standard/skill-standard-v1.md)
- 🤖 **Agent Protocol:** [`standard/agent-discovery-protocol.md`](standard/agent-discovery-protocol.md)
- 💬 **Discussions:** [GitHub Discussions](../../discussions)
- 🐛 **Issues:** [GitHub Issues](../../issues)
