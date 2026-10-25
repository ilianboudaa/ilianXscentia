"use client";

import React from "react";

import { Sparkles, HeartHandshake, Feather } from "lucide-react";

export function Manifesto() {
  return (
    <section
      id="manifeste"
      className="py-24 bg-[#F7F4EE] border-y border-[#ba7d7a]/30 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#9b626a]">
            <span className="text-[#ba7d7a]">✦</span>
            <span>L’Art & La Matière</span>
            <span className="text-[#ba7d7a]">✦</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#76545a] font-normal leading-tight">
            L’Âme de la Haute Parfumerie Française
          </h2>
          <p className="text-sm sm:text-base text-[#342e2c]/80 font-light leading-relaxed">
            Chez SCENTIA, nous croyons qu’un parfum n’est pas un simple
            accessoire, mais un poème liquide invisible. Une empreinte
            indélébile déposée sur le creux du poignet, une émotion pure qui
            traverse le temps.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Card 1 */}
          <div className="bg-[#fcf9f5] p-8 border border-[#ba7d7a]/30 rounded-sm shadow-sm relative group hover:border-[#76545a] transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[#f5e7e3] text-[#76545a] flex items-center justify-center mb-6 group-hover:bg-[#76545a] group-hover:text-[#fdf5f1] transition-colors">
              <Sparkles size={22} />
            </div>
            <h3 className="font-serif text-xl text-[#76545a] mb-3">
              L’Or Noir de Madagascar
            </h3>
            <p className="text-xs sm:text-sm text-[#8E827F] leading-relaxed">
              Nous sélectionnons exclusivement les gousses de vanille Planifolia
              et Tahitensis à pleine maturité dans la région protégée de
              Sambava. Écossées à la main et affinées pendant 9 mois au soleil.
            </p>
            <div className="mt-6 pt-4 border-t border-[#f5e7e3] text-[11px] uppercase tracking-wider text-[#9b626a] font-semibold">
              Extraction à froid & macération lente
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#fcf9f5] p-8 border border-[#ba7d7a]/30 rounded-sm shadow-sm relative group hover:border-[#76545a] transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[#f5e7e3] text-[#76545a] flex items-center justify-center mb-6 group-hover:bg-[#76545a] group-hover:text-[#fdf5f1] transition-colors">
              <Feather size={22} />
            </div>
            <h3 className="font-serif text-xl text-[#76545a] mb-3">
              Le Savoir-Faire de Grasse
            </h3>
            <p className="text-xs sm:text-sm text-[#8E827F] leading-relaxed">
              Tous nos jus sont assemblés et mûris à Grasse, berceau mondial de
              la parfumerie. Nos formules sont formulées à une concentration
              d’extrait de 25% à 32%, garantissant un sillage magistral et une
              tenue de plus de 12 heures.
            </p>
            <div className="mt-6 pt-4 border-t border-[#f5e7e3] text-[11px] uppercase tracking-wider text-[#9b626a] font-semibold">
              Tradition artisanale perpétuée
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#fcf9f5] p-8 border border-[#ba7d7a]/30 rounded-sm shadow-sm relative group hover:border-[#76545a] transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[#f5e7e3] text-[#76545a] flex items-center justify-center mb-6 group-hover:bg-[#76545a] group-hover:text-[#fdf5f1] transition-colors">
              <HeartHandshake size={22} />
            </div>
            <h3 className="font-serif text-xl text-[#76545a] mb-3">
              Filières Durables & Noblesse
            </h3>
            <p className="text-xs sm:text-sm text-[#8E827F] leading-relaxed">
              Nous rémunérons nos cueilleurs partenaires au prix juste et
              reversons 1% de nos bénéfices au reboisement des forêts primaires
              malgaches. Chaque flacon en verre lourd est rechargeable dans nos
              salons.
            </p>
            <div className="mt-6 pt-4 border-t border-[#f5e7e3] text-[11px] uppercase tracking-wider text-[#9b626a] font-semibold">
              Éco-luxe & Flacons éternels
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
