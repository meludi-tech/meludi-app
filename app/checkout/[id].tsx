import { useCheckout } from '@/features/checkout/hooks/useCheckout';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams();

  const { startCheckout } = useCheckout();

  const [deliveryType, setDeliveryType] = useState<'shipping' | 'in_person'>(
    'shipping'
  );
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      setProduct(data);
    };

    fetch();
  }, [id]);

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  const handleCheckout = async () => {
    try {
      setLoading(true);

      await startCheckout({
        listing_id: product.id,
        delivery_type: deliveryType,
      });
    } catch (e) {
      console.log('checkout error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>
        {product.title}
      </Text>

      <Text style={{ marginTop: 6 }}>
        ${product.price_clp?.toLocaleString()}
      </Text>

      {/* DELIVERY */}
      <Text style={{ marginTop: 20, fontWeight: '600' }}>
        Tipo de entrega
      </Text>

      <TouchableOpacity
        onPress={() => setDeliveryType('shipping')}
        style={option(deliveryType === 'shipping')}
      >
        <Text>Envío</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setDeliveryType('in_person')}
        style={option(deliveryType === 'in_person')}
      >
        <Text>Presencial</Text>
      </TouchableOpacity>

      {/* RESUMEN */}
      <View style={{ marginTop: 30 }}>
        <Text style={{ fontWeight: '600' }}>Resumen</Text>

        <Text style={{ marginTop: 8 }}>
          Producto: ${product.price_clp?.toLocaleString()}
        </Text>

        <Text>Envío: $0</Text>

        <Text style={{ marginTop: 8, fontWeight: '700' }}>
          Total: ${product.price_clp?.toLocaleString()}
        </Text>
      </View>

      {/* CTA */}
      <TouchableOpacity
        onPress={handleCheckout}
        disabled={loading}
        style={{
          marginTop: 40,
          backgroundColor: '#000',
          padding: 14,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          {loading ? 'Procesando...' : 'Pagar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const option = (active: boolean) => ({
  padding: 12,
  borderWidth: 1,
  borderColor: active ? '#000' : '#ccc',
  borderRadius: 8,
  marginBottom: 8,
});