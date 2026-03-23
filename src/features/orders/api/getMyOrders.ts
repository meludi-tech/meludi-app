import { supabase } from '@/lib/supabase';

export const getMyOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      delivery_type,
      created_at,
      listing:listings (
        id,
        title,
        cover_photo_url,
        price_clp
      )
    `)
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.log('getMyOrders error', error);
    throw error;
  }

  return data;
};