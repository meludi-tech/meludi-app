import { useAuthStore } from '@/stores/auth.store';
import { router } from 'expo-router';
import { Alert } from 'react-native';

type Props = {
  children: (onPress: () => void) => React.ReactNode;
  onPress: () => void;
};

export const ProtectedAction = ({ children, onPress }: Props) => {
  const { status } = useAuthStore();

  const handlePress = () => {
    // ✅ usuario verificado → pasa
    if (status === 'verified') {
      onPress();
      return;
    }

    // 🔓 usuario no logueado → signup
    if (status === 'anonymous') {
      router.push('/(auth)/signup');
      return;
    }

    // ⚠️ logueado pero no verificado
    Alert.alert(
      'Verifica tu identidad',
      'Necesitas verificar tu identidad para realizar esta acción.',
      [
        {
          text: 'Verificar',
          onPress: () => {
            router.push('/(auth)/pre-truora'); // luego lo conectamos real
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  return <>{children(handlePress)}</>;
};