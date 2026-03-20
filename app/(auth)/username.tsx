import { checkUsername } from '@/features/auth/api/checkUsername';
import { updateUsername } from '@/features/auth/api/updateUsername';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function UsernameScreen() {
  const router = useRouter();

  const { user, setOnboardingStep } = useAuthStore();

  const [username, setUsername] = useState('');
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (value: string) => {
    setUsername(value);

    if (value.length < 3) {
      setAvailable(null);
      return;
    }

    try {
      setChecking(true);
      const isAvailable = await checkUsername(value);
      setAvailable(isAvailable);
    } catch {
      setAvailable(false);
    } finally {
      setChecking(false);
    }
  };

  const handleContinue = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const finalUsername =
        username.length >= 3
          ? username
          : `user_${Math.floor(Math.random() * 100000)}`;

      await updateUsername(user.id, finalUsername);

      setOnboardingStep('COMPLETE');

      router.replace('/');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 16 }}>
        ¿Cómo quieres aparecer en meludi?
      </Text>

      <TextInput
        placeholder="Tu username"
        value={username}
        onChangeText={handleCheck}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 10,
          padding: 14,
          marginBottom: 12,
        }}
      />

      {checking && <ActivityIndicator />}

      {available === true && (
        <Text style={{ color: 'green' }}>Disponible</Text>
      )}

      {available === false && (
        <Text style={{ color: 'red' }}>No disponible</Text>
      )}

      <Pressable
        onPress={handleContinue}
        disabled={loading}
        style={{
          backgroundColor: '#1F3A44',
          padding: 16,
          borderRadius: 10,
          alignItems: 'center',
          marginTop: 24,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            Continuar
          </Text>
        )}
      </Pressable>

      <Pressable
        onPress={handleContinue}
        style={{ marginTop: 16 }}
      >
        <Text style={{ textAlign: 'center', color: '#888' }}>
          Completar después
        </Text>
      </Pressable>
    </View>
  );
}