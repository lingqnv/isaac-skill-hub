# Agent Skill Discovery Protocol

**How Isaac Claw (and any agent) finds, selects, and loads skills at runtime.**

---

## The Problem

An agent like Isaac Claw receives a high-level task: "Set up a navigation pipeline for the warehouse." It needs to discover that `nav-slam-lidar` exists, determine it's the right fit, load it, and compose it with other skills — all without a human manually selecting skills.

This is the difference between a **package manager** (human picks what to install) and a **skill registry** (agent discovers what it needs).

---

## Discovery Architecture

```
                    ┌──────────────────────────┐
                    │      AGENT RUNTIME        │
                    │    (Isaac Claw / Any)      │
                    │                            │
                    │  1. Task → Intent Parse    │
                    │  2. Intent → Skill Query   │
                    │  3. Query → Ranked Results  │
                    │  4. Select → Load → Execute │
                    └─────────┬────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │   LOCAL     │  │  HUB API   │  │  CUSTOM    │
     │  REGISTRY   │  │ (remote)   │  │  REGISTRY  │
     │             │  │            │  │  (federated)│
     └────────────┘  └────────────┘  └────────────┘
```

### Three Discovery Sources (Priority Order)

1. **Local Registry** — Skills already installed on the robot/workstation. Fastest. Always checked first.
2. **Hub API** — The Isaac Skill Hub. Searched when local skills don't cover the task.
3. **Federated Registries** — Third-party registries that implement the same protocol. Enterprise customers run their own.

---

## Discovery Protocol

### Step 1: Build a Skill Index

Every registry (local or remote) maintains a **skill index** — a lightweight manifest of all available skills. This is the equivalent of Anthropic's `available_skills` list that agents see in their context.

```yaml
# skill-index.yaml — auto-generated, never hand-edited
version: "2026-04-09T10:00:00Z"
skills:
  - name: nav-slam-lidar
    display_name: LiDAR SLAM Navigation
    description: >-
      Real-time LiDAR SLAM for warehouse navigation. Use when the robot needs
      to simultaneously build a map and localize using LiDAR sensors.
    domain: navigation
    tags: [slam, lidar, mapping, warehouse]
    version: 1.2.0
    hub_score: 94
    execution_context: hybrid
    inputs_summary: "LaserScan, Odometry → OccupancyGrid, PoseStamped"
    platforms: [jetson-orin, x86_64-rtx]

  - name: grasp-6dof-transformer
    display_name: 6-DOF Grasp Planner
    description: >-
      Transformer-based 6-DOF grasp pose prediction from point clouds.
      Use for pick-and-place with novel objects.
    domain: manipulation
    tags: [grasping, transformer, 6dof, point-cloud]
    version: 2.0.1
    hub_score: 91
    execution_context: hybrid
    inputs_summary: "PointCloud2 → GraspPose, JointTrajectory"
    platforms: [jetson-orin, x86_64-rtx]
  # ... more skills
```

**Key insight:** The index contains just enough for an agent to decide relevance without loading full SKILL.md files. The `description` and `inputs_summary` are the primary matching signals — same principle as Anthropic's skill triggering.

### Step 2: Agent Queries the Index

When the agent receives a task, it constructs a **discovery query**:

```json
{
  "intent": "Set up navigation and mapping for a warehouse with LiDAR sensors",
  "required_capabilities": ["mapping", "localization", "path_planning"],
  "context": {
    "robot_platform": "jetson-orin",
    "sensors": ["lidar_2d", "imu", "wheel_odometry"],
    "environment": "indoor_warehouse",
    "ros_version": "humble"
  },
  "constraints": {
    "execution_context": "real",
    "min_hub_score": 70
  }
}
```

### Step 3: Multi-Signal Matching

The registry matches skills using multiple signals:

```
MatchScore = 0.40 × SemanticMatch(intent, description)
           + 0.25 × CapabilityOverlap(required_capabilities, tags + domain)
           + 0.15 × PlatformFit(robot_platform, platforms)
           + 0.10 × IOCompatibility(sensors, inputs)
           + 0.10 × QualitySignal(hub_score)
```

| Signal | What It Checks | Weight |
|--------|---------------|--------|
| **Semantic match** | Does the skill description match the agent's intent? (Embedding similarity or LLM judge) | 40% |
| **Capability overlap** | Do the tags/domain cover what's needed? | 25% |
| **Platform fit** | Is the skill compatible with the robot's hardware? | 15% |
| **I/O compatibility** | Do the robot's sensors match the skill's expected inputs? | 10% |
| **Quality signal** | HubScore as a tiebreaker | 10% |

### Step 4: Load and Compose

Once the agent selects skills, it loads them in progressive order:

1. **Load metadata** — Already in the index
2. **Load SKILL.md body** — Full instructions, parameter guidance
3. **Load references/** — Only if the agent needs deeper guidance
4. **Execute** — Run the skill's entry point with configured parameters

For multi-skill workflows (e.g., navigation + perception + safety), the agent checks I/O compatibility between skills:

```
perception-yolo-ros2 → outputs: DetectedObjects
         ↓
nav-slam-lidar → inputs: OccupancyGrid (needs a bridge skill)
         ↓
safety-zone-monitor → inputs: OccupancyGrid, RobotPose ✓
```

---

## Open Source Strategy

### What's Open (Apache 2.0)

| Component | Description |
|-----------|-------------|
| **Isaac Skill Standard** | The SKILL.md format, frontmatter schema, directory structure |
| **Discovery Protocol** | The query/match/rank protocol described in this doc |
| **skill-index.yaml schema** | How registries describe their catalog |
| **isaac-hub CLI** | The command-line tool for authoring, validating, publishing skills |
| **Reference registry implementation** | A self-hostable registry server |
| **SDK for skill authors** | Python/C++ libraries for building skills |

### What's Operated (by NVIDIA)

| Component | Description |
|-----------|-------------|
| **Isaac Skill Hub** | The official public registry (hub.isaac.nvidia.com) |
| **Automated Sim Validation** | Isaac Sim infrastructure for testing skills |
| **Certified Badge Reviews** | NVIDIA domain expert review process |
| **Identity & Auth** | Account management, contributor tiers |

### Federation Model

Anyone can run their own registry. The discovery protocol is the same:

```bash
# Add a custom registry
isaac-hub registry add mycompany https://skills.mycompany.com

# Search across all registries
isaac-hub search "grasp planning" --all-registries

# Priority: local → official hub → custom registries
```

Enterprise customers keep proprietary skills in their own registry while still pulling from the public hub. Same model as Docker Hub + private registries.

---

## Agent Integration Patterns

### Pattern 1: Embedded Index (Simplest)

The agent has the skill index loaded into its context window (same as how Anthropic skills appear in `available_skills`). Agent uses LLM reasoning to select skills.

```
System prompt includes:
"Available skills: [skill-index entries]"
→ Agent reads task
→ Agent selects skills by reasoning over descriptions
→ Agent loads selected SKILL.md files
```

**Best for:** Small skill catalogs (<50 skills), simple agents.

### Pattern 2: Search API (Scalable)

The agent calls a search API that returns ranked results. Agent then reasons over the top-K results.

```
Agent → POST /api/v1/discover {intent, context}
     ← Top 10 skills with match scores
Agent → Selects top 3
Agent → GET /api/v1/skills/{id}/full → loads SKILL.md
```

**Best for:** Large catalogs, production systems.

### Pattern 3: Planner-Driven (Isaac Claw)

Isaac Claw's Long-Horizon Planner decomposes the task into stages, then discovers skills per stage:

```
Task: "Build a sim-to-real navigation pipeline"

Planner decomposes:
  Stage 1: Environment setup     → discovers: isaac-sim-warehouse
  Stage 2: Data generation       → discovers: domain-rand-factory
  Stage 3: Policy training       → discovers: rl-locomotion-anymal
  Stage 4: Sim validation        → discovers: nav-slam-lidar (sim mode)
  Stage 5: Real deployment       → discovers: nav-slam-lidar (real mode) + safety-zone-monitor

Each stage queries the index independently, with I/O chaining between stages.
```

**Best for:** Complex multi-skill workflows, agentic systems.

### Pattern 4: Skill Recommender (Proactive)

The registry proactively suggests skills based on what the agent already has:

```
Agent has: nav-slam-lidar, perception-yolo-ros2
Hub suggests: "Users who use these also use safety-zone-monitor (85% co-occurrence)"
```

**Best for:** Helping roboticists discover skills they didn't know they needed.

---

## Skill Composition Graph

Skills declare their I/O types, which enables automatic composition checking:

```yaml
# The hub can build a dependency/composition graph:

nav-slam-lidar:
  in:  [LaserScan, Odometry]
  out: [OccupancyGrid, PoseStamped, Path]

safety-zone-monitor:
  in:  [OccupancyGrid, PoseStamped, PointCloud2]
  out: [SafetyZoneStatus, EmergencyStop]

perception-yolo-ros2:
  in:  [Image, CameraInfo]
  out: [DetectedObjects, BoundingBoxes]

# Compatible composition:
nav-slam-lidar.OccupancyGrid → safety-zone-monitor.OccupancyGrid ✓
nav-slam-lidar.PoseStamped → safety-zone-monitor.PoseStamped ✓

# Incompatible — needs bridge:
perception-yolo-ros2.DetectedObjects → nav-slam-lidar.??? ✗
```

The hub exposes a **composition API** that tells agents whether two skills can chain directly or need a bridge skill:

```
GET /api/v1/compose?from=nav-slam-lidar&to=safety-zone-monitor
→ { compatible: true, connections: [{from: "occupancy_map", to: "occupancy_grid"}] }
```

---

## Versioning & Stability

| Spec | Status |
|------|--------|
| SKILL.md frontmatter v1 | Stable — breaking changes require major version bump |
| Discovery protocol v1 | Stable |
| skill-index.yaml v1 | Stable |
| Composition API v1 | Experimental |
| Recommender API v1 | Experimental |
