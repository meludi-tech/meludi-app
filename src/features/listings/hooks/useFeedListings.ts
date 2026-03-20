import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export type Listing = {
  id: string;
  title: string;
  price: number;
  brand: string | null;
  size: string | null;
  condition: string | null;
  created_at: string;
  photos: { url: string }[];
};

export const useFeedListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('listings')
      .select(`
        id,
        title,
        price,
        brand,
        size,
        condition,
        created_at,
        listing_photos ( url )
      `)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const mapped = data.map((item: any) => ({
      ...item,
      photos: item.listing_photos || [],
    }));

    setListings(mapped);
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return { listings, loading, refetch: fetchListings };
};