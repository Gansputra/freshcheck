# FreshCheck — Real-Time AI Freshness Scanner

FreshCheck is a production-ready, client-side web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **ONNX Runtime Web (`onnxruntime-web`)**. It performs real-time classification of fruit and vegetable freshness using an on-device **MobileNetV3-Large** neural network running entirely within the browser via WebAssembly (WASM SIMD).

---

## 🌟 Key Features

- **100% Client-Side Inference**: Video frames captured via the HTML5 `MediaDevices` API are preprocessed on an offscreen HTML Canvas and evaluated locally using WebAssembly. No video frames, images, or personal metadata are ever transmitted to an external server.
- **Trained MobileNetV3-Large ONNX Model**: Executes genuine PyTorch-exported model weights (`[1, 3, 224, 224]` input tensor) outputting 3 calibrated class logits (`Fresh`, `Semi-Fresh`, `Rotten`).
- **Exact Pipeline Preprocessing**: Matches the training pipeline bit-for-bit:
  - Center-square aspect ratio crop
  - High-fidelity bilinear resize to 224 × 224
  - RGB normalization to $[0, 1]$
  - Channel-specific ImageNet standardization ($\mu = [0.485, 0.456, 0.406]$, $\sigma = [0.229, 0.224, 0.225]$)
  - Planar NCHW tensor conversion
  - Numerically stable Softmax probability computation
- **Responsive Real-Time Scanner (`/scanner`)**:
  - Live video preview with custom animated targeting reticle and scanline
  - Non-overlapping inference scheduler (runs every ~650ms without queue thrashing)
  - Camera device switching (front/back environment camera or multiple webcams)
  - Clear error states for denied camera permissions or unsupported browsers
  - Alternative photo upload and pre-packaged test presets (Fresh, Semi-Fresh, Rotten) for testing without a webcam
- **Modern Dashboard UI**:
  - Primary class headline with status color coding (Fresh: green, Semi-Fresh: amber, Rotten: red)
  - Exact prediction probability breakdown percentages
  - Inference latency (ms) and timestamp counters
  - Transparent model confidence labeling and food safety disclaimers

---

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx                # Root layout, fonts, Navbar & Footer
│   ├── page.tsx                  # Landing page (Overview, categories, workflow, privacy)
│   ├── scanner/
│   │   └── page.tsx              # Scanner page route
│   ├── about/
│   │   └── page.tsx              # Architecture deep-dive, math, and disclaimers
│   └── globals.css               # Global styles, scanline animations
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx            # Sticky navigation header with status badge
│   │   └── Footer.tsx            # Technical specs, privacy notice, disclaimers
│   └── scanner/
│       ├── CameraScanner.tsx     # Live stream, device controls, upload/preset tester
│       ├── ScanningOverlay.tsx   # Target reticle, corner guides, pulse indicators
│       └── PredictionPanel.tsx   # Top class, probability breakdown bars, latency
├── hooks/
│   ├── useCamera.ts              # MediaDevices lifecycle, permissions, track cleanup
│   └── useFreshnessClassifier.ts # Inference session management & non-overlapping loop
├── lib/
│   ├── onnx/
│   │   ├── config.ts             # Default parameters & remote config loader
│   │   ├── preprocess.ts         # Bilinear resize, ImageNet normalization, NCHW tensor
│   │   ├── postprocess.ts        # Softmax computation & result formatting
│   │   └── session.ts            # Singleton ONNX InferenceSession manager
│   └── samples/
│       └── generateSampleImage.ts# Synthetic produce sample generator for instant testing
├── public/
│   ├── models/
│   │   ├── freshcheck_mobilenetv3.onnx  # MobileNetV3-Large ONNX model weights
│   │   └── freshcheck_config.json       # Input shape, normalization, class mapping
│   └── ort-wasm/                 # WebAssembly SIMD binaries for offline inference
├── types/
│   └── freshcheck.ts             # TypeScript definitions for configs and predictions
├── next.config.mjs               # Webpack configuration, COOP/COEP isolation headers
└── tailwind.config.ts            # Custom forest green & status palette configuration
```

---

## 🤖 AI Model & Preprocessing Pipeline

### Model Details
- **Architecture**: MobileNetV3-Large
- **Input Tensor**: `[1, 3, 224, 224]` (Batch: 1, Channels: 3, Height: 224, Width: 224)
- **Input Color Space**: RGB
- **Output**: 3 class logits
- **Class Order**:
  1. `Fresh` (Index 0)
  2. `Semi-Fresh` (Index 1)
  3. `Rotten` (Index 2)

### Preprocessing Formula
For each channel $c \in \{R, G, B\}$:
$$\text{tensor}[c, y, x] = \frac{\frac{\text{pixel}_{c}(x, y)}{255.0} - \text{mean}[c]}{\text{std}[c]}$$

Where:
- $\text{mean} = [0.485, 0.456, 0.406]$
- $\text{std} = [0.229, 0.224, 0.225]$

### Logits to Probabilities (Softmax)
$$P(c_i) = \frac{\exp(z_i - \max(z))}{\sum_{j} \exp(z_j - \max(z))}$$

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js version 18.x or higher (tested on Node v22)
- npm or yarn

### 1. Installation
```bash
npm install
```

### 2. Verify Model Files
Ensure that the trained ONNX model and its configuration are in `public/models/`:
- `public/models/freshcheck_mobilenetv3.onnx`
- `public/models/freshcheck_config.json`

*(Both are pre-placed in the repository)*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🔒 Privacy & Permissions

1. **Camera Permissions**: The browser will explicitly ask for permission when clicking **Start Scanner**.
2. **Device Disconnection**: Stopping the scanner or navigating away terminates all camera media tracks immediately.
3. **Local Compute**: No images leave your device. All calculations occur inside the client's WebAssembly sandbox.

---

## ⚠️ Important Disclaimers

- **Probabilistic Predictions**: The confidence percentage displayed by FreshCheck indicates the neural network's visual classification probability. It does not constitute a certified percentage of internal freshness, biochemical safety, or remaining shelf life.
- **Single-Object Scanning**: The MobileNetV3 model is trained as a single-subject image classifier. Users should frame one fruit or vegetable clearly in the reticle.
- **No Food Safety Certification**: Visual appearance cannot detect all bacterial toxins, pathogens, or internal degradation. Always perform standard sensory inspection (smell, touch, cut) before consuming produce.

