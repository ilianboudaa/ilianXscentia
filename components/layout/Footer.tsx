import Link from "next/link";
import { ScentiaLogo } from "./ScentiaLogo";
export function Footer() {
  return (
    <footer className="botanical-footer">
      <div className="grid md:grid-cols-[2fr_1fr_1fr] gap-10">
        <div>
          <Link
            className="botanical-brand"
            href="/"
            aria-label="SCENTIA — La poésie du parfum, retour à l'accueil"
          >
            <ScentiaLogo
              className="botanical-brand-logo"
              aria-hidden="true"
              idPrefix="footer-"
            />
            <span className="botanical-brand-text">
              SCENTIA<small>LA POÉSIE DU PARFUM</small>
            </span>
          </Link>
          <p>
            Des parfums comme des jardins personnels. Une collection tendre,
            singulière et pleine de souvenirs.
          </p>
        </div>
        <div>
          <h2>La maison</h2>
          <Link href="/#catalogue">Nos parfums</Link>
          <Link href="/#manifeste">Notre histoire</Link>
          <Link href="/#quiz">Diagnostic olfactif</Link>
        </div>
        <div>
          <h2>Votre espace</h2>
          <Link href="/compte">Mon compte et commandes</Link>
          <Link href="/compte#favoris">Mes favoris</Link>
          <Link href="/admin">Administration</Link>
          <Link href="/informations">Informations et confidentialité</Link>
        </div>
      </div>
      <div className="botanical-footer-bottom">
        © 2026 SCENTIA · Projet pédagogique. Aucune vente, aucun paiement ni
        envoi réel. Les créations et leurs descriptions sont illustratives.
      </div>
    </footer>
  );
}
