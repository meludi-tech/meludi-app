import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);

  useEffect(() => {
    if (!session) {
      router.replace('/(auth)/login');
    }
  }, [session]);

  if (!session) return null;

  return <>{children}</>;
};