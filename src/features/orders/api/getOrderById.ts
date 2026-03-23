import { supabase } from '@/lib/supabase';
import { Order } from '../types';

export const getOrderById = async (
  orderId: string
): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      buyer_id,
      seller_id,
      listing_id,
      status,
      delivery_type,
      created_at,
      tracking_number,
      label_url,
      listing:listings (
        id,
        title,
        cover_photo_url,
        price_clp,
        brand,
        size,
        condition
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    console.log('getOrderById error:', error);
    return null;
  }

  return data as unknown as Order;
};