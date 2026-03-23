import { useAuthStore } from '@/stores/auth.store';
import { useEffect, useState } from 'react';
import { getMyOrders } from '../api/getMyOrders';

export const useMyOrders = () => {
  const { user } = useAuthStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    if (!user) return;

    setLoading(true);
    const data = await getMyOrders(user.id);
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  return {
    orders,
    loading,
    reload: loadOrders,
  };
};