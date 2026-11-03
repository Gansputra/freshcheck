import React from 'react';
import { CameraScanner } from '@/components/scanner/CameraScanner';
import { ShieldCheck, Info } from 'lucide-react';

export const metadata = {
  title: 'Live Scanner — FreshCheck AI',
  description: 'Real-time camera scanner for classifying fruit and vegetable freshness using ONNX WebAssembly.',
};

export default function ScannerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-100">
        <div>
          <div className="flex items-center gap-2 text-forest-800 text-xs font-semibold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-forest-600" />
            <span>Interactive Scanner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Produce Freshness Scanner
          </h1>
          <p className="text-sm text-navy-600 mt-1">
            Real-time visual classification powered by MobileNetV3-Large ONNX.
          </p>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-navy-50 text-navy-700 border border-navy-200/80 font-medium">
            3-Class Logits
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-forest-50 text-forest-900 border border-forest-200 font-medium">
            Local ONNX Inference
          </div>
        </div>
      </div>

      {/* Main Scanner Container */}
      <CameraScanner />
    </div>
  );
}

