import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SellScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 10 }}>Vender</Text>
        <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 18 }}>
          Para publicar necesitas crear cuenta o iniciar sesión.
        </Text>

        <Pressable
          onPress={() => router.push('/(auth)/signup')}
          style={{
            backgroundColor: '#1F3A44',
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderRadius: 14,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Crear cuenta</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}