import { supabase } from '@/lib/supabase';
import { CreateListingPayload } from '../types';

export const updateListing = async (
  listingId: string,
  payload: Partial<CreateListingPayload>
) => {
  const { data, error } = await supabase
    .from('listings')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .select()
    .single();

  if (error) {
    console.log('updateListing error', error);
    throw error;
  }

  return data;
};