import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/layout/PageShell";
import { money, date, statusLabel } from "@/lib/format";
import { StockEditor } from "./StockEditor";
export default async function Admin() {
  const db = await createClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) redirect("/connexion");
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return (
      <PageShell>
        <h1 className="title">Accès réservé</h1>
        <p className="mt-5">
          Ce compte ne dispose pas des droits administrateur.
        </p>
      </PageShell>
    );
  const [m, o, s] = await Promise.all([
    db.rpc("admin_metrics"),
    db
      .from("orders")
      .select("id,order_number,customer_name,total,created_at,status,is_demo")
      .order("created_at", { ascending: false })
      .limit(20),
    db
      .from("product_variants")
      .select("id,size,stock,sku,products(name)")
      .order("stock", { ascending: true }),
  ]);
  if (m.error || o.error || s.error)
    throw new Error("Le tableau de bord est momentanément indisponible.");
  const k = m.data;
  const daily = k.daily as { day: string; count: number; total: number }[];
  const max = Math.max(...daily.map((d) => Number(d.total)), 1);
  return (
    <PageShell>
      <div className="mb-10 flex justify-between items-end flex-wrap gap-4">
        <div className="space-y-3">
          <p className="eyebrow">Scentia · Administration</p>
          <h1 className="title">La maison, en chiffres.</h1>
        </div>
        <p className="text-xs text-stone-500">
          Données Supabase · actualisées à l’ouverture
        </p>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {[
          ["CA encaissé hors démo", money(k.revenue)],
          ["Commandes", k.orders],
          ["Clients", k.customers],
          ["Panier moyen enregistré", money(k.average)],
          ["Volume de démo", money(k.demo_total)],
        ].map(([label, value]) => (
          <div key={label} className="panel">
            <p className="eyebrow leading-relaxed">{label}</p>
            <p className="font-serif text-3xl text-[#76545a] mt-4">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <section className="panel">
          <h2 className="font-serif text-2xl text-[#76545a] mb-5">
            Activité des 30 derniers jours
          </h2>
          {daily.length ? (
            <div className="space-y-3">
              {daily.map((d) => (
                <div
                  key={d.day}
                  className="grid grid-cols-[80px_1fr_90px] gap-3 items-center text-xs"
                >
                  <span>{d.day.slice(5)}</span>
                  <div className="bg-[#f5e7e3] h-5">
                    <div
                      className="h-full bg-[#76545a]"
                      style={{ width: `${(Number(d.total) / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-right">{money(d.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-500 py-8">
              Les premières commandes feront apparaître votre activité ici.
            </p>
          )}
          <p className="text-xs text-stone-500 mt-5">
            Montants enregistrés, démos incluses. Le CA encaissé exclut les
            démos.
          </p>
        </section>
        <section className="panel">
          <h2 className="font-serif text-2xl text-[#76545a] mb-5">
            Les signatures les plus choisies
          </h2>
          {k.top_products.length ? (
            k.top_products.map(
              (p: { name: string; units: number; total: number }) => (
                <div
                  key={p.name}
                  className="flex justify-between border-t py-4 text-sm"
                >
                  <span>{p.name}</span>
                  <span>
                    {p.units} flacons · {money(p.total)}
                  </span>
                </div>
              ),
            )
          ) : (
            <p className="text-sm text-stone-500">
              Aucune commande pour le moment.
            </p>
          )}
        </section>
      </div>
      <section className="panel mb-8">
        <h2 className="font-serif text-2xl text-[#76545a] mb-5">
          Dernières commandes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-stone-500 border-b">
                {["Référence", "Client", "Date", "État", "Total"].map((h) => (
                  <th className="py-3 pr-5" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {o.data.map((order) => (
                <tr className="border-b border-stone-100" key={order.id}>
                  <td className="py-4 pr-5 whitespace-nowrap">
                    {order.order_number}
                    {order.is_demo && (
                      <span className="text-xs ml-2 text-stone-500">Démo</span>
                    )}
                  </td>
                  <td className="pr-5">{order.customer_name}</td>
                  <td className="pr-5 whitespace-nowrap">
                    {date(order.created_at)}
                  </td>
                  <td className="pr-5">{statusLabel[order.status]}</td>
                  <td>{money(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!o.data.length && (
            <p className="text-sm py-6 text-stone-500">
              Aucune commande enregistrée.
            </p>
          )}
        </div>
      </section>
      <section className="panel">
        <h2 className="font-serif text-2xl text-[#76545a] mb-5">
          Stocks par format
        </h2>
        <p className="text-xs text-stone-500 mb-5">
          L’enregistrement vérifie à nouveau votre rôle côté serveur. Les
          commandes décrémentent automatiquement le stock.
        </p>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {s.data.map((v) => (
            <StockEditor
              key={v.id}
              variant={{
                id: v.id,
                sku: v.sku,
                size: v.size,
                stock: v.stock,
                name: (v.products as unknown as { name: string }).name,
              }}
            />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
