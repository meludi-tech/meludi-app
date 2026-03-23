import { supabase } from '@/lib/supabase';

export const getMessages = async (threadId: string) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (error) {
    console.log('getMessages error', error);
    throw error;
  }

  return data;
};