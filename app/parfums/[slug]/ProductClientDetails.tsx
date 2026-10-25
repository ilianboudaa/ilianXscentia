"use client";
import { useState } from "react";
import { Perfume, ProductVariant } from "@/types";
import { useApp } from "@/components/providers/AppProvider";
import { Heart, ShoppingBag } from "lucide-react";
export function ProductClientDetails({ perfume }: { perfume: Perfume }) {
  const { addToCart, toggleFavorite, isFavorite } = useApp();
  const [size, setSize] = useState<ProductVariant["size"]>("50ml");
  const [engraving, setEngraving] = useState("");
  const variant = perfume.variants.find((v) => v.size === size)!;
  return (
    <div className="space-y-6">
      <p className="eyebrow">{perfume.familyLabel} · 50 ml</p>
      <h1 className="title">{perfume.name}</h1>
      <p className="text-sm text-stone-500 leading-relaxed">
        {perfume.description}
      </p>
      <fieldset>
        <legend className="text-xs uppercase tracking-widest mb-3">
          Choisir votre format
        </legend>
        <div className="flex gap-3">
          {perfume.variants.map((v) => (
            <button
              type="button"
              aria-pressed={size === v.size}
              key={v.size}
              onClick={() => setSize(v.size)}
              className={`border px-5 py-3 ${size === v.size ? "bg-[#76545a] text-white" : "border-[#ba7d7a]"}`}
            >
              {v.size}
              <span className="block text-xs mt-1">{v.price} €</span>
            </button>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm">
        Gravure offerte <span className="text-stone-500">(facultative)</span>
        <input
          className="field mt-2"
          maxLength={24}
          value={engraving}
          onChange={(e) => setEngraving(e.target.value)}
          placeholder="Vos initiales, un souvenir…"
        />
      </label>
      <div className="flex gap-3">
        <button
          className="primary flex-1"
          disabled={variant.stock === 0}
          onClick={() => addToCart(perfume, size, 1, engraving)}
        >
          <ShoppingBag size={16} />
          {variant.stock === 0
            ? "Épuisé"
            : `Ajouter au panier · ${variant.price} €`}
        </button>
        <button
          aria-label="Ajouter aux favoris"
          aria-pressed={isFavorite(perfume.id)}
          className="border border-[#ba7d7a] p-4"
          onClick={() => toggleFavorite(perfume.id)}
        >
          <Heart
            fill={isFavorite(perfume.id) ? "currentColor" : "none"}
            size={20}
          />
        </button>
      </div>
      <p className="text-xs text-stone-500">
        Stock et prix vérifiés à la commande. Projet étudiant : aucune
        transaction bancaire.
      </p>
    </div>
  );
}
