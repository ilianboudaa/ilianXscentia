import Link from "next/link";
export default function NotFound() {
  return (
    <main className="max-w-xl mx-auto px-6 py-24 space-y-6">
      <p className="eyebrow">Scentia · 404</p>
      <h1 className="title">Cette fragrance s’est envolée.</h1>
      <p>La page demandée n’existe pas ou ne vous est pas accessible.</p>
      <Link className="primary" href="/">
        Retour à la maison
      </Link>
    </main>
  );
}
