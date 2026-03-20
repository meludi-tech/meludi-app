export interface Listing {
  id: string;
  title: string;
  price_clp: number;
  condition: string;
  brand: string;
  size: string;
  created_at: string;
  photos: {
    url: string;
  }[];
}