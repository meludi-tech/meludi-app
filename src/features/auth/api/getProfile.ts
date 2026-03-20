import { supabase } from '@/lib/supabase';
import { Profile } from '../types';

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // no profile
    throw error;
  }

  return data;
};