import { getCatalogue } from "@/lib/catalog-public";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BotanicalHome } from "@/components/home/BotanicalHome";
export const dynamic = "force-dynamic";
export default async function Home() {
  const perfumes = await getCatalogue();
  return (
    <>
      <Header />
      <main>
        <BotanicalHome perfumes={perfumes} />
      </main>
      <Footer />
    </>
  );
}
