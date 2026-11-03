'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useFruitDetectionPipeline } from '@/hooks/useFruitDetectionPipeline';
import { ScanningOverlay } from './ScanningOverlay';
import { PredictionPanel } from './PredictionPanel';
import { createSyntheticSample } from '@/lib/samples/generateSampleImage';
import {
  Camera,
  CameraOff,
  SwitchCamera,
  AlertTriangle,
  Upload,
  RefreshCw,
  Info,
  Cpu,
  Layers,
  Sparkles,
  Scan,
  ShieldAlert,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const CameraScanner: React.FC = () => {
  const {
    videoRef,
    status: cameraStatus,
    errorMessage: cameraError,
    startCamera,
    stopCamera,
    switchCamera,
    isStreaming,
  } = useCamera();

  const {
    modelStatus,
    progress,
    result: pipelineResult,
    isInferring,
    pipelineConfig,
    setPipelineConfig,
    initModels,
    inferSource,
    startContinuousInference,
    stopContinuousInference,
    clearResult,
  } = useFruitDetectionPipeline({ inferenceIntervalMs: 850 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'camera' | 'upload' | 'sample'>('camera');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [sampleLabel, setSampleLabel] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isSecureContext, setIsSecureContext] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSecureContext(window.isSecureContext);
    }
  }, []);

  // Initialize both ONNX models on mount (singleton session)
  useEffect(() => {
    initModels();
  }, [initModels]);

  // Manage continuous inference when camera stream is active
  useEffect(() => {
    if (cameraStatus === 'active' && videoRef.current && activeMode === 'camera') {
      startContinuousInference(videoRef.current);
    } else {
      stopContinuousInference();
    }
  }, [cameraStatus, activeMode, videoRef, startContinuousInference, stopContinuousInference]);

  const handleStopCamera = () => {
    stopContinuousInference();
    stopCamera();
    clearResult();
  };

  const handleStartCamera = async () => {
    setSelectedImageSrc(null);
    setSampleLabel(null);
    setActiveMode('camera');
    await startCamera();
  };

  // Image Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (cameraStatus === 'active') {
      handleStopCamera();
    }

    setSampleLabel(file.name);
    setActiveMode('upload');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const src = event.target?.result as string;
      setSelectedImageSrc(src);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        setIsProcessingImage(true);
        try {
          await inferSource(img, img.naturalWidth, img.naturalHeight);
        } finally {
          setIsProcessingImage(false);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Preset Sample Tester
  const handleTestSample = async (type: 'fresh' | 'semifresh' | 'rotten') => {
    if (cameraStatus === 'active') {
      handleStopCamera();
    }

    const labels = {
      fresh: 'Fresh Apple Sample',
      semifresh: 'Semi-Fresh Fruit Sample',
      rotten: 'Rotten Produce Sample',
    };

    setSampleLabel(labels[type]);
    setActiveMode('sample');

    const canvas = createSyntheticSample(type);
    setSelectedImageSrc(canvas.toDataURL());

    setIsProcessingImage(true);
    try {
      await inferSource(canvas, canvas.width, canvas.height);
    } finally {
      setIsProcessingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Insecure Context (HTTP) Notice for Mobile Browsers */}
      {!isSecureContext && (
        <div className="bg-rose-500 text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-rose-600 space-y-2.5">
          <div className="flex items-center gap-2.5 font-bold text-sm sm:text-base">
            <AlertTriangle className="w-5 h-5 text-white shrink-0" />
            <span>Koneksi Bukan HTTPS — Izin Kamera HP Dimatikan Browser</span>
          </div>
          <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
            Browser HP (Google Chrome &amp; Safari) secara otomatis <strong>menonaktifkan dialog izin kamera</strong> pada koneksi <code>http://</code> biasa demi alasan privasi.
          </p>
          <div className="bg-rose-950/60 p-3 rounded-xl text-xs space-y-1 font-mono text-rose-200">
            <div className="font-sans font-bold text-white mb-1">Solusi Mudah:</div>
            <div>1. Buka terminal baru di PC dan jalankan: <strong className="text-white">npm run tunnel</strong></div>
            <div>2. Buka link HTTPS resmi yang muncul (contoh: <strong className="text-white">https://xxxx.loca.lt/scanner</strong>) di browser HP Anda.</div>
          </div>
        </div>
      )}

      {/* 1. Dual Model Loading Progress State */}
      {modelStatus.overall === 'loading' && (
        <div className="bg-navy-950 text-white p-4 rounded-2xl border border-navy-800 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              <RefreshCw className="w-4 h-4 text-forest-400 animate-spin" />
              <span>Memuat Model AI Browser (ONNX WebAssembly)...</span>
            </div>
            <span className="text-xs bg-navy-800 text-navy-200 px-2.5 py-1 rounded-md font-mono">
              WASM SIMD
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
              <span>YOLOv8s (Fruit Detector 44.9MB)</span>
              <span className="text-forest-400">
                {modelStatus.yolo === 'ready' ? '✓ Ready' : 'Loading...'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
              <span>MobileNetV3 (Freshness 16.8MB)</span>
              <span className="text-forest-400">
                {modelStatus.mobilenet === 'ready' ? '✓ Ready' : 'Loading...'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Model Error State Banner */}
      {modelStatus.overall === 'error' && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Gagal Memuat Model ONNX</span>
            </div>
            <button
              onClick={() => initModels()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold transition-all shadow-xs active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Muat Ulang Model</span>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-rose-700 leading-relaxed">
            {modelStatus.errorMessage || 'Pastikan file ONNX berada di folder public/models/.'}
          </p>
          <div className="text-xs text-rose-800 bg-white/70 p-3 rounded-lg border border-rose-200/60 font-mono">
            File yang dibutuhkan: public/models/yolov8s_best.onnx &amp; public/models/freshcheck_mobilenetv3.onnx
          </div>
        </div>
      )}

      {/* 3. Camera Permission Denied / Error Banner */}
      {(cameraStatus === 'denied' || cameraStatus === 'error' || cameraStatus === 'unsupported') && (
        <div className="bg-amber-50 border border-amber-200 text-amber-950 p-5 rounded-2xl space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">Pemberitahuan Izin Kamera</h4>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                {cameraError || 'Kamera tidak dapat diakses.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleStartCamera}
              className="px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition-colors"
            >
              Coba Minta Izin Lagi
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Foto Buah Sebagai Ganti</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. UTAMA: AR CAMERA VIEWFINDER DENGAN DETEKSI MULTI-BUAH & HUD REAL-TIME */}
      {/* ========================================================================= */}
      <div className="bg-navy-950 rounded-3xl overflow-hidden shadow-2xl border border-navy-800 relative">
        {/* Top Viewfinder Bar */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
          <div className="bg-navy-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs text-white font-medium flex items-center gap-2">
            <Scan className="w-3.5 h-3.5 text-forest-400" />
            <span>YOLOv8s + MobileNetV3 Scanner</span>
          </div>

          <div className="flex items-center gap-2">
            {isStreaming && (
              <div className="bg-emerald-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE</span>
              </div>
            )}
          </div>
        </div>

        {/* Viewport Frame */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] w-full flex items-center justify-center bg-black">
          {/* Live Camera Video */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              activeMode === 'camera' && isStreaming ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Upload / Preset Static Image Preview */}
          {(activeMode === 'upload' || activeMode === 'sample') && selectedImageSrc && (
            <div className="absolute inset-0 flex items-center justify-center p-4 bg-navy-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImageSrc}
                alt="Produce Sample"
                className="max-w-full max-h-full object-contain rounded-2xl shadow-xl"
              />
              <div className="absolute top-4 left-4 bg-navy-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs text-navy-200 border border-white/10 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-forest-400" />
                <span>{sampleLabel || 'Test Sample'}</span>
              </div>
            </div>
          )}

          {/* In-Camera Detection Bounding Boxes & AR Overlay */}
          <ScanningOverlay
            status={cameraStatus}
            errorMessage={cameraError}
            pipelineResult={pipelineResult}
            progress={progress}
            isInferring={isInferring || isProcessingImage}
            onRequestStart={handleStartCamera}
          />
        </div>

        {/* Viewfinder Controls Toolbar */}
        <div className="p-4 sm:p-5 bg-navy-900/95 backdrop-blur-md border-t border-navy-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {!isStreaming ? (
              <button
                onClick={handleStartCamera}
                disabled={cameraStatus === 'requesting'}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-500 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-md shadow-forest-900/30 active:scale-95"
              >
                <Camera className="w-4 h-4 text-forest-200" />
                <span>
                  {cameraStatus === 'requesting' ? 'Meminta Izin...' : 'Mulai Kamera'}
                </span>
              </button>
            ) : (
              <button
                onClick={handleStopCamera}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-sm font-semibold transition-all shadow-md shadow-rose-900/30 active:scale-95"
              >
                <CameraOff className="w-4 h-4" />
                <span>Stop Kamera</span>
              </button>
            )}

            {isStreaming && (
              <button
                onClick={switchCamera}
                title="Ganti kamera depan / belakang"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-sm font-medium border border-navy-700 transition-colors"
              >
                <SwitchCamera className="w-4 h-4 text-forest-400" />
                <span className="hidden sm:inline">Ganti Kamera</span>
              </button>
            )}

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-xl border transition-colors ${
                showSettings
                  ? 'bg-forest-900 text-forest-200 border-forest-500'
                  : 'bg-navy-800 text-navy-300 border-navy-700 hover:bg-navy-700'
              }`}
              title="Pengaturan Pipeline & Validasi Spesies"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-200 border border-navy-700 text-xs sm:text-sm font-medium transition-colors"
            >
              <Upload className="w-4 h-4 text-navy-400" />
              <span>Upload Foto</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-navy-800 text-xs">
              <button
                onClick={() => handleTestSample('fresh')}
                disabled={modelStatus.overall === 'loading' || isInferring}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-medium transition-colors"
              >
                Fresh Apple
              </button>
              <button
                onClick={() => handleTestSample('semifresh')}
                disabled={modelStatus.overall === 'loading' || isInferring}
                className="px-2.5 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-500/40 text-amber-300 font-medium transition-colors"
              >
                Semi-Fresh
              </button>
              <button
                onClick={() => handleTestSample('rotten')}
                disabled={modelStatus.overall === 'loading' || isInferring}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-medium transition-colors"
              >
                Rotten
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Modular Pipeline Settings */}
        {showSettings && (
          <div className="p-4 bg-navy-950 border-t border-navy-800 text-xs text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-forest-400" />
                Konfigurasi Pipeline &amp; Validasi Spesies
              </span>
              <span className="text-[11px] text-navy-400">Modular Architecture</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-xl bg-navy-900/90 border border-navy-800 space-y-1.5">
                <label className="font-medium flex items-center justify-between">
                  <span>Confidence Threshold YOLO</span>
                  <span className="font-mono text-forest-300">
                    {Math.round(pipelineConfig.confidenceThreshold * 100)}%
                  </span>
                </label>
                <input
                  type="range"
                  min="0.15"
                  max="0.85"
                  step="0.05"
                  value={pipelineConfig.confidenceThreshold}
                  onChange={(e) =>
                    setPipelineConfig((prev) => ({
                      ...prev,
                      confidenceThreshold: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-forest-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-navy-900/90 border border-navy-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Filter Spesies Belum Tervalidasi</span>
                  <input
                    type="checkbox"
                    checked={pipelineConfig.excludeUnvalidatedSpecies}
                    onChange={(e) =>
                      setPipelineConfig((prev) => ({
                        ...prev,
                        excludeUnvalidatedSpecies: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded accent-forest-500"
                  />
                </div>
                <p className="text-[11px] text-navy-400 leading-snug">
                  Jika dicentang, buah yang belum memiliki dataset kesegaran tervalidasi (Grape,
                  Pineapple, Watermelon) tidak akan diproses oleh MobileNetV3.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. PANEL HASIL DETEKSI MULTI-BUAH & TELEMETRI */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Detailed Results List */}
        <div className="lg:col-span-7">
          <PredictionPanel
            pipelineResult={pipelineResult}
            progress={progress}
            isInferring={isInferring || isProcessingImage}
            isStreaming={isStreaming || activeMode === 'upload' || activeMode === 'sample'}
          />
        </div>

        {/* Right: Technical Specs & Scientific Limitations */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-navy-500 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-forest-700" />
                Pipeline Two-Stage ONNX
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-forest-50 text-forest-800 border border-forest-200">
                Client-Side WASM
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-navy-50/70 border border-navy-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-navy-950 block">Stage 1: YOLOv8s</span>
                  <span className="text-navy-500 text-[11px]">Letterbox 640×640 RGB • 6 Fruit Classes</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-forest-700">10 × 8400</span>
              </div>

              <div className="p-2.5 rounded-lg bg-navy-50/70 border border-navy-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-navy-950 block">Stage 2: MobileNetV3-Large</span>
                  <span className="text-navy-500 text-[11px]">Crop 224×224 • ImageNet Norm • 3 Logits</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-forest-700">Fresh/Semi/Rotten</span>
              </div>
            </div>
          </div>

          {/* Scientific Notice Card */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Batasan Ilmiah &amp; Cakupan Spesies:</span>
            </div>
            <p className="leading-relaxed text-amber-900">
              Model klasifikasi kesegaran dilatih pada dataset buah tertentu (Apple, Banana, Orange).
              Untuk buah jenis lain (Grape, Pineapple, Watermelon), status kesegaran bersifat
              eksperimental dan tidak diklaim memiliki validasi laboratorium.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
