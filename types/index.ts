export type OlfactoryFamily =
  | "vanille"
  | "florale"
  | "boisee"
  | "ambree"
  | "fraiche"
  | "gourmande"
  | "fruite";

export interface OlfactoryPyramid {
  top: string[]; // Notes de tête
  heart: string[]; // Notes de cœur
  base: string[]; // Notes de fond
}

export interface ScentProfile {
  intensity: number; // 1 to 5
  sillage: number; // 1 to 5
  longevity: string; // e.g. "8-12 heures"
  season: string; // e.g. "Automne - Hiver"
  occasion: string; // e.g. "Soirée & Cérémonie"
}

export interface ProductVariant {
  size: "30ml" | "50ml" | "100ml";
  price: number;
  stock: number;
  sku: string;
}

export interface Perfume {
  id: string;
  bottleBackground?: string;
  badge?: string;
  slug: string;
  name: string;
  subtitle: string;
  tagline: string;
  family: OlfactoryFamily;
  familyLabel: string;
  description: string;
  story: string;
  destination: string; // The inspiration journey
  price: number; // Base price for 50ml
  volume: string;
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
  isNew?: boolean;
  isVanillaCollection?: boolean;
  image: string;
  moodColor: string; // Hex for ambient glow
  pyramid: OlfactoryPyramid;
  profile: ScentProfile;
  variants: ProductVariant[];
  ingredients: string[];
}

export interface CartItem {
  id: string; // unique item id: `${perfumeId}-${size}`
  perfumeId: string;
  name: string;
  slug: string;
  family: OlfactoryFamily;
  image: string;
  size: "30ml" | "50ml" | "100ml";
  price: number;
  quantity: number;
  engraving?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: "customer" | "admin";
  createdAt: string;
  phone?: string;
  shippingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface OrderItem {
  id: string;
  perfumeId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  engraving?: string;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status:
    "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "unpaid" | "refunded";
  stripeSessionId?: string;
  createdAt: string;
}

export interface QuizAnswer {
  label: string;
  description: string;
  preferredFamilies: OlfactoryFamily[];
  vanillaScore: number;
  icon?: string;
}

export interface QuizQuestion {
  id: number;
  title: string;
  subtitle: string;
  options: QuizAnswer[];
}

export interface QuizResult {
  topPerfumes: Perfume[];
  primaryFamily: OlfactoryFamily;
  vanillaAffinity: number; // Percentage
  recommendedAt: string;
}

export interface Review {
  id: string;
  perfumeId: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}
