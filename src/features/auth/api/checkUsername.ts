import { supabase } from '@/lib/supabase';

export const checkUsername = async (username: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (error) throw error;

  return !data; // true = disponible
};