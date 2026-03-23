export type CreateListingPayload = {
  title: string;
  description: string;
  price_clp: number;
  brand?: string;
  size?: string;
  condition?: string;
  cover_photo_url?: string;
};