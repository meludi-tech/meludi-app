import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="favorites/index" />
        <Stack.Screen name="notifications/index" />
        <Stack.Screen name="product/[id]" />
      </Stack>
    </SafeAreaProvider>
  );
}