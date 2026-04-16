import { useAuthBootstrap } from '@/features/auth/hooks/useAuthBootstrap';
import { Redirect } from 'expo-router';

export default function EntryScreen() {
  useAuthBootstrap();

  return <Redirect href="/(tabs)/home" />;
}