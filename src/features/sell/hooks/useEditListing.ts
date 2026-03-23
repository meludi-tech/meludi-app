import { deleteListing } from '../api/deleteListing';
import { updateListing } from '../api/updateListing';

export const useEditListing = () => {
  const handleUpdate = async (id: string, payload: any) => {
    return await updateListing(id, payload);
  };

  const handleDelete = async (id: string) => {
    return await deleteListing(id);
  };

  return {
    handleUpdate,
    handleDelete,
  };
};