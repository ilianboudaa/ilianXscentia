import { sameOrigin } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function PATCH(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Origine non autorisée" },
      { status: 403 },
    );
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  const { data: p } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (p?.role !== "admin")
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  try {
    const { id, stock } = await req.json();
    if (
      typeof id !== "string" ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      stock > 10000
    )
      return NextResponse.json({ error: "Stock invalide" }, { status: 400 });
    const { data, error } = await db
      .from("product_variants")
      .update({ stock })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error || !data)
      return NextResponse.json(
        { error: "Mise à jour impossible" },
        { status: 400 },
      );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}
