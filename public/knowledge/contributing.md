# Contributing to Isaac Skill Hub

## Contributing a Skill

### 1. Create the directory

```
skills/<domain>/my-skill/
├── SKILL.md          # Required — frontmatter + docs
├── LICENSE.txt        # Required — Apache 2.0 recommended
├── scripts/
│   └── main.py        # At least one executable
├── tests/             # Optional but improves HubScore
├── examples/          # Optional — usage examples
└── references/        # Optional — deep documentation
```

### 2. Write the SKILL.md

Required frontmatter: `name`, `version`, `description`, `license`, `domain`, `execution.context`, `execution.entry_point`.

The `description` is critical — it's what agents and search use to find your skill. Write trigger conditions, not marketing.

Good: "6-DOF grasp pose prediction from point clouds. Use for bin picking, shelf manipulation, or grasping novel objects."

Bad: "A powerful and versatile grasping solution for modern robotics."

### 3. Add robotics extensions

Strongly recommended — makes your skill composable:
- `inputs` / `outputs` with ROS message types
- `parameters` with types, defaults, ranges
- `platforms` for hardware compatibility
- `validation` criteria for automated testing

### 4. Submit via GitHub PR

```bash
git checkout -b add-my-skill
git add skills/<domain>/my-skill
git commit -m "Add my-skill: brief description"
git push origin add-my-skill
# Open PR on GitHub
```

PR title format: `[skill] Add <skill-name>: one-line description`

## Contributor Tiers

| Tier | Requirements | Perks |
|------|-------------|-------|
| Community | GitHub account | Submit, rate, review |
| Verified | 3+ published skills | Priority review, badge |
| Certified | NVIDIA partner or track record | Fast-track publishing |
| Core | Maintainers | Full admin |

## Review Process

Automated checks on every PR:
- SKILL.md schema conformance
- Required files present
- Dependency resolution
- Test execution
- License compatibility
- Documentation completeness

Human review required for Community tier (1 maintainer). Certified tier auto-merges patches.

## Updating a Skill

Bump the version in SKILL.md frontmatter, make changes, run validation, open PR.

- Patch (1.0.1): bug fixes, doc updates
- Minor (1.1.0): new optional features
- Major (2.0.0): breaking I/O or parameter changes
