import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/playfair-display/latin-400.css";
import "@fontsource/playfair-display/latin-400-italic.css";
import { GlobalOverlays } from "@/components/layout/GlobalOverlays";
import type { Metadata } from "next";

import "./globals.css";
import "@/components/home/botanique.css";
import { AppProvider } from "@/components/providers/AppProvider";

export const metadata: Metadata = {
  title: "SCENTIA | Haute Parfumerie & Parfums Rares",
  description:
    "Maison de haute parfumerie française. Découvrez nos créations olfactives exclusives et nos vanilles d'exception. La poésie du parfum.",
  keywords: [
    "parfum de niche",
    "haute parfumerie",
    "vanille étoilée",
    "scentia",
    "parfum luxe",
  ],
  openGraph: {
    title: "SCENTIA | La poésie du parfum",
    description:
      "Maison de haute parfumerie française et créations vanillées d'exception.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#fcf9f5] text-[#342e2c] selection:bg-[#e9ddd7] selection:text-[#76545a]">
        <AppProvider>
          {children}
          <GlobalOverlays />
        </AppProvider>
      </body>
    </html>
  );
}
