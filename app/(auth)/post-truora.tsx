import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function PostTruoraScreen() {
  const router = useRouter();
  const setOnboardingStep = useAuthStore((s) => s.setOnboardingStep);

  const handleContinue = () => {
    setOnboardingStep('USERNAME');
    router.replace('/(auth)/username');
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: '#1F3A44',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 28 }}>✓</Text>
      </View>

      <Text style={{ fontSize: 22, fontWeight: '600', marginBottom: 12 }}>
        Identidad verificada
      </Text>

      <Text style={{ color: '#666', textAlign: 'center', marginBottom: 32 }}>
        Ya puedes operar con seguridad dentro de meludi.
      </Text>

      <Pressable
        onPress={handleContinue}
        style={{
          backgroundColor: '#1F3A44',
          padding: 16,
          borderRadius: 10,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>
          Continuar
        </Text>
      </Pressable>
    </View>
  );
}