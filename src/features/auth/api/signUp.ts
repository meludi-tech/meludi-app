import { supabase } from '@/lib/supabase';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  const user = data.user;

  if (!user) throw new Error('No user');

  // 🔥 CLAVE
  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    email: user.email,
    kyc_status: 'not_started',
  });

  if (profileError) throw profileError;

  return data;
}