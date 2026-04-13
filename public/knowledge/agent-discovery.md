# Agent Skill Discovery Protocol

How agents find, select, and load skills at runtime.

## Discovery Sources (Priority Order)

1. **Local Registry** — skills already installed. Always checked first.
2. **Hub API** — the Isaac Skill Hub. Searched when local skills don't cover the task.
3. **Federated Registries** — third-party registries using the same protocol.

## Discovery Query

When an agent receives a task, it constructs a query:

```json
{
  "intent": "navigate a warehouse with LiDAR",
  "required_capabilities": ["mapping", "localization"],
  "context": {
    "robot_platform": "jetson-orin",
    "sensors": ["lidar_2d", "imu"],
    "ros_version": "humble"
  },
  "constraints": {
    "execution_context": "real",
    "min_hub_score": 70
  }
}
```

## Multi-Signal Matching

```
MatchScore = 0.40 × SemanticMatch(intent, description)
           + 0.25 × CapabilityOverlap(capabilities, tags + domain)
           + 0.15 × PlatformFit(platform, platforms)
           + 0.10 × IOCompatibility(sensors, inputs)
           + 0.10 × QualitySignal(hub_score)
```

## Load Sequence

1. **Metadata** — from the skill index (already cached)
2. **SKILL.md body** — full instructions and parameters
3. **references/** — only if deeper guidance is needed
4. **Execute** — run entry point with configured parameters

## Composition

Skills declare typed I/O, enabling automatic composition checking:

```
nav-slam-lidar.OccupancyGrid → safety-zone-monitor.OccupancyGrid ✓
perception-yolo-ros2.DetectedObjects → nav-slam-lidar.??? ✗ (needs bridge)
```

## Integration Patterns

| Pattern | Best For | How |
|---------|----------|-----|
| Embedded Index | <50 skills, simple agents | Skill index in context window |
| Search API | Large catalogs, production | POST /api/v1/discover |
| Planner-Driven | Multi-skill workflows | Decompose task → discover per stage |
| Recommender | Proactive discovery | "Users who use X also use Y" |
