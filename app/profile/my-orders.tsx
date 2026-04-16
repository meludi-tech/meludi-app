import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useOrders } from '../../src/features/orders/hooks/useOrders';

export default function MyOrdersScreen() {
  const { orders, loading } = useOrders();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!orders.length) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          No tienes compras aún
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/orders/${item.id}`)}
            style={{
              marginBottom: 12,
              flexDirection: 'row',
              backgroundColor: '#fff',
              borderRadius: 12,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#eee',
            }}
          >
            {/* IMAGE */}
            {item.listing?.cover_photo_url && (
              <Image
                source={{ uri: item.listing.cover_photo_url }}
                style={{ width: 100, height: 100 }}
              />
            )}

            {/* INFO */}
            <View style={{ flex: 1, padding: 10 }}>
              <Text numberOfLines={1} style={{ fontWeight: '600' }}>
                {item.listing?.title}
              </Text>

              <Text style={{ marginTop: 4 }}>
                ${item.listing?.price_clp?.toLocaleString()}
              </Text>

              <Text style={{ marginTop: 6, fontSize: 12, color: '#666' }}>
                {item.status}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}