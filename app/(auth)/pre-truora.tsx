import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PreTruora() {
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (loading) return;

    try {
      setLoading(true);

      // 1. obtener usuario
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        Alert.alert('Error', 'No encontramos tu sesión.');
        return;
      }

      const userId = user.id;

      // 🔥 CLAVE: guardar truora_account_id antes de iniciar proceso
      await supabase
        .from('profiles')
        .update({
          truora_account_id: userId,
          kyc_status: 'pending',
        })
        .eq('id', userId);

      // 2. obtener token de sesión
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      if (!accessToken) {
        throw new Error('No session token');
      }

      // 3. llamar a función edge
      const res = await fetch(
        'https://ijczgrdkvvfmqsddwmle.functions.supabase.co/create-truora-token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            user_id: userId,
          }),
        }
      );

      const data = await res.json();

      if (!data?.api_key) {
        throw new Error('No se recibió token');
      }

      // 4. abrir Truora
      const url = `https://identity.truora.com/?token=${data.api_key}`;
      await Linking.openURL(url);

      // 5. pantalla de espera
      router.push('/post-truora');

    } catch (e) {
      console.log('TRUORA ERROR:', e);
      Alert.alert('Error', 'No pudimos iniciar la verificación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verificar identidad</Text>

        <Text style={styles.subtitle}>
          Para vender y comprar con seguridad necesitamos verificar tu identidad.
        </Text>

        <View style={styles.benefits}>
          <Text style={styles.benefit}>• Vende sin límites</Text>
          <Text style={styles.benefit}>• Compra protegida</Text>
          <Text style={styles.benefit}>• Pagos seguros</Text>
        </View>

        <Pressable
          onPress={handleVerify}
          disabled={loading}
          style={[styles.primaryButton, loading && { opacity: 0.6 }]}
        >
          <Text style={styles.primaryText}>
            {loading ? 'Abriendo...' : 'Continuar verificación'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryText}>Más tarde</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    color: '#111827',
  },

  subtitle: {
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },

  benefits: {
    marginBottom: 30,
  },

  benefit: {
    marginBottom: 6,
    color: '#374151',
  },

  primaryButton: {
    backgroundColor: '#1F3A44',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
  },

  primaryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },

  secondaryButton: {
    borderWidth: 1.5,
    borderColor: '#111827',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },

  secondaryText: {
    color: '#111827',
    fontWeight: '500',
  },
});