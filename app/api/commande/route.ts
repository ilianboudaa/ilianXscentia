import { sameOrigin } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Origine non autorisée" },
      { status: 403 },
    );
  const db = await createClient();
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();
  if (authError || !user)
    return NextResponse.json(
      { error: "Connectez-vous pour commander." },
      { status: 401 },
    );
  try {
    const body = await req.json();
    if (
      !Array.isArray(body.items) ||
      body.items.length < 1 ||
      body.items.length > 50 ||
      typeof body.name !== "string" ||
      !body.address ||
      typeof body.address !== "object" ||
      typeof body.requestId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        body.requestId,
      )
    )
      return NextResponse.json(
        { error: "Commande invalide." },
        { status: 400 },
      );
    if (
      !body.items.every(
        (i: Record<string, unknown>) =>
          i &&
          typeof i.product_id === "string" &&
          ["30ml", "50ml", "100ml"].includes(String(i.size)) &&
          Number.isInteger(i.quantity) &&
          Number(i.quantity) > 0 &&
          Number(i.quantity) <= 99 &&
          typeof i.engraving === "string" &&
          i.engraving.length <= 24,
      )
    )
      return NextResponse.json(
        { error: "Articles invalides." },
        { status: 400 },
      );
    const { data, error } = await db.rpc("place_order", {
      p_items: body.items,
      p_name: body.name,
      p_address: body.address,
      p_request: body.requestId,
    });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Impossible de traiter la commande. Réessayez." },
      { status: 400 },
    );
  }
}
