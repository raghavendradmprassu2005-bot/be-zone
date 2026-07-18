export interface Product {
  id: string;
  name: string;
  description: string;

  price: number;
  originalPrice?: number;

  category: Category;
  image: string;

  rating: number;
  reviewCount: number;

  tags: string[];

  zodiacSign?: string;   // existing camelCase
  zodiac_sign?: string;  // Supabase column

  stock?: number;        // actual stock quantity
  inStock: boolean;      // for old components

  featured?: boolean;
}

export type Category =
  | "beauty-care"
  | "hair-care"
  | "makeup"
  | "jewellery"
  | "grooming"
  | "kids-zone"
  | "education"
  | "makeup-rental"
  | "beauty-services";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export const CATEGORIES: {
  id: Category;
  name: string;
  icon: string;
  description: string;
  image?: string;
}[] = [
  {
    id: "beauty-care",
    name: "Beauty Care",
    icon: "🧴",
    description: "Skin care & beauty essentials",
    image: "beauty-care-category",
  },
  {
    id: "hair-care",
    name: "Hair Care",
    icon: "💇",
    description: "Hair oils, shampoos & treatments",
    image: "hair-care-category",
  },
  {
    id: "makeup",
    name: "Makeup",
    icon: "💄",
    description: "Lipsticks, foundations & cosmetics",
    image: "makeup-category",
  },
  {
    id: "jewellery",
    name: "Jewellery",
    icon: "💍",
    description: "Fashion jewellery & accessories",
    image: "jewellery-category",
  },
  {
    id: "grooming",
    name: "Grooming",
    icon: "🧔",
    description: "Men's grooming products",
    image: "grooming-category",
  },
  {
    id: "kids-zone",
    name: "Kids Zone",
    icon: "🧸",
    description: "Kids essentials & accessories",
    image: "kids-category",
  },
  {
    id: "education",
    name: "Education",
    icon: "📚",
    description: "Educational books & learning products",
    image: "education-category",
  },
  {
    id: "makeup-rental",
    name: "Makeup Rental",
    icon: "👑",
    description: "Professional makeup rental services",
    image: "makeup-rental-category",
  },
  {
    id: "beauty-services",
    name: "Beauty Services",
    icon: "✨",
    description: "Salon & beauty services",
    image: "beauty-services-category",
  },
];

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;
