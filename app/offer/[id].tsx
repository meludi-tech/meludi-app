import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1F3A44';
const BG = '#F8F8F6';
const CARD = '#FFFFFF';
const BORDER = '#E7E5E4';
const MUTED = '#6B7280';

type Listing = {
  id: string;
  seller_id: string;
  title: string | null;
  price_clp: number | null;
  cover_photo_url: string | null;
};

type Conversation = {
  id: string;
};

export default function OfferScreen() {
  const { id } = useLocalSearchParams();
  const listingId = String(id || '');
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState<Listing | null>(null);
  const [offerInput, setOfferInput] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/signup');
    }
  }, [user]);

  useEffect(() => {
    if (!listingId) return;
    void loadProduct();
  }, [listingId]);

  const loadProduct = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('listings')
        .select('id, seller_id, title, price_clp, cover_photo_url')
        .eq('id', listingId)
        .single();

      if (error || !data) {
        throw error || new Error('Listing not found');
      }

      setProduct(data as Listing);
    } catch (error) {
      console.log('OFFER LOAD PRODUCT ERROR:', error);
      Alert.alert('Error', 'No pudimos cargar el producto.');
    } finally {
      setLoading(false);
    }
  };

  const originalPrice = Number(product?.price_clp || 0);
  const offerPrice = Number(offerInput || 0);
  const protectionFee = 990;

  const totalWithProtection = useMemo(() => {
    if (!offerPrice) return 0;
    return offerPrice + protectionFee;
  }, [offerPrice]);

  const presetValues = useMemo(() => {
    if (!originalPrice) return [];
    return [
      Math.round(originalPrice * 0.95),
      Math.round(originalPrice * 0.9),
      Math.round(originalPrice * 0.85),
    ];
  }, [originalPrice]);

  const selectPreset = (value: number, index: number) => {
    setSelectedPreset(index);
    setOfferInput(String(value));
  };

  const handleOfferInput = (value: string) => {
    setSelectedPreset(null);
    setOfferInput(value.replace(/[^0-9]/g, ''));
  };

  const getOrCreateConversation = async (): Promise<string> => {
    if (!user?.id || !product?.seller_id) {
      throw new Error('Missing user or seller');
    }

    const { data: existing, error: existingError } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', product.id)
      .eq('buyer_id', user.id)
      .eq('seller_id', product.seller_id)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing?.id) {
      return existing.id;
    }

    const { data: created, error: createError } = await supabase
      .from('conversations')
      .insert({
        listing_id: product.id,
        buyer_id: user.id,
        seller_id: product.seller_id,
      })
      .select('id')
      .single();

    if (createError || !created?.id) {
      throw createError || new Error('Conversation creation failed');
    }

    return created.id;
  };

  const submitOffer = async () => {
    if (!user?.id) {
      router.push('/(auth)/signup');
      return;
    }

    if (!product) return;

    if (!offerPrice || offerPrice <= 0) {
      Alert.alert('Oferta inválida', 'Ingresa un valor válido.');
      return;
    }

    if (offerPrice >= originalPrice) {
      Alert.alert(
        'Oferta inválida',
        'La oferta debe ser menor al precio publicado.'
      );
      return;
    }

    if (offerPrice < Math.round(originalPrice * 0.5)) {
      Alert.alert(
        'Oferta demasiado baja',
        'Por ahora solo permitimos ofertas desde el 50% del precio publicado.'
      );
      return;
    }

    try {
      setSubmitting(true);

      const conversationId = await getOrCreateConversation();

      const { data: offer, error: offerError } = await supabase
        .from('offers')
        .insert({
          listing_id: product.id,
          buyer_id: user.id,
          seller_id: product.seller_id,
          price_clp: offerPrice,
          status: 'pending',
        })
        .select('id, listing_id, buyer_id, seller_id, price_clp, status')
        .single();

      if (offerError || !offer) {
        throw offerError || new Error('Offer creation failed');
      }

      const { error: messageError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        event: 'offer_pending',
        payload: {
          offer_id: offer.id,
          listing_id: offer.listing_id,
          buyer_id: offer.buyer_id,
          seller_id: offer.seller_id,
          price_clp: offer.price_clp,
        },
      });

      if (messageError) throw messageError;

      router.replace(`/chat/${conversationId}`);
    } catch (error) {
      console.log('SUBMIT OFFER ERROR:', error);
      Alert.alert('Error', 'No pudimos enviar la oferta.');
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>‹</Text>
            </Pressable>

            <Text style={styles.headerTitle}>Hacer una oferta</Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.productCard}>
            {product.cover_photo_url ? (
              <Image
                source={{ uri: product.cover_photo_url }}
                style={styles.productImage}
              />
            ) : (
              <View style={styles.productImagePlaceholder} />
            )}

            <View style={styles.productInfo}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {product.title || 'Producto'}
              </Text>

              <Text style={styles.productPrice}>
                ${originalPrice.toLocaleString('es-CL')}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selecciona una oferta</Text>

            <View style={styles.presetsRow}>
              {presetValues.map((value, index) => (
                <Pressable
                  key={value}
                  onPress={() => selectPreset(value, index)}
                  style={[
                    styles.presetButton,
                    selectedPreset === index && styles.presetButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      selectedPreset === index && styles.presetTextActive,
                    ]}
                  >
                    ${value.toLocaleString('es-CL')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>O escribe tu oferta</Text>

            <View style={styles.inputWrap}>
              <Text style={styles.inputPrefix}>$</Text>
              <TextInput
                value={offerInput}
                onChangeText={handleOfferInput}
                keyboardType="numeric"
                placeholder="Ej: 42000"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>

            <Text style={styles.helperText}>
              El vendedor podrá aceptar, rechazar o enviar una contraoferta.
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Row
              label="Oferta"
              value={
                offerPrice
                  ? `$${offerPrice.toLocaleString('es-CL')}`
                  : '-'
              }
            />
            <Row
              label="Pago protegido"
              value={`$${protectionFee.toLocaleString('es-CL')}`}
            />
            <View style={styles.summaryDivider} />
            <Row
              label="Total estimado"
              value={
                totalWithProtection
                  ? `$${totalWithProtection.toLocaleString('es-CL')}`
                  : '-'
              }
              bold
            />
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>Antes de enviar</Text>
            <Text style={styles.noteText}>
              La oferta se enviará al chat del producto.
            </Text>
            <Text style={styles.noteText}>
              Si la aceptan, podrás continuar con ese precio.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={submitOffer}
            disabled={submitting || !offerPrice}
            style={[
              styles.primaryButton,
              (submitting || !offerPrice) && styles.primaryButtonDisabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {submitting ? 'Enviando...' : 'Enviar oferta'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.rowBold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
    marginTop: 8,
  },
  backButton: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 28,
    lineHeight: 28,
    color: '#111',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  headerSpacer: {
    width: 32,
  },
  productCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  productImage: {
    width: 74,
    height: 74,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  productImagePlaceholder: {
    width: 74,
    height: 74,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: '#111',
    fontWeight: '600',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetButtonActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  presetText: {
    color: '#111',
    fontWeight: '600',
    fontSize: 14,
  },
  presetTextActive: {
    color: '#fff',
  },
  inputWrap: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputPrefix: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#111',
    paddingVertical: 0,
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: MUTED,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 18,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  noteBox: {
    backgroundColor: '#EEF4F1',
    borderRadius: 18,
    padding: 14,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 14 : 18,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: BG,
  },
  primaryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});