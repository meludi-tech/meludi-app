import { signUp } from '@/features/auth/api/signUp';
import { useAuthStore } from '@/stores/auth.store';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1F3A44';

export default function SignupScreen() {
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Faltan datos', 'Completa email y contraseña.');
      return;
    }

    try {
      setLoading(true);

      // 🔥 signUp ahora crea auth + profile
      const data = await signUp(email.trim(), password);

      if (!data?.user) {
        throw new Error('No se pudo crear el usuario');
      }

      // 🔥 guardar en store
      setUser(data.user);

      // 🔥 esperar un pequeño delay para asegurar consistencia
      await new Promise((res) => setTimeout(res, 500));

      // 🔥 ir a KYC
      router.replace('/(auth)/pre-truora');

    } catch (error: any) {
      console.log('SIGNUP ERROR:', error);

      Alert.alert(
        'No pudimos crear tu cuenta',
        error?.message || 'Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    Alert.alert('Pendiente', 'Google lo conectamos después.');
  };

  const handleApple = () => {
    Alert.alert('Pendiente', 'Apple lo conectamos después.');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 18,
            paddingBottom: 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* BACK */}
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={{ marginBottom: 18 }}
          >
            <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
          </Pressable>

          {/* TITLE */}
          <Text
            style={{
              fontSize: 32,
              lineHeight: 38,
              fontWeight: '700',
              color: '#111827',
              marginBottom: 28,
            }}
          >
            Crear cuenta
          </Text>

          {/* EMAIL */}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#C7C7CC"
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              height: 58,
              borderRadius: 18,
              borderWidth: 1.5,
              borderColor: '#D1D5DB',
              paddingHorizontal: 18,
              fontSize: 17,
              color: '#111827',
              marginBottom: 14,
            }}
          />

          {/* PASSWORD */}
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            placeholderTextColor="#C7C7CC"
            secureTextEntry
            style={{
              height: 58,
              borderRadius: 18,
              borderWidth: 1.5,
              borderColor: '#D1D5DB',
              paddingHorizontal: 18,
              fontSize: 17,
              color: '#111827',
              marginBottom: 24,
            }}
          />

          {/* CTA */}
          <Pressable
            onPress={handleSignup}
            disabled={loading}
            style={{
              backgroundColor: PRIMARY,
              height: 58,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 17,
                fontWeight: '600',
              }}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Text>
          </Pressable>

          {/* GOOGLE */}
          <Pressable
            onPress={handleGoogle}
            style={{
              height: 58,
              borderRadius: 18,
              borderWidth: 1.5,
              borderColor: '#111827',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#111827', fontSize: 17 }}>
              Registrarse con Google
            </Text>
          </Pressable>

          {/* APPLE */}
          <Pressable
            onPress={handleApple}
            style={{
              height: 58,
              borderRadius: 18,
              borderWidth: 1.5,
              borderColor: '#111827',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 28,
            }}
          >
            <Text style={{ color: '#111827', fontSize: 17 }}>
              Registrarse con Apple
            </Text>
          </Pressable>

          {/* LOGIN */}
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 16,
                color: '#111827',
              }}
            >
              Ya tienes cuenta? Inicia sesión
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}