"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="max-w-xl mx-auto p-10 space-y-6">
      <h1 className="title">Un instant, s’il vous plaît.</h1>
      <p>
        La page n’a pas pu être chargée. Vérifiez votre connexion puis
        réessayez.
      </p>
      <button className="primary" onClick={reset}>
        Réessayer
      </button>
      <Link href="/" className="secondary ml-3">
        Accueil
      </Link>
    </main>
  );
}
