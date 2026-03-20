import { supabase } from '@/lib/supabase';

interface CreatePreferenceParams {
  listingId: string;
}

interface CreatePreferenceResponse {
  init_point?: string;
  sandbox_init_point?: string;
}

export const createPreference = async ({
  listingId,
}: CreatePreferenceParams): Promise<CreatePreferenceResponse> => {
  const { data, error } = await supabase.functions.invoke(
    'mp-create-preference',
    {
      body: {
        listingId,
      },
    }
  );

  if (error) {
    throw error;
  }

  return data as CreatePreferenceResponse;
};