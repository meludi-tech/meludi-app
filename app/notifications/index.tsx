import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const sections = [
  {
    title: 'Hoy',
    items: [
      { id: '1', title: 'Pago', body: 'Tu pago quedó protegido.', icon: 'lock-closed' as const },
    ],
  },
  {
    title: 'Ayer',
    items: [
      { id: '2', title: 'Pago', body: 'El pago se liberará cuando el pedido llegue.', icon: 'wallet' as const },
      { id: '3', title: 'Envíos', body: 'Tu pedido va en camino.', icon: 'location' as const },
    ],
  },
  {
    title: 'Diciembre 22, 2025',
    items: [
      { id: '4', title: 'Cuenta', body: 'Tu cuenta quedó lista para usar.', icon: 'card' as const },
      { id: '5', title: 'Cuenta', body: 'Método de pago agregado correctamente.', icon: 'person' as const },
    ],
  },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>

          <Text style={{ flex: 1, marginLeft: 14, fontSize: 28, fontWeight: '700', color: '#111827' }}>
            Notificaciones
          </Text>

          <Ionicons name="ellipsis-horizontal-circle-outline" size={24} color="#111827" />
        </View>

        {sections.map((section) => (
          <View key={section.title} style={{ marginBottom: 22 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 14 }}>
              {section.title}
            </Text>

            {section.items.map((item) => (
              <View
                key={item.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#FAFAFA',
                  borderRadius: 18,
                  paddingHorizontal: 14,
                  paddingVertical: 16,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 999,
                    backgroundColor: '#111827',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  <Ionicons name={item.icon} size={20} color="#FFFFFF" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 3 }}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#6B7280' }}>{item.body}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}