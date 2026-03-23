import { supabase } from '@/lib/supabase';

export const deleteListing = async (listingId: string) => {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId);

  if (error) {
    console.log('deleteListing error', error);
    throw error;
  }

  return true;
};