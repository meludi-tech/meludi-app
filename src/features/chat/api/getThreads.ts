import { supabase } from '@/lib/supabase';

export const getThreads = async (userId: string) => {
  const { data, error } = await supabase
    .from('chat_threads')
    .select('*')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.log('getThreads error', error);
    throw error;
  }

  return data;
};