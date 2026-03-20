import { supabase } from '@/lib/supabase';
import { Listing } from '../types';

interface ListingRow {
  id: string;
  title: string;
  price_clp: number;
  condition: string;
  brand: string;
  size: string;
  created_at: string;
  listing_photos?: { url: string }[];
}

export const getListingById = async (id: string): Promise<Listing> => {
  const { data, error } = await supabase
    .from('listings')
    .select(
      `
      id,
      title,
      price_clp,
      condition,
      brand,
      size,
      created_at,
      listing_photos (
        url
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  const row = data as ListingRow;

  return {
    id: row.id,
    title: row.title,
    price_clp: row.price_clp,
    condition: row.condition,
    brand: row.brand,
    size: row.size,
    created_at: row.created_at,
    photos: row.listing_photos ?? [],
  };
};