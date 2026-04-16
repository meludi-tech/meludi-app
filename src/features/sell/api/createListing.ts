import { supabase } from '@/lib/supabase';
import * as ImageManipulator from 'expo-image-manipulator';

const LISTING_IMAGES_BUCKET = 'listing-photos';

type CreateListingInput = {
  title: string;
  description?: string;
  price: string;

  category?: string;
  subcategory?: string;

  brand_id: string | null;
  brand_name?: string;

  size?: string;
  condition?: string;
  color?: string[];

  package_size?: 'S' | 'M' | 'L'; // ✅ NUEVO
};

export async function createListing(
  input: CreateListingInput,
  userId: string
) {
  const payload = {
    seller_id: userId,

    title: input.title.trim(),
    description: input.description?.trim() || null,

    price_clp: Number(input.price),

    category_id: null,
    subcategory_id: null,

    brand_id: input.brand_id,
    brand: input.brand_name || null,

    size: input.size || null,
    condition: input.condition || null,

    color: input.color?.length ? input.color.join(', ') : null,
    package_size: input.package_size || null, // ✅ NUEVO

    status: 'ACTIVE',
    moderation_status: 'APPROVED',
    is_active: true,
  };

  console.log('PAYLOAD QUE SE ENVÍA:', payload);

  const { data, error } = await supabase
    .from('listings')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.log('CREATE LISTING ERROR:', error);
    throw error;
  }

  return data;
}

export async function uploadListingImages(
  imageUris: string[],
  listingId: string
) {
  if (!imageUris.length) return [];

  const uploadedUrls: string[] = [];

  for (let i = 0; i < imageUris.length; i++) {
    const uri = imageUris[i];

    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [],
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    const response = await fetch(manipulated.uri);

    if (!response.ok) {
      throw new Error('Error leyendo imagen');
    }

    const arrayBuffer = await response.arrayBuffer();

    const path = `${listingId}/${Date.now()}-${i}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from(LISTING_IMAGES_BUCKET)
      .upload(path, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.log('UPLOAD IMAGE ERROR:', uploadError);
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from(LISTING_IMAGES_BUCKET)
      .getPublicUrl(path);

    const imageUrl = publicUrlData.publicUrl;
    uploadedUrls.push(imageUrl);

    const { error: photoError } = await supabase
      .from('listing_photos')
      .insert({
        listing_id: listingId,
        image_url: imageUrl,
        url: imageUrl,
        position: i,
      });

    if (photoError) {
      console.log('LISTING PHOTO INSERT ERROR:', photoError);
      throw photoError;
    }
  }

  const firstImage = uploadedUrls[0];

  if (firstImage) {
    const { error: coverError } = await supabase
      .from('listings')
      .update({
        cover_photo_url: firstImage,
        photo_count: uploadedUrls.length,
      })
      .eq('id', listingId);

    if (coverError) {
      console.log('COVER UPDATE ERROR:', coverError);
      throw coverError;
    }
  }

  return uploadedUrls;
}