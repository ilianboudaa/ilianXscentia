"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, ArrowUpDown } from "lucide-react";
import { OLFACTORY_FAMILIES } from "@/data/perfumes";
import { PerfumeCard } from "./PerfumeCard";
import { Perfume } from "@/types";

export function CatalogSection({ perfumes }: { perfumes: Perfume[] }) {
  const [selectedFamily, setSelectedFamily] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "featured" | "price-asc" | "price-desc" | "rating"
  >("featured");

  const filteredPerfumes = useMemo(() => {
    let list = [...perfumes];

    if (selectedFamily === "vanille") {
      list = list.filter(
        (p) => p.isVanillaCollection || p.family === "vanille",
      );
    } else if (selectedFamily !== "all") {
      list = list.filter((p) => p.family === selectedFamily);
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      // featured: bestsellers first
      list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    return list;
  }, [selectedFamily, sortBy, perfumes]);

  return (
    <section id="catalogue" className="py-24 bg-[#fcf9f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#9b626a]">
            <span className="text-[#ba7d7a]">✦</span>
            <span>La Collection Complète</span>
            <span className="text-[#ba7d7a]">✦</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#76545a] font-normal">
            Le Grand Catalogue SCENTIA
          </h2>
          <p className="text-sm sm:text-base text-[#342e2c]/80 font-light">
            Vingt-deux créations rares, patiemment macérées à Grasse. Des
            vanilles enchanteresses aux accords boisés et cuirés les plus
            souverains.
          </p>
        </div>

        {/* Vanilla Collection Special Feature Banner */}
        <div
          id="vanille"
          className="mb-16 p-8 sm:p-12 rounded-sm bg-gradient-to-r from-[#4b373b] via-[#593e44] to-[#76545a] text-[#fdf5f1] border border-[#ba7d7a]/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="max-w-xl space-y-4 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ba7d7a]/20 border border-[#ba7d7a]/40 text-[#ba7d7a] rounded-full text-[10px] uppercase tracking-widest font-semibold">
              <Sparkles size={12} /> Collection d’Excellence
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl text-[#fdf5f1]">
              L’Anthologie des Vanilles d’Exception
            </h3>
            <p className="text-xs sm:text-sm text-[#fdf5f1]/80 leading-relaxed font-light">
              De{" "}
              <span className="text-[#ba7d7a] font-medium">
                Vanille Étoilée
              </span>{" "}
              à <span className="text-[#ba7d7a] font-medium">Crème Brûlée</span>
              , découvrez notre signature olfactive la plus réputée : des
              gousses de vanille bourbon affinées jusqu’à libération de leur
              arôme le plus charnel.
            </p>
            <button
              onClick={() => setSelectedFamily("vanille")}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#ba7d7a] hover:bg-[#fdf5f1] text-[#4b373b] text-xs uppercase tracking-widest font-semibold rounded-sm transition-colors shadow-md"
            >
              Voir la sélection vanillée (
              {perfumes.filter((p) => p.isVanillaCollection).length})
            </button>
          </div>

          <div className="relative z-10 w-full md:w-auto text-center md:text-right border-t md:border-t-0 md:border-l border-[#ba7d7a]/30 pt-6 md:pt-0 md:pl-10 space-y-3">
            <div className="font-serif text-3xl sm:text-4xl text-[#ba7d7a] font-bold">
              100%
            </div>
            <div className="text-xs text-[#fdf5f1]/80 uppercase tracking-widest">
              Gousses Bourbon de Sambava
            </div>
            <div className="text-[11px] text-[#ba7d7a] italic">
              « Le nectar le plus précieux de l’Océan Indien »
            </div>
          </div>
        </div>

        {/* Filter Tabs & Sort Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-8 mb-10 border-b border-[#ba7d7a]/30">
          {/* Family Tabs */}
          <div className="flex flex-wrap gap-2">
            {OLFACTORY_FAMILIES.map((fam) => (
              <button
                key={fam.id}
                onClick={() => setSelectedFamily(fam.id)}
                className={`px-4 py-2 text-xs uppercase tracking-wider rounded-sm transition-all ${
                  selectedFamily === fam.id
                    ? "bg-[#76545a] text-[#fdf5f1] font-semibold shadow-sm border border-[#76545a]"
                    : "bg-[#F7F4EE] text-[#342e2c] hover:bg-[#f5e7e3] border border-[#ba7d7a]/30"
                }`}
              >
                {fam.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto text-xs text-[#8E827F]">
            <ArrowUpDown size={14} className="text-[#76545a]" />
            <span className="uppercase tracking-wider text-[11px]">
              Trier par :
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-[#F7F4EE] border border-[#ba7d7a]/40 rounded-sm py-1.5 px-3 text-xs text-[#342e2c] focus:outline-none focus:border-[#76545a]"
            >
              <option value="featured">Sélection Signature</option>
              <option value="price-asc">Prix : Croissant</option>
              <option value="price-desc">Prix : Décroissant</option>
              <option value="rating">Les Mieux Notés</option>
            </select>
          </div>
        </div>

        {/* Perfume Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredPerfumes.map((perfume) => (
            <PerfumeCard key={perfume.id} perfume={perfume} />
          ))}
        </div>
      </div>
    </section>
  );
}
