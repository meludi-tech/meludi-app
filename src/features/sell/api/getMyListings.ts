import { supabase } from '@/lib/supabase';

export const getMyListings = async (userId: string) => {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.log('getMyListings error', error);
    throw error;
  }

  return data;
};