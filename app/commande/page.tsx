"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { useApp } from "@/components/providers/AppProvider";
import { money } from "@/lib/format";
export default function Checkout() {
  const {
    cart,
    user,
    profile,
    isLoadingAuth,
    total,
    subtotal,
    shippingCost,
    clearCart,
    flushCart,
    setIsAuthModalOpen,
    setAuthModalMode,
  } = useApp();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const lock = useRef(false);
  const router = useRouter();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const items = cart.map((i) => ({
      product_id: i.perfumeId,
      size: i.size,
      quantity: i.quantity,
      engraving: i.engraving || "",
    }));
    const fingerprint = JSON.stringify({
      items,
      name: form.get("name"),
      street: form.get("street"),
      city: form.get("city"),
      postalCode: form.get("postalCode"),
    });
    let saved: { fingerprint: string; id: string } | null = null;
    try {
      saved = JSON.parse(sessionStorage.getItem("scentia_checkout") || "null");
    } catch {}
    const requestId =
      saved?.fingerprint === fingerprint ? saved.id : crypto.randomUUID();
    sessionStorage.setItem(
      "scentia_checkout",
      JSON.stringify({ fingerprint, id: requestId }),
    );
    try {
      await flushCart();
      const res = await fetch("/api/commande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          name: form.get("name"),
          address: {
            street: form.get("street"),
            city: form.get("city"),
            postalCode: form.get("postalCode"),
            country: "France",
          },
          requestId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      clearCart();
      sessionStorage.removeItem("scentia_checkout");
      router.push(`/commande/confirmation/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur réseau. Réessayez.",
      );
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <PageShell>
      <div className="mb-10 space-y-3">
        <p className="eyebrow">01 Panier → 02 Livraison → 03 Confirmation</p>
        <h1 className="title">Votre prochain souvenir.</h1>
        <p className="text-stone-500 text-sm">
          Commande de démonstration · aucun prélèvement ni expédition réelle.
        </p>
      </div>
      {isLoadingAuth ? (
        <p>Chargement…</p>
      ) : !user ? (
        <div className="panel max-w-xl space-y-4">
          <h2 className="font-serif text-2xl">
            Identifiez-vous pour continuer
          </h2>
          <p>Votre commande sera conservée dans votre espace personnel.</p>
          <button
            className="primary"
            onClick={() => {
              setAuthModalMode("login");
              setIsAuthModalOpen(true);
            }}
          >
            Connexion / inscription
          </button>
        </div>
      ) : cart.length === 0 ? (
        <div className="panel space-y-4">
          <p>Votre panier est vide.</p>
          <Link className="primary" href="/#catalogue">
            Découvrir les parfums
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8">
          <form className="panel space-y-5" onSubmit={submit}>
            <h2 className="font-serif text-2xl text-[#76545a]">
              Vos coordonnées
            </h2>
            <p className="text-xs text-stone-500">Compte : {user.email}</p>
            <label className="block text-sm">
              Nom complet
              <input
                className="field mt-2"
                name="name"
                required
                minLength={2}
                maxLength={120}
                defaultValue={profile?.fullName}
                autoComplete="name"
              />
            </label>
            <label className="block text-sm">
              Adresse
              <input
                className="field mt-2"
                name="street"
                required
                minLength={3}
                maxLength={200}
                autoComplete="street-address"
                defaultValue={profile?.shippingAddress?.street}
              />
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm">
                Code postal
                <input
                  className="field mt-2"
                  name="postalCode"
                  required
                  minLength={2}
                  maxLength={20}
                  autoComplete="postal-code"
                  defaultValue={profile?.shippingAddress?.postalCode}
                />
              </label>
              <label className="block text-sm">
                Ville
                <input
                  className="field mt-2"
                  name="city"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="address-level2"
                  defaultValue={profile?.shippingAddress?.city}
                />
              </label>
            </div>
            <p className="text-sm">Pays : France</p>
            <label className="flex items-start gap-3 text-xs leading-relaxed">
              <input type="checkbox" required className="mt-1" />
              Je comprends qu’il s’agit d’une commande pédagogique, sans
              paiement ni livraison réelle.
            </label>
            {error && (
              <p role="alert" className="bg-red-50 text-red-800 p-3 text-sm">
                {error}
              </p>
            )}
            <button className="primary w-full" disabled={busy}>
              {busy
                ? "Enregistrement…"
                : "Confirmer la commande de démonstration"}
            </button>
          </form>
          <aside className="panel h-fit space-y-5">
            <h2 className="font-serif text-2xl text-[#76545a]">
              Votre sélection
            </h2>
            {cart.map((i) => (
              <div
                key={i.id}
                className="flex justify-between border-b border-stone-100 pb-4 text-sm"
              >
                <div>
                  {i.name}
                  <p className="text-xs text-stone-500 mt-1">
                    {i.size} × {i.quantity}
                    {i.engraving && ` · « ${i.engraving} »`}
                  </p>
                </div>
                <span>{money(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm">
              <span>Sous-total</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Livraison</span>
              <span>{shippingCost ? money(shippingCost) : "Offerte"}</span>
            </div>
            <div className="flex justify-between font-serif text-2xl text-[#76545a]">
              <span>Total estimé</span>
              <span>{money(total)}</span>
            </div>
            <p className="text-xs text-stone-500">
              Le serveur vérifie les prix et les stocks avant de confirmer.
            </p>
          </aside>
        </div>
      )}
    </PageShell>
  );
}
