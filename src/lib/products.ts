import { Product, Review } from './types';

export const products: Product[] = [];

export const productReviews: Record<string, Review[]> = {
  '1': [
    { id: 'r1', author: 'deepika.', rating: 5, comment: 'Absolutely gorgeous collections.', date: '2026-02-15' },
    { id: 'r2', author: 'Orion K.', rating: 5, comment: 'Deep purple color, beautiful natural formations. Even better in person than the photos.', date: '2024-01-28' },
    { id: 'r3', author: 'Stella R.', rating: 4, comment: 'Beautiful piece, slightly smaller than expected but the quality is top-notch.', date: '2024-01-10' },
  ],
  '6': [
    { id: 'r4', author: 'Sage W.', rating: 5, comment: 'The sound from this bowl is absolutely divine. Pure, clear tones that resonate deeply. Life-changing purchase.', date: '2024-03-01' },
    { id: 'r5', author: 'Aria N.', rating: 5, comment: 'Handcrafted perfection. Use it daily for my morning meditation practice.', date: '2024-02-20' },
  ],
};

export interface FestiveOffer {
  title: string;
  banner: string;
  productIds: string[];
  discount?: string;
  startDate?: string;
  endDate?: string;
}

export const festiveOffers: FestiveOffer[] = [
  {
    title: "Raksha Bandhan Special",
    banner: "/festivals/raksha-bandhan.jpg",
    discount: "Up to 30% OFF",
    productIds: ["1", "2", "5", "8"],
  },
  {
    title: "Ganesh Chaturthi Offers",
    banner: "/festivals/ganesh.jpg",
    discount: "Flat 20% OFF",
    productIds: ["3", "4", "6"],
  },
  {
    title: "Navratri Beauty Sale",
    banner: "/festivals/navratri.jpg",
    discount: "Buy 2 Get 1",
    productIds: ["7", "9", "10"],
  },
  {
    title: "Diwali Mega Sale",
    banner: "/festivals/diwali.jpg",
    discount: "Up to 60% OFF",
    productIds: ["1", "3", "5", "7", "11"],
  },
  {
    title: "Christmas Special",
    banner: "/festivals/christmas.jpg",
    discount: "Flat 25% OFF",
    productIds: ["2", "4", "8", "12"],
  },
  {
    title: "New Year Sale",
    banner: "/festivals/newyear.jpg",
    discount: "Up to 50% OFF",
    productIds: ["1", "2", "3", "4", "5"],
  },
];
