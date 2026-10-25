"use client";
/* eslint-disable react-hooks/set-state-in-effect -- Hydrates external localStorage and Supabase account state; never derives state from render props. */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { CartItem, Perfume, UserProfile } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "gold";
}
interface AppContextType {
  cart: CartItem[];
  addToCart: (
    p: Perfume,
    s: "30ml" | "50ml" | "100ml",
    q?: number,
    e?: string,
  ) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, q: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (v: boolean) => void;
  cartCount: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  quickViewPerfume: Perfume | null;
  setQuickViewPerfume: (p: Perfume | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (v: boolean) => void;
  user: User | null;
  profile: UserProfile | null;
  isLoadingAuth: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (v: boolean) => void;
  authModalMode: "login" | "register";
  setAuthModalMode: (v: "login" | "register") => void;
  signOut: () => Promise<void>;
  flushCart: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  toasts: Toast[];
  showToast: (m: string, t?: Toast["type"]) => void;
}
const Context = createContext<AppContextType | undefined>(undefined);
const itemKey = (p: string, s: string, e = "") => JSON.stringify([p, s, e]);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const db = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [cart, setCart] = useState<CartItem[]>([]),
    [favorites, setFavorites] = useState<string[]>([]);
  const cartRef = useRef<CartItem[]>([]),
    favRef = useRef<string[]>([]),
    owner = useRef<string | null>(null);
  const ready = useRef(false),
    queue = useRef<Promise<void>>(Promise.resolve());
  const [user, setUser] = useState<User | null>(null),
    [profile, setProfile] = useState<UserProfile | null>(null),
    [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false),
    [isSearchOpen, setIsSearchOpen] = useState(false),
    [quickViewPerfume, setQuickViewPerfume] = useState<Perfume | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false),
    [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback(
    (message: string, type: Toast["type"] = "gold") => {
      const id = crypto.randomUUID();
      setToasts((p) => [...p, { id, message, type }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
    },
    [],
  );
  const setItems = useCallback((items: CartItem[]) => {
    cartRef.current = items;
    setCart(items);
    if (!owner.current)
      localStorage.setItem("scentia_guest_cart", JSON.stringify(items));
  }, []);
  const setFavs = useCallback((ids: string[]) => {
    favRef.current = ids;
    setFavorites(ids);
    if (!owner.current)
      localStorage.setItem("scentia_guest_favs", JSON.stringify(ids));
  }, []);
  const refreshProfile = useCallback(async () => {
    if (!db) return;
    const {
      data: { user: u },
    } = await db.auth.getUser();
    if (!u) return;
    const { data, error } = await db
      .from("profiles")
      .select("*")
      .eq("id", u.id)
      .single();
    if (error) throw error;
    setProfile({
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      role: data.role,
      createdAt: data.created_at,
      phone: data.phone,
      shippingAddress: data.shipping_address,
    });
  }, [db]);
  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem("scentia_guest_cart") || "[]");
      const f = JSON.parse(localStorage.getItem("scentia_guest_favs") || "[]");
      if (Array.isArray(c))
        setItems(
          c.filter(
            (x) =>
              x &&
              typeof x.perfumeId === "string" &&
              Number.isInteger(x.quantity) &&
              x.quantity > 0 &&
              x.quantity <= 99 &&
              Number.isFinite(x.price),
          ),
        );
      if (Array.isArray(f)) setFavs(f.filter((x) => typeof x === "string"));
    } catch {
      localStorage.removeItem("scentia_guest_cart");
      localStorage.removeItem("scentia_guest_favs");
    }
    if (!db) {
      setIsLoadingAuth(false);
      ready.current = true;
      return;
    }
    // Never make another Supabase request inside onAuthStateChange's auth lock.
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });
    return () => subscription.unsubscribe();
  }, [db, setItems, setFavs]);
  useEffect(() => {
    if (!db || isLoadingAuth) return;
    const uid = user?.id ?? null;
    if (owner.current === uid && ready.current) return;
    let active = true;
    ready.current = false;
    const previousOwner = owner.current;
    owner.current = uid;
    if (!uid) {
      if (previousOwner) {
        setItems([]);
        setFavs([]);
        setProfile(null);
      }
      ready.current = true;
      return;
    }
    // Clear the previous account immediately; only the guest cart is eligible to merge.
    const guest = previousOwner ? [] : cartRef.current;
    const guestFavs = previousOwner ? [] : favRef.current;
    cartRef.current = [];
    setCart([]);
    favRef.current = [];
    setFavorites([]);
    async function hydrate() {
      try {
        await queue.current;
        const [{ data: rows, error }, { data: favs, error: favError }] =
          await Promise.all([
            db!
              .from("cart_items")
              .select(
                "*,products(name,slug,family,image,product_variants(size,price))",
              )
              .eq("user_id", uid!),
            db!.from("favorites").select("product_id").eq("user_id", uid!),
          ]);
        if (error || favError) throw error || favError;
        const items: CartItem[] = (rows || []).map((r) => ({
          id: itemKey(r.product_id, r.size, r.engraving),
          perfumeId: r.product_id,
          name: r.products.name,
          slug: r.products.slug,
          family: r.products.family,
          image: r.products.image,
          size: r.size,
          price: Number(
            r.products.product_variants.find(
              (v: { size: string }) => v.size === r.size,
            )?.price || 0,
          ),
          quantity: r.quantity,
          engraving: r.engraving,
        }));
        const merged = new Map(items.map((i) => [i.id, i]));
        guest.forEach((i) => {
          const id = itemKey(i.perfumeId, i.size, i.engraving);
          if (!merged.has(id)) merged.set(id, { ...i, id });
        });
        if (guest.length) {
          const { error } = await db!.from("cart_items").upsert(
            [...merged.values()].map((i) => ({
              user_id: uid,
              product_id: i.perfumeId,
              size: i.size,
              quantity: i.quantity,
              engraving: i.engraving || "",
            })),
            { onConflict: "user_id,product_id,size,engraving" },
          );
          if (error) throw error;
        }
        const allFavs = [
          ...new Set([...(favs || []).map((f) => f.product_id), ...guestFavs]),
        ];
        if (guestFavs.length) {
          const { error } = await db!.from("favorites").upsert(
            allFavs.map((product_id) => ({ user_id: uid, product_id })),
            { onConflict: "user_id,product_id" },
          );
          if (error) throw error;
        }
        if (!active) return;
        setItems([...merged.values()]);
        setFavs(allFavs);
        await refreshProfile();
        localStorage.removeItem("scentia_guest_cart");
        localStorage.removeItem("scentia_guest_favs");
      } catch {
        if (active)
          showToast(
            "Synchronisation impossible. Rechargez la page avant de modifier votre panier.",
            "info",
          );
        return;
      }
      if (active) ready.current = true;
    }
    void hydrate();
    return () => {
      active = false;
    };
  }, [
    db,
    user?.id,
    isLoadingAuth,
    setItems,
    setFavs,
    refreshProfile,
    showToast,
  ]);
  function persist(task: () => PromiseLike<{ error: unknown }>) {
    queue.current = queue.current
      .then(async () => {
        const { error } = await task();
        if (error) throw error;
      })
      .catch(() => {
        ready.current = false;
        showToast(
          "Modification non enregistrée. Rechargez la page pour retrouver votre panier en base.",
          "info",
        );
      });
  }
  function allowed() {
    if (!ready.current || isLoadingAuth) {
      showToast("Veuillez patienter pendant la synchronisation.", "info");
      return false;
    }
    return true;
  }
  function saveItem(i: CartItem) {
    const uid = owner.current;
    if (uid && db)
      persist(() =>
        db
          .from("cart_items")
          .upsert(
            {
              user_id: uid,
              product_id: i.perfumeId,
              size: i.size,
              engraving: i.engraving || "",
              quantity: i.quantity,
            },
            { onConflict: "user_id,product_id,size,engraving" },
          ),
      );
  }
  function addToCart(
    p: Perfume,
    size: "30ml" | "50ml" | "100ml",
    quantity = 1,
    engraving = "",
  ) {
    if (!allowed()) return;
    engraving = engraving.trim().slice(0, 24);
    const variant = p.variants.find((v) => v.size === size);
    if (!variant) return;
    const id = itemKey(p.id, size, engraving),
      existing = cartRef.current.find((i) => i.id === id),
      qty = (existing?.quantity || 0) + quantity;
    if (
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > Math.min(99, variant.stock)
    ) {
      showToast("Quantité indisponible pour ce format.", "info");
      return;
    }
    const item: CartItem = {
      id,
      perfumeId: p.id,
      name: p.name,
      slug: p.slug,
      family: p.family,
      image: p.image,
      size,
      price: variant.price,
      quantity: qty,
      engraving,
    };
    setItems([...cartRef.current.filter((i) => i.id !== id), item]);
    saveItem(item);
    setIsCartOpen(true);
    showToast(`${p.name} ajouté au panier`);
  }
  function removeFromCart(id: string) {
    if (!allowed()) return;
    const i = cartRef.current.find((i) => i.id === id);
    if (!i) return;
    setItems(cartRef.current.filter((i) => i.id !== id));
    const uid = owner.current;
    if (uid && db)
      persist(() =>
        db
          .from("cart_items")
          .delete()
          .eq("user_id", uid)
          .eq("product_id", i.perfumeId)
          .eq("size", i.size)
          .eq("engraving", i.engraving || ""),
      );
  }
  function updateQuantity(id: string, q: number) {
    if (q <= 0) {
      removeFromCart(id);
      return;
    }
    if (!allowed() || !Number.isInteger(q) || q > 99) return;
    const i = cartRef.current.find((i) => i.id === id);
    if (!i) return;
    const item = { ...i, quantity: q };
    setItems(cartRef.current.map((x) => (x.id === id ? item : x)));
    saveItem(item);
  }
  function clearCart() {
    if (!allowed()) return;
    setItems([]);
    const uid = owner.current;
    if (uid && db)
      persist(() => db.from("cart_items").delete().eq("user_id", uid));
  }
  function toggleFavorite(id: string) {
    if (!allowed()) return;
    const exists = favRef.current.includes(id);
    setFavs(
      exists ? favRef.current.filter((x) => x !== id) : [...favRef.current, id],
    );
    const uid = owner.current;
    if (uid && db)
      persist(() =>
        exists
          ? db
              .from("favorites")
              .delete()
              .eq("user_id", uid)
              .eq("product_id", id)
          : db
              .from("favorites")
              .upsert(
                { user_id: uid, product_id: id },
                { onConflict: "user_id,product_id" },
              ),
      );
    showToast(exists ? "Retiré des favoris" : "Ajouté aux favoris");
  }
  async function flushCart() {
    await queue.current;
    if (!ready.current)
      throw new Error(
        "Panier non synchronisé. Rechargez la page avant de commander.",
      );
  }
  async function signOut() {
    await queue.current;
    if (db) {
      const { error } = await db.auth.signOut();
      if (error) {
        showToast("Déconnexion impossible. Réessayez.", "info");
        return;
      }
    }
    setUser(null);
    setProfile(null);
    owner.current = null;
    ready.current = true;
    setItems([]);
    setFavs([]);
    showToast("Vous avez été déconnecté", "info");
    router.replace("/connexion");
    router.refresh();
  }
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0),
    subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0),
    shippingCost = subtotal >= 150 || subtotal === 0 ? 0 : 9.9,
    total = subtotal + shippingCost;
  return (
    <Context.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        subtotal,
        shippingCost,
        total,
        favorites,
        toggleFavorite,
        isFavorite: (id) => favorites.includes(id),
        quickViewPerfume,
        setQuickViewPerfume,
        isSearchOpen,
        setIsSearchOpen,
        user,
        profile,
        isLoadingAuth,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        signOut,
        flushCart,
        refreshProfile,
        toasts,
        showToast,
      }}
    >
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 left-5 sm:left-auto z-[100] space-y-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-[#4b373b] text-[#fdf5f1] border border-[#ba7d7a]/40 px-5 py-4 shadow-xl text-sm"
          >
            ✦ {t.message}
          </div>
        ))}
      </div>
      {!isSupabaseConfigured && (
        <div
          role="alert"
          className="fixed bottom-0 inset-x-0 bg-red-100 text-red-900 p-3 text-center z-[110]"
        >
          Supabase non configuré. Renseignez les variables d’environnement avant
          de lancer le site.
        </div>
      )}
    </Context.Provider>
  );
}
export function useApp() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("AppProvider requis");
  return ctx;
}
