export interface AdminProductForm {
  name: string;
  description: string;
  price: string;
  original_price: string;
  category: string;
  tags: string;
  zodiac_sign: string;
  in_stock: boolean;
  rating: string;
  featured: boolean;
}

export interface AdminProductRow {
  id: string;
  image: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  original_price: number | null;
  discount: number;
  in_stock: boolean;
  status: 'active' | 'low-stock' | 'out-of-stock';
  rating: number;
  created_at: string;
  featured: boolean;
  views: number;
  wishlistCount: number;
  orders: number;
  revenue: number;
  tags: string[];
}
