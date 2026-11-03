import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-navy-100 text-navy-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest-900 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4 text-forest-300" />
              </div>
              <span className="font-semibold text-lg text-navy-950">FreshCheck</span>
            </div>
            <p className="text-sm text-navy-600 max-w-md leading-relaxed">
              Real-time fruit and vegetable freshness classification powered by on-device
              MobileNetV3-Large neural networks running in WebAssembly via ONNX Runtime Web.
            </p>
            <div className="flex items-center gap-2 text-xs text-forest-800 bg-forest-50 border border-forest-200/70 px-3 py-1.5 rounded-lg w-fit">
              <Lock className="w-3.5 h-3.5 text-forest-700" />
              <span>100% Client-Side Privacy: Camera frames never leave your browser.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-navy-400">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-navy-600 hover:text-forest-800 transition-colors">
                  Product Overview
                </Link>
              </li>
              <li>
                <Link href="/scanner" className="text-navy-600 hover:text-forest-800 transition-colors">
                  Live Camera Scanner
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-navy-600 hover:text-forest-800 transition-colors">
                  Architecture & AI Pipeline
                </Link>
              </li>
            </ul>
          </div>

          {/* Technical Specs */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-navy-400">Architecture</h4>
            <div className="space-y-1.5 text-xs text-navy-600">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-navy-400" />
                <span>MobileNetV3-Large (ONNX)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-navy-400" />
                <span>Input: 224 × 224 × 3 (RGB)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-navy-400" />
                <span>Runtime: WebAssembly (WASM SIMD)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Responsible AI Disclaimer Banner */}
        <div className="pt-6 border-t border-navy-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-navy-500">
          <p className="leading-relaxed max-w-3xl">
            <strong>Disclaimer:</strong> FreshCheck classifications reflect neural network prediction
            probabilities based solely on visual camera frames. This application does not provide
            scientific, medical, food safety, or shelf-life certifications. Always inspect food
            thoroughly before consumption.
          </p>
          <p className="whitespace-nowrap text-navy-400">
            © {new Date().getFullYear()} FreshCheck. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

