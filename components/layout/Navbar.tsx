'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, ScanLine, Info, Menu, X, Cpu } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Overview' },
    { href: '/scanner', label: 'Live Scanner', badge: 'Real-time' },
    { href: '/about', label: 'Architecture & AI' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-navy-100 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center space-x-2.5 text-navy-900 group transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-forest-900 flex items-center justify-center text-white shadow-sm shadow-forest-900/20 group-hover:bg-forest-800 transition-colors">
              <ShieldCheck className="w-5 h-5 text-forest-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg tracking-tight text-navy-950 flex items-center gap-1.5">
                FreshCheck
                <span className="hidden sm:inline-block text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-forest-50 text-forest-800 border border-forest-200">
                  ONNX AI
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-forest-50 text-forest-900 font-semibold'
                      : 'text-navy-700 hover:text-navy-900 hover:bg-navy-50'
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="text-[10px] bg-forest-100 text-forest-800 px-1.5 py-0.2 rounded font-medium">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action & Engine Badge */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center gap-1.5 text-xs text-navy-600 bg-navy-50 border border-navy-200/60 px-2.5 py-1.5 rounded-lg">
              <Cpu className="w-3.5 h-3.5 text-forest-700" />
              <span>MobileNetV3 WASM</span>
            </div>
            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-forest-900 text-white text-sm font-medium hover:bg-forest-800 transition-colors shadow-sm shadow-forest-900/15"
            >
              <ScanLine className="w-4 h-4 text-forest-300" />
              <span>Launch Scanner</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-navy-700 hover:bg-navy-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-navy-100 bg-white px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? 'bg-forest-50 text-forest-900 font-semibold'
                    : 'text-navy-700 hover:bg-navy-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-xs bg-forest-100 text-forest-800 px-2 py-0.5 rounded">
                      {link.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/scanner"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-forest-900 text-white text-sm font-medium hover:bg-forest-800 transition-colors"
            >
              <ScanLine className="w-4 h-4 text-forest-300" />
              <span>Launch Scanner</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

