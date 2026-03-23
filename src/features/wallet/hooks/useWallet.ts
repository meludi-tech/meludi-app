import { useAuthStore } from '@/stores/auth.store';
import { useEffect, useState } from 'react';
import { getWallet } from '../api/getWallet';

export const useWallet = () => {
  const { user } = useAuthStore();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [held, setHeld] = useState(0);
  const [available, setAvailable] = useState(0);

  const loadWallet = async () => {
    if (!user) return;

    setLoading(true);
    const data = await getWallet(user.id);

    setTransactions(data || []);

    // 🔥 calcular saldos
    let heldSum = 0;
    let availableSum = 0;

    data?.forEach((t: any) => {
      if (t.type === 'HELD') heldSum += Number(t.amount);
      if (t.type === 'AVAILABLE') availableSum += Number(t.amount);
    });

    setHeld(heldSum);
    setAvailable(availableSum);

    setLoading(false);
  };

  useEffect(() => {
    loadWallet();
  }, [user]);

  return {
    transactions,
    held,
    available,
    loading,
    reload: loadWallet,
  };
};