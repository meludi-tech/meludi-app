import { supabase } from '@/lib/supabase';

export const toggleFavorite = async ({
  userId,
  listingId,
  isLiked,
}: {
  userId: string;
  listingId: string;
  isLiked: boolean;
}) => {
  if (isLiked) {
    const { error } = await supabase
      .from('listing_likes')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', listingId);

    if (error) throw error;
  } else {
    const { error } = await supabase.from('listing_likes').insert({
      user_id: userId,
      listing_id: listingId,
    });

    if (error) throw error;
  }
};