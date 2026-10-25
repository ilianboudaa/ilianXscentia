import { getPerfume } from "@/lib/catalog";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PERFUMES_DATA } from "@/data/perfumes";
import { ProductClientDetails } from "./ProductClientDetails";
import { MapPin, Sparkles, ShieldCheck, Truck, Gift } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const perfume = await getPerfume(slug);
  if (!perfume) return { title: "Parfum introuvable | SCENTIA" };

  return {
    title: `${perfume.name} - Extrait de Parfum | SCENTIA Paris`,
    description: perfume.description,
    openGraph: {
      title: `${perfume.name} | SCENTIA Haute Parfumerie`,
      description: perfume.tagline,
      images: [{ url: perfume.image }],
    },
  };
}

export default async function PerfumePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const perfume = await getPerfume(slug);

  if (!perfume) {
    notFound();
  }

  // Related perfumes in same family
  const relatedPerfumes = PERFUMES_DATA.filter(
    (p) => p.family === perfume.family && p.id !== perfume.id,
  ).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f5]">
      <Header />

      <main className="flex-1 pb-24">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs text-[#8E827F]">
          <Link href="/" className="hover:text-[#76545a]">
            Accueil
          </Link>
          <span className="mx-2">/</span>
          <Link href="/#catalogue" className="hover:text-[#76545a]">
            Catalogue
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#76545a] font-medium">{perfume.name}</span>
        </div>

        {/* Product Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Visual Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="relative w-full aspect-square sm:aspect-[4/3] bg-gradient-to-b from-[#4b373b] to-[#593e44] rounded-sm overflow-hidden shadow-2xl border border-[#ba7d7a]/30 flex items-center justify-center p-8 sm:p-12">
                <div
                  className="absolute inset-0 opacity-40 blur-3xl pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${perfume.moodColor} 0%, transparent 70%)`,
                  }}
                />

                <div className="absolute top-6 left-6 z-10 flex items-center gap-2 px-3.5 py-1.5 bg-black/40 backdrop-blur-md border border-[#ba7d7a]/30 rounded-full text-xs text-[#fdf5f1]">
                  <MapPin size={13} className="text-[#ba7d7a]" />
                  <span>{perfume.destination}</span>
                </div>

                <div className="relative z-10 w-full max-w-sm h-full rounded shadow-2xl overflow-hidden border border-[#ba7d7a]/40">
                  <Image
                    src={perfume.image}
                    alt={perfume.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Guarantees row */}
              <div className="grid grid-cols-3 gap-4 text-center p-4 bg-[#F7F4EE] rounded border border-[#ba7d7a]/30 text-xs">
                <div className="flex flex-col items-center gap-1">
                  <Truck size={18} className="text-[#76545a]" />
                  <span className="font-semibold text-[#342e2c]">
                    Livraison Offerte
                  </span>
                  <span className="text-[10px] text-[#8E827F]">
                    Dès 150 € d’achat
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Gift size={18} className="text-[#76545a]" />
                  <span className="font-semibold text-[#342e2c]">
                    Un échantillon
                  </span>
                  <span className="text-[10px] text-[#8E827F]">
                    Offert avec la commande
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck size={18} className="text-[#76545a]" />
                  <span className="font-semibold text-[#342e2c]">
                    Collection botanique
                  </span>
                  <span className="text-[10px] text-[#8E827F]">
                    Création illustrative
                  </span>
                </div>
              </div>
            </div>

            {/* Client Interactive Column: Formats, Engraving, Add to cart */}
            <div className="lg:col-span-5">
              <ProductClientDetails perfume={perfume} />
            </div>
          </div>

          {/* Sensory Story & Pyramid Full Breakdown */}
          <div className="mt-24 pt-16 border-t border-[#ba7d7a]/30">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Narrative Story */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#9b626a]">
                  <Sparkles size={14} className="text-[#ba7d7a]" />
                  <span>Le Récit Olfactif</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#76545a]">
                  Voyage au Cœur de la Création
                </h3>
                <p className="text-sm text-[#342e2c]/85 leading-relaxed font-light">
                  {perfume.story}
                </p>
                <div className="p-4 bg-[#f5e7e3]/60 rounded border-l-2 border-[#76545a] text-xs italic text-[#76545a]">
                  « {perfume.tagline} »
                </div>
              </div>

              {/* Olfactory Pyramid Display */}
              <div className="space-y-4">
                <h4 className="font-serif text-xl text-[#76545a] mb-4">
                  Pyramide Olfactive Détaillée
                </h4>

                <div className="p-4 bg-white rounded border border-[#ba7d7a]/30 space-y-2">
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-[#76545a] block">
                    Notes de Tête
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {perfume.pyramid.top.map((note, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-3 py-1 bg-[#f5e7e3] text-[#342e2c] rounded-sm"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[#F7F4EE] rounded border border-[#ba7d7a]/40 space-y-2">
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-[#76545a] block">
                    Notes de Cœur (Corps du Parfum)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {perfume.pyramid.heart.map((note, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-3 py-1 bg-white text-[#76545a] font-medium rounded-sm border border-[#ba7d7a]/30"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[#4b373b] text-[#fdf5f1] rounded border border-[#ba7d7a]/30 space-y-2">
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-[#ba7d7a] block">
                    Notes de Fond (Sillage Longue Durée)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {perfume.pyramid.base.map((note, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-3 py-1 bg-white/10 text-[#fdf5f1] rounded-sm"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Perfumes */}
          {relatedPerfumes.length > 0 && (
            <div className="mt-24 pt-16 border-t border-[#ba7d7a]/30">
              <h3 className="font-serif text-2xl text-[#76545a] mb-8 text-center">
                Dans la Même Famille Olfactive
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedPerfumes.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/parfums/${rel.slug}`}
                    className="p-4 bg-white border border-[#ba7d7a]/30 rounded-sm hover:border-[#76545a] hover:shadow-md transition-all group"
                  >
                    <div className="relative w-full h-48 bg-[#F7F4EE] rounded overflow-hidden mb-3">
                      <Image
                        src={rel.image}
                        alt={rel.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-[#9b626a] font-semibold">
                      {rel.familyLabel}
                    </span>
                    <h4 className="font-serif text-base font-semibold text-[#342e2c] group-hover:text-[#76545a] transition-colors">
                      {rel.name}
                    </h4>
                    <span className="font-serif text-sm font-bold text-[#76545a] mt-2 block">
                      {rel.price} €
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Global Modals */}
    </div>
  );
}
