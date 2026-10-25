import { Header } from "./Header";
import { Footer } from "./Footer";
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto w-full px-5 sm:px-8 py-12 min-h-[65vh]">
        {children}
      </main>
      <Footer />
    </>
  );
}
