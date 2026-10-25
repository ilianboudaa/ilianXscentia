"use client";
import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { createClient } from "@/lib/supabase/client";
import type { Perfume } from "@/types";
import { money } from "@/lib/format";
const questions = [
  {
    q: "Quelle sensation recherchez-vous ?",
    a: [
      "Douceur enveloppante",
      "Élégance florale",
      "Fraîcheur lumineuse",
      "Mystère boisé",
    ],
  },
  {
    q: "Votre moment préféré ?",
    a: [
      "Un dessert à la vanille",
      "Un jardin au printemps",
      "Un matin au soleil",
      "Une soirée feutrée",
    ],
  },
  { q: "Choisissez une note", a: ["Vanille", "Rose", "Néroli", "Santal"] },
];
const families = ["gourmande", "florale", "fraiche", "boisee"];
export function BotanicalQuiz({ perfumes }: { perfumes: Perfume[] }) {
  const [answers, setAnswers] = useState<number[]>([]),
    [result, setResult] = useState<Perfume | null>(null),
    [saved, setSaved] = useState("");
  const { user, setQuickViewPerfume, addToCart } = useApp();
  async function choose(i: number) {
    const next = [...answers, i];
    setAnswers(next);
    if (next.length < 3) return;
    const scores = families.map((_, i) => next.filter((a) => a === i).length);
    const winner = scores.indexOf(Math.max(...scores));
    const p =
      perfumes.find((p) => p.family === families[winner]) || perfumes[0];
    setResult(p);
    if (user) {
      const { error } = await createClient()
        .from("quiz_results")
        .insert({
          user_id: user.id,
          primary_family: p.family,
          vanilla_affinity: Math.round((scores[0] / 3) * 100),
          recommended_product_ids: [p.id],
          answers: next,
        });
      setSaved(
        error
          ? "Le résultat n’a pas pu être enregistré."
          : "Votre résultat est enregistré dans votre espace personnel.",
      );
    } else
      setSaved(
        "Connectez-vous avant votre prochain diagnostic pour conserver son résultat.",
      );
  }
  const q = questions[answers.length];
  return (
    <section id="quiz" className="botanical-quiz">
      <p className="eyebrow">L’expérience SCENTIA</p>
      <h2>Quel parfum êtes-vous ?</h2>
      <p>Répondez à trois questions et découvrez votre signature olfactive.</p>
      {!result && q ? (
        <div className="mt-8">
          <p className="eyebrow" aria-live="polite">
            Question {answers.length + 1} / 3
          </p>
          <h3 className="font-serif text-2xl my-5">{q.q}</h3>
          <div className="flex justify-center gap-3 flex-wrap">
            {q.a.map((a, i) => (
              <button
                key={a}
                className="quiz-choice"
                onClick={() => void choose(i)}
              >
                {a}
              </button>
            ))}
          </div>
          {answers.length > 0 && (
            <button
              className="underline text-xs mt-5"
              onClick={() => setAnswers(answers.slice(0, -1))}
            >
              Question précédente
            </button>
          )}
        </div>
      ) : result ? (
        <div className="quiz-result" aria-live="polite">
          <p className="eyebrow">Votre signature olfactive</p>
          <h3 className="font-serif text-3xl my-4">{result.name}</h3>
          <p>{result.description}</p>
          <p className="text-xs mt-4 text-[#827771]">{saved}</p>
          <div className="flex gap-3 justify-center flex-wrap mt-6">
            <button className="btn" onClick={() => addToCart(result, "50ml")}>
              Ajouter · {money(result.price)}
            </button>
            <button
              className="btn secondary"
              onClick={() => setQuickViewPerfume(result)}
            >
              Mon voyage olfactif
            </button>
          </div>
          <button
            className="underline text-xs mt-5"
            onClick={() => {
              setAnswers([]);
              setResult(null);
              setSaved("");
            }}
          >
            Recommencer
          </button>
        </div>
      ) : null}
    </section>
  );
}
