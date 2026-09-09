# 🌾 KisanMitra Machine Learning & Computer Vision System

## 1. Architecture & Model Transparency

KisanMitra evaluates **harvested produce & commodity market quality** using a modular computer vision pipeline.

```
Incoming Produce Image
        │
        ▼
[Image Preprocessing & Validation]
  • Resolution check (min 80x80px)
  • Laplacian variance blur metric (var >= 60.0)
        │
        ▼
[Produce Detection & Spectral Segmentation]
  • HSV & LAB color-space analysis
  • Geometric contour boundary extraction
  • Crop matching across 6 supported commodities:
    (Tomato, Chilli, Onion, Potato, Banana, Rice)
        │
        ▼
[Visible Quality Feature Extraction]
  • Crop-specific defect & blemish contour ratio
  • Surface color maturity & greening index
  • Shriveling / texture roughness (Sobel gradient)
  • Scale / skin curing & uniformity variance
        │
        ▼
[Deterministic Scoring Layer]
  • Quality Score (0 - 100) based on actual physical features
  • Category: EXCELLENT | GOOD | FAIR | BELOW AVERAGE | POOR
  • Zero random numbers (No Math.random())
```

---

## 2. Technical Model Status

| Parameter | Current Project Status |
|---|---|
| **Active Inference Pipeline** | Deterministic OpenCV Computer Vision (`crop_vision_engine.py`) |
| **Active Model Version** | `CropQuality-VisionEngine v1.0.0` |
| **Deep Learning Weights** | Pending custom domain dataset training |
| **Honesty Guarantee** | No fabricated accuracy claims. No synthetic benchmark numbers. |
| **Target DL Architectures** | MobileNetV3-Large / EfficientNet-B0 (Quality) & YOLOv8n (Detection) |

---

## 3. Dataset Requirements for Fine-Tuning

To train a domain-specific deep learning model for APMC market grading, images must be collected of **harvested produce** (not leaves or plant disease).

### Directory Structure
```
ml/datasets/
├── train/
│   ├── Tomato/
│   │   ├── EXCELLENT/
│   │   ├── GOOD/
│   │   ├── FAIR/
│   │   ├── BELOW_AVERAGE/
│   │   └── POOR/
│   ├── Chilli/
│   ├── Onion/
│   ├── Potato/
│   ├── Banana/
│   └── Rice/
└── val/
    └── (Same structure as train, 80/20 train/val split)
```

### Visual Label Definitions
1. **EXCELLENT (90-100)**: Freshly harvested, uniform color, optimal maturity, blemish ratio < 3%, no cracks or greening.
2. **GOOD (80-89)**: Sound produce with minor superficial blemishes (< 8% surface area), suitable for premium retail or standard mandi lotting.
3. **FAIR (70-79)**: Moderate visible variation, breaker stage or minor bruising (8-15% surface area), requires grading/sorting.
4. **BELOW AVERAGE (60-69)**: High blemish ratio (15-25%), partial shriveling, or noticeable greening/scab.
5. **POOR (< 60)**: Advanced decay, mold patches, severe mechanical cuts, or extreme over-ripeness.

---

## 4. Training & Export Instructions

When domain datasets are loaded into `ml/datasets/`:
```bash
# Fine-tune MobileNetV3 classifier
python ml/training/train_quality_classifier.py --epochs 35 --batch-size 32

# Export to ONNX for lightweight production inference
python ml/training/export_onnx.py --output ml/models/crop_quality_mobilenet.onnx
```
