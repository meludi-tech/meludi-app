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
      cover_photo_url,
      created_at,
      listing_photos (
        image_url
      )
    `)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });

  if (error) {
    console.log('FEED ERROR:', error);
    throw error;
  }

  return (data || []).map((item: any) => ({
    ...item,
    photos: item.listing_photos || [],
  }));
};