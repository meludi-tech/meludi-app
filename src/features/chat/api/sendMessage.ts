import { supabase } from '@/lib/supabase';

export const sendMessage = async (
  threadId: string,
  senderId: string,
  text: string
) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      thread_id: threadId,
      sender_id: senderId,
      text,
    })
    .select()
    .single();

  if (error) {
    console.log('sendMessage error', error);
    throw error;
  }

  return data;
};