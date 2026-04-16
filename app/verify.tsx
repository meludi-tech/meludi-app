import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1F3A44';

export default function VerifyScreen() {
  const handleVerify = async () => {
    try {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        alert('Debes iniciar sesión');
        return;
      }

      const userId = data.user.id;

      const res = await fetch(
        'https://ijczgrdkvvfmqsddwmle.functions.supabase.co/create-truora-token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
          }),
        }
      );

      const json = await res.json();

      if (!json.api_key) {
        console.log(json);
        alert('Error generando verificación');
        return;
      }

      const url = `https://identity.truora.com/?token=${json.api_key}`;

      // 🔥 IMPORTANTE → funciona mejor que Linking
      await WebBrowser.openBrowserAsync(url);

    } catch (err) {
      console.log(err);
      alert('Error en verificación');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 24, marginTop: 40 }}>
        <Text style={{ fontSize: 30, fontWeight: '700', marginBottom: 12 }}>
          Verificar identidad
        </Text>

        <Text style={{ color: '#6B7280', marginBottom: 24 }}>
          Para vender y comprar con seguridad necesitamos verificar tu identidad.
        </Text>

        <View
          style={{
            backgroundColor: '#F3F4F6',
            padding: 16,
            borderRadius: 16,
            marginBottom: 30,
          }}
        >
          <Text style={{ fontWeight: '600', marginBottom: 6 }}>
            Qué te pediremos
          </Text>
          <Text style={{ color: '#6B7280' }}>
            Documento de identidad y validación facial. Toma solo unos minutos.
          </Text>
        </View>

        <Pressable
          onPress={handleVerify}
          style={{
            backgroundColor: PRIMARY,
            padding: 18,
            borderRadius: 20,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            Continuar verificación
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={{
            borderWidth: 1.5,
            borderColor: '#111827',
            padding: 18,
            borderRadius: 20,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16 }}>Más tarde</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}