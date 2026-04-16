import { supabase } from '@/lib/supabase';

export async function createTruoraLink(userId: string) {
  console.log('SENDING USER ID:', userId);

  const { data, error } = await supabase.functions.invoke(
    'create-truora-token',
    {
      body: {
        user_id: userId,
      },
    }
  );

  if (error) {
    throw error;
  }

  if (!data?.api_key) {
    throw new Error('No api_key returned');
  }

  return `https://identity.truora.com/?token=${data.api_key}`;
}