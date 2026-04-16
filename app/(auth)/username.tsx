import { checkUsername } from '@/features/auth/api/checkUsername';
import { updateUsername } from '@/features/auth/api/updateUsername';
import { useAuthStore } from '@/stores/auth.store';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1F3A44';
const TEXT = '#111827';
const MUTED = '#6B7280';

export default function UsernameScreen() {
  const { user } = useAuthStore();

  const [username, setUsername] = useState('');
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (value: string) => {
    const cleanValue = value.trim().toLowerCase();
    setUsername(value);

    if (cleanValue.length < 3) {
      setAvailable(null);
      return;
    }

    try {
      setChecking(true);
      const isAvailable = await checkUsername(cleanValue);
      setAvailable(isAvailable);
    } catch {
      setAvailable(false);
    } finally {
      setChecking(false);
    }
  };

  const handleContinue = async () => {
    if (!user) {
      Alert.alert('Error', 'No encontramos tu usuario. Vuelve a iniciar sesión.');
      return;
    }

    try {
      setLoading(true);

      let finalUsername = username.trim().toLowerCase();

      if (finalUsername.length >= 3) {
        const isAvailable = await checkUsername(finalUsername);

        if (!isAvailable) {
          Alert.alert('Username no disponible', 'Prueba con otro nombre.');
          setLoading(false);
          return;
        }
      } else {
        finalUsername = `user_${Math.floor(Math.random() * 100000)}`;
      }

      await updateUsername(user.id, finalUsername);

      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert(
        'No pudimos guardar tu username',
        error?.message || 'Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 32,
              lineHeight: 38,
              fontWeight: '700',
              color: TEXT,
              marginBottom: 12,
            }}
          >
            Elige tu username
          </Text>

          <Text
            style={{
              fontSize: 16,
              lineHeight: 24,
              color: MUTED,
              marginBottom: 24,
            }}
          >
            Así aparecerás dentro de meludi.
          </Text>

          <TextInput
            value={username}
            onChangeText={handleCheck}
            placeholder="Tu username"
            placeholderTextColor="#C7C7CC"
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              height: 58,
              borderRadius: 18,
              borderWidth: 1.5,
              borderColor: '#D1D5DB',
              paddingHorizontal: 18,
              fontSize: 17,
              color: TEXT,
              marginBottom: 12,
            }}
          />

          {checking && (
            <ActivityIndicator style={{ marginBottom: 10 }} color={PRIMARY} />
          )}

          {available === true && (
            <Text style={{ color: '#15803D', marginBottom: 14 }}>Disponible</Text>
          )}

          {available === false && username.trim().length >= 3 && (
            <Text style={{ color: '#DC2626', marginBottom: 14 }}>No disponible</Text>
          )}

          <Pressable
            onPress={handleContinue}
            disabled={loading}
            style={{
              backgroundColor: PRIMARY,
              height: 58,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 10,
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600' }}>
              {loading ? 'Guardando...' : 'Continuar'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleContinue}
            style={{
              height: 58,
              borderRadius: 18,
              borderWidth: 1.5,
              borderColor: '#111827',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 12,
            }}
          >
            <Text style={{ color: '#111827', fontSize: 17, fontWeight: '500' }}>
              Completar después
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}