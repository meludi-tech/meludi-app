import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1F3A44';

export default function EntryScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 }}>
        <View style={{ alignItems: 'flex-end', marginBottom: 40 }}>
          <Pressable onPress={() => router.replace('/(tabs)/home')} hitSlop={12}>
            <Text style={{ fontSize: 22, color: '#111827' }}>✕</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 34,
              lineHeight: 40,
              fontWeight: '700',
              color: '#111827',
              marginBottom: 12,
            }}
          >
            Vende tu ropa con respaldo.
          </Text>

          <Text
            style={{
              fontSize: 16,
              lineHeight: 24,
              color: '#6B7280',
              marginBottom: 36,
            }}
          >
            Compra con protección. Todo dentro de meludi.
          </Text>

          <Pressable
            onPress={() => router.push('/(auth)/signup')}
            style={{
              backgroundColor: PRIMARY,
              height: 56,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600' }}>
              Crear cuenta
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={{
              height: 56,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: '#111827',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#111827', fontSize: 17, fontWeight: '500' }}>
              Iniciar sesión
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}