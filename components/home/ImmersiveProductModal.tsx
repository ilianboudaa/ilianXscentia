"use client";
import { useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { useDialog } from "@/components/layout/useDialog";
import { Bottle } from "./Bottle";
import { money } from "@/lib/format";
export function ImmersiveProductModal() {
  const { quickViewPerfume: p, setQuickViewPerfume, addToCart } = useApp();
  const [engraving, setEngraving] = useState("");
  const ref = useDialog(() => setQuickViewPerfume(null));
  if (!p) return null;
  const palettes: Record<string, string[]> = {
    gourmande: ["#593a43", "#b57c79"],
    florale: ["#613f55", "#b7859e"],
    fraiche: ["#304f4a", "#88b5a3"],
    boisee: ["#42382f", "#a18a67"],
    fruite: ["#653c50", "#c987a0"],
  };
  const colors = palettes[p.family] || palettes.gourmande;
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`Voyage olfactif ${p.name}`}
      className="voyage active scentia-home"
    >
      <button
        className="voyage-close"
        aria-label="Fermer le voyage"
        onClick={() => setQuickViewPerfume(null)}
      >
        ×
      </button>
      <div
        className="voyage-scene"
        style={{ "--vdark": colors[0], "--vlight": colors[1] } as CSSProperties}
      >
        <div className="voyage-copy">
          <div className="kicker">SCENTIA · L’expérience olfactive</div>
          <h2>{p.name}</h2>
          <div className="storyline">« {p.tagline} »</div>
          <p>{p.story}</p>
          <div className="notes">
            {[p.pyramid.top, p.pyramid.heart, p.pyramid.base].map(
              (notes, i) => (
                <div className="note" key={i}>
                  <small>
                    {["Note de tête", "Note de cœur", "Note de fond"][i]}
                  </small>
                  <span>{notes.join(", ")}</span>
                </div>
              ),
            )}
          </div>
          <label className="block text-xs mb-5">
            Une gravure pour votre souvenir (facultative)
            <input
              className="block mt-2 w-full max-w-sm bg-white/10 border border-white/30 p-3 text-white placeholder:text-white/60"
              maxLength={24}
              value={engraving}
              onChange={(e) => setEngraving(e.target.value)}
              placeholder="24 caractères maximum"
            />
          </label>
          <div className="voyage-buttons">
            <button
              disabled={p.variants[0]?.stock === 0}
              onClick={() => {
                addToCart(p, "50ml", 1, engraving);
                setQuickViewPerfume(null);
              }}
            >
              {p.variants[0]?.stock === 0
                ? "ÉPUISÉ"
                : `ADOPTER CE PARFUM · ${money(p.price)}`}
            </button>
            <button
              className="outline"
              onClick={() => setQuickViewPerfume(null)}
            >
              RETOUR À LA COLLECTION
            </button>
          </div>
          <Link
            href={`/parfums/${p.slug}`}
            className="inline-block text-xs underline mt-5"
            onClick={() => setQuickViewPerfume(null)}
          >
            Voir la fiche complète
          </Link>
        </div>
        <div className="voyage-art">
          <div className="voyage-orbit" />
          <Bottle perfume={p} />
        </div>
        {Array.from({ length: 13 }, (_, i) => (
          <span
            key={i}
            className="petal"
            aria-hidden="true"
            style={{
              left: `${(i * 37) % 100}%`,
              animationDelay: `-${i * 1.2}s`,
              animationDuration: `${9 + (i % 6)}s`,
            }}
          >
            {i % 3 === 0 ? "✿" : "❀"}
          </span>
        ))}
        <div className="voyage-hint">
          Un parfum. Une destination. Une émotion.
        </div>
      </div>
    </div>
  );
}
