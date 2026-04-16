import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 🔥 esto luego viene de backend
const notifications = [
  {
    id: '1',
    title: 'Pago protegido',
    body: 'Tu pago quedó protegido.',
    icon: 'lock-closed',
    route: '/orders',
  },
  {
    id: '2',
    title: 'Pedido en camino',
    body: 'Tu pedido va en camino.',
    icon: 'location',
    route: '/orders',
  },
  {
    id: '3',
    title: 'Dinero disponible',
    body: 'Tu saldo fue liberado.',
    icon: 'wallet',
    route: '/profile/wallet',
  },
];

export default function NotificationsScreen() {
  const isEmpty = notifications.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>

          <Text style={styles.title}>Notificaciones</Text>

          <View style={{ width: 24 }} />
        </View>

        {/* EMPTY */}
        {isEmpty && (
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>
              Aún no tienes notificaciones
            </Text>
          </View>
        )}

        {/* LISTA */}
        {!isEmpty &&
          notifications.map((item) => (
            <Pressable
              key={item.id}
              style={styles.item}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.icon}>
                <Ionicons name={item.icon as any} size={20} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemBody}>{item.body}</Text>
              </View>
            </Pressable>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  content: {
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  title: {
    flex: 1,
    marginLeft: 14,
    fontSize: 24,
    fontWeight: '700',
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  icon: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  itemTitle: {
    fontWeight: '600',
  },

  itemBody: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },

  empty: {
    marginTop: 80,
    alignItems: 'center',
  },

  emptyText: {
    marginTop: 10,
    color: '#888',
  },
});