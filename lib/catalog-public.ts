import original from "@/data/catalog.json";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseConfig } from "./supabase/config";
import { Perfume } from "@/types";
export async function getCatalogue(): Promise<Perfume[]> {
  const { url, key } = requireSupabaseConfig();
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
  const { data, error } = await db
    .from("products")
    .select("*,product_variants(*)")
    .eq("is_active", true)
    .order("id");
  if (error) throw new Error("Catalogue indisponible");
  return data
    .sort(
      (a, b) =>
        original.findIndex((p) => p.id === a.id) -
        original.findIndex((p) => p.id === b.id),
    )
    .map((p) => ({
      ...p,
      price: Number(p.price),
      familyLabel: p.family_label,
      reviewCount: p.review_count,
      isBestseller: p.is_bestseller,
      isNew: p.is_new,
      isVanillaCollection: p.is_vanilla_collection,
      moodColor: p.mood_color,
      bottleBackground: original.find((x) => x.id === p.id)?.bottleBackground,
      badge: original.find((x) => x.id === p.id)?.badge,
      variants: p.product_variants
        .filter((v: { size: string }) => v.size === "50ml")
        .map((v: { price: number }) => ({ ...v, price: Number(v.price) })),
    }));
}
