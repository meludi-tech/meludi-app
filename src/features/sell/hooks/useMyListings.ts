import { useAuthStore } from '@/stores/auth.store';
import { useEffect, useState } from 'react';
import { getMyListings } from '../api/getMyListings';

export const useMyListings = () => {
  const { user } = useAuthStore();

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadListings = async () => {
    if (!user) return;

    setLoading(true);
    const data = await getMyListings(user.id);
    setListings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadListings();
  }, [user]);

  return {
    listings,
    loading,
    reload: loadListings,
  };
};