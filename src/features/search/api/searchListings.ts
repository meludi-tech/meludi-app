import { supabase } from '@/lib/supabase';

type Params = {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
};

export const searchListings = async ({ query, minPrice, maxPrice }: Params) => {
  let req = supabase
    .from('listings')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // 🔍 texto
  if (query) {
    req = req.ilike('title', `%${query}%`);
  }

  // 💰 filtros precio
  if (minPrice) {
    req = req.gte('price_clp', minPrice);
  }

  if (maxPrice) {
    req = req.lte('price_clp', maxPrice);
  }

  const { data, error } = await req;

  if (error) {
    console.log('search error', error);
    throw error;
  }

  return data;
};