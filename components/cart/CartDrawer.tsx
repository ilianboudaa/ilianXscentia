"use client";
import { useDialog } from "@/components/layout/useDialog";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingCost,
    total,
    clearCart,
  } = useApp();

  const dialogRef = useDialog(() => setIsCartOpen(false));
  if (!isCartOpen) return null;

  const freeShippingThreshold = 150;
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100),
  );
  const remainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - subtotal,
  );

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Votre panier"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#fcf9f5] shadow-2xl flex flex-col border-l border-[#ba7d7a]/30 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-[#ba7d7a]/20 flex items-center justify-between bg-[#F7F4EE]">
            <div className="flex items-center gap-2">
              <span className="text-[#ba7d7a] font-serif text-lg">✦</span>
              <h2 className="font-serif text-xl text-[#76545a] tracking-wide font-normal">
                Votre Panier Précieux
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#8E827F] hover:text-[#76545a] transition-colors rounded-full hover:bg-[#e9ddd7]/30"
              aria-label="Fermer le panier"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-6 py-3 bg-[#f5e7e3]/50 border-b border-[#ba7d7a]/20 text-xs">
            {subtotal >= freeShippingThreshold ? (
              <p className="text-[#76545a] font-medium flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#ba7d7a]" />
                Félicitations ! Vous bénéficiez de la livraison offerte en
                France métropolitaine.
              </p>
            ) : (
              <div>
                <p className="text-[#342e2c] mb-1.5">
                  Plus que{" "}
                  <span className="font-semibold text-[#76545a]">
                    {remainingForFreeShipping.toFixed(2)} €
                  </span>{" "}
                  pour la livraison offerte.
                </p>
                <div className="w-full bg-[#e9ddd7] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#76545a] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#f5e7e3] flex items-center justify-center text-[#9b626a]">
                  <Sparkles size={28} />
                </div>
                <h3 className="font-serif text-lg text-[#76545a]">
                  Votre panier est encore vide
                </h3>
                <p className="text-xs text-[#8E827F] max-w-xs">
                  Laissez-vous envoûter par nos créations vanillées ou réalisez
                  votre diagnostic olfactif.
                </p>
                <Link
                  href="/#catalogue"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 bg-[#76545a] text-[#fdf5f1] text-xs uppercase tracking-widest hover:bg-[#593e44] transition-colors rounded-sm"
                >
                  Découvrir la Collection
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-6 border-b border-[#ba7d7a]/20 group"
                >
                  {/* Perfume Thumbnail */}
                  <div className="relative w-20 h-24 bg-[#f5e7e3] rounded overflow-hidden flex-shrink-0 border border-[#ba7d7a]/30">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm font-medium text-[#342e2c] hover:text-[#76545a]">
                          {item.name}
                        </h4>
                        <span className="font-serif text-sm font-semibold text-[#76545a]">
                          {(item.price * item.quantity).toFixed(2)} €
                        </span>
                      </div>
                      <div className="text-xs text-[#8E827F] mt-0.5 flex items-center gap-2">
                        <span className="uppercase tracking-wider">
                          {item.size}
                        </span>
                        <span>•</span>
                        <span>{item.price.toFixed(2)} € / unité</span>
                      </div>
                      {item.engraving && (
                        <p className="text-[11px] text-[#9b626a] italic mt-1 bg-[#f5e7e3] px-2 py-0.5 rounded inline-block">
                          Gravure : « {item.engraving} »
                        </p>
                      )}
                    </div>

                    {/* Quantity & Delete */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#ba7d7a]/40 rounded-sm bg-white">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 px-2 text-[#8E827F] hover:text-[#76545a] transition-colors"
                          aria-label="Diminuer quantité"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-medium text-[#342e2c]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 px-2 text-[#8E827F] hover:text-[#76545a] transition-colors"
                          aria-label="Augmenter quantité"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#8E827F] hover:text-[#76545a] p-1 transition-colors"
                        aria-label="Supprimer du panier"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#ba7d7a]/30 bg-[#F7F4EE] space-y-4">
              {/* Luxury Guarantee */}
              <div className="flex items-center gap-2 text-[11px] text-[#9b626a]">
                <ShieldCheck size={14} className="text-[#ba7d7a]" />
                <span>
                  Flacon sous scellé d’artisan • Écrin & Ruban de soie offerts
                </span>
              </div>

              {/* Subtotal & Shipping */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#8E827F]">
                  <span>Sous-total</span>
                  <span className="font-medium text-[#342e2c]">
                    {subtotal.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between text-[#8E827F]">
                  <span>Livraison estimée</span>
                  <span>
                    {shippingCost === 0
                      ? "Offerte"
                      : `${shippingCost.toFixed(2)} €`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-serif font-bold text-[#76545a] pt-2 border-t border-[#ba7d7a]/20">
                  <span>Total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/commande"
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#76545a] hover:bg-[#593e44] text-[#fdf5f1] uppercase tracking-[0.2em] text-xs font-semibold rounded-sm shadow-md transition-all hover:shadow-lg duration-300"
              >
                <span>Finaliser la commande</span>
                <ArrowRight size={16} />
              </Link>

              <button
                onClick={clearCart}
                className="w-full text-center text-[11px] text-[#8E827F] hover:text-[#76545a] underline transition-colors"
              >
                Vider le panier
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
