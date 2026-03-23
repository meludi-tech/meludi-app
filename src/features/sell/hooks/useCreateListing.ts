import { useAuthStore } from '@/stores/auth.store';
import { createListing } from '../api/createListing';
import { CreateListingPayload } from '../types';

export const useCreateListing = () => {
  const { user } = useAuthStore();

  const handleCreateListing = async (payload: CreateListingPayload) => {
    if (!user) throw new Error('No user');

    return await createListing(payload, user.id);
  };

  return {
    handleCreateListing,
  };
};