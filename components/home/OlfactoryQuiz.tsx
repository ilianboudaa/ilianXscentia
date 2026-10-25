"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { QUIZ_QUESTIONS, calculateQuizResults } from "@/data/quiz";
import { PERFUMES_DATA } from "@/data/perfumes";
import { Perfume } from "@/types";
import { useApp } from "@/components/providers/AppProvider";
import { createClient } from "@/lib/supabase/client";

export function OlfactoryQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [results, setResults] = useState<{
    topPerfumes: Perfume[];
    primaryFamily: string;
    vanillaAffinity: number;
  } | null>(null);

  const { addToCart, setQuickViewPerfume, user, showToast } = useApp();
  const supabase = createClient();

  const handleSelectOption = (optionIndex: number) => {
    const updated = [...selectedAnswers];
    updated[currentStep] = optionIndex;
    setSelectedAnswers(updated);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate results
      const res = calculateQuizResults(updated, PERFUMES_DATA);
      setResults(res);
      setQuizFinished(true);

      // Save to Supabase if logged in
      if (user) {
        supabase
          .from("quiz_results")
          .insert({
            user_id: user.id,
            primary_family: res.primaryFamily,
            vanilla_affinity: res.vanillaAffinity,
            recommended_product_ids: res.topPerfumes.map((p) => p.id),
            answers: updated,
          })
          .then(({ error }) => {
            if (!error) {
              showToast(
                "Votre diagnostic a été sauvegardé sur votre compte",
                "gold",
              );
            }
          });
      }
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setSelectedAnswers([]);
    setQuizFinished(false);
    setResults(null);
  };

  const currentQ = QUIZ_QUESTIONS[currentStep];

  return (
    <section
      id="quiz"
      className="py-24 bg-gradient-to-b from-[#F7F4EE] via-[#f5e7e3]/50 to-[#fcf9f5] border-t border-[#ba7d7a]/30 relative overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#9b626a]">
            <Sparkles size={14} className="text-[#ba7d7a]" />
            <span>Diagnostic Haute Parfumerie</span>
            <Sparkles size={14} className="text-[#ba7d7a]" />
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#76545a] font-normal">
            Trouvez Votre Empreinte Olfactive
          </h2>
          <p className="text-xs sm:text-sm text-[#342e2c]/80 font-light leading-relaxed">
            Répondez à cinq questions sensorielles. Notre algorithme d’artisan
            parfumeur révélera le flacon en harmonie parfaite avec votre peau.
          </p>
        </div>

        {/* Quiz Container Box */}
        <div className="bg-[#fcf9f5] border border-[#ba7d7a]/40 rounded-sm shadow-xl p-6 sm:p-10 relative">
          {!quizFinished ? (
            <div>
              {/* Progress Bar & Counter */}
              <div className="flex items-center justify-between text-xs text-[#8E827F] mb-4">
                <span className="uppercase tracking-widest text-[10px]">
                  Étape {currentStep + 1} sur {QUIZ_QUESTIONS.length}
                </span>
                <span className="font-serif italic">
                  {Math.round(
                    ((currentStep + 1) / QUIZ_QUESTIONS.length) * 100,
                  )}
                  % complété
                </span>
              </div>
              <div className="w-full bg-[#e9ddd7] h-1.5 rounded-full overflow-hidden mb-8">
                <div
                  className="bg-[#76545a] h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question */}
              <div className="text-center mb-8">
                <h3 className="font-serif text-xl sm:text-2xl text-[#76545a] mb-2">
                  {currentQ.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#8E827F] font-light">
                  {currentQ.subtitle}
                </p>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQ.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className="p-5 text-left bg-white border border-[#ba7d7a]/30 rounded-sm hover:border-[#76545a] hover:bg-[#f5e7e3]/30 hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-6 h-6 rounded-full border border-[#ba7d7a]/60 flex items-center justify-center text-xs font-serif text-[#76545a] group-hover:bg-[#76545a] group-hover:text-white transition-colors">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-[#ba7d7a] opacity-0 group-hover:opacity-100 transition-opacity">
                          ✦
                        </span>
                      </div>
                      <h4 className="font-serif text-sm font-semibold text-[#342e2c] group-hover:text-[#76545a] transition-colors mb-1">
                        {option.label}
                      </h4>
                      <p className="text-xs text-[#8E827F] leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Back navigation */}
              {currentStep > 0 && (
                <div className="mt-8 pt-4 border-t border-[#ba7d7a]/20 flex justify-start">
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="inline-flex items-center gap-1.5 text-xs text-[#8E827F] hover:text-[#76545a] transition-colors"
                  >
                    <ArrowLeft size={14} /> Étape précédente
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Results Reveal */
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="text-center max-w-xl mx-auto space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#76545a] text-[#ba7d7a] mx-auto shadow-md">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#76545a]">
                  Votre Signature Olfactive Dévoilée
                </h3>
                <p className="text-xs sm:text-sm text-[#342e2c]/80 leading-relaxed font-light">
                  Selon vos réponses sensorielles, votre profil s’oriente vers
                  la famille{" "}
                  <span className="font-semibold text-[#76545a] uppercase tracking-wider">
                    {results?.primaryFamily}
                  </span>{" "}
                  avec une affinité vanillée de{" "}
                  <span className="font-semibold text-[#ba7d7a]">
                    {results?.vanillaAffinity}%
                  </span>
                  .
                </p>
              </div>

              {/* Top 3 Perfumes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {results?.topPerfumes.map((perfume, index) => (
                  <div
                    key={perfume.id}
                    className="bg-white border border-[#ba7d7a]/40 rounded-sm p-5 flex flex-col justify-between shadow-sm hover:border-[#76545a] hover:shadow-lg transition-all"
                  >
                    <div>
                      {/* Match percentage badge */}
                      <div className="flex justify-between items-center mb-3">
                        <span className="px-2.5 py-0.5 bg-[#76545a] text-[#fdf5f1] text-[10px] uppercase tracking-widest font-bold rounded-full">
                          Match #{index + 1}
                        </span>
                        <span className="text-xs font-serif font-bold text-[#ba7d7a]">
                          {index === 0 ? "98%" : index === 1 ? "92%" : "87%"}
                        </span>
                      </div>

                      {/* Image */}
                      <div
                        onClick={() => setQuickViewPerfume(perfume)}
                        className="relative w-full h-44 bg-[#F7F4EE] rounded overflow-hidden mb-4 cursor-pointer group"
                      >
                        <Image
                          src={perfume.image}
                          alt={perfume.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <h4
                        onClick={() => setQuickViewPerfume(perfume)}
                        className="font-serif text-base font-semibold text-[#342e2c] hover:text-[#76545a] transition-colors cursor-pointer"
                      >
                        {perfume.name}
                      </h4>
                      <p className="text-xs text-[#8E827F] italic line-clamp-1 mt-0.5">
                        {perfume.subtitle}
                      </p>
                      <p className="text-xs text-[#342e2c]/80 mt-2 line-clamp-2">
                        {perfume.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#f5e7e3] flex items-center justify-between">
                      <span className="font-serif text-base font-bold text-[#76545a]">
                        {perfume.price} €
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setQuickViewPerfume(perfume)}
                          className="p-2 border border-[#ba7d7a]/40 hover:border-[#76545a] text-[#76545a] rounded-sm transition-colors"
                          aria-label="Voir le parfum"
                          title="Voir le parfum"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => addToCart(perfume, "50ml", 1)}
                          className="px-3 py-1.5 bg-[#76545a] hover:bg-[#593e44] text-[#fdf5f1] text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors flex items-center gap-1.5"
                        >
                          <ShoppingBag size={12} />
                          <span>Ajouter</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Restart quiz CTA */}
              <div className="text-center pt-6 border-t border-[#ba7d7a]/20">
                <button
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#8E827F] hover:text-[#76545a] font-medium transition-colors"
                >
                  <RefreshCw size={14} /> Recommencer le diagnostic
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
