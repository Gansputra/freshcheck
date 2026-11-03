import React from 'react';
import {
  DetectedFruit,
  FRUIT_CLASSES,
  FreshnessClass,
  PipelineProgress,
  PipelineResult,
} from '@/types/freshcheck';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
  Activity,
  Info,
  ShieldAlert,
  Search,
  Scan,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface PredictionPanelProps {
  pipelineResult: PipelineResult | null;
  progress: PipelineProgress;
  isInferring: boolean;
  isStreaming: boolean;
}

const FRUIT_EMOJIS: Record<string, string> = {
  Apple: '🍎',
  Cherry: '🍒',
  DragonFruit: '🐉',
  Fig: '🫐',
  Lemon: '🍋',
  Lime: '🍈',
  Lychee: '🍓',
  Mango: '🥭',
  Orange: '🍊',
  Peach: '🍑',
  Pineapple: '🍍',
  Tomato: '🍅',
  Watermelon: '🍉',
  Banana: '🍌',
  Grape: '🍇',
};

export const PredictionPanel: React.FC<PredictionPanelProps> = ({
  pipelineResult,
  progress,
  isInferring,
  isStreaming,
}) => {
  const classStyles: Record<
    FreshnessClass,
    {
      text: string;
      bg: string;
      border: string;
      badge: string;
      bar: string;
      icon: React.ReactNode;
    }
  > = {
    Fresh: {
      text: 'text-emerald-800',
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      bar: 'bg-emerald-600',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    },
    'Semi-Fresh': {
      text: 'text-amber-800',
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      bar: 'bg-amber-500',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
    },
    Rotten: {
      text: 'text-rose-800',
      bg: 'bg-rose-50/70',
      border: 'border-rose-200',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      bar: 'bg-rose-600',
      icon: <XCircle className="w-4 h-4 text-rose-600 shrink-0" />,
    },
  };

  // 1. Initial Empty / Waiting State
  if (!pipelineResult) {
    return (
      <div className="bg-white rounded-2xl border border-navy-200/80 shadow-sm p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[460px]">
        <div className="w-16 h-16 rounded-2xl bg-navy-50 border border-navy-100 flex items-center justify-center text-navy-400 mb-4">
          <Scan className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-navy-900 mb-1">
          Menunggu Input Pemindaian
        </h3>
        <p className="text-sm text-navy-500 max-w-xs mb-6">
          {isStreaming
            ? 'Menganalisis frame kamera dengan YOLOv8s & MobileNetV3...'
            : 'Mulai scanner atau unggah foto untuk mendeteksi buah dan mengecek kesegarannya.'}
        </p>

        {isInferring && (
          <div className="flex items-center gap-2 text-xs font-medium text-forest-700 bg-forest-50 px-3 py-1.5 rounded-full border border-forest-200">
            <span className="w-2 h-2 rounded-full bg-forest-600 animate-ping" />
            <span>{progress.message || 'Menjalankan inferensi AI...'}</span>
          </div>
        )}
      </div>
    );
  }

  // 2. Clear Empty State: When YOLO executes and finds 0 fruits
  if (pipelineResult.noFruitsDetected || pipelineResult.detectedFruits.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-navy-200/80 shadow-sm p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[460px]">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
          <Search className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-navy-950 mb-1">
          Tidak Ada Buah Terdeteksi
        </h3>
        <p className="text-xs sm:text-sm text-navy-600 max-w-sm mb-4 leading-relaxed">
          Model YOLOv8s tidak menemukan objek buah pada frame ini. Pastikan buah terlihat jelas dan
          cukup pencahayaan.
        </p>
        <div className="p-3 bg-navy-50 rounded-xl border border-navy-100 text-xs text-navy-700 w-full max-w-xs space-y-1">
          <span className="font-semibold text-navy-900 block">15 Buah yang Didukung:</span>
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 max-h-24 overflow-y-auto">
            {FRUIT_CLASSES.map((fc) => (
              <span key={fc} className="px-2 py-0.5 rounded bg-white border border-navy-200 font-medium text-[11px]">
                {FRUIT_EMOJIS[fc] || '🍎'} {fc}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 text-[11px] text-navy-400 font-mono">
          YOLO Inference: {pipelineResult.yoloInferenceTimeMs}ms
        </div>
      </div>
    );
  }

  // 3. Results with Detected Fruits
  const { detectedFruits } = pipelineResult;

  return (
    <div className="bg-white rounded-2xl border border-navy-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Top Telemetry Header */}
      <div className="px-5 py-3.5 border-b border-navy-100 flex items-center justify-between bg-navy-50/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-navy-900">
            Hasil Deteksi Buah
          </span>
          <span className="text-xs bg-forest-100 text-forest-800 font-bold px-2 py-0.5 rounded-full">
            {detectedFruits.length} Ditemukan
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-navy-500">
          <div className="flex items-center gap-1" title="Total Pipeline Time">
            <Zap className="w-3.5 h-3.5 text-forest-700" />
            <span className="font-mono">{pipelineResult.totalTimeMs} ms</span>
          </div>
          <div className="flex items-center gap-1" title="Detection Timestamp">
            <Clock className="w-3.5 h-3.5 text-navy-400" />
            <span>{pipelineResult.timestamp}</span>
          </div>
        </div>
      </div>

      {/* Detection Cards List */}
      <div className="p-4 sm:p-5 space-y-4 max-h-[620px] overflow-y-auto">
        {detectedFruits.map((fruit, idx) => {
          const freshness = fruit.freshnessResult;
          const freshnessStyle = freshness ? classStyles[freshness.topClass] : null;
          const emoji = FRUIT_EMOJIS[fruit.fruitClass] || '🍏';

          return (
            <div
              key={fruit.id || idx}
              className="p-4 rounded-xl border border-navy-200/80 bg-white hover:border-navy-300 transition-all shadow-xs space-y-3.5"
            >
              {/* Card Header: Crop preview + Fruit Type + Freshness Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Clean Crop Thumbnail from ORIGINAL Image */}
                  {fruit.cropDataUrl ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-navy-200 bg-navy-950 shrink-0 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={fruit.cropDataUrl}
                        alt={`${fruit.fruitClass} crop`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-navy-50 border border-navy-200 flex items-center justify-center text-2xl shrink-0">
                      {emoji}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{emoji}</span>
                      <h4 className="font-bold text-base text-navy-950">
                        {fruit.fruitClass}
                      </h4>
                    </div>
                    <div className="text-xs text-navy-500 font-mono">
                      Deteksi: {fruit.detectionConfidencePercentage}%
                    </div>
                  </div>
                </div>

                {/* Freshness Classification Pill */}
                {freshness && freshnessStyle ? (
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold ${freshnessStyle.badge}`}
                    >
                      {freshnessStyle.icon}
                      <span>{freshness.topClass}</span>
                      <span className="font-mono">{freshness.confidencePercentage}%</span>
                    </div>
                    <div className="text-[10px] text-navy-400 mt-0.5">
                      Probabilitas Kesegaran
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-medium text-navy-400 bg-navy-50 px-2.5 py-1 rounded-lg border border-navy-200">
                    Freshness Skipped
                  </div>
                )}
              </div>

              {/* Freshness Probabilities Breakdown */}
              {freshness && (
                <div className="space-y-1.5 pt-1">
                  <div className="grid grid-cols-3 gap-2">
                    {freshness.probabilities.map((prob) => {
                      const itemStyle = classStyles[prob.className];
                      const isTop = prob.className === freshness.topClass;

                      return (
                        <div
                          key={prob.className}
                          className={`p-2 rounded-lg border text-center transition-all ${
                            isTop
                              ? 'bg-navy-50/70 border-navy-300 font-bold'
                              : 'bg-white border-navy-100 text-navy-600'
                          }`}
                        >
                          <div className="text-[10px] uppercase tracking-wider text-navy-500 mb-0.5">
                            {prob.className}
                          </div>
                          <div className="text-xs font-mono font-bold text-navy-900">
                            {prob.percentage}%
                          </div>
                          <div className="w-full bg-navy-100 rounded-full h-1 mt-1 overflow-hidden">
                            <div
                              className={`h-full ${itemStyle.bar}`}
                              style={{ width: `${Math.max(3, prob.percentage)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Scientific Species Validation Notice */}
              {!fruit.isSpeciesValidated && (
                <div className="p-2.5 rounded-lg bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <strong>Pemberitahuan Spesies:</strong> {fruit.validationNotice}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Telemetry & Disclaimers */}
      <div className="p-4 bg-navy-50/70 border-t border-navy-100 text-xs text-navy-600 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-navy-500 font-mono">
          <span>YOLOv8s: {pipelineResult.yoloInferenceTimeMs}ms</span>
          <span>MobileNetV3: {pipelineResult.freshnessInferenceTimeMs}ms</span>
          {pipelineResult.filteredDetectionCount !== undefined && (
            <span>
              Anchors: 8400 → {pipelineResult.filteredDetectionCount} conf → {pipelineResult.detectedFruits.length} NMS
            </span>
          )}
          <span>Total: {pipelineResult.totalTimeMs}ms</span>
        </div>

        <div className="flex items-start gap-2 pt-1 border-t border-navy-200/60 text-[11px] text-navy-500">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-tight">
            Klasifikasi kesegaran merupakan estimasi probabilitas model visual. Tidak memberikan
            jaminan laboratorium atau sertifikasi keamanan konsumsi pangan.
          </p>
        </div>
      </div>
    </div>
  );
};
