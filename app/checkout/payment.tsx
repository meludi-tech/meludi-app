import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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

type PaymentParams = {
  listingId?: string;
  acceptedOfferId?: string;
  acceptedOfferPrice?: string;
};

export default function CheckoutPaymentScreen() {
  const { user } = useAuthStore();
  const {
    listingId,
    acceptedOfferId,
    acceptedOfferPrice,
  } = useLocalSearchParams<PaymentParams>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [resolvedOfferPrice, setResolvedOfferPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/signup');
    }
  }, [user]);

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
        console.log('PAYMENT LOAD PRODUCT ERROR:', error);
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

  const itemPrice = resolvedOfferPrice ?? Number(product?.price_clp || 0);
  const protectionFee = 990;
  const shippingPrice = 0;
  const totalPaid = itemPrice + protectionFee + shippingPrice;
  const hasAcceptedOffer = resolvedOfferPrice !== null;

  const handleCreateOrder = async () => {
    if (!user?.id || !product?.id) return;

    try {
      setSubmitting(true);

      // 1. conversación
      const { data: existingConversation, error: existingConversationError } =
        await supabase
          .from('conversations')
          .select('id, order_id')
          .eq('listing_id', product.id)
          .eq('buyer_id', user.id)
          .eq('seller_id', product.seller_id)
          .maybeSingle();

      if (existingConversationError) throw existingConversationError;

      let conversationId = existingConversation?.id ?? null;

      if (!conversationId) {
        const { data: newConversation, error: newConversationError } =
          await supabase
            .from('conversations')
            .insert({
              listing_id: product.id,
              buyer_id: user.id,
              seller_id: product.seller_id,
            })
            .select('id')
            .single();

        if (newConversationError || !newConversation?.id) {
          throw newConversationError || new Error('No se pudo crear la conversación');
        }

        conversationId = newConversation.id;
      }

      // 2. order
      const orderPayload: Record<string, any> = {
        listing_id: product.id,
        buyer_id: user.id,
        seller_id: product.seller_id,
        status: 'PAID_HELD',
        item_price_clp: itemPrice,
        shipping_price_clp: shippingPrice,
        insurance_fee_clp: protectionFee,
        total_paid_clp: totalPaid,
        paid_at: new Date().toISOString(),
        payment_provider: 'manual_mvp',
      };

      if (hasAcceptedOffer && acceptedOfferId) {
        orderPayload.internal_note = `accepted_offer:${acceptedOfferId}`;
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select('id')
        .single();

      if (orderError || !order?.id) {
        throw orderError || new Error('No se pudo crear la orden');
      }

      // 3. link conversación
      const { error: conversationUpdateError } = await supabase
        .from('conversations')
        .update({ order_id: order.id })
        .eq('id', conversationId);

      if (conversationUpdateError) throw conversationUpdateError;

      // 4. marcar listing vendido/reservado MVP
      await supabase
        .from('listings')
        .update({
          is_sold: true,
          status: 'RESERVED',
        })
        .eq('id', product.id);

      // 5. ir a success
      router.replace({
        pathname: '/checkout/success',
        params: {
          orderId: order.id,
          conversationId,
          listingId: product.id,
        },
      });
    } catch (error) {
      console.log('CREATE ORDER ERROR:', error);
      Alert.alert('Error', 'No pudimos crear la orden.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

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

            <Text style={styles.headerTitle}>Pagar</Text>

            <View style={styles.headerIcon} />
          </View>

          <View style={styles.divider} />

          {hasAcceptedOffer && (
            <>
              <View style={styles.offerBox}>
                <View style={styles.offerIconWrap}>
                  <Ionicons name="pricetag" size={18} color="#0F766E" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.offerTitle}>Oferta aplicada</Text>
                  <Text style={styles.offerSub}>
                    Este pago usará el precio aceptado en el chat.
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
            <Text style={styles.sectionTitle}>Resumen del pedido</Text>

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
                      ${Number(product.price_clp || 0).toLocaleString('es-CL')}
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
            <Text style={styles.sectionTitle}>Método de pago</Text>

            <View style={styles.selectCard}>
              <View style={styles.cardIconWrap}>
                <Ionicons name="card-outline" size={18} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Pago protegido</Text>
                <Text style={styles.cardSub}>
                  MVP manual listo para conectar con pasarela después
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
                value={`-$${(Number(product.price_clp || 0) - itemPrice).toLocaleString('es-CL')}`}
                highlight
              />
            )}
            <Row label="Pago protegido" value={protectionFee} />
            <Row label="Envío" value={shippingPrice === 0 ? '-' : shippingPrice} />
            <View style={styles.summaryDivider} />
            <Row label="Total" value={`$${totalPaid.toLocaleString('es-CL')}`} bold />
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>Qué pasará después</Text>
            <Text style={styles.noteText}>
              Se creará la orden, se conectará al chat y el vendedor podrá preparar el envío.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={handleCreateOrder}
            disabled={submitting}
            style={[
              styles.primaryButton,
              submitting && styles.primaryButtonDisabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {submitting ? 'Procesando...' : 'Confirmar pago'}
            </Text>
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
    backgroundColor: '#EEF6F2',
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
    color: '#0F766E',
  },

  offerPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F766E',
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

  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PRIMARY,
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
    color: '#0F766E',
  },

  noteBox: {
    backgroundColor: BG,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },

  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },

  noteText: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 18,
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

  primaryButtonDisabled: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});