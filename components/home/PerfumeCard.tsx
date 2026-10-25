"use client";

import React, { useState } from "react";
import Image from "next/image";

import { Heart, ShoppingBag, Eye, Star } from "lucide-react";
import { Perfume } from "@/types";
import { useApp } from "@/components/providers/AppProvider";

interface PerfumeCardProps {
  perfume: Perfume;
}

export function PerfumeCard({ perfume }: PerfumeCardProps) {
  const [selectedSize, setSelectedSize] = useState<"30ml" | "50ml" | "100ml">(
    "50ml",
  );
  const { addToCart, isFavorite, toggleFavorite, setQuickViewPerfume } =
    useApp();

  const currentVariant = perfume.variants.find((v) => v.size === selectedSize);
  const currentPrice = currentVariant ? currentVariant.price : perfume.price;
  const isFav = isFavorite(perfume.id);

  return (
    <div className="group relative bg-[#fcf9f5] border border-[#ba7d7a]/30 rounded-sm overflow-hidden flex flex-col justify-between hover:border-[#76545a] hover:shadow-xl transition-all duration-500">
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {perfume.isVanillaCollection && (
          <span className="px-2.5 py-0.5 bg-[#4b373b] text-[#ba7d7a] border border-[#ba7d7a]/40 text-[9px] uppercase tracking-widest font-semibold rounded-full shadow-sm">
            ✦ Vanille Rare
          </span>
        )}
        {perfume.isBestseller && (
          <span className="px-2.5 py-0.5 bg-[#76545a] text-[#fdf5f1] text-[9px] uppercase tracking-widest font-semibold rounded-full shadow-sm">
            Signature
          </span>
        )}
        {perfume.isNew && (
          <span className="px-2.5 py-0.5 bg-[#ba7d7a] text-white text-[9px] uppercase tracking-widest font-semibold rounded-full shadow-sm">
            Nouveau
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(perfume.id);
        }}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-[#fcf9f5]/80 backdrop-blur-sm border border-[#ba7d7a]/30 text-[#76545a] hover:bg-[#76545a] hover:text-white transition-all shadow-sm"
        aria-label="Ajouter aux favoris"
      >
        <Heart
          size={16}
          className={
            isFav ? "fill-[#76545a] text-[#76545a] group-hover:fill-white" : ""
          }
        />
      </button>

      {/* Product Image & Quick View trigger */}
      <div
        onClick={() => setQuickViewPerfume(perfume)}
        className="relative w-full h-80 bg-gradient-to-b from-[#F7F4EE] to-[#f5e7e3]/50 overflow-hidden cursor-pointer flex items-center justify-center p-6"
      >
        <Image
          src={perfume.image}
          alt={perfume.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#fcf9f5] text-[#76545a] text-xs uppercase tracking-widest font-semibold rounded-sm shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Eye size={14} /> Découvrir l’univers
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Family tag and Rating */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#9b626a] font-semibold">
              {perfume.familyLabel}
            </span>
            <div className="flex items-center gap-1 text-[#ba7d7a]">
              <Star size={12} className="fill-[#ba7d7a]" />
              <span className="text-[11px] font-medium text-[#342e2c]">
                {perfume.rating}
              </span>
            </div>
          </div>

          {/* Perfume Name */}
          <h3
            onClick={() => setQuickViewPerfume(perfume)}
            className="font-serif text-lg font-medium text-[#342e2c] group-hover:text-[#76545a] transition-colors cursor-pointer"
          >
            {perfume.name}
          </h3>

          {/* Subtitle */}
          <p className="text-xs text-[#8E827F] italic font-serif mt-0.5 line-clamp-1">
            {perfume.subtitle}
          </p>

          {/* Olfactory Notes Preview */}
          <div className="flex flex-wrap gap-1 mt-3 mb-4">
            {perfume.pyramid.heart.slice(0, 2).map((note, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 bg-[#f5e7e3] text-[#76545a] rounded-sm font-light"
              >
                {note}
              </span>
            ))}
            <span className="text-[10px] px-2 py-0.5 bg-[#F7F4EE] text-[#8E827F] rounded-sm">
              +{perfume.pyramid.base[0]}
            </span>
          </div>
        </div>

        {/* Pricing, Formats & Action */}
        <div className="pt-3 border-t border-[#ba7d7a]/20">
          {/* Format Selector */}
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex gap-1.5">
              {(["30ml", "50ml", "100ml"] as const).map((size) => (
                <button
                  key={size}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-sm transition-colors border ${
                    selectedSize === size
                      ? "bg-[#76545a] text-white border-[#76545a] font-semibold"
                      : "bg-white text-[#8E827F] border-[#ba7d7a]/40 hover:border-[#76545a]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <span className="font-serif text-base font-bold text-[#76545a]">
              {currentPrice} €
            </span>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={() => addToCart(perfume, selectedSize, 1)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#f5e7e3] hover:bg-[#76545a] text-[#76545a] hover:text-[#fdf5f1] uppercase tracking-[0.16em] text-[11px] font-semibold rounded-sm transition-all duration-300 shadow-sm"
          >
            <ShoppingBag size={14} />
            <span>Ajouter au Panier</span>
          </button>
        </div>
      </div>
    </div>
  );
}
