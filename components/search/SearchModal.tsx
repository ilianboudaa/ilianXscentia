"use client";
import { useDialog } from "@/components/layout/useDialog";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Search, X, Sparkles, ArrowRight } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { PERFUMES_DATA } from "@/data/perfumes";

export function SearchModal() {
  const { isSearchOpen, setIsSearchOpen, setQuickViewPerfume } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPerfumes = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return PERFUMES_DATA.filter((p) => {
      const matchName = p.name.toLowerCase().includes(term);
      const matchFamily =
        p.familyLabel.toLowerCase().includes(term) || p.family.includes(term);
      const matchNotes = [
        ...p.pyramid.top,
        ...p.pyramid.heart,
        ...p.pyramid.base,
      ].some((note) => note.toLowerCase().includes(term));
      const matchDesc = p.description.toLowerCase().includes(term);
      return matchName || matchFamily || matchNotes || matchDesc;
    });
  }, [searchTerm]);

  const dialogRef = useDialog(() => setIsSearchOpen(false));
  if (!isSearchOpen) return null;

  const popularTags = [
    "Vanille Bourbon",
    "Rose de Grasse",
    "Santal de Mysore",
    "Fève Tonka",
    "Oud Sauvage",
    "Cuir",
  ];

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Rechercher un parfum"
      className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-20 px-4"
    >
      {/* Backdrop */}
      <div
        onClick={() => setIsSearchOpen(false)}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      />

      {/* Search Panel */}
      <div className="relative bg-[#fcf9f5] w-full max-w-2xl rounded-sm border border-[#ba7d7a]/40 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 border-b border-[#ba7d7a]/30 flex items-center gap-3 bg-[#F7F4EE]">
          <Search size={22} className="text-[#76545a]" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un parfum, une note (vanille, rose, ambre...)"
            className="flex-1 bg-transparent border-none text-base sm:text-lg focus:outline-none text-[#342e2c] placeholder:text-[#8E827F] font-serif"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="p-1 text-[#8E827F] hover:text-[#76545a] text-xs uppercase"
            >
              Effacer
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 text-[#8E827F] hover:text-[#76545a] rounded-full hover:bg-[#e9ddd7]/30"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Suggestion Tags */}
        <div className="px-6 py-3 bg-[#f5e7e3]/40 border-b border-[#ba7d7a]/20 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[#8E827F] whitespace-nowrap text-[11px] uppercase tracking-wider">
            Recherches populaires :
          </span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchTerm(tag)}
              className="px-2.5 py-1 bg-white hover:bg-[#76545a] hover:text-white border border-[#ba7d7a]/40 text-[#76545a] rounded-full transition-colors whitespace-nowrap text-[11px]"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {searchTerm.trim() === "" ? (
            <div className="text-center py-12 text-[#8E827F] space-y-2">
              <Sparkles size={24} className="mx-auto text-[#ba7d7a]" />
              <p className="font-serif text-base text-[#76545a]">
                Explorez le catalogue de la Maison SCENTIA
              </p>
              <p className="text-xs">
                Tapez le nom d’un parfum ou une note olfactive pour dévoiler les
                flacons.
              </p>
            </div>
          ) : filteredPerfumes.length === 0 ? (
            <div className="text-center py-12 text-[#8E827F]">
              <p className="font-serif text-base text-[#76545a] mb-1">
                Aucun parfum ne correspond à « {searchTerm} »
              </p>
              <p className="text-xs">
                Essayez avec une autre famille (vanille, florale, boisé,
                ambrée...)
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPerfumes.map((perfume) => (
                <div
                  key={perfume.id}
                  onClick={() => {
                    setIsSearchOpen(false);
                    setQuickViewPerfume(perfume);
                  }}
                  className="flex gap-3 p-3 bg-white border border-[#ba7d7a]/30 rounded-sm hover:border-[#76545a] hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="relative w-16 h-20 bg-[#f5e7e3] rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={perfume.image}
                      alt={perfume.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-wider text-[#9b626a] font-semibold">
                      {perfume.familyLabel}
                    </span>
                    <h4 className="font-serif text-sm font-semibold text-[#342e2c] group-hover:text-[#76545a] transition-colors">
                      {perfume.name}
                    </h4>
                    <p className="text-[11px] text-[#8E827F] line-clamp-1 mt-0.5">
                      {perfume.subtitle}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#f5e7e3]">
                      <span className="font-serif text-xs font-bold text-[#76545a]">
                        {perfume.price} €
                      </span>
                      <span className="text-[10px] text-[#9b626a] flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        Découvrir <ArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
