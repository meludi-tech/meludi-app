import { useState } from 'react';
import { searchListings } from '../api/searchListings';

export const useSearch = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (params: {
    query?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    try {
      setLoading(true);
      const data = await searchListings(params);
      setResults(data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    search,
  };
};