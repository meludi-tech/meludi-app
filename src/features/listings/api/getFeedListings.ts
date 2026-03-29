import { supabase } from '@/lib/supabase';
import { Listing } from '../types';

export const getFeedListings = async (): Promise<Listing[]> => {
  const { data, error } = await supabase
    .from('listings')
    .select(`
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
    `)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((item: any) => ({
    ...item,
    photos: item.listing_photos || [],
  }));
};