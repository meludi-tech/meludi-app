import { supabase } from '@/lib/supabase';

export const getFavorites = async (userId: string) => {
  const { data, error } = await supabase
    .from('listing_likes')
    .select(`
      listing:listing_id (
        id,
        title,
        price,
        brand,
        size,
        condition,
        created_at,
        listing_photos ( url )
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;

  return data.map((item: any) => ({
    ...item.listing,
    photos: item.listing.listing_photos || [],
  }));
};