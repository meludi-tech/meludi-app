import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

export const ProtectedAction = ({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);

  const handlePress = () => {
    if (!session) {
      router.push('/(auth)/login');
      return;
    }

    onPress();
  };

  return <Pressable onPress={handlePress}>{children}</Pressable>;
};