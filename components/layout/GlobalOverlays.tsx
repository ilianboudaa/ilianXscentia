"use client";
import dynamic from "next/dynamic";
import { useApp } from "@/components/providers/AppProvider";
// Applied skill: bundle-dynamic-imports. Each window loads only when opened.
const Auth = dynamic(
  () => import("@/components/auth/AuthModal").then((m) => m.AuthModal),
  { ssr: false },
);
const Cart = dynamic(
  () => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer),
  { ssr: false },
);
const Search = dynamic(
  () => import("@/components/search/SearchModal").then((m) => m.SearchModal),
  { ssr: false },
);
const Product = dynamic(
  () =>
    import("@/components/home/ImmersiveProductModal").then(
      (m) => m.ImmersiveProductModal,
    ),
  { ssr: false },
);
export function GlobalOverlays() {
  const { isAuthModalOpen, isCartOpen, isSearchOpen, quickViewPerfume } =
    useApp();
  return (
    <>
      {isAuthModalOpen && <Auth />}
      {isCartOpen && <Cart />}
      {isSearchOpen && <Search />}
      {quickViewPerfume && <Product />}
    </>
  );
}
