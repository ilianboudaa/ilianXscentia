import original from "@/data/catalog.json";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { Perfume } from "@/types";
export const getPerfume = cache(
  async (slug: string): Promise<Perfume | null> => {
    const db = await createClient();
    const { data, error } = await db
      .from("products")
      .select("*,product_variants(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error("Le catalogue est momentanément indisponible.");
    if (!data) return null;
    return {
      ...data,
      price: Number(data.price),
      familyLabel: data.family_label,
      reviewCount: data.review_count,
      isBestseller: data.is_bestseller,
      isNew: data.is_new,
      isVanillaCollection: data.is_vanilla_collection,
      moodColor: data.mood_color,
      bottleBackground: original.find((x) => x.id === data.id)
        ?.bottleBackground,
      badge: original.find((x) => x.id === data.id)?.badge,
      variants: data.product_variants
        .filter((v: { size: string }) => v.size === "50ml")
        .map(
          (v: { size: string; price: number; stock: number; sku: string }) => ({
            ...v,
            price: Number(v.price),
          }),
        ),
    };
  },
);
