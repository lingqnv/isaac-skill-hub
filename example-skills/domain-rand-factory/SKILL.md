---
name: domain-rand-factory
version: "2.0.0"
display_name: Domain Randomization Factory
description: "Generate domain-randomized synthetic training data for sim-to-real transfer with annotation pipeline and validation metrics"
license: "Apache-2.0"
compatibility: ">=Isaac Sim 2024.1"
author: "NVIDIA Isaac Robotics"
domain: "data_training"
tags: ["domain-randomization", "synthetic-data", "sim-to-real", "training", "simulation"]
execution: "sim-only"
inputs:
  - name: "usd_scene"
    type: "file"
    description: "USD/USDZ scene file with physics-enabled objects and camera rigs"
  - name: "randomization_config"
    type: "file"
    description: "YAML config specifying randomization ranges (materials, lighting, object poses, etc.)"
outputs:
  - name: "randomized_scenes"
    type: "directory"
    description: "Folder with N randomized USD snapshots (frame 0)"
  - name: "rgb_images"
    type: "directory"
    description: "Rendered RGB images (PNG format, 1920x1080)"
  - name: "depth_maps"
    type: "directory"
    description: "Normalized depth maps as 16-bit grayscale (16UC1)"
  - name: "annotation_data"
    type: "file"
    description: "JSON file with 2D bounding boxes, instance masks, 6D pose labels"
parameters:
  - name: "num_samples"
    type: "integer"
    default: 10000
    min: 100
    max: 1000000
    description: "Total synthetic images to generate"
  - name: "render_resolution"
    type: "string"
    default: "1920x1080"
    enum: ["640x480", "1280x720", "1920x1080", "2560x1440"]
    description: "Output image resolution; higher = more training data detail"
  - name: "randomize_materials"
    type: "boolean"
    default: true
    description: "Randomize texture, color, roughness, metallic properties"
  - name: "randomize_lighting"
    type: "boolean"
    default: true
    description: "Vary light intensity, position, color, shadows"
  - name: "randomize_poses"
    type: "boolean"
    default: true
    description: "Random object placement within specified volumes"
  - name: "randomize_camera"
    type: "boolean"
    default: false
    description: "Vary camera intrinsics, position, and FOV within limits"
  - name: "batch_size"
    type: "integer"
    default: 100
    min: 1
    max: 500
    description: "Scenes per render batch; larger = faster but more memory"
  - name: "max_worker_threads"
    type: "integer"
    default: 4
    min: 1
    max: 16
    description: "Parallel rendering workers; CPU cores / 2 recommended"
  - name: "enable_semantic_segmentation"
    type: "boolean"
    default: true
    description: "Generate instance/semantic masks alongside RGB"
platforms:
  - "x86_64"
  - "arm64"
dependencies:
  - name: "isaac-sim"
    version: ">=2024.1"
  - name: "python"
    version: ">=3.10"
  - name: "omni-client-library"
    version: ">=latest"
  - name: "pxr"
    version: ">=latest"
validation:
  - type: "simulation"
    requirement: "Isaac Sim runtime with GPU acceleration"
  - type: "disk_space"
    requirement: "100+ GB for large-scale generation (1M samples)"
  - type: "config_validation"
    requirement: "Randomization YAML must match scene object names"
---

# Domain Randomization Factory

Generate massive synthetic training datasets with photorealistic rendering, physically accurate randomization, and automated annotation for sim-to-real transfer learning.

## Quick Reference

| Aspect | Detail |
|--------|--------|
| **Execution** | Simulation-only (Isaac Sim GPU rendering) |
| **Throughput** | 50-200 images/sec (varies with complexity) |
| **Output** | RGB, depth, semantic masks, 6D pose labels (JSON) |
| **Memory** | 4-8GB GPU for batch generation |
| **Typical Dataset** | 10k-100k images per object class |

## Getting Started

```bash
# Initialize domain randomization pipeline
python -m domain_rand_factory \
  --usd_scene /path/to/scene.usd \
  --config /path/to/randomization.yaml \
  --num_samples 10000 \
  --output_dir /mnt/datasets/sim_data/

# Monitor progress
tail -f /mnt/datasets/sim_data/generation.log
```

## Parameters

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `num_samples` | int | 10000 | 100k+ for robust training; 10k for prototyping |
| `render_resolution` | string | 1920x1080 | Match target camera or slightly higher |
| `randomize_materials` | bool | true | Critical for sim-to-real generalization |
| `randomize_lighting` | bool | true | Shadows and brightness vary in real world |
| `batch_size` | int | 100 | Increase if OOM; decrease for varied samples |
| `max_worker_threads` | int | 4 | 8-16 for high-end systems (CPU cores / 2) |

## Common Workflows

### Grasping Network Training (10k object instances)
Generate diverse grasps with full sim-to-real domain gap:
```yaml
num_samples: 50000
randomize_materials: true
randomize_lighting: true
randomize_poses: true
randomize_camera: true
enable_semantic_segmentation: true
batch_size: 128
max_worker_threads: 8
```

### Pose Estimation Fine-Tuning (single object class)
Faster iteration with consistent materials and lighting:
```yaml
num_samples: 10000
randomize_materials: false
randomize_lighting: false
randomize_poses: true
randomize_camera: false
batch_size: 200
max_worker_threads: 16
```

### Industrial Part Detection Benchmark
Photo-realism prioritized over speed:
```yaml
num_samples: 100000
render_resolution: "2560x1440"
randomize_materials: true
randomize_lighting: true
randomize_poses: true
batch_size: 32
max_worker_threads: 4
```

## Troubleshooting

**Q: Generation speed very slow (<10 images/sec)**
- Increase `batch_size` from 100 to 200-500
- Reduce `render_resolution` to 1280x720
- Decrease `max_worker_threads` if GPU memory is saturated
- Disable `enable_semantic_segmentation` if not needed

**Q: Out-of-memory errors during rendering**
- Reduce `batch_size` from 100 to 50 or 25
- Split generation across multiple jobs with smaller `num_samples`
- Reduce `render_resolution` to 1280x720
- Simplify scene geometry or reduce object count

**Q: Annotations misaligned with images or incomplete**
- Verify randomization config matches USD object paths exactly
- Check object physics constraints (locked scales, poses)
- Re-run validation: `python -c "import domain_rand_factory; domain_rand_factory.validate_config()"`
- Ensure camera rig names match config expectations
