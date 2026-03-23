import { supabase } from '@/lib/supabase';
import { ProtectedAction } from '@/navigation/ProtectedAction';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProductScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      setProduct(data);
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Producto no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {/* IMAGEN */}
        <Image
          source={{ uri: product.cover_photo_url }}
          style={{ width: '100%', height: 400 }}
        />

        <View style={{ padding: 16 }}>
          {/* PRECIO */}
          <Text style={{ fontSize: 22, fontWeight: '700' }}>
            ${product.price_clp?.toLocaleString()}
          </Text>

          {/* TÍTULO */}
          <Text style={{ fontSize: 18, marginTop: 6 }}>
            {product.title}
          </Text>

          {/* BADGES */}
          <View style={{ flexDirection: 'row', marginTop: 10, gap: 6 }}>
            {product.brand && (
              <Text style={badge}>{product.brand}</Text>
            )}
            {product.size && (
              <Text style={badge}>{product.size}</Text>
            )}
            {product.condition && (
              <Text style={badge}>{product.condition}</Text>
            )}
          </View>

          {/* BLOQUE CONFIANZA */}
          <View
            style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: '#f6f6f6',
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: '600' }}>
              Compra protegida
            </Text>
            <Text style={{ fontSize: 13, marginTop: 4 }}>
              Tienes 48h desde la entrega para revisar el producto antes de liberar el pago.
            </Text>
          </View>

          {/* DESCRIPCIÓN */}
          {product.description && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontWeight: '600' }}>
                Descripción
              </Text>
              <Text style={{ marginTop: 6 }}>
                {product.description}
              </Text>
            </View>
          )}

          {/* SELLER (simple por ahora) */}
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontWeight: '600' }}>
              Vendedor
            </Text>
            <Text style={{ marginTop: 4, color: '#555' }}>
              Usuario verificado
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View
        style={{
          padding: 16,
          borderTopWidth: 1,
          borderColor: '#eee',
        }}
      >
        <ProtectedAction
          onPress={() => {
            console.log('ir a checkout');
          }}
        >
          {(handlePress) => (
            <TouchableOpacity
              onPress={handlePress}
              style={{
                backgroundColor: '#000',
                padding: 14,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: '#fff', textAlign: 'center' }}>
                Comprar
              </Text>
            </TouchableOpacity>
          )}
        </ProtectedAction>
      </View>
    </View>
  );
}

const badge = {
  fontSize: 12,
  backgroundColor: '#eee',
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 6,
};