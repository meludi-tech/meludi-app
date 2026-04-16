import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';

export default function PostTruora() {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  const checkStatus = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) return;

    const { data } = await supabase
      .from('profiles')
      .select('kyc_status')
      .eq('id', user.id)
      .single();

    if (data?.kyc_status === 'verified') {
      setVerified(true);
    }

    setLoading(false);
  };

  useEffect(() => {
    checkStatus();

    const interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      
      {/* Estado */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        {verified ? (
          <Text style={{ fontSize: 28 }}>✅</Text>
        ) : (
          <ActivityIndicator />
        )}
      </View>

      {/* Título */}
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 10 }}>
        {verified
          ? 'Identidad verificada'
          : 'Confirmando tu identidad'}
      </Text>

      {/* Descripción */}
      <Text style={{ color: '#6B7280', marginBottom: 32 }}>
        {verified
          ? 'Tu cuenta ya está lista para usar meludi.'
          : 'Esto puede tardar unos minutos. Puedes continuar y lo terminamos en segundo plano.'}
      </Text>

      {/* BOTÓN PRINCIPAL */}
      <Pressable
        onPress={() => router.replace('/' as any)}
        style={{
          backgroundColor: '#1F3A44',
          padding: 16,
          borderRadius: 14,
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>
          Continuar
        </Text>
      </Pressable>

      {/* BOTÓN SECUNDARIO */}
      {!verified && (
        <Pressable
          onPress={checkStatus}
          style={{
            padding: 14,
            borderRadius: 14,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#111827',
          }}
        >
          <Text>Actualizar estado</Text>
        </Pressable>
      )}

    </View>
  );
}