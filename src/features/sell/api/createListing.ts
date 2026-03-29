import { supabase } from '@/lib/supabase';

export const createListing = async (payload: any, userId: string) => {
  const { data, error } = await supabase
    .from('listings')
    .insert([
      {
        title: payload.title,
        price_clp: Number(payload.price),
        description: payload.description,
        brand: payload.brand,
        size: payload.size,
        condition: payload.condition,
        category: payload.category,
        status: 'ACTIVE',
        seller_id: userId,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
};

export const uploadListingImages = async (
  images: string[],
  listingId: string
) => {
  for (let i = 0; i < images.length; i++) {
    const uri = images[i];

    const response = await fetch(uri);
    const blob = await response.blob();

    const path = `${listingId}/${Date.now()}-${i}.jpg`;

    await supabase.storage
      .from('listing-images')
      .upload(path, blob);

    const { data } = supabase.storage
      .from('listing-images')
      .getPublicUrl(path);

    await supabase.from('listing_photos').insert({
      listing_id: listingId,
      url: data.publicUrl,
      position: i,
    });
  }
};