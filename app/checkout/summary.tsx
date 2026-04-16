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
const SUCCESS_TEXT = '#0F766E';

type SummaryParams = {
  listingId?: string;
  acceptedOfferId?: string;
  acceptedOfferPrice?: string;
  addressLabel?: string;
  shippingType?: string;
  shippingPrice?: string;
};

export default function CheckoutSummaryScreen() {
  const {
    listingId,
    acceptedOfferId,
    acceptedOfferPrice,
    addressLabel,
    shippingType,
    shippingPrice,
  } = useLocalSearchParams<SummaryParams>();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [resolvedOfferPrice, setResolvedOfferPrice] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!listingId) return;

      setLoading(true);

      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          listing_photos (
            image_url,
            position
          )
        `)
        .eq('id', listingId)
        .single();

      if (error) {
        console.log('SUMMARY LOAD PRODUCT ERROR:', error);
        setProduct(null);
      } else {
        setProduct(data);
      }

      setLoading(false);
    };

    load();
  }, [listingId]);

  useEffect(() => {
    const resolveOffer = async () => {
      if (acceptedOfferPrice) {
        const parsed = Number(acceptedOfferPrice);
        if (!Number.isNaN(parsed) && parsed > 0) {
          setResolvedOfferPrice(parsed);
          return;
        }
      }

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

    resolveOffer();
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
  const itemPrice = resolvedOfferPrice ?? originalPrice;
  const protectionFee = 990;
  const shipping = Number(shippingPrice || 0);
  const total = itemPrice + protectionFee + shipping;
  const hasAcceptedOffer = resolvedOfferPrice !== null;

  const handleContinue = () => {
    if (!product?.id) return;

    router.push({
      pathname: '/checkout/payment',
      params: {
        listingId: product.id,
        ...(acceptedOfferId ? { acceptedOfferId } : {}),
        ...(hasAcceptedOffer ? { acceptedOfferPrice: String(itemPrice) } : {}),
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={PRIMARY} />
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
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.headerIcon}>
              <Ionicons name="arrow-back" size={24} color="#111" />
            </Pressable>

            <Text style={styles.headerTitle}>Resumen</Text>

            <View style={styles.headerIcon} />
          </View>

          <View style={styles.divider} />

          {hasAcceptedOffer && (
            <>
              <View style={styles.offerBox}>
                <View style={styles.offerIconWrap}>
                  <Ionicons name="pricetag" size={18} color={SUCCESS_TEXT} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.offerTitle}>Oferta aplicada</Text>
                  <Text style={styles.offerSub}>
                    Se usará el precio aceptado en el chat.
                  </Text>
                </View>

                <Text style={styles.offerPrice}>
                  ${itemPrice.toLocaleString('es-CL')}
                </Text>
              </View>

              <View style={styles.divider} />
            </>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Producto</Text>

            <View style={styles.productCard}>
              <Image source={{ uri: coverImage }} style={styles.productImage} />

              <View style={{ flex: 1 }}>
                <Text style={styles.productTitle}>{product.title}</Text>

                <Text style={styles.productMeta}>
                  {[product.color, product.size].filter(Boolean).join('  |  ')}
                </Text>

                {hasAcceptedOffer ? (
                  <>
                    <Text style={styles.strikedPrice}>
                      ${originalPrice.toLocaleString('es-CL')}
                    </Text>
                    <Text style={styles.productPrice}>
                      ${itemPrice.toLocaleString('es-CL')}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.productPrice}>
                    ${itemPrice.toLocaleString('es-CL')}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Entrega</Text>

            <View style={styles.infoCard}>
              <View style={styles.iconWrap}>
                <Ionicons name="location-outline" size={18} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Dirección</Text>
                <Text style={styles.infoSub}>
                  {addressLabel || 'Se definirá en el siguiente paso'}
                </Text>
              </View>
            </View>

            <View style={[styles.infoCard, { marginTop: 10 }]}>
              <View style={styles.iconWrap}>
                <Ionicons name="car-outline" size={18} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Tipo de entrega</Text>
                <Text style={styles.infoSub}>
                  {shippingType || 'Se definirá en el siguiente paso'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryBox}>
            <Row label="Producto" value={itemPrice} />
            {hasAcceptedOffer && (
              <Row
                label="Ahorro por oferta"
                value={`-$${(originalPrice - itemPrice).toLocaleString('es-CL')}`}
                highlight
              />
            )}
            <Row label="Pago protegido" value={protectionFee} />
            <Row label="Envío" value={shipping === 0 ? '-' : shipping} />
            <View style={styles.summaryDivider} />
            <Row label="Total" value={`$${total.toLocaleString('es-CL')}`} bold />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={handleContinue} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Continuar a pago</Text>
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
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
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
  strikedPrice: {
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
  infoCard: {
    backgroundColor: BG,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  infoSub: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
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
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});