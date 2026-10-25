import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/layout/PageShell";
import { money } from "@/lib/format";
export default async function Confirmation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/connexion");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: order, error } = await db
    .from("orders")
    .select("*,order_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !order) notFound();
  return (
    <PageShell>
      <div className="max-w-2xl mx-auto space-y-7 py-10">
        <p className="eyebrow">Commande enregistrée</p>
        <h1 className="title">Merci, {order.customer_name}.</h1>
        <p>Votre sélection vous attend dans votre espace personnel.</p>
        <div className="panel space-y-4">
          <p className="font-mono text-sm">{order.order_number}</p>
          {order.order_items.map(
            (i: {
              id: string;
              name: string;
              size: string;
              quantity: number;
              price: number;
            }) => (
              <div key={i.id} className="flex justify-between text-sm">
                <span>
                  {i.name} · {i.size} × {i.quantity}
                </span>
                <span>{money(i.price * i.quantity)}</span>
              </div>
            ),
          )}
          <div className="border-t pt-4 flex justify-between font-semibold">
            <span>Total</span>
            {money(order.total)}
          </div>
          <p className="text-xs text-stone-500">
            Démonstration : aucun paiement effectué, aucun colis expédié.
          </p>
        </div>
        <Link className="primary" href="/compte">
          Retrouver mes commandes
        </Link>
        <Link className="secondary ml-3" href="/#catalogue">
          Continuer la visite
        </Link>
      </div>
    </PageShell>
  );
}
