"use client";
import { useDialog } from "@/components/layout/useDialog";

import React, { useState } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    refreshProfile,
    showToast,
  } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();
  const dialogRef = useDialog(() => setIsAuthModalOpen(false));

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (authModalMode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMessage(
            error.message === "Invalid login credentials"
              ? "Identifiants invalides. Veuillez vérifier votre adresse e-mail et mot de passe."
              : error.message,
          );
          return;
        }

        if (data?.user) {
          showToast("Bienvenue chez SCENTIA", "gold");
          await refreshProfile();
          setIsAuthModalOpen(false);
          router.refresh();
        }
      } else {
        // Register mode
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        if (data?.user) {
          if (data.session) {
            showToast("Votre compte SCENTIA a été créé avec succès", "gold");
            await refreshProfile();
            setIsAuthModalOpen(false);
            router.refresh();
          } else {
            setSuccessMessage(
              "Un e-mail de confirmation vous a été envoyé. Veuillez vérifier votre boîte de réception pour valider votre compte.",
            );
          }
        }
      }
    } catch (err: unknown) {
      setErrorMessage(
        (err instanceof Error ? err.message : "") ||
          "Une erreur est survenue lors de l'authentification.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Connexion et inscription"
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={() => setIsAuthModalOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative bg-[#fcf9f5] w-full max-w-md rounded-sm border border-[#ba7d7a]/40 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Top Decorative Header */}
        <div className="bg-[#4b373b] text-[#fdf5f1] p-6 text-center relative border-b border-[#ba7d7a]/30">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 text-[#ba7d7a] hover:text-[#fdf5f1] p-1 transition-colors"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
          <div className="flex justify-center mb-1 text-[#ba7d7a]">
            <Sparkles size={20} />
          </div>
          <h3 className="font-serif text-2xl tracking-[0.15em] text-[#fdf5f1]">
            SCENTIA
          </h3>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#ba7d7a] mt-1">
            Maison de Haute Parfumerie
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#ba7d7a]/30 bg-[#F7F4EE]">
          <button
            onClick={() => {
              setAuthModalMode("login");
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-3 text-xs uppercase tracking-widest font-medium transition-colors ${
              authModalMode === "login"
                ? "text-[#76545a] border-b-2 border-[#76545a] bg-[#fcf9f5]"
                : "text-[#8E827F] hover:text-[#342e2c]"
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => {
              setAuthModalMode("register");
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-3 text-xs uppercase tracking-widest font-medium transition-colors ${
              authModalMode === "register"
                ? "text-[#76545a] border-b-2 border-[#76545a] bg-[#fcf9f5]"
                : "text-[#8E827F] hover:text-[#342e2c]"
            }`}
          >
            Créer un compte
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
              {errorMessage}
            </div>
          )}

          {successMessage ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <h4 className="font-serif text-lg text-[#76545a]">
                Validation requise
              </h4>
              <p className="text-xs text-[#8E827F] leading-relaxed">
                {successMessage}
              </p>
              <button
                onClick={() => {
                  setAuthModalMode("login");
                  setSuccessMessage(null);
                }}
                className="mt-4 px-6 py-2 bg-[#76545a] text-[#fdf5f1] text-xs uppercase tracking-widest rounded-sm"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {authModalMode === "register" && (
                <div>
                  <label className="block text-xs font-medium text-[#342e2c] uppercase tracking-wider mb-1.5">
                    Prénom & Nom
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8E827F]">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alexandre de Guise"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#ba7d7a]/40 rounded-sm focus:outline-none focus:border-[#76545a] text-[#342e2c]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#342e2c] uppercase tracking-wider mb-1.5">
                  Adresse E-mail
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8E827F]">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@domaine.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#ba7d7a]/40 rounded-sm focus:outline-none focus:border-[#76545a] text-[#342e2c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#342e2c] uppercase tracking-wider mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8E827F]">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#ba7d7a]/40 rounded-sm focus:outline-none focus:border-[#76545a] text-[#342e2c]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#76545a] hover:bg-[#593e44] text-[#fdf5f1] uppercase tracking-[0.2em] text-xs font-semibold rounded-sm transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Traitement en cours...</span>
                  ) : (
                    <>
                      <span>
                        {authModalMode === "login"
                          ? "Accéder à mon espace"
                          : "Créer mon compte"}
                      </span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-center text-[#8E827F] pt-2">
                En vous connectant, vous accédez à vos commandes, vos favoris et
                vos diagnostics olfactifs personnalisés.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
