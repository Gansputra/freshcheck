import React from 'react';
import {
  CameraStatus,
  DetectedFruit,
  PipelineProgress,
  PipelineResult,
} from '@/types/freshcheck';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Lock,
  RotateCcw,
  Sparkles,
  Search,
  HelpCircle,
} from 'lucide-react';

interface ScanningOverlayProps {
  status: CameraStatus;
  errorMessage?: string | null;
  pipelineResult: PipelineResult | null;
  progress: PipelineProgress;
  isInferring: boolean;
  onRequestStart: () => void;
}

const FRUIT_EMOJIS: Record<string, string> = {
  Apple: '🍎',
  Banana: '🍌',
  Grape: '🍇',
  Orange: '🍊',
  Pineapple: '🍍',
  Watermelon: '🍉',
};

export const ScanningOverlay: React.FC<ScanningOverlayProps> = ({
  status,
  errorMessage,
  pipelineResult,
  progress,
  isInferring,
  onRequestStart,
}) => {
  // 1. Idle State
  if (status === 'idle') {
    return (
      <div className="absolute inset-0 bg-navy-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 text-white shadow-inner">
          <Camera className="w-8 h-8 text-forest-300" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Camera Scanner Ready</h3>
        <p className="text-sm text-navy-300 max-w-sm mb-6 leading-relaxed">
          Aktifkan kamera untuk mendeteksi buah (Apple, Banana, Grape, Orange, Pineapple, Watermelon)
          dan klasifikasi kesegarannya secara real-time.
        </p>
        <button
          onClick={onRequestStart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-600 hover:bg-forest-500 text-white font-semibold text-sm transition-all shadow-lg shadow-forest-900/40 active:scale-95"
        >
          <Camera className="w-4 h-4" />
          <span>Mulai Scanner Kamera</span>
        </button>
      </div>
    );
  }

  // 2. Requesting Camera Access
  if (status === 'requesting') {
    return (
      <div className="absolute inset-0 bg-navy-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
        <RefreshCw className="w-10 h-10 text-forest-400 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Meminta Izin Kamera...</h3>
        <p className="text-sm text-navy-300 max-w-sm">
          Silakan klik <strong>&quot;Allow / Izinkan&quot;</strong> pada prompt izin kamera browser Anda.
        </p>
      </div>
    );
  }

  // 3. Denied / Error / Unsupported State
  if (status === 'denied' || status === 'error' || status === 'unsupported') {
    return (
      <div className="absolute inset-0 bg-navy-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 shadow-inner">
          {status === 'denied' ? <Lock className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          {status === 'denied'
            ? 'Izin Kamera Ditolak / Diblokir'
            : status === 'unsupported'
            ? 'Akses Kamera Tidak Didukung'
            : 'Kamera Gagal Dimulai'}
        </h3>
        <p className="text-xs sm:text-sm text-navy-200 max-w-md mb-6 leading-relaxed">
          {errorMessage ||
            'Klik ikon Gembok / Setelan di sebelah kiri URL browser untuk mengizinkan akses kamera, lalu muat ulang halaman.'}
        </p>
        <button
          onClick={onRequestStart}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all shadow-lg active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Coba Minta Izin Lagi</span>
        </button>
      </div>
    );
  }

  const detectedFruits = pipelineResult?.detectedFruits || [];
  const hasDetections = detectedFruits.length > 0;
  const noFruitsDetected = pipelineResult?.noFruitsDetected === true;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {/* 4. Active Bounding Boxes for Every Detected Fruit */}
      {hasDetections &&
        detectedFruits.map((fruit, idx) => {
          const [rx1, ry1, rx2, ry2] = fruit.relativeBox;
          const leftPercent = Math.max(0, rx1 * 100);
          const topPercent = Math.max(0, ry1 * 100);
          const widthPercent = Math.min(100 - leftPercent, (rx2 - rx1) * 100);
          const heightPercent = Math.min(100 - topPercent, (ry2 - ry1) * 100);

          const freshnessClass = fruit.freshnessResult?.topClass;
          const isFresh = freshnessClass === 'Fresh';
          const isSemi = freshnessClass === 'Semi-Fresh';
          const isRotten = freshnessClass === 'Rotten';

          // Color themes based on freshness
          let borderStyle = 'border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.35)]';
          let cornerStyle = 'border-sky-300';
          let badgeBg = 'bg-sky-950/90 text-sky-200 border-sky-400/70';

          if (isFresh) {
            borderStyle = 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.45)]';
            cornerStyle = 'border-emerald-300';
            badgeBg = 'bg-emerald-950/90 text-emerald-100 border-emerald-400/80';
          } else if (isSemi) {
            borderStyle = 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.45)]';
            cornerStyle = 'border-amber-300';
            badgeBg = 'bg-amber-950/90 text-amber-100 border-amber-400/80';
          } else if (isRotten) {
            borderStyle = 'border-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.45)]';
            cornerStyle = 'border-rose-400';
            badgeBg = 'bg-rose-950/90 text-rose-100 border-rose-500/80';
          }

          const emoji = FRUIT_EMOJIS[fruit.fruitClass] || '🍏';

          return (
            <div
              key={fruit.id || idx}
              className={`absolute border-2 rounded-xl transition-all duration-200 ${borderStyle}`}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
              }}
            >
              {/* Corner Brackets */}
              <div
                className={`absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 rounded-tl-md ${cornerStyle}`}
              />
              <div
                className={`absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 rounded-tr-md ${cornerStyle}`}
              />
              <div
                className={`absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 rounded-bl-md ${cornerStyle}`}
              />
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 rounded-br-md ${cornerStyle}`}
              />

              {/* Floating Header Tag directly on the fruit box */}
              <div
                className={`absolute -top-10 left-0 flex items-center gap-2 px-2.5 py-1 rounded-lg backdrop-blur-md border shadow-lg text-xs whitespace-nowrap ${badgeBg}`}
              >
                <span className="text-sm">{emoji}</span>
                <span className="font-bold uppercase tracking-wider">
                  {fruit.fruitClass}
                </span>
                <span className="font-mono text-[11px] opacity-80">
                  {fruit.detectionConfidencePercentage}%
                </span>

                {/* Freshness Classification Pill if available */}
                {fruit.freshnessResult && (
                  <span
                    className={`ml-1 pl-1.5 border-l border-white/20 font-black flex items-center gap-1 ${
                      isFresh
                        ? 'text-emerald-300'
                        : isSemi
                        ? 'text-amber-300'
                        : 'text-rose-300'
                    }`}
                  >
                    {isFresh && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {isSemi && <AlertTriangle className="w-3.5 h-3.5" />}
                    {isRotten && <XCircle className="w-3.5 h-3.5" />}
                    <span>{fruit.freshnessResult.topClass}</span>
                    <span className="font-mono text-[10px]">
                      {fruit.freshnessResult.confidencePercentage}%
                    </span>
                  </span>
                )}

                {/* Unverified species badge */}
                {!fruit.isSpeciesValidated && (
                  <span className="text-[10px] bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/40">
                    Unverified
                  </span>
                )}
              </div>
            </div>
          );
        })}

      {/* 5. Clear Empty State: When YOLO runs and detects no fruit in frame */}
      {noFruitsDetected && !hasDetections && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-navy-950/85 backdrop-blur-md border border-white/15 px-5 py-3.5 rounded-2xl text-center shadow-xl max-w-sm space-y-1.5">
            <div className="flex items-center justify-center gap-2 text-forest-300 text-xs font-semibold uppercase tracking-wider">
              <Search className="w-4 h-4" />
              <span>Scanning for Fruit</span>
            </div>
            <p className="text-xs text-navy-200">
              Tidak ada buah terdeteksi. Arahkan kamera ke salah satu buah yang didukung:
            </p>
            <div className="pt-1 flex flex-wrap items-center justify-center gap-1.5 text-xs text-white">
              <span className="px-2 py-0.5 rounded bg-white/10">🍎 Apple</span>
              <span className="px-2 py-0.5 rounded bg-white/10">🍌 Banana</span>
              <span className="px-2 py-0.5 rounded bg-white/10">🍇 Grape</span>
              <span className="px-2 py-0.5 rounded bg-white/10">🍊 Orange</span>
              <span className="px-2 py-0.5 rounded bg-white/10">🍍 Pineapple</span>
              <span className="px-2 py-0.5 rounded bg-white/10">🍉 Watermelon</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Subtle default scanning reticle when no detection has run yet */}
      {!hasDetections && !noFruitsDetected && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-2xl border border-white/20">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-forest-400 rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-forest-400 rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-forest-400 rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-forest-400 rounded-br-lg" />

            <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-forest-400 to-transparent shadow-[0_0_8px_#4ade80] animate-scanline" />

            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-navy-950/85 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/15 text-[11px] text-white flex items-center gap-1.5 whitespace-nowrap shadow-md">
              <span
                className={`w-2 h-2 rounded-full ${
                  isInferring ? 'bg-forest-400 animate-ping' : 'bg-forest-500'
                }`}
              />
              <span>YOLOv8s + MobileNetV3 AI</span>
            </div>
          </div>
        </div>
      )}

      {/* 7. Bottom Pipeline Progress Pill */}
      {isInferring && progress.message && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-navy-950/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs text-white flex items-center gap-2 shadow-xl">
          <RefreshCw className="w-3.5 h-3.5 text-forest-400 animate-spin" />
          <span>{progress.message}</span>
        </div>
      )}
    </div>
  );
};
