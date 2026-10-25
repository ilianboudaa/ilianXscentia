"use client";
import { PageShell } from "@/components/layout/PageShell";
import { useApp } from "@/components/providers/AppProvider";
import Link from "next/link";
export default function Login() {
  const { user, setIsAuthModalOpen, setAuthModalMode } = useApp();
  return (
    <PageShell>
      <div className="max-w-lg mx-auto text-center py-14 space-y-6">
        <p className="eyebrow">Le cercle Scentia</p>
        <h1 className="title">Votre espace personnel</h1>
        <p>
          Retrouvez vos commandes, vos favoris et votre signature olfactive.
        </p>
        {user ? (
          <Link className="primary" href="/compte">
            Accéder à mon compte
          </Link>
        ) : (
          <div className="flex justify-center gap-3">
            <button
              className="primary"
              onClick={() => {
                setAuthModalMode("login");
                setIsAuthModalOpen(true);
              }}
            >
              Se connecter
            </button>
            <button
              className="secondary"
              onClick={() => {
                setAuthModalMode("register");
                setIsAuthModalOpen(true);
              }}
            >
              Créer un compte
            </button>
          </div>
        )}
        <p className="text-xs text-stone-500">
          Si votre lien de confirmation a expiré, reconnectez-vous après avoir
          validé votre adresse e-mail.
        </p>
      </div>
    </PageShell>
  );
}
