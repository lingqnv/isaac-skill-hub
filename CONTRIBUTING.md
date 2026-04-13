# Contributing to Isaac Skill Hub

Thanks for contributing. This guide covers everything you need to submit a skill, review others' work, or improve the standard itself.

---

## Contributing a Skill

### 1. Scaffold

```bash
isaac-hub init my-skill
# Creates:
#   my-skill/
#   ├── SKILL.md          (template with required fields)
#   ├── LICENSE.txt        (Apache 2.0 default)
#   └── scripts/
#       └── main.py        (entry point stub)
```

Or manually create the directory. Minimum requirement: `SKILL.md` + `LICENSE.txt` + one file in `scripts/`.

### 2. Write Your SKILL.md

The SKILL.md is the contract. The frontmatter must include at minimum:

```yaml
---
name: my-skill
version: 1.0.0
description: >-
  When should an agent or user reach for this skill?
  Be specific: mention sensor types, robot platforms,
  environments, and task types.
license: Apache-2.0
domain: navigation  # or manipulation, perception, etc.
execution:
  context: hybrid   # sim | real | hybrid
  entry_point: scripts/main.py
---
```

**The `description` field is critical.** It's what agents and the search engine use to find your skill. Write it from the perspective of someone (or something) looking for this capability. Don't write marketing copy — write trigger conditions.

Good: *"6-DOF grasp pose prediction from point clouds. Use for bin picking, shelf manipulation, or any scenario where the robot needs to grasp novel objects it hasn't seen before."*

Bad: *"A powerful and versatile grasping solution for modern robotics."*

### 3. Add the Robotics Extensions

These are optional but strongly recommended — they're what make your skill composable with others:

```yaml
inputs:
  - name: point_cloud
    type: sensor_msgs/PointCloud2
    description: RGB-D point cloud of the scene
    required: true

outputs:
  - name: grasp_poses
    type: geometry_msgs/PoseArray
    description: Ranked candidate grasp poses

parameters:
  - name: num_candidates
    type: int
    default: 100
    range: [10, 1000]
    description: Number of grasp candidates to evaluate

platforms:
  isaac_sdk: ">=3.0.0"
  ros: [ros2-humble]
  hardware: [NVIDIA Jetson Orin, x86_64 + NVIDIA RTX]
```

### 4. Add Tests

```
tests/
├── test_unit.py         # Unit tests (required for quality score)
├── test_sim.py          # Isaac Sim tests (optional, earns validation badge)
└── scene.usd            # Test scene (if sim-testable)
```

If your skill is sim-testable, add validation criteria to the frontmatter:

```yaml
validation:
  sim_scene: tests/scene.usd
  criteria:
    - metric: success_rate
      threshold: 0.90
      operator: ">="
```

### 5. Add Documentation

The SKILL.md body should follow the progressive disclosure pattern:

1. **Quick Reference** — table of common tasks → guide links
2. **Getting Started** — simplest useful invocation
3. **Parameters** — tunable values with recommendations
4. **Common Workflows** — 2-3 typical usage patterns
5. **Troubleshooting** — known issues and fixes

Put deep documentation in `references/` — it's loaded on-demand, not upfront.

### 6. Add Examples

```
examples/
├── basic_usage.py       # Minimum working example
└── advanced_pipeline.py # Multi-skill composition example
```

### 7. Validate Locally

```bash
isaac-hub validate ./my-skill
```

This checks:
- SKILL.md frontmatter schema conformance
- Required files present
- Dependencies resolvable
- Tests pass
- Documentation completeness score

### 8. Submit via Pull Request

```bash
# Fork the repo, then:
cp -r my-skill skills/<domain>/my-skill
git checkout -b add-my-skill
git add skills/<domain>/my-skill
git commit -m "Add my-skill: brief description"
git push origin add-my-skill
# Open PR on GitHub
```

**PR title format:** `[skill] Add <skill-name>: one-line description`

**PR description:** Include what the skill does, what robots/platforms it's been tested on, and a link to a demo or paper if applicable.

---

## Review Process

### Automated Checks (Run on Every PR)

| Check | What It Does |
|-------|-------------|
| Schema validation | SKILL.md frontmatter conforms to the standard |
| File structure | Required files present, no banned files (.env, credentials) |
| Dependency resolution | All declared dependencies exist |
| Test execution | Unit tests pass |
| Sim validation | If sim tests declared, run in Isaac Sim (CI has GPU runners) |
| License check | License is SPDX-compatible, no license conflicts in deps |
| Doc completeness | README quality score (examples present, params documented) |

### Human Review

- **Community tier:** Requires 1 maintainer approval
- **Verified tier:** Requires 1 maintainer approval (priority queue)
- **Certified tier:** Auto-merge for minor updates; 1 approval for new skills

Reviewers check for:
- Does the skill do what it claims?
- Are the I/O types correct and composable?
- Is the description trigger-worthy (will agents find it)?
- Are there any safety concerns (especially for `real` execution context)?

---

## Updating a Skill

```bash
# Bump version in SKILL.md frontmatter
# Make your changes
isaac-hub validate ./my-skill
# PR with title: [skill] Update <skill-name> to v1.2.0: what changed
```

Version bumping rules:
- **Patch** (1.0.0 → 1.0.1): Bug fixes, doc updates
- **Minor** (1.0.0 → 1.1.0): New optional features, new parameters
- **Major** (1.0.0 → 2.0.0): Breaking changes to inputs, outputs, or parameters

---

## Contributing to the Standard

The Isaac Skill Standard itself is open for proposals:

1. Open an issue tagged `[standard]` describing the proposed change
2. Discuss in the issue thread
3. If consensus, submit a PR to `standard/`
4. Requires 2 core maintainer approvals

Breaking changes to the standard require a major version bump and a migration guide.

---

## Reporting Issues

- **Skill bug:** Open an issue tagged `[bug] <skill-name>`
- **Standard issue:** Open an issue tagged `[standard]`
- **Hub/website:** Open an issue tagged `[hub]`
- **Security:** Email security@isaac-hub.nvidia.com (do not open public issues)

---

## Code of Conduct

Be professional. Be constructive. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

## Contributor Tiers

| Tier | How to Get There | What You Get |
|------|-----------------|-------------|
| 🌱 **Community** | Sign up | Submit skills, rate, review, discuss |
| ✓ **Verified** | 3+ published skills + identity verification | Priority review, Verified badge on profile and skills |
| 🏅 **Certified** | NVIDIA partner program or exceptional track record | Fast-track publishing, Certified badge, skip review for patches |
| ⭐ **Core** | Appointed by maintainers | Full admin, taxonomy changes, standard votes |

Tier progression is based on quality, not volume. One excellent skill counts more than five mediocre ones.
