'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  PipelineProgress,
  PipelineResult,
} from '@/types/freshcheck';
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Maximize2,
  FileText,
  Search,
} from 'lucide-react';
import { createSyntheticSample } from '@/lib/samples/generateSampleImage';

interface ImageUploadSectionProps {
  onInferImage: (source: CanvasImageSource, width: number, height: number) => Promise<void>;
  pipelineResult: PipelineResult | null;
  progress: PipelineProgress;
  isInferring: boolean;
  onClear: () => void;
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

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  onInferImage,
  pipelineResult,
  progress,
  isInferring,
  onClear,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [selectedFruitId, setSelectedFruitId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('Silakan pilih file gambar (JPG, PNG, WEBP).');
        return;
      }

      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setImageSrc(src);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = async () => {
          setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          await onInferImage(img, img.naturalWidth, img.naturalHeight);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    },
    [onInferImage]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleTestPreset = async (type: 'fresh' | 'semifresh' | 'rotten') => {
    const titles = {
      fresh: 'Sample_Fresh_Apple.png',
      semifresh: 'Sample_SemiFresh_Fruit.png',
      rotten: 'Sample_Rotten_Produce.png',
    };
    setImageFileName(titles[type]);

    const canvas = createSyntheticSample(type);
    const dataUrl = canvas.toDataURL();
    setImageSrc(dataUrl);
    setImageDimensions({ width: canvas.width, height: canvas.height });

    await onInferImage(canvas, canvas.width, canvas.height);
  };

  const handleReset = () => {
    setImageSrc(null);
    setImageFileName(null);
    setImageDimensions(null);
    setSelectedFruitId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear();
  };

  const detectedFruits = pipelineResult?.detectedFruits || [];

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 1. Upload Dropzone (When no image is uploaded) */}
      {!imageSrc ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative bg-white rounded-3xl border-2 border-dashed p-8 sm:p-14 text-center cursor-pointer transition-all shadow-sm ${
            dragActive
              ? 'border-forest-600 bg-forest-50/60 scale-[1.01]'
              : 'border-navy-200 hover:border-forest-500 hover:bg-forest-50/30'
          }`}
        >
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-700 mx-auto shadow-xs">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-bold text-navy-950">
                Tarik &amp; Letakkan Foto Buah ke Sini
              </h3>
              <p className="text-xs sm:text-sm text-navy-500 leading-relaxed">
                atau klik untuk memilih file dari galeri/penyimpanan perangkat Anda.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-900 text-white font-semibold text-xs sm:text-sm hover:bg-forest-800 transition-colors shadow-sm">
              <ImageIcon className="w-4 h-4 text-forest-300" />
              <span>Pilih Gambar dari Perangkat</span>
            </div>

            <div className="text-[11px] text-navy-400 pt-2 border-t border-navy-100 flex items-center justify-center gap-3">
              <span>Format: JPG, PNG, WEBP</span>
              <span>•</span>
              <span>Multi-Object Detection Supported</span>
            </div>
          </div>

          {/* Quick Preset Samples */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-8 pt-6 border-t border-navy-100 flex flex-col sm:flex-row items-center justify-center gap-2.5 text-xs"
          >
            <span className="text-navy-500 font-medium flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-forest-700" />
              Atau coba sampel gambar instan:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => handleTestPreset('fresh')}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-medium transition-colors"
              >
                🍎 Fresh Apple
              </button>
              <button
                onClick={() => handleTestPreset('semifresh')}
                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-medium transition-colors"
              >
                🍌 Semi-Fresh
              </button>
              <button
                onClick={() => handleTestPreset('rotten')}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 font-medium transition-colors"
              >
                🍊 Rotten Produce
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Uploaded Image Inspector with Interactive Bounding Boxes */
        <div className="space-y-4">
          <div className="bg-navy-950 rounded-3xl overflow-hidden shadow-2xl border border-navy-800 relative">
            {/* Top Inspector Bar */}
            <div className="p-4 bg-navy-900/90 backdrop-blur-md border-b border-navy-800 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-2 font-medium">
                <FileText className="w-4 h-4 text-forest-400" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{imageFileName}</span>
                {imageDimensions && (
                  <span className="text-navy-400 font-mono text-[11px] hidden sm:inline">
                    ({imageDimensions.width} × {imageDimensions.height}px)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-200 border border-navy-700 transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ganti Foto</span>
                </button>
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg bg-navy-800 hover:bg-rose-900/50 text-navy-400 hover:text-rose-300 border border-navy-700 transition-colors"
                  title="Hapus foto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image Canvas Viewport with Bounding Boxes */}
            <div className="relative w-full flex items-center justify-center p-4 sm:p-6 bg-black min-h-[380px] max-h-[640px]">
              <div className="relative inline-block max-w-full max-h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Uploaded Fruit"
                  className="max-w-full max-h-[580px] object-contain rounded-2xl shadow-lg block"
                />

                {/* Bounding Box Overlays */}
                {detectedFruits.map((fruit, idx) => {
                  const [rx1, ry1, rx2, ry2] = fruit.relativeBox;
                  const left = `${rx1 * 100}%`;
                  const top = `${ry1 * 100}%`;
                  const width = `${(rx2 - rx1) * 100}%`;
                  const height = `${(ry2 - ry1) * 100}%`;

                  const isFresh = fruit.freshnessResult?.topClass === 'Fresh';
                  const isSemi = fruit.freshnessResult?.topClass === 'Semi-Fresh';
                  const isRotten = fruit.freshnessResult?.topClass === 'Rotten';
                  const isSelected = selectedFruitId === fruit.id;

                  let border = 'border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.4)]';
                  let badge = 'bg-sky-950/90 text-sky-200 border-sky-400/80';

                  if (isFresh) {
                    border = 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]';
                    badge = 'bg-emerald-950/90 text-emerald-100 border-emerald-400/80';
                  } else if (isSemi) {
                    border = 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]';
                    badge = 'bg-amber-950/90 text-amber-100 border-amber-400/80';
                  } else if (isRotten) {
                    border = 'border-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]';
                    badge = 'bg-rose-950/90 text-rose-100 border-rose-500/80';
                  }

                  const emoji = FRUIT_EMOJIS[fruit.fruitClass] || '🍏';

                  // Prevent badge clipping at image top & right boundaries
                  const isNearTop = ry1 < 0.12;
                  const isNearRight = rx1 > 0.68;
                  const badgePositionClass = isNearTop
                    ? `top-1.5 ${isNearRight ? 'right-1.5' : 'left-1.5'}`
                    : `-top-9 ${isNearRight ? 'right-0' : 'left-0'}`;

                  return (
                    <div
                      key={fruit.id || idx}
                      onClick={() => setSelectedFruitId(isSelected ? null : fruit.id)}
                      className={`absolute border-2 rounded-xl transition-all duration-200 cursor-pointer ${border} ${
                        isSelected ? 'ring-4 ring-white/50 scale-[1.01]' : 'hover:scale-[1.005]'
                      }`}
                      style={{
                        left,
                        top,
                        width,
                        height,
                        zIndex: isSelected ? 30 : 10 + (idx % 10),
                      }}
                    >
                      {/* Floating Badge */}
                      <div
                        className={`absolute ${badgePositionClass} flex items-center gap-2 px-2.5 py-1 rounded-lg backdrop-blur-md border shadow-lg text-xs whitespace-nowrap ${badge}`}
                      >
                        <span>{emoji}</span>
                        <span className="font-bold">{fruit.fruitClass}</span>
                        <span className="font-mono text-[11px] opacity-80">
                          {fruit.detectionConfidencePercentage}%
                        </span>

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
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Empty State Overlay if no fruits were found */}
                {pipelineResult?.noFruitsDetected && (
                  <div className="absolute inset-0 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 rounded-2xl">
                    <div className="bg-navy-900 border border-white/20 p-5 rounded-2xl text-center text-white space-y-2 shadow-2xl max-w-sm">
                      <Search className="w-8 h-8 text-amber-400 mx-auto" />
                      <h4 className="font-bold text-sm">Tidak Ada Buah Ditemukan</h4>
                      <p className="text-xs text-navy-300 leading-relaxed">
                        YOLOv8s tidak menemukan objek buah pada gambar ini. Coba gunakan foto dengan
                        pencahayaan lebih terang atau buah lebih fokus.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Status & Re-scan Toolbar */}
            <div className="p-4 bg-navy-900/90 backdrop-blur-md border-t border-navy-800 flex flex-wrap items-center justify-between gap-3 text-xs text-white">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-forest-400" />
                <span className="text-navy-300">Hasil Analisis:</span>
                <span className="font-bold text-white">
                  {detectedFruits.length > 0
                    ? `${detectedFruits.length} buah teridentifikasi`
                    : 'Tidak ada buah'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isInferring ? (
                  <div className="flex items-center gap-2 text-forest-300 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{progress.message || 'Menganalisis...'}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (imageRef.current) {
                        onInferImage(
                          imageRef.current,
                          imageRef.current.naturalWidth,
                          imageRef.current.naturalHeight
                        );
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-forest-600 hover:bg-forest-500 text-white font-medium transition-colors shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Scan Ulang Foto Ini</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

