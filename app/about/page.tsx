import React from 'react';
import Link from 'next/link';
import {
  Cpu,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Code2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';

export const metadata = {
  title: 'Architecture & AI Workflow — FreshCheck',
  description:
    'Technical documentation on the MobileNetV3-Large ONNX pipeline, ImageNet preprocessing, and client-side WebAssembly inference in FreshCheck.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      {/* Page Title */}
      <div className="space-y-4 text-center sm:text-left border-b border-navy-100 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-900 text-xs font-semibold uppercase tracking-wider">
          Technical Documentation
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-navy-950 tracking-tight">
          About FreshCheck &amp; The AI Architecture
        </h1>
        <p className="text-base sm:text-lg text-navy-600 leading-relaxed max-w-2xl">
          An engineering breakdown of how FreshCheck runs computer vision neural networks inside the
          browser using ONNX Runtime Web and WebAssembly.
        </p>
      </div>

      {/* 1. What is FreshCheck? */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-navy-950 flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-forest-700" />
          <span>What is FreshCheck?</span>
        </h2>
        <p className="text-navy-700 text-sm sm:text-base leading-relaxed">
          FreshCheck is a web-based computer vision application designed to categorize the visual
          freshness of fruits and vegetables into three distinct stages: <strong>Fresh</strong>,{' '}
          <strong>Semi-Fresh</strong>, and <strong>Rotten</strong>.
        </p>
        <p className="text-navy-700 text-sm sm:text-base leading-relaxed">
          Rather than transmitting camera frames across the internet to costly and latency-heavy cloud
          APIs, FreshCheck executes the entire inference pipeline directly within the client browser.
          This guarantees immediate feedback, runs offline once loaded, and preserves user privacy.
        </p>
      </section>

      {/* 2. Neural Network Specifications */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-navy-950 flex items-center gap-2.5">
          <Cpu className="w-6 h-6 text-forest-700" />
          <span>Model Architecture: MobileNetV3-Large</span>
        </h2>
        <p className="text-navy-700 text-sm sm:text-base leading-relaxed">
          The underlying model uses the <strong>MobileNetV3-Large</strong> architecture, optimized for
          edge devices through hardware-aware network architecture search (NAS) and NetAdapt algorithms.
          The model weights were trained using PyTorch and exported to the Open Neural Network Exchange
          (ONNX) standard format.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-navy-200/80 shadow-xs space-y-1.5">
            <span className="text-xs font-bold uppercase text-navy-400">Tensor Dimensions</span>
            <div className="text-base font-bold text-navy-900 font-mono">[1, 3, 224, 224]</div>
            <p className="text-xs text-navy-500">
              Batch size 1, 3 color channels (RGB), 224 pixels height, 224 pixels width in NCHW planar layout.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-navy-200/80 shadow-xs space-y-1.5">
            <span className="text-xs font-bold uppercase text-navy-400">Output Logits</span>
            <div className="text-base font-bold text-navy-900 font-mono">[1, 3] Float32</div>
            <p className="text-xs text-navy-500">
              3 unnormalized logit values mapped sequentially to Fresh, Semi-Fresh, and Rotten.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Preprocessing Mathematics */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-navy-950 flex items-center gap-2.5">
          <Layers className="w-6 h-6 text-forest-700" />
          <span>Exact Training-Matched Preprocessing</span>
        </h2>
        <p className="text-navy-700 text-sm sm:text-base leading-relaxed">
          Neural networks are exceptionally sensitive to preprocessing discrepancies. To guarantee
          that live predictions faithfully represent training accuracy, the canvas pipeline adheres
          strictly to the training configuration:
        </p>

        <div className="bg-white rounded-2xl border border-navy-200/80 p-6 space-y-4 shadow-xs">
          <ol className="space-y-3 text-sm text-navy-700 list-decimal list-inside">
            <li>
              <strong>Optical Capture:</strong> Video stream sampled from camera or image element.
            </li>
            <li>
              <strong>Bilinear Rescaling:</strong> Center-cropped to maintain aspect ratio and scaled
              to 224 × 224 using high-quality bilinear interpolation.
            </li>
            <li>
              <strong>RGB Normalization:</strong> Pixel values mapped from 8-bit integers [0, 255]
              to floating-point range [0.0, 1.0].
            </li>
            <li>
              <strong>Channel Standard Standardization:</strong>
              <div className="mt-2 pl-4 py-2 border-l-2 border-forest-500 bg-navy-50/70 font-mono text-xs rounded-r-lg space-y-1">
                <div>Mean (RGB): [0.485, 0.456, 0.406]</div>
                <div>Std  (RGB): [0.229, 0.224, 0.225]</div>
                <div className="text-navy-500 pt-1">
                  Formula: channel_norm = (pixel_rgb / 255.0 - mean) / std
                </div>
              </div>
            </li>
            <li>
              <strong>NCHW Planar Memory Layout:</strong> Converted into flat continuous Float32Array
              channel-first chunks (50,176 red values, 50,176 green values, 50,176 blue values).
            </li>
            <li>
              <strong>Softmax Logit Evaluation:</strong>
              <div className="mt-2 pl-4 py-2 border-l-2 border-forest-500 bg-navy-50/70 font-mono text-xs rounded-r-lg">
                P(class_i) = exp(z_i - max(z)) / sum(exp(z_j - max(z)))
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* 4. Limitations & Ethical AI */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-navy-950 flex items-center gap-2.5">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
          <span>Operational Boundaries &amp; Disclaimers</span>
        </h2>
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 space-y-4 text-sm text-amber-950">
          <h3 className="font-bold text-base text-amber-900">
            Important Scientific &amp; Food Safety Notices:
          </h3>
          <ul className="space-y-2.5 list-disc list-inside leading-relaxed text-amber-900">
            <li>
              <strong>Probabilistic Output:</strong> Percentages generated by FreshCheck represent
              the neural network&apos;s classification probability based on visual surface patterns.
              They do not measure scientific bacterial load, nutritional degradation, or internal rot.
            </li>
            <li>
              <strong>Single-Object Constraint:</strong> The current model is an image classifier, not
              an object detection bounding-box model. Scanning multi-produce clusters or busy
              backgrounds can yield ambiguous predictions. Always center one produce item in frame.
            </li>
            <li>
              <strong>No Safety Guarantees:</strong> Visual appearance alone cannot detect all
              pathogens, foodborne toxins, or chemical residues. Never consume food that smells off,
              feels abnormally soft, or shows signs of spoilage regardless of the model&apos;s
              score.
            </li>
          </ul>
        </div>
      </section>

      {/* CTA back to scanner */}
      <div className="pt-4 text-center sm:text-left">
        <Link
          href="/scanner"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-sm transition-colors shadow-sm"
        >
          <span>Return to Live Scanner</span>
          <ArrowRight className="w-4 h-4 text-forest-300" />
        </Link>
      </div>
    </div>
  );
}

