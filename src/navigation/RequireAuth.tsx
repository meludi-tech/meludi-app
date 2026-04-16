import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user, isBootstrapped } = useAuthStore();

  useEffect(() => {
    if (isBootstrapped && !user) {
      router.replace('/(auth)/login');
    }
  }, [isBootstrapped, user, router]);

  if (!isBootstrapped) return null;
  if (!user) return null;

  return <>{children}</>;
};