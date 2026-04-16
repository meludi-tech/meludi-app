import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export function useOrder(id?: string) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          listing:listings (
            title,
            price_clp,
            cover_photo_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.log('ORDER ERROR:', error);
        setOrder(null);
      } else {
        setOrder(data);
      }

      setLoading(false);
    };

    fetchOrder();
  }, [id]);

  return { order, loading };
}