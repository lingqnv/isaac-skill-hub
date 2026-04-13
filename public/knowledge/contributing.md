# Contributing to Isaac Skill Hub

## Contributing a Skill

### 1. Create the directory

Skills live in `example-skills/` during early access. Place your skill there:

```
example-skills/my-skill/
├── SKILL.md          # Required — frontmatter + docs
├── LICENSE.txt        # Required — Apache 2.0 recommended
├── scripts/
│   └── main.py        # At least one executable
├── tests/             # Optional but improves HubScore
├── examples/          # Optional — usage examples
└── references/        # Optional — deep documentation
```

> **Note:** The directory will move to `skills/<domain>/my-skill/` after GA. During early access, all skills go in `example-skills/`.

**Reference implementation:** See `example-skills/nav-slam-lidar/SKILL.md` for a gold-standard example with typed I/O, parameters with ranges, platform compatibility, and validation criteria.

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

### 4. Validate your skill

Run the validation script to check SKILL.md frontmatter before submitting:

```bash
python3 public/validate_skill.py example-skills/my-skill/SKILL.md
```

This checks: required fields present, SPDX license valid, domain is recognized, execution context valid, typed I/O format correct, parameter ranges well-formed.

### 5. Submit via GitHub PR

Fork the repo, create your skill, then open a PR:

```bash
# Fork via GitHub UI or gh CLI
gh repo fork lingqnv/isaac-skill-hub --clone
cd isaac-skill-hub

# Create your skill
git checkout -b add-my-skill
mkdir -p example-skills/my-skill/scripts
# ... author SKILL.md, LICENSE.txt, scripts/ ...

# Validate
python3 public/validate_skill.py example-skills/my-skill/SKILL.md

# Commit and PR
git add example-skills/my-skill
git commit -m "[skill] Add my-skill: brief description"
git push origin add-my-skill

# Open PR targeting the active branch
gh pr create --repo lingqnv/isaac-skill-hub --base jon/agent-hub-integration \
  --title "[skill] Add my-skill: one-line description" \
  --body "## Summary\n- Domain: ...\n- Execution: hybrid/sim/real\n- Key capability: ..."
```

> **PR target branch:** During early access, target `jon/agent-hub-integration`. After GA, target `main`.

## Contributor Tiers

| Tier | Requirements | Perks |
|------|-------------|-------|
| Community | GitHub account | Submit, rate, review |
| Verified | 3+ published skills | Priority review, badge |
| Certified | NVIDIA partner or track record | Fast-track publishing |
| Core | Maintainers | Full admin |

## Review Process

Automated checks on every PR:
- SKILL.md frontmatter validation (via `validate_skill.py`)
- Required files present (SKILL.md + LICENSE.txt)
- License compatibility
- Documentation completeness

Human review required for Community tier (1 maintainer). Certified tier auto-merges patches.

## Updating a Skill

Bump the version in SKILL.md frontmatter, make changes, run validation, open PR.

- Patch (1.0.1): bug fixes, doc updates
- Minor (1.1.0): new optional features
- Major (2.0.0): breaking I/O or parameter changes
