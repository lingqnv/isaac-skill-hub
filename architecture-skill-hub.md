# Isaac Skill Hub — Architecture & Product Specification

**Version:** 0.1.0 | **Date:** April 9, 2026 | **Status:** Internal Draft

---

## 1. Vision

The Isaac Skill Hub is an open marketplace and registry for robotics skills — modular, composable units of robotic capability that can be discovered, shared, validated, and deployed across any Isaac-compatible workflow. Think npm for robotics, but with quality gates and domain-aware curation.

The hub is built on top of the **Isaac Skill Standard** — an open specification for describing, packaging, and distributing robotics skills. The standard is designed to be vendor-neutral and community-driven.

---

## 2. Core Concepts

### 2.1 What Is a Skill?

A skill is a self-contained unit of robotic capability with:

- **Defined inputs/outputs** (sensor data, actions, sim configs, trained models)
- **Execution context** (sim-only, real-world, hybrid)
- **Domain classification** (navigation, manipulation, perception, data, simulation)
- **Dependency graph** (other skills, Isaac packages, hardware requirements)
- **Validation criteria** (what "success" looks like, test harnesses)

### 2.2 The Skill Standard (skill.yaml)

Every skill is defined by a `skill.yaml` manifest — see separate schema doc. This is the atomic unit the entire ecosystem builds on.

### 2.3 Skill Lifecycle

```
Author → Package → Submit → Review → Publish → Discover → Deploy → Rate/Feedback
```

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ISAAC SKILL HUB                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │   Web Portal  │  │   CLI Tool   │  │   API (REST + gRPC)   │ │
│  │  (React SPA)  │  │ (isaac-hub)  │  │                       │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘ │
│         │                 │                       │             │
│  ┌──────▼─────────────────▼───────────────────────▼───────────┐ │
│  │                    Hub Core Service                         │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐             │ │
│  │  │  Registry   │ │  Review    │ │  Analytics  │             │ │
│  │  │  Engine     │ │  Pipeline  │ │  Engine     │             │ │
│  │  └────────────┘ └────────────┘ └────────────┘             │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐             │ │
│  │  │  Search &   │ │  Identity  │ │  Validation │             │ │
│  │  │  Discovery  │ │  & Auth    │ │  Service    │             │ │
│  │  └────────────┘ └────────────┘ └────────────┘             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     Data Layer                              │ │
│  │  PostgreSQL (metadata) │ S3 (packages) │ Redis (cache)     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Domain Taxonomy

Skills are organized into a two-level taxonomy:

| Domain | Sub-Domains |
|--------|-------------|
| **Navigation** | Path planning, SLAM, obstacle avoidance, multi-robot coordination |
| **Manipulation** | Grasp planning, motion planning, force control, assembly |
| **Perception** | Object detection, pose estimation, scene understanding, depth processing |
| **Data & Training** | Dataset generation, domain randomization, curriculum learning, annotation |
| **Simulation** | Environment setup, physics tuning, sensor simulation, digital twin |
| **Control** | PID tuning, reinforcement learning policies, model predictive control |
| **Safety** | Collision detection, workspace monitoring, emergency stop, compliance |
| **Integration** | ROS bridges, hardware drivers, cloud deployment, edge optimization |

Each skill can belong to one primary domain and up to 3 secondary domains (tags).

---

## 5. Contribution Workflow

### 5.1 Contributor Tiers

| Tier | Requirements | Privileges |
|------|-------------|------------|
| **Community** | GitHub/NVIDIA account | Submit skills, rate, comment |
| **Verified** | 3+ published skills, identity verified | Priority review, "Verified" badge |
| **Certified** | NVIDIA partner program or proven track record | Skip review for minor updates, "Certified" badge |
| **Core** | NVIDIA internal or appointed maintainers | Full admin, merge rights, taxonomy changes |

### 5.2 Submission & Review Pipeline

```
1. Author packages skill with skill.yaml + code + tests
2. CLI: `isaac-hub publish` → uploads package, runs automated checks
3. Automated validation:
   ├── Schema validation (skill.yaml conforms to standard)
   ├── Dependency resolution (all deps available)
   ├── Test execution (if sim-testable, run in Isaac Sim)
   ├── Security scan (no malicious code, license compliance)
   └── Documentation check (README, examples present)
4. Human review (for Community tier; auto-approve for Certified)
5. Published to registry with initial quality score
```

### 5.3 Versioning

Semantic versioning (MAJOR.MINOR.PATCH) with:
- **MAJOR**: Breaking changes to inputs/outputs
- **MINOR**: New capabilities, backward-compatible
- **PATCH**: Bug fixes, documentation

---

## 6. Quality & Traction Signals

### 6.1 Usage Metrics (Public)

| Metric | Description |
|--------|-------------|
| **Downloads** | Total and rolling 30-day download count |
| **Active Deployments** | Anonymized count of active installations (opt-in telemetry) |
| **Workflow Completions** | How often the skill completes successfully in real pipelines |
| **Dependency Count** | How many other skills depend on this one |

### 6.2 Quality Metrics (Public)

| Metric | Description |
|--------|-------------|
| **Quality Score** | Composite 0-100 score (test coverage, doc quality, maintenance frequency) |
| **User Rating** | 5-star rating with written reviews |
| **Validation Badge** | Passed automated testing in Isaac Sim |
| **Certified Badge** | Reviewed and endorsed by NVIDIA domain experts |
| **Maintenance Status** | Active / Maintained / Deprecated / Archived |
| **Compatibility Matrix** | Which Isaac SDK versions, ROS versions, hardware platforms |

### 6.3 Composite Ranking

Skills are ranked by a weighted composite:

```
HubScore = 0.35 × NormalizedUsage 
         + 0.30 × QualityScore 
         + 0.20 × UserRating 
         + 0.15 × MaintenanceRecency
```

This score powers default search ranking, "Trending" and "Top" lists.

---

## 7. Search & Discovery

### 7.1 Search Dimensions

- **Full-text**: Name, description, README content
- **Domain filter**: Primary and secondary domain tags
- **Compatibility filter**: Isaac SDK version, ROS version, hardware
- **Quality filter**: Minimum rating, certification status
- **Sort**: HubScore, downloads, recency, rating

### 7.2 Curated Collections

Editorially curated skill bundles:
- "Getting Started with Mobile Robots"
- "Production Manipulation Pipeline"  
- "Sim-to-Real Transfer Kit"
- Seasonal/event collections (GTC picks, community highlights)

---

## 8. API Surface

### 8.1 Public API (REST)

```
GET    /api/v1/skills                    # Search & list
GET    /api/v1/skills/{id}               # Skill detail
GET    /api/v1/skills/{id}/versions      # Version history
GET    /api/v1/skills/{id}/reviews       # User reviews
POST   /api/v1/skills/{id}/reviews       # Submit review
GET    /api/v1/skills/{id}/metrics       # Usage & quality metrics
GET    /api/v1/domains                   # Taxonomy
GET    /api/v1/collections               # Curated collections
GET    /api/v1/trending                  # Trending skills
GET    /api/v1/contributors/{id}         # Contributor profile
```

### 8.2 Publisher API (Authenticated)

```
POST   /api/v1/publish                   # Submit new skill
PUT    /api/v1/skills/{id}               # Update skill
DELETE /api/v1/skills/{id}               # Deprecate/remove
GET    /api/v1/dashboard                 # Publisher analytics
```

### 8.3 CLI

```bash
isaac-hub search "grasp planning"        # Search skills
isaac-hub install nav-slam-toolkit       # Install a skill
isaac-hub publish ./my-skill             # Publish a skill
isaac-hub validate ./my-skill            # Run validation locally
isaac-hub login                          # Authenticate
```

---

## 9. Governance Model

### 9.1 Open by Default

- Skill Standard is open-source (Apache 2.0)
- Hub API spec is public
- Anyone can build alternative registries using the same standard
- NVIDIA operates the "official" hub but the format is not locked in

### 9.2 Community Council (Future)

- Elected maintainers from top contributors
- Vote on taxonomy changes, standard evolution
- Quarterly roadmap input

---

## 10. Phased Rollout

| Phase | Timeline | Scope |
|-------|----------|-------|
| **Alpha** | Now | Internal NVIDIA teams, 10-20 seed skills, manual curation |
| **Beta** | +2 months | Invited partners, automated review pipeline, public API |
| **GA** | +6 months | Open registration, CLI tooling, community council |
| **Scale** | +12 months | Marketplace features (premium skills), federation with other registries |

---

## 11. Key Design Decisions

1. **skill.yaml as the universal contract** — Everything flows from the manifest. No skill exists without a valid one.
2. **Quality > quantity** — HubScore weights quality and usage over pure download counts. We don't want a dumping ground.
3. **CLI-first publishing** — Developers publish from their workflow, not a web form. The web portal is for discovery and browsing.
4. **Validation is automated** — Isaac Sim integration means we can actually run skills and verify they work, not just lint code.
5. **Badges are earned, not claimed** — Certified and Validated badges come from automated + human review, not self-attestation.
