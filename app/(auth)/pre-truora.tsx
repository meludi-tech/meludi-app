import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function PreTruoraScreen() {
  const router = useRouter();
  const setOnboardingStep = useAuthStore((s) => s.setOnboardingStep);

  const handleContinue = () => {
    // 🔴 simulamos Truora por ahora
    setOnboardingStep('POST_TRUORA');
    router.replace('/(auth)/post-truora');
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: '#fff',
      }}
    >
      <Text style={{ fontSize: 26, fontWeight: '600', marginBottom: 16 }}>
        Verificar identidad
      </Text>

      <Text style={{ color: '#666', marginBottom: 32 }}>
        Para vender y comprar con seguridad, necesitamos verificar tu identidad.
      </Text>

      <Pressable
        onPress={handleContinue}
        style={{
          backgroundColor: '#1F3A44',
          padding: 16,
          borderRadius: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>
          Continuar verificación
        </Text>
      </Pressable>
    </View>
  );
}