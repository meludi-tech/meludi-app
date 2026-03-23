import { useOrder } from '@/features/orders/hooks/useOrder';
import { OrderStatus } from '@/features/orders/types';
import { router, useLocalSearchParams } from 'expo-router';
import {
    ActivityIndicator,
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { order, loading } = useOrder(id);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Orden no encontrada</Text>
      </View>
    );
  }

  const status = order.status as OrderStatus;

  const statusLabelMap: Record<OrderStatus, string> = {
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
    <View style={{ flex: 1, padding: 16 }}>
      {/* HEADER */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ marginBottom: 10 }}>← Volver</Text>
      </TouchableOpacity>

      {/* ESTADO */}
      <Text style={{ fontSize: 22, fontWeight: '700' }}>
        {statusLabelMap[status]}
      </Text>

      {/* PRODUCTO */}
      {order.listing?.cover_photo_url && (
        <Image
          source={{ uri: order.listing.cover_photo_url }}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 10,
            marginTop: 16,
          }}
        />
      )}

      <Text style={{ fontSize: 18, marginTop: 10 }}>
        {order.listing?.title}
      </Text>

      <Text style={{ marginTop: 6 }}>
        ${order.listing?.price_clp?.toLocaleString()}
      </Text>

      {/* INFO */}
      <View style={{ marginTop: 20 }}>
        <Text>Tipo: {order.delivery_type}</Text>
        <Text>ID: {order.id}</Text>
      </View>

      {/* ACCIONES */}
      {order.label_url && (
        <TouchableOpacity
          onPress={() => console.log('abrir label')}
          style={{
            marginTop: 20,
            backgroundColor: '#000',
            padding: 12,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center' }}>
            Descargar etiqueta
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}