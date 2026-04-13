---
name: perception-yolo-ros2
version: "2.1.0"
display_name: YOLO v8/v9 Object Detection Node
description: "Real-time object detection on RGB images using YOLOv8/v9 with ROS2 integration and multi-class support"
license: "Apache-2.0"
compatibility: ">=Isaac Sim 2024.1, ROS2 Humble/Iron"
author: "NVIDIA Isaac Robotics"
domain: "perception"
tags: ["object-detection", "yolo", "real-time", "cnn", "ros2"]
execution: "hybrid"
inputs:
  - name: "image"
    type: "sensor_msgs/Image"
    description: "Input RGB image (8UC3 or BGR8 format)"
  - name: "camera_info"
    type: "sensor_msgs/CameraInfo"
    description: "Camera calibration parameters for 3D projection"
outputs:
  - name: "detections"
    type: "vision_msgs/Detection2DArray"
    description: "Detected objects with bounding boxes and class labels"
  - name: "labeled_image"
    type: "sensor_msgs/Image"
    description: "RGB image with drawn bounding boxes and labels (optional debug output)"
  - name: "object_poses"
    type: "geometry_msgs/PoseArray"
    description: "Estimated 3D poses of detected objects (requires depth)"
parameters:
  - name: "model_variant"
    type: "string"
    default: "yolov8m"
    enum: ["yolov8n", "yolov8s", "yolov8m", "yolov8l", "yolov9c", "yolov9m"]
    description: "YOLO model size; nano to medium for edge, large for accuracy"
  - name: "confidence_threshold"
    type: "float"
    default: 0.5
    min: 0.0
    max: 1.0
    description: "Minimum detection confidence (0.5-0.7 typical)"
  - name: "iou_threshold"
    type: "float"
    default: 0.45
    min: 0.0
    max: 1.0
    description: "NMS intersection-over-union threshold"
  - name: "input_size"
    type: "integer"
    default: 640
    enum: [320, 416, 512, 640, 832, 1024]
    description: "Input image size; larger = slower but more accurate"
  - name: "max_detections"
    type: "integer"
    default: 100
    min: 1
    max: 500
    description: "Maximum detections per frame"
  - name: "inference_device"
    type: "string"
    default: "cuda"
    enum: ["cuda", "cpu", "tensorrt"]
    description: "Inference backend; TensorRT fastest on Jetson"
platforms:
  - "x86_64"
  - "arm64"
dependencies:
  - name: "ultralytics"
    version: ">=8.0.200"
  - name: "torch"
    version: ">=2.0"
  - name: "torchvision"
    version: ">=0.15"
  - name: "opencv-python"
    version: ">=4.8"
  - name: "ros2"
    version: ">=Humble"
validation:
  - type: "hardware"
    requirement: "GPU recommended for real-time performance"
    description: "CPU mode slower; NVIDIA T4+ or Jetson AGX recommended"
  - type: "ros_topic"
    requirement: "Image topic publishing at >=10Hz in 640x480 or similar"
  - type: "memory"
    requirement: "Min 2GB GPU memory; 4GB+ for batched inference"
---

# YOLO v8/v9 Object Detection Node

High-performance real-time object detection using state-of-the-art YOLO models with flexible hardware acceleration and full ROS2 integration.

## Quick Reference

| Aspect | Detail |
|--------|--------|
| **Execution** | Hybrid (GPU inference, CPU post-processing) |
| **Latency** | 30-100ms (model-dependent) |
| **Throughput** | 10-30 FPS depending on input resolution |
| **Memory** | 1-4GB GPU (YOLOv8n to v9m) |
| **Models** | YOLOv8/v9 nano to large (80 COCO classes) |

## Getting Started

```bash
# Start detection node with default settings
ros2 run perception_yolo detection_node \
  --image_topic /camera/rgb/image_rect \
  --output_topic /detections

# Run with custom model and thresholds
ros2 run perception_yolo detection_node \
  --model yolov9m \
  --confidence_threshold 0.6 \
  --input_size 832
```

## Parameters

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `model_variant` | string | yolov8m | nano=fast/edge, medium=balanced, large=accurate |
| `confidence_threshold` | float | 0.5 | Increase to 0.6-0.7 to reduce false positives |
| `input_size` | int | 640 | Larger (832, 1024) improves accuracy, increases latency |
| `inference_device` | string | cuda | tensorrt on Jetson for 50-80% speedup |
| `max_detections` | int | 100 | Reduce to 20-30 for crowded scenes |

## Common Workflows

### Warehouse Inventory Counting
Fast inference, permissive detection:
```yaml
model_variant: yolov8n
input_size: 416
confidence_threshold: 0.4
max_detections: 200
```

### Precision Part Inspection
High accuracy, slower acceptable:
```yaml
model_variant: yolov9m
input_size: 832
confidence_threshold: 0.75
inference_device: tensorrt
```

### Mobile Robot Real-Time Detection
Balance speed and accuracy:
```yaml
model_variant: yolov8s
input_size: 640
confidence_threshold: 0.55
inference_device: cuda
```

## Troubleshooting

**Q: Detection latency too high (>150ms)**
- Reduce `input_size` from 640 to 416 or 320
- Switch `model_variant` to yolov8n or yolov8s
- Use `inference_device: tensorrt` on Jetson/Xavier

**Q: Too many false positives (low-confidence boxes)**
- Increase `confidence_threshold` to 0.65-0.75
- Check image exposure and lighting
- Verify model matches training distribution (COCO)

**Q: GPU out of memory with large input size**
- Reduce `input_size` to 640 or smaller
- Use smaller model variant (nano or small)
- Process images serially instead of batching
