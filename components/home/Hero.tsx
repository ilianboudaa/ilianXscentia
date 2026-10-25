"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#F7F4EE] via-[#fcf9f5] to-[#f5e7e3]/40 py-20 lg:py-32">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e9ddd7]/50 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#DFBE76]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Floating subtle gold sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-[15%] text-[#ba7d7a]/30 text-xl animate-float">
          ✦
        </div>
        <div
          className="absolute top-48 right-[20%] text-[#ba7d7a]/40 text-sm animate-float"
          style={{ animationDelay: "2s" }}
        >
          ✦
        </div>
        <div
          className="absolute bottom-32 left-[25%] text-[#ba7d7a]/30 text-base animate-float"
          style={{ animationDelay: "4s" }}
        >
          ✦
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Top Maison Monogram Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ba7d7a]/40 bg-[#fcf9f5]/80 backdrop-blur-sm mb-8 shadow-sm">
          <span className="text-[#ba7d7a]">✦</span>
          <span className="text-[11px] uppercase tracking-[0.28em] text-[#76545a] font-medium">
            Maison de Haute Parfumerie Française
          </span>
          <span className="text-[#ba7d7a]">✦</span>
        </div>

        {/* Primary Editorial Title */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#342e2c] font-normal tracking-tight leading-[1.1] mb-6">
          <span className="block text-[#76545a]">SCENTIA</span>
          <span className="block italic font-light text-2xl sm:text-4xl md:text-5xl text-[#9b626a] mt-3 font-serif">
            « La poésie du parfum »
          </span>
        </h1>

        {/* Editorial Subtitle */}
        <p className="max-w-2xl text-base sm:text-lg text-[#76545a]/90 font-light leading-relaxed mb-10 tracking-wide">
          Des élixirs d’exception sculptés dans les matières premières les plus
          rares du monde. Une célébration magistrale de la vanille noire de
          Madagascar, des roses royales de Grasse et des bois sacrés d’Orient.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
          <Link
            href="/#catalogue"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#76545a] hover:bg-[#593e44] text-[#fdf5f1] uppercase tracking-[0.22em] text-xs font-semibold rounded-sm shadow-xl transition-all hover:scale-[1.02] duration-300"
          >
            <span>Explorer la Collection</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/#quiz"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/80 hover:bg-white text-[#76545a] border border-[#ba7d7a]/60 uppercase tracking-[0.22em] text-xs font-semibold rounded-sm shadow-sm transition-all hover:border-[#76545a] duration-300 backdrop-blur-sm"
          >
            <Compass size={16} className="text-[#ba7d7a]" />
            <span>Diagnostic Olfactif</span>
          </Link>
        </div>

        {/* Key Maison Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 pt-16 mt-16 border-t border-[#ba7d7a]/30 w-full text-center">
          <div className="space-y-1">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#76545a]">
              22
            </span>
            <p className="text-[11px] uppercase tracking-wider text-[#8E827F]">
              Créations Rares
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#76545a]">
              30%
            </span>
            <p className="text-[11px] uppercase tracking-wider text-[#8E827F]">
              Concentration Extrait
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#76545a]">
              100%
            </span>
            <p className="text-[11px] uppercase tracking-wider text-[#8E827F]">
              Vanilles Éthiques
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#76545a]">
              Grasse
            </span>
            <p className="text-[11px] uppercase tracking-wider text-[#8E827F]">
              Artisanat Français
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
