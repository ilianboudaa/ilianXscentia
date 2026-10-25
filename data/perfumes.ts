import type { Perfume } from "@/types";
import catalog from "./catalog.json";
export const PERFUMES_DATA = catalog as Perfume[];
export const OLFACTORY_FAMILIES = [
  { id: "all", label: "Tous les parfums" },
  { id: "gourmande", label: "Vanillés & gourmands" },
  { id: "florale", label: "Floral" },
  { id: "fraiche", label: "Frais" },
  { id: "boisee", label: "Boisé" },
  { id: "fruite", label: "Fruité" },
] as const;
