import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const TRUORA_URL =
  'https://identity.truora.com/IDPd81908e2ae3bdf194ae9effeaaeb10f4';

export default function TruoraScreen() {
  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {loading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <ActivityIndicator size="large" color="#1F3A44" />
        </View>
      )}

      <WebView
        source={{ uri: TRUORA_URL }}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        onNavigationStateChange={(navState) => {
          if (navState.url.includes('kyc-complete')) {
            router.replace('/(auth)/post-truora');
          }
        }}
      />
    </SafeAreaView>
  );
}