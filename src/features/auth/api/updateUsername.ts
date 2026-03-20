import { supabase } from '@/lib/supabase';

export const updateUsername = async (userId: string, username: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({ username })
    .eq('id', userId);

  if (error) throw error;
};