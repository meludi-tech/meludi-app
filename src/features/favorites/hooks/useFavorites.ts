import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { getFavorites } from '../api/getFavorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const data = await getFavorites(user.id);
    setFavorites(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return { favorites, loading, refetch: fetchFavorites };
};