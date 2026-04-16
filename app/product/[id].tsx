import { supabase } from '@/lib/supabase';
import { ProtectedAction } from '@/navigation/ProtectedAction';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ProductScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [liked, setLiked] = useState(false); // ❤️

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);

      const { data: listing } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      const { data: photos } = await supabase
        .from('listing_photos')
        .select('image_url, position')
        .eq('listing_id', id)
        .order('position', { ascending: true });

      setProduct({
        ...listing,
        photos: photos || [],
      });

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const orderedPhotos = useMemo(() => {
    const fromPhotos =
      product?.photos
        ?.map((p: any) => p.image_url)
        ?.filter(Boolean) || [];

    if (fromPhotos.length > 0) return fromPhotos;

    if (product?.cover_photo_url) return [product.cover_photo_url];

    return ['https://via.placeholder.com/400']; // fallback real
  }, [product]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Producto no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>

        {/* BACK */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </Pressable>

        {/* ❤️ LIKE */}
        <Pressable
          style={styles.likeButton}
          onPress={() => setLiked(!liked)}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={22}
            color={liked ? '#EF4444' : '#111'}
          />
        </Pressable>

        {/* GALERÍA */}
        <ScrollView
          horizontal
          pagingEnabled
          onScroll={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / SCREEN_WIDTH
            );
            setActiveIndex(index);
          }}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
        >
          {orderedPhotos.map((uri: string, i: number) => (
            <Image
              key={i}
              source={{ uri }}
              style={styles.image}
            />
          ))}
        </ScrollView>

        {/* DOTS */}
        <View style={styles.dots}>
          {orderedPhotos.map((_: any, i: number) => (
            <View
              key={i}
              style={[
                styles.dot,
                activeIndex === i && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.content}>

          {/* PRECIO */}
          <Text style={styles.price}>
            ${product.price_clp?.toLocaleString('es-CL')}
          </Text>

          {/* TOTAL */}
          <Text style={styles.protected}>
            ${(product.price_clp + 990).toLocaleString('es-CL')} total · Pago protegido
          </Text>

          {/* TÍTULO */}
          <Text style={styles.title}>{product.title}</Text>

          {/* BADGES */}
          <View style={styles.badgeRow}>
            {product.brand && <Badge label={product.brand} />}
            {product.size && <Badge label={product.size} />}
            {product.condition && <Badge label={product.condition} />}
          </View>

          {/* VENDEDOR */}
          <View style={styles.sellerRow}>
            <View>
              <Text style={{ fontWeight: '600' }}>Usuario verificado</Text>
              <Text style={{ color: '#6B7280', fontSize: 12 }}>
                Identidad verificada
              </Text>
            </View>

            <TouchableOpacity style={styles.messageBtn}>
              <Text>Enviar mensaje</Text>
            </TouchableOpacity>
          </View>

          {/* TRUST */}
          <View style={styles.trustBox}>
            <Text style={styles.trustTitle}>Compra protegida</Text>
            <Text style={styles.trustText}>
              Pago retenido hasta confirmar entrega.
            </Text>
            <Text style={styles.trustText}>
              48h para reportar problemas.
            </Text>
          </View>

          {/* DESCRIPCIÓN */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text>{product.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text>Hacer oferta</Text>
        </TouchableOpacity>

        <ProtectedAction onPress={() => router.push(`/checkout/${product.id}`)}>
          {(handlePress) => (
            <TouchableOpacity onPress={handlePress} style={styles.primaryButton}>
              <Text style={{ color: '#fff' }}>Comprar</Text>
            </TouchableOpacity>
          )}
        </ProtectedAction>
      </View>
    </View>
  );
}

function Badge({ label }: any) {
  return (
    <View style={styles.badge}>
      <Text style={{ fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 999,
  },

  likeButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 999,
  },

  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.1,
    backgroundColor: '#F3F4F6',
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 3,
  },

  dotActive: {
    backgroundColor: '#111827',
  },

  content: { padding: 16 },

  price: { fontSize: 26, fontWeight: '700' },

  protected: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
  },

  title: {
    fontSize: 20,
    marginTop: 10,
  },

  badgeRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 6,
  },

  badge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 6,
  },

  sellerRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  messageBtn: {
    borderWidth: 1,
    borderColor: '#1F3A44',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  trustBox: {
    marginTop: 16,
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 12,
  },

  trustTitle: { fontWeight: '600' },

  trustText: { fontSize: 13, marginTop: 4 },

  section: { marginTop: 16 },

  sectionTitle: { fontWeight: '600', marginBottom: 6 },

  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },

  primaryButton: {
    flex: 1,
    backgroundColor: '#1F3A44',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
});