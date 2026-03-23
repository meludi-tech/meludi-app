import { supabase } from '@/lib/supabase';

export const getWallet = async (userId: string) => {
  const { data, error } = await supabase
    .from('wallet_ledger')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.log('wallet error', error);
    throw error;
  }

  return data;
};