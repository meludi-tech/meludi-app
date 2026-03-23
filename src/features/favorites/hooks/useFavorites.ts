import { useAuthStore } from '@/stores/auth.store';
import { toggleFavorite } from '../api/toggleFavorite';

export const useFavorites = () => {
  const { user } = useAuthStore();

  const handleToggleFavorite = async (listingId: string) => {
    if (!user) return;

    try {
      await toggleFavorite(listingId, user.id);
    } catch (e) {
      console.log('favorite error', e);
    }
  };

  return {
    handleToggleFavorite,
  };
};