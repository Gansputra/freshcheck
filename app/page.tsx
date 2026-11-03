import React from 'react';
import Link from 'next/link';
import {
  ScanLine,
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Sliders,
  Database,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-24 py-12 md:py-20">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-50 border border-forest-200 text-forest-900 text-xs font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse" />
            <span>MobileNetV3-Large ONNX Runtime</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-navy-950 tracking-tight leading-[1.12]">
            Know Your Produce.{' '}
            <span className="text-forest-800">Instantly.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-navy-600 leading-relaxed max-w-2xl mx-auto">
            AI-powered freshness classification for fruits and vegetables. Running directly inside
            your browser with zero cloud latency and complete camera privacy.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/scanner"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-base transition-all shadow-md shadow-forest-900/20 group"
            >
              <ScanLine className="w-5 h-5 text-forest-300 group-hover:scale-110 transition-transform" />
              <span>Start Scanning</span>
              <ArrowRight className="w-4 h-4 text-forest-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-navy-50 text-navy-800 border border-navy-200 font-semibold text-base transition-colors"
            >
              <span>How It Works</span>
            </a>
          </div>

          {/* Tech Trust Bar */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-navy-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-forest-700" />
              <span>Real ONNX Inference</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-forest-700" />
              <span>100% Client-Side Frames</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-forest-700" />
              <span>WebAssembly SIMD Speed</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Product Preview Mockup */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-white rounded-3xl border border-navy-200/80 shadow-xl overflow-hidden p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Visual Scanner Mockup */}
            <div className="md:col-span-7 bg-navy-950 rounded-2xl aspect-[4/3] relative overflow-hidden flex items-center justify-center border border-navy-800 shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-tr from-forest-950/40 via-transparent to-navy-900/60" />
              
              {/* Target Reticle */}
              <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-2xl border border-white/20 flex items-center justify-center">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-forest-400" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-forest-400" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-forest-400" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-forest-400" />
                
                <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-forest-400 animate-ping" />
                </div>
                
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-forest-400/80 shadow-[0_0_8px_#4ade80] animate-scanline" />
              </div>

              <div className="absolute bottom-4 left-4 bg-navy-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-forest-400 animate-pulse" />
                <span>Single-Object Classifier</span>
              </div>
            </div>

            {/* Mock Result Showcase */}
            <div className="md:col-span-5 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-forest-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-forest-700" />
                <span>Real-Time Output</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase text-emerald-800">Classification</span>
                  <span className="text-xs text-emerald-700 font-mono">42 ms</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-emerald-950">Fresh</span>
                  <span className="text-2xl font-extrabold text-navy-900 font-mono">92.4%</span>
                </div>
                <p className="text-xs text-emerald-800 mt-2 italic">
                  &quot;The model classifies this sample as Fresh.&quot;
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-navy-700 mb-1">
                    <span>Fresh</span>
                    <span className="font-mono">92.4%</span>
                  </div>
                  <div className="w-full bg-navy-100 rounded-full h-1.5">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '92.4%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-navy-700 mb-1">
                    <span>Semi-Fresh</span>
                    <span className="font-mono">5.1%</span>
                  </div>
                  <div className="w-full bg-navy-100 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '5.1%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-navy-700 mb-1">
                    <span>Rotten</span>
                    <span className="font-mono">2.5%</span>
                  </div>
                  <div className="w-full bg-navy-100 rounded-full h-1.5">
                    <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '2.5%' }} />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/scanner"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-900 text-white text-xs sm:text-sm font-semibold hover:bg-forest-800 transition-colors"
                >
                  <ScanLine className="w-4 h-4 text-forest-300" />
                  <span>Open Interactive Camera</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three Freshness Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-950 tracking-tight">
            Three Distinct Freshness Tiers
          </h2>
          <p className="text-sm sm:text-base text-navy-600">
            Trained on hundreds of agricultural samples across various decay stages to deliver
            calibrated classification logits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fresh */}
          <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  Tier 1
                </div>
                <h3 className="text-xl font-bold text-navy-950">Fresh</h3>
              </div>
              <p className="text-sm text-navy-600 leading-relaxed">
                Produce exhibiting firm skin, intact coloration, natural luster, and absence of
                bruising, fungal spotting, or dehydration.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-100 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Optimal appearance &amp; firm texture</span>
            </div>
          </div>

          {/* Semi-Fresh */}
          <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                  Tier 2
                </div>
                <h3 className="text-xl font-bold text-navy-950">Semi-Fresh</h3>
              </div>
              <p className="text-sm text-navy-600 leading-relaxed">
                Samples displaying initial signs of ripening or age: mild discoloration, slight
                surface softening, skin wrinkling, or superficial blemishes.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-amber-100 text-xs font-semibold text-amber-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Ripe or early post-peak stage</span>
            </div>
          </div>

          {/* Rotten */}
          <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                <XCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                  Tier 3
                </div>
                <h3 className="text-xl font-bold text-navy-950">Rotten</h3>
              </div>
              <p className="text-sm text-navy-600 leading-relaxed">
                Extensive visual degradation including surface molds, bacterial rot, deep dark
                spots, tissue collapse, or active decomposition.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-rose-100 text-xs font-semibold text-rose-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Visible spoilage &amp; degradation</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How the Scanner Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-block text-xs font-bold uppercase tracking-wider text-forest-800">
            Pipeline Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-950 tracking-tight">
            How The FreshCheck Scanner Works
          </h2>
          <p className="text-sm sm:text-base text-navy-600">
            A high-performance pipeline bridging standard web standards with PyTorch-trained ONNX
            neural models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-navy-200/80 p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h4 className="font-bold text-base text-navy-950">Frame Capture</h4>
            <p className="text-xs text-navy-600 leading-relaxed">
              Streams video via HTML5 MediaDevices API preferring the environment camera at up to
              60fps.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-navy-200/80 p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h4 className="font-bold text-base text-navy-950">Bilinear Scaling</h4>
            <p className="text-xs text-navy-600 leading-relaxed">
              Extracts the center square crop and scales it to 224 × 224 pixels using high-fidelity
              canvas interpolation.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-navy-200/80 p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h4 className="font-bold text-base text-navy-950">ImageNet Norm</h4>
            <p className="text-xs text-navy-600 leading-relaxed">
              Converts to RGB [0, 1] range and applies exact training channel normalization:
              mean [0.485, 0.456, 0.406] and std [0.229, 0.224, 0.225].
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-navy-200/80 p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h4 className="font-bold text-base text-navy-950">ONNX WASM</h4>
            <p className="text-xs text-navy-600 leading-relaxed">
              Evaluates MobileNetV3-Large logits through ONNX Runtime WebAssembly and outputs
              normalized Softmax probabilities.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Complete Privacy & Edge Computing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-950 text-white rounded-3xl p-8 sm:p-12 border border-navy-800 shadow-xl overflow-hidden relative">
          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900/60 border border-forest-500/30 text-forest-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero-Cloud Edge Computing</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Your camera frames never leave your computer.
            </h2>

            <p className="text-navy-300 text-sm sm:text-base leading-relaxed">
              Unlike cloud-reliant AI services that stream live video over the internet, FreshCheck
              downloads the MobileNetV3-Large ONNX weights once into your browser. All frame extraction,
              tensor operations, and neural classifications execute on your device&apos;s CPU via
              WebAssembly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-navy-800">
              <div className="space-y-1">
                <span className="text-forest-400 font-bold text-lg">0 KB</span>
                <p className="text-xs text-navy-400">Video frames sent externally</p>
              </div>
              <div className="space-y-1">
                <span className="text-forest-400 font-bold text-lg">&lt; 50 ms</span>
                <p className="text-xs text-navy-400">Local inference latency</p>
              </div>
              <div className="space-y-1">
                <span className="text-forest-400 font-bold text-lg">100% Private</span>
                <p className="text-xs text-navy-400">Full on-device data sovereignty</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-navy-950 tracking-tight">
            Ready to test produce freshness?
          </h2>
          <p className="text-navy-600 text-sm sm:text-base">
            Launch the real-time camera scanner to inspect fruits and vegetables immediately.
          </p>
          <Link
            href="/scanner"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-base transition-colors shadow-sm"
          >
            <ScanLine className="w-5 h-5 text-forest-300" />
            <span>Open FreshCheck Scanner</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

