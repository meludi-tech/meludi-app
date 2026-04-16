import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1F3A44';
const BG = '#F6F6F4';
const BORDER = '#E5E7EB';
const MUTED = '#6B7280';
const SUCCESS_BG = '#EEF6F2';
const SUCCESS_TEXT = '#155E4B';

type CheckoutParams = {
  id: string;
  acceptedOfferId?: string;
  acceptedOfferPrice?: string;
};

export default function CheckoutReviewScreen() {
  const {
    id,
    acceptedOfferId,
    acceptedOfferPrice,
  } = useLocalSearchParams<CheckoutParams>();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [resolvedOfferPrice, setResolvedOfferPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setLoading(true);

      const { data: listing, error } = await supabase
        .from('listings')
        .select(`
          *,
          listing_photos (
            image_url,
            position
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.log('CHECKOUT PRODUCT ERROR:', error);
        setProduct(null);
      } else {
        setProduct(listing);
      }

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const resolveAcceptedOffer = async () => {
      if (!acceptedOfferId && !acceptedOfferPrice) {
        setResolvedOfferPrice(null);
        return;
      }

      // 1. si viene precio por params, úsalo directo
      if (acceptedOfferPrice) {
        const parsed = Number(acceptedOfferPrice);
        if (!Number.isNaN(parsed) && parsed > 0) {
          setResolvedOfferPrice(parsed);
          return;
        }
      }

      // 2. fallback: consultar offer por id
      if (acceptedOfferId) {
        const { data, error } = await supabase
          .from('offers')
          .select('price_clp, status')
          .eq('id', acceptedOfferId)
          .maybeSingle();

        if (!error && data?.status === 'accepted') {
          setResolvedOfferPrice(Number(data.price_clp));
          return;
        }
      }

      setResolvedOfferPrice(null);
    };

    resolveAcceptedOffer();
  }, [acceptedOfferId, acceptedOfferPrice]);

  const coverImage = useMemo(() => {
    const orderedPhotos =
      product?.listing_photos
        ?.slice()
        ?.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
        ?.map((item: any) => item.image_url)
        ?.filter(Boolean) || [];

    if (orderedPhotos.length > 0) return orderedPhotos[0];
    if (product?.cover_photo_url) return product.cover_photo_url;
    return 'https://via.placeholder.com/300';
  }, [product]);

  const originalPrice = Number(product?.price_clp || 0);
  const price = resolvedOfferPrice ?? originalPrice;
  const hasAcceptedOffer = resolvedOfferPrice !== null;

  const protectionFee = 990;
  const shipping = 0; // todavía no definido; se elegirá después
  const total = price + protectionFee + shipping;

  const handleContinue = () => {
    if (!product?.id) return;

    router.push({
      pathname: '/checkout/address',
      params: {
        listingId: product.id,
        ...(acceptedOfferId ? { acceptedOfferId } : {}),
        ...(hasAcceptedOffer ? { acceptedOfferPrice: String(price) } : {}),
      },
    });
  };

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
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.headerIcon}>
              <Ionicons name="arrow-back" size={24} color="#111" />
            </Pressable>

            <Text style={styles.headerTitle}>Revisar pedido</Text>

            <Pressable style={styles.headerIcon}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#111" />
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* OFERTA APLICADA */}
          {hasAcceptedOffer && (
            <>
              <View style={styles.offerBox}>
                <View style={styles.offerIconWrap}>
                  <Ionicons name="pricetag" size={18} color={SUCCESS_TEXT} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.offerTitle}>Oferta aplicada</Text>
                  <Text style={styles.offerSub}>
                    Esta compra usará el precio aceptado por el vendedor.
                  </Text>
                </View>

                <Text style={styles.offerPrice}>
                  ${price.toLocaleString('es-CL')}
                </Text>
              </View>

              <View style={styles.divider} />
            </>
          )}

          {/* DIRECCIÓN */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dirección de entrega</Text>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/checkout/address',
                  params: {
                    listingId: product.id,
                    ...(acceptedOfferId ? { acceptedOfferId } : {}),
                    ...(hasAcceptedOffer ? { acceptedOfferPrice: String(price) } : {}),
                  },
                })
              }
              style={styles.selectCard}
            >
              <View style={styles.leftIconWrap}>
                <Ionicons name="location" size={20} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Elegir dirección</Text>
                <Text style={styles.cardSub}>
                  Selecciona dónde quieres recibir tu compra
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#111" />
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* PRODUCTO */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Productos</Text>

            <View style={styles.productCard}>
              <Image source={{ uri: coverImage }} style={styles.productImage} />

              <View style={{ flex: 1 }}>
                <Text style={styles.productTitle}>{product.title}</Text>

                <Text style={styles.productMeta}>
                  {[product.color, product.size].filter(Boolean).join('  |  ')}
                </Text>

                {hasAcceptedOffer ? (
                  <View>
                    <Text style={styles.originalPriceStriked}>
                      ${originalPrice.toLocaleString('es-CL')}
                    </Text>
                    <Text style={styles.productPrice}>
                      ${price.toLocaleString('es-CL')}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.productPrice}>
                    ${price.toLocaleString('es-CL')}
                  </Text>
                )}
              </View>

              <Pressable>
                <Ionicons name="trash-outline" size={20} color="#111" />
              </Pressable>
            </View>
          </View>

          <View style={styles.divider} />

          {/* TIPO ENTREGA */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipo de entrega</Text>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/checkout/shipping',
                  params: {
                    listingId: product.id,
                    ...(acceptedOfferId ? { acceptedOfferId } : {}),
                    ...(hasAcceptedOffer ? { acceptedOfferPrice: String(price) } : {}),
                  },
                })
              }
              style={styles.selectCard}
            >
              <View style={styles.shippingIconWrap}>
                <Ionicons name="car-outline" size={18} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Elegir tipo de entrega</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#111" />
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* CÓDIGO */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Código promocional</Text>

            <View style={styles.promoRow}>
              <View style={styles.promoInputFake}>
                <Text style={styles.promoPlaceholder}>Código promocional</Text>
              </View>

              <Pressable style={styles.plusButton}>
                <Ionicons name="add" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>

          {/* RESUMEN */}
          <View style={styles.summaryBox}>
            <Row label="Producto" value={price} />
            {hasAcceptedOffer && (
              <Row
                label="Ahorro por oferta"
                value={`-$${(originalPrice - price).toLocaleString('es-CL')}`}
                highlight
              />
            )}
            <Row label="Pago protegido" value={protectionFee} />
            <Row label="Envío" value={shipping === 0 ? '-' : shipping} />
            <View style={styles.summaryDivider} />
            <Row label="Total" value={`$${total.toLocaleString('es-CL')}`} bold />
          </View>
        </ScrollView>

        {/* CTA */}
        <View style={styles.footer}>
          <Pressable onPress={handleContinue} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Ir a pagar</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string | number;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text
        style={[
          styles.rowLabel,
          bold && styles.rowBold,
          highlight && styles.rowHighlight,
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.rowValue,
          bold && styles.rowBold,
          highlight && styles.rowHighlight,
        ]}
      >
        {typeof value === 'number' ? `$${value.toLocaleString('es-CL')}` : value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 14,
  },

  headerIcon: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },

  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginBottom: 18,
  },

  offerBox: {
    backgroundColor: SUCCESS_BG,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },

  offerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DDEDE6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  offerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
  },

  offerSub: {
    fontSize: 12,
    color: SUCCESS_TEXT,
  },

  offerPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: SUCCESS_TEXT,
  },

  section: {
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 14,
  },

  selectCard: {
    backgroundColor: BG,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  leftIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  shippingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },

  cardSub: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },

  productCard: {
    backgroundColor: BG,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },

  productImage: {
    width: 84,
    height: 84,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },

  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },

  productMeta: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 6,
  },

  originalPriceStriked: {
    fontSize: 13,
    color: MUTED,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },

  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },

  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  promoInputFake: {
    flex: 1,
    backgroundColor: BG,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  promoPlaceholder: {
    color: '#B0B7BF',
    fontSize: 14,
  },

  plusButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingTop: 4,
    paddingBottom: 10,
    marginBottom: 16,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 10,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  rowLabel: {
    fontSize: 14,
    color: '#111',
  },

  rowValue: {
    fontSize: 14,
    color: '#111',
  },

  rowBold: {
    fontWeight: '700',
  },

  rowHighlight: {
    color: SUCCESS_TEXT,
  },

  footer: {
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#F2F4F5',
  },

  primaryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});