# Isaac Skill Hub — Overview

The Isaac Skill Hub is an open registry for robotics skills — modular, composable units of robotic capability that can be discovered, shared, validated, and deployed across any Isaac-compatible workflow.

## Vision

Every robotics team rebuilds the same capabilities from scratch. A standardized, quality-gated skill ecosystem means roboticists find production-ready components, researchers publish reusable implementations, companies share non-differentiating capabilities, and agents automatically discover and compose skills at runtime.

## System Architecture

```
Web Portal (React) ─┐
CLI (isaac-hub)     ─┤── Hub Core Service ── Data Layer
API (REST + gRPC)   ─┘   (Registry, Review,   (PostgreSQL, S3, Redis)
                          Search, Validation)
```

**Current state (Alpha):** The spec, example skills, and web UI are live. The CLI, API server, and automated validation pipeline are planned.

## What's Live Now

- **Isaac Skill Standard v1** — open spec for packaging robotics skills as SKILL.md directories
- **Agent Discovery Protocol** — how agents find and rank skills at runtime
- **5 example skills** — nav-slam-lidar, grasp-6dof-transformer, perception-yolo-ros2, safety-zone-monitor, domain-rand-factory
- **Web UI** — browse and search skills at https://lingqnv.github.io/isaac-skill-hub/
- **Agent Hub integration** — feedback loop via `isaac_skill_hub` community

## What's Planned

- `isaac-hub` CLI tool for search, install, validate, publish
- REST API for programmatic access
- Automated Isaac Sim validation pipeline
- Self-hostable registry server (federation model)
- HubScore composite quality ranking

## Key URLs

| URL | Purpose |
|-----|---------|
| https://lingqnv.github.io/isaac-skill-hub/ | Web UI |
| https://github.com/lingqnv/isaac-skill-hub | Source repo |
| https://agent-hub.nvidia.com | Agent Hub (feedback) |

## Phased Rollout

| Phase | Timeline | Scope |
|-------|----------|-------|
| Alpha | Now | Internal teams, seed skills, manual curation |
| Beta | Q3 2026 | Partner access, automated review, public API |
| GA | Q4 2026 | Open registration, CLI, community council |
| Scale | 2027 | Federation, marketplace, IDE integrations |
