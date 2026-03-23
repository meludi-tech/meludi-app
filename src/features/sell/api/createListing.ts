import { supabase } from '@/lib/supabase';
import { CreateListingPayload } from '../types';

export const createListing = async (
  payload: CreateListingPayload,
  userId: string
) => {
  const { data, error } = await supabase
    .from('listings')
    .insert({
      ...payload,
      seller_id: userId,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.log('createListing error', error);
    throw error;
  }

  return data;
};