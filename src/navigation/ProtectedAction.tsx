import { useAuthStore } from '@/stores/auth.store';
import { router } from 'expo-router';
import React from 'react';

type Props = {
  children: (onPress: () => void) => React.ReactNode;
  onPress: () => void;
  requireVerified?: boolean;
};

export const ProtectedAction = ({
  children,
  onPress,
  requireVerified = true,
}: Props) => {
  const { status } = useAuthStore();

  const handlePress = () => {
    // 🔥 1. Usuario no logueado
    if (status === 'ANONYMOUS') {
      router.push('/(auth)/signup');
      return;
    }

    // 🔥 2. Usuario verificado
    if (status === 'VERIFIED') {
      onPress();
      return;
    }

    // 🔥 3. Usuario en proceso
    if (status === 'PENDING') {
      router.push('/(auth)/post-truora');
      return;
    }

    // 🔥 4. Usuario no iniciado o rechazado
    if (status === 'REJECTED' || status === 'NOT_STARTED') {
      router.push('/verify');
      return;
    }

    // 🔥 fallback (por si algo raro pasa)
    if (requireVerified) {
      router.push('/verify');
      return;
    }

    onPress();
  };

  return <>{children(handlePress)}</>;
};