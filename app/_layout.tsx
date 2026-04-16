import { Stack } from 'expo-router';
import { PostHogProvider } from 'posthog-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
;

const posthogConfig = {
  apiKey: 'phc_nTafc00LqvpzesEYwhMv6uXU9QKIaKR7f2AZGmz8Nbd',
  options: {
    host: 'https://us.i.posthog.com',
  },
};

export default function RootLayout() {
  return (
    <PostHogProvider apiKey={posthogConfig.apiKey} options={posthogConfig.options}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="favorites/index" />
          <Stack.Screen name="notifications/index" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="verify" />
        </Stack>
      </SafeAreaProvider>
    </PostHogProvider>
  );
}