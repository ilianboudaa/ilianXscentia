"use client";
import { useState } from "react";
import Link from "next/link";
import {
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Shield,
  LogOut,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
export function Header() {
  const [menu, setMenu] = useState(false),
    [account, setAccount] = useState(false);
  const {
    cartCount,
    favorites,
    user,
    profile,
    setIsCartOpen,
    setIsAuthModalOpen,
    setAuthModalMode,
    signOut,
  } = useApp();
  return (
    <header className="botanical-header">
      <div className="botanical-announcement">
        Livraison offerte dès 150 € · Un échantillon offert avec chaque commande
      </div>
      <div className="botanical-nav">
        <Link className="botanical-brand" href="/">
          SCENTIA<small>MAISON DE PARFUM</small>
        </Link>
        <nav className="botanical-navlinks" aria-label="Navigation principale">
          <Link href="/#catalogue">Nos parfums</Link>
          <Link href="/#manifeste">Notre maison</Link>
          <Link href="/#quiz">Diagnostic olfactif</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <button
              className="botanical-icon"
              aria-label={user ? "Mon compte" : "Se connecter"}
              aria-expanded={user ? account : undefined}
              onClick={() => {
                if (user) setAccount(!account);
                else {
                  setAuthModalMode("login");
                  setIsAuthModalOpen(true);
                }
              }}
            >
              <User size={20} />
            </button>
            {account && user && (
              <div className="account-menu">
                <p className="text-xs px-4 py-3 border-b break-words">
                  {profile?.fullName || user.email}
                </p>
                <Link href="/compte" onClick={() => setAccount(false)}>
                  Mon compte et commandes
                </Link>
                {profile?.role === "admin" && (
                  <Link href="/admin" onClick={() => setAccount(false)}>
                    <Shield size={14} /> Administration
                  </Link>
                )}
                <button
                  onClick={() => {
                    setAccount(false);
                    void signOut();
                  }}
                >
                  <LogOut size={14} /> Déconnexion
                </button>
              </div>
            )}
          </div>
          <Link
            className="botanical-icon"
            href="/compte#favoris"
            aria-label="Mes favoris"
          >
            <Heart size={20} />
            {favorites.length > 0 && (
              <span className="botanical-count">{favorites.length}</span>
            )}
          </Link>
          <button
            className="botanical-icon"
            aria-label="Ouvrir le panier"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="botanical-count">{cartCount}</span>
            )}
          </button>
          <button
            className="botanical-icon botanical-mobile"
            aria-label="Menu"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menu && (
        <nav className="botanical-mobile-menu" aria-label="Navigation mobile">
          <Link onClick={() => setMenu(false)} href="/#catalogue">
            Nos parfums
          </Link>
          <Link onClick={() => setMenu(false)} href="/#manifeste">
            Notre maison
          </Link>
          <Link onClick={() => setMenu(false)} href="/#quiz">
            Diagnostic olfactif
          </Link>
          <Link onClick={() => setMenu(false)} href="/compte">
            Mon compte
          </Link>
        </nav>
      )}
    </header>
  );
}
