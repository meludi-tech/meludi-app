import { router } from 'expo-router';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useOrders } from '../../src/features/orders/hooks/useOrders';

export default function OrdersScreen() {
  const { orders, loading } = useOrders();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Tus compras</Text>
        <Text style={styles.empty}>
          Aún no tienes pedidos
        </Text>
      </View>
    );
  }

  const statusMap: Record<string, string> = {
    PAID_HELD: 'Pago protegido',
    LABEL_CREATED: 'Etiqueta generada',
    IN_TRANSIT: 'En tránsito',
    DELIVERED: 'Entregado',
    WAITING_48H: 'Protección 48h',
    RELEASED: 'Pago liberado',
    DISPUTE_OPENED: 'Disputa abierta',
    REFUNDED: 'Reembolsado',
    CANCELLED: 'Cancelado',
  };

  return (
    <FlatList
      style={styles.container}
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/orders/${item.id}`)}
        >
          {item.listing?.cover_photo_url && (
            <Image
              source={{ uri: item.listing.cover_photo_url }}
              style={styles.image}
            />
          )}

          <View style={{ flex: 1 }}>
            <Text style={styles.titleItem}>
              {item.listing?.title}
            </Text>

            <Text style={styles.price}>
              ${item.listing?.price_clp?.toLocaleString()}
            </Text>

            <Text style={styles.status}>
              {statusMap[item.status] || item.status}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
  },

  empty: {
    marginTop: 10,
    color: '#666',
  },

  card: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
  },

  titleItem: {
    fontWeight: '600',
  },

  price: {
    marginTop: 4,
    color: '#111',
  },

  status: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
  },
});