import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/layout/PageShell";
import { ProfileForm } from "./ProfileForm";
import { money, date, statusLabel } from "@/lib/format";
export default async function Account() {
  const db = await createClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) redirect("/connexion");
  const [p, o, f, q] = await Promise.all([
    db.from("profiles").select("*").eq("id", user.id).single(),
    db
      .from("orders")
      .select("*,order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    db
      .from("favorites")
      .select("product_id,products(name,slug)")
      .eq("user_id", user.id),
    db
      .from("quiz_results")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);
  if (p.error || o.error || f.error || q.error)
    throw new Error("Impossible de charger votre espace personnel.");
  return (
    <PageShell>
      <div className="space-y-3 mb-10">
        <p className="eyebrow">Votre cercle personnel</p>
        <h1 className="title">Bonjour, {p.data.full_name || "à vous"}.</h1>
        <p className="text-sm text-stone-500">{user.email}</p>
        {p.data.role === "admin" && (
          <Link className="secondary" href="/admin">
            Tableau de bord administrateur
          </Link>
        )}
      </div>
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
        <div className="space-y-8">
          <section className="panel space-y-5">
            <h2 className="font-serif text-2xl text-[#76545a]">
              Mes commandes
            </h2>
            {!o.data.length ? (
              <div className="py-8 text-stone-500">
                <p>Votre histoire commence ici.</p>
                <Link className="underline text-sm" href="/#catalogue">
                  Trouver votre premier parfum
                </Link>
              </div>
            ) : (
              o.data.map((order) => (
                <article
                  key={order.id}
                  className="border-t border-stone-100 pt-5 space-y-3"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <Link
                      className="text-sm font-semibold underline"
                      href={`/commande/confirmation/${order.id}`}
                    >
                      {order.order_number}
                    </Link>
                    <span className="text-xs bg-[#f5e7e3] px-2 py-1">
                      {statusLabel[order.status]}
                      {order.is_demo ? " · Démo" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    {date(order.created_at)}
                  </p>
                  {order.order_items.map(
                    (i: {
                      id: string;
                      name: string;
                      quantity: number;
                      size: string;
                      engraving: string;
                    }) => (
                      <p className="text-sm" key={i.id}>
                        {i.name} · {i.size} × {i.quantity}
                        {i.engraving && ` · « ${i.engraving} »`}
                      </p>
                    ),
                  )}
                  <p className="text-right text-[#76545a] font-semibold">
                    {money(order.total)}
                  </p>
                </article>
              ))
            )}
          </section>
          <section id="favoris" className="panel space-y-4">
            <h2 className="font-serif text-2xl text-[#76545a]">Mes favoris</h2>
            {f.data.length ? (
              <div className="flex gap-3 flex-wrap">
                {f.data.map((item) => {
                  const product = item.products as unknown as {
                    name: string;
                    slug: string;
                  };
                  return (
                    <Link
                      key={item.product_id}
                      className="secondary"
                      href={`/parfums/${product.slug}`}
                    >
                      {product.name}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-stone-500">
                Touchez le cœur d’un parfum pour le retrouver ici.
              </p>
            )}
          </section>
        </div>
        <div className="space-y-8">
          <ProfileForm profile={p.data} />
          <section className="panel space-y-4">
            <h2 className="font-serif text-2xl text-[#76545a]">
              Mon empreinte olfactive
            </h2>
            {q.data.length ? (
              q.data.map((result) => (
                <div className="text-sm border-t pt-3" key={result.id}>
                  <p className="capitalize">
                    Famille {result.primary_family} · Affinité vanille{" "}
                    {result.vanilla_affinity}%
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    {date(result.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">
                Un diagnostic en quelques questions pour trouver votre
                signature.
              </p>
            )}
            <Link className="secondary" href="/#quiz">
              Faire le diagnostic
            </Link>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
