import { supabase } from '@/lib/supabase';

export const toggleFavorite = async (listingId: string, userId: string) => {
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('listing_id', listingId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('favorites')
      .delete()
      .eq('listing_id', listingId)
      .eq('user_id', userId);

    return false;
  }

  await supabase.from('favorites').insert({
    listing_id: listingId,
    user_id: userId,
  });

  return true;
};