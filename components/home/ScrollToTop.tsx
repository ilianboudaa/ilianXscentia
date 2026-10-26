"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";

/**
 * Bouton « Retour en haut » pour la page d'accueil de SCENTIA.
 *
 * Conforme aux règles vercel-react-best-practices :
 * - client-passive-event-listeners : écouteur de défilement passif ({ passive: true })
 * - rerender-derived-state : abonnement à un booléen dérivé (isVisible) plutôt qu'aux pixels de scroll
 * - rendering-conditional-render : rendu conditionnel explicite avec opérateur ternaire
 */
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { isCartOpen } = useApp();

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 400;
      setIsVisible((prev) => (prev !== shouldShow ? shouldShow : prev));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return isVisible && !isCartOpen ? (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Retour en haut de page"
      title="Retour en haut de page"
      className="scroll-to-top"
    >
      <ArrowUp size={20} strokeWidth={2} aria-hidden="true" />
      <span className="sr-only">Retour en haut de page</span>
    </button>
  ) : null;
}
