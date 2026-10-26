"use client";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import type { Perfume } from "@/types";
import { useApp } from "@/components/providers/AppProvider";
import { OLFACTORY_FAMILIES, PERFUMES_DATA } from "@/data/perfumes";
import { money } from "@/lib/format";
import { Bottle, Flower } from "./Bottle";
import { BotanicalQuiz } from "./BotanicalQuiz";
import { ScrollToTop } from "./ScrollToTop";
export function BotanicalHome({ perfumes }: { perfumes: Perfume[] }) {
  const [family, setFamily] = useState("all"),
    [search, setSearch] = useState(""),
    [sort, setSort] = useState("selection"),
    [favoriteOnly, setFavoriteOnly] = useState(false);
  const { addToCart, toggleFavorite, isFavorite, setQuickViewPerfume } =
    useApp();
  const shown = useMemo(() => {
    const q = search.toLocaleLowerCase("fr");
    const rows = perfumes.filter(
      (p) =>
        (family === "all" || p.family === family) &&
        (!favoriteOnly || isFavorite(p.id)) &&
        `${p.name} ${p.description} ${p.familyLabel}`
          .toLocaleLowerCase("fr")
          .includes(q),
    );
    if (sort === "asc") rows.sort((a, b) => a.price - b.price);
    if (sort === "desc") rows.sort((a, b) => b.price - a.price);
    return rows;
  }, [perfumes, family, search, sort, favoriteOnly, isFavorite]);
  const first =
    perfumes.find((p) => p.name === "Vanille Étoilée") || perfumes[0];
  const rose = perfumes.find((p) => p.name === "Vanille Rosée") || first;
  return (
    <div className="scentia-home">
      <section className="hero" id="accueil">
        <div className="heroText">
          <div className="eyebrow">Collection botanique · Édition 2026</div>
          <h1>
            La poésie
            <br />
            du <em>parfum.</em>
          </h1>
          <p>
            Des fragrances qui racontent une histoire. La douceur de la vanille,
            l’éclat des fleurs, la chaleur d’un souvenir. Trouvez celle qui vous
            ressemble.
          </p>
          <div className="heroButtons">
            <a className="btn" href="#catalogue">
              Découvrir la collection <ArrowRight size={14} />
            </a>
            <a className="btn secondary" href="#quiz">
              Trouver mon parfum
            </a>
          </div>
        </div>
        <div className="heroArt">
          <div className="flower one">
            <Flower />
          </div>
          <div className="flower two">
            <Flower />
          </div>
          {first && (
            <div className="heroBottle">
              <Bottle perfume={first} />
            </div>
          )}
          <div className="heroNote">Laissez une empreinte.</div>
        </div>
      </section>
      <div className="benefits">
        <div className="benefit">
          <span>✿</span>Créations olfactives singulières
        </div>
        <div className="benefit">
          <span>♡</span>Une attention dans chaque colis
        </div>
        <div className="benefit">
          <span>◇</span>Livraison offerte dès 150 €
        </div>
      </div>
      <section className="section" id="catalogue">
        <div className="sectionHead">
          <div className="eyebrow">Le jardin des senteurs</div>
          <h2>Notre collection</h2>
          <p>
            Vingt compositions gourmandes, florales et boisées pour chaque
            personnalité.
          </p>
        </div>
        <div className="toolbar">
          <div className="chips">
            {OLFACTORY_FAMILIES.map((f) => (
              <button
                key={f.id}
                aria-pressed={family === f.id}
                className={`chip ${family === f.id ? "active" : ""}`}
                onClick={() => setFamily(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            className="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un parfum…"
            aria-label="Rechercher dans la collection"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 text-xs">
          <p aria-live="polite">
            {shown.length} création{shown.length > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-4">
            <button
              className="underline"
              aria-pressed={favoriteOnly}
              onClick={() => setFavoriteOnly(!favoriteOnly)}
            >
              {favoriteOnly
                ? "Voir toute la collection"
                : "Mes favoris uniquement"}
            </button>
            <label>
              Trier :{" "}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-[#e9ddd7] py-2 px-3 bg-white"
              >
                <option value="selection">La collection</option>
                <option value="asc">Prix croissant</option>
                <option value="desc">Prix décroissant</option>
              </select>
            </label>
          </div>
        </div>
        <div className="products">
          {shown.map((p) => {
            const art = PERFUMES_DATA.find((a) => a.id === p.id);
            return (
              <article className="product" key={p.id}>
                <div
                  className="visual"
                  style={
                    {
                      "--bg": art?.bottleBackground || "#f3e5e0",
                    } as CSSProperties
                  }
                >
                  {art?.badge && <span className="tag">{art.badge}</span>}
                  <button
                    className="visual-link"
                    aria-label={`Découvrir le voyage olfactif ${p.name}`}
                    onClick={() => setQuickViewPerfume(p)}
                  >
                    <Bottle perfume={p} />
                  </button>
                  <button
                    className={`wish ${isFavorite(p.id) ? "active" : ""}`}
                    aria-label={`Favori ${p.name}`}
                    aria-pressed={isFavorite(p.id)}
                    onClick={() => toggleFavorite(p.id)}
                  >
                    <Heart
                      size={17}
                      fill={isFavorite(p.id) ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <div className="productMeta">
                  <span className="family">
                    {p.familyLabel} · Eau de parfum 50 ml
                  </span>
                  <h3>
                    <Link href={`/parfums/${p.slug}`}>{p.name}</Link>
                  </h3>
                  <p>{p.description}</p>
                  <div className="productBottom">
                    <strong>{money(p.price)}</strong>
                    <button
                      className="add"
                      onClick={() => addToCart(p, "50ml")}
                      disabled={p.variants[0]?.stock === 0}
                    >
                      {p.variants[0]?.stock === 0
                        ? "ÉPUISÉ"
                        : "AJOUTER AU PANIER +"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          {shown.length === 0 && (
            <div className="empty-state">
              <p>Aucun parfum ne correspond à votre sélection.</p>
              <button
                className="btn secondary mt-5"
                onClick={() => {
                  setFamily("all");
                  setSearch("");
                  setFavoriteOnly(false);
                }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </section>
      <section className="story" id="manifeste">
        <div className="storyArt">{rose && <Bottle perfume={rose} />}</div>
        <div className="storyText">
          <div className="eyebrow">L’esprit de la maison</div>
          <h2>Un parfum est un souvenir qui fleurit.</h2>
          <p>
            Chez SCENTIA, nous imaginons chaque fragrance comme un petit jardin
            personnel. Des accords vanillés enveloppants, des fleurs délicates
            et des bois précieux composent une collection à la fois tendre et
            affirmée.
          </p>
          <a className="btn secondary" href="#quiz">
            Découvrir mon univers →
          </a>
        </div>
      </section>
      <BotanicalQuiz perfumes={perfumes} />
      <ScrollToTop />
    </div>
  );
}
