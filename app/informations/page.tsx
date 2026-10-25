import { PageShell } from "@/components/layout/PageShell";
export default function Information() {
  return (
    <PageShell>
      <div className="max-w-2xl space-y-8">
        <p className="eyebrow">Projet étudiant</p>
        <h1 className="title">Une maison imaginaire, un projet concret.</h1>
        <section className="space-y-3">
          <h2 className="font-serif text-2xl">La démonstration</h2>
          <p>
            SCENTIA est un prototype pédagogique. Aucune vente, aucun paiement
            bancaire ni expédition ne sont réalisés. Les parfums et leurs
            propriétés sont des créations illustratives.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Vos données</h2>
          <p>
            Les comptes sont gérés par Supabase Auth. Le site conserve le
            profil, le panier, les favoris, les diagnostics et les commandes de
            démonstration dans Supabase. Le panier visiteur est conservé dans le
            navigateur. Les mots de passe ne sont jamais stockés dans les tables
            applicatives.
          </p>
          <p>
            Utilisez uniquement des coordonnées de démonstration pour la
            livraison. Aucun numéro de carte bancaire n’est demandé. Pour une
            suppression de compte, contactez l’équipe du projet par le canal
            utilisé pour cette démonstration.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
