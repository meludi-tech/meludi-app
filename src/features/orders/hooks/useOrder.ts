import { useEffect, useState } from 'react';
import { getOrderById } from '../api/getOrderById';
import { Order } from '../types';

export const useOrder = (orderId?: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    if (!orderId) return;

    setLoading(true);
    const data = await getOrderById(orderId);
    setOrder(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  return {
    order,
    loading,
  };
};