import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

// TODO real: reemplazar por comuna del seller/listing cuando la conectemos
const ORIGIN_COMMUNE_ID = 308;

type Address = {
  id: string;
  label: string;
  address: string;
  city: string;
  region: string;
  commune_id: number | null;
  commune_name?: string | null;
  is_default?: boolean;
};

type Listing = {
  id: string;
  title: string;
  price_clp: number;
  package_size: 'S' | 'M' | 'L' | null;
};

type ShippingOption = {
  courier_id: number | null;
  courier_name: string;
  price: number;
  days?: number | null;
};

type ShippingParams = {
  listingId: string;
  addressId: string;
  addressLabel?: string;
  acceptedOfferId?: string;
  acceptedOfferPrice?: string;
};

export default function ShippingScreen() {
  const {
    listingId,
    addressId,
    addressLabel,
    acceptedOfferId,
    acceptedOfferPrice,
  } = useLocalSearchParams<ShippingParams>();

  const [loading, setLoading] = useState(true);
  const [quoting, setQuoting] = useState(false);

  const [listing, setListing] = useState<Listing | null>(null);
  const [address, setAddress] = useState<Address | null>(null);

  const [deliveryType, setDeliveryType] = useState<'home_delivery' | 'branch'>(
    'home_delivery'
  );
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState<number | null>(null);

  useEffect(() => {
    void loadBaseData();
  }, [listingId, addressId]);

  useEffect(() => {
    if (listing && address?.commune_id) {
      void quoteShipment();
    }
  }, [listing, address, deliveryType]);

  const selectedOption = useMemo(
    () => options.find((item) => item.courier_id === selectedCourierId) || null,
    [options, selectedCourierId]
  );

  const resolvedAddressLabel = useMemo(() => {
    if (addressLabel) return addressLabel;
    if (!address) return undefined;
    return `${address.label} · ${address.address}, ${address.city}`;
  }, [address, addressLabel]);

  const resolvedShippingType = useMemo(() => {
    return deliveryType === 'home_delivery'
      ? 'Entrega a domicilio'
      : 'Retiro en sucursal';
  }, [deliveryType]);

  const loadBaseData = async () => {
    try {
      setLoading(true);

      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('id, title, price_clp, package_size')
        .eq('id', listingId)
        .single();

      if (listingError) {
        console.log('SHIPPING LISTING ERROR:', listingError);
        setListing(null);
      } else {
        setListing(listingData);
      }

      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', addressId)
        .single();

      if (addressError) {
        console.log('SHIPPING ADDRESS ERROR:', addressError);
        setAddress(null);
      } else {
        setAddress(addressData);
      }
    } catch (e) {
      console.log('SHIPPING LOAD ERROR:', e);
    } finally {
      setLoading(false);
    }
  };

  const quoteShipment = async () => {
    if (!listing?.package_size) return;
    if (!address?.commune_id) return;

    try {
      setQuoting(true);
      setOptions([]);
      setSelectedCourierId(null);

      const { data, error } = await supabase.functions.invoke('quote-shipment', {
        body: {
          origin_commune_id: ORIGIN_COMMUNE_ID,
          destiny_commune_id: address.commune_id,
          destination_type: deliveryType,
          size: listing.package_size,
        },
      });

      if (error) {
        console.log('QUOTE SHIPMENT ERROR:', error);
        return;
      }

      const fetchedOptions: ShippingOption[] = data?.options || [];
      setOptions(fetchedOptions);

      if (fetchedOptions.length > 0) {
        setSelectedCourierId(fetchedOptions[0].courier_id);
      }
    } catch (e) {
      console.log('QUOTE SHIPMENT UNEXPECTED:', e);
    } finally {
      setQuoting(false);
    }
  };

  const handleContinue = () => {
    if (!listing) return;
    if (!address) return;
    if (!selectedOption) return;

    router.push({
      pathname: '/checkout/summary',
      params: {
        listingId: listing.id,
        addressId: address.id,
        ...(resolvedAddressLabel ? { addressLabel: resolvedAddressLabel } : {}),
        deliveryType,
        shippingType: resolvedShippingType,
        courierId: String(selectedOption.courier_id ?? ''),
        courierName: selectedOption.courier_name,
        shippingPrice: String(selectedOption.price),
        ...(acceptedOfferId ? { acceptedOfferId } : {}),
        ...(acceptedOfferPrice ? { acceptedOfferPrice } : {}),
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

  if (!listing || !address) {
    return (
      <View style={styles.center}>
        <Text>No pudimos cargar el envío</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerIcon}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>

          <Text style={styles.headerTitle}>Tipo de entrega</Text>

          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Dirección</Text>

          <View style={styles.infoCard}>
            <View style={styles.leftIconWrap}>
              <Ionicons name="location" size={20} color="#fff" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{address.label}</Text>
              <Text style={styles.cardSub}>
                {address.address}, {address.city}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Cómo quieres recibirlo</Text>

          <View style={styles.choiceWrap}>
            <Pressable
              onPress={() => setDeliveryType('home_delivery')}
              style={[
                styles.choiceCard,
                deliveryType === 'home_delivery' && styles.choiceCardActive,
              ]}
            >
              <Text
                style={[
                  styles.choiceTitle,
                  deliveryType === 'home_delivery' && styles.choiceTitleActive,
                ]}
              >
                Entrega a domicilio
              </Text>
              <Text
                style={[
                  styles.choiceSub,
                  deliveryType === 'home_delivery' && styles.choiceSubActive,
                ]}
              >
                Recíbelo en tu dirección
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setDeliveryType('branch')}
              style={[
                styles.choiceCard,
                deliveryType === 'branch' && styles.choiceCardActive,
              ]}
            >
              <Text
                style={[
                  styles.choiceTitle,
                  deliveryType === 'branch' && styles.choiceTitleActive,
                ]}
              >
                Retiro en sucursal
              </Text>
              <Text
                style={[
                  styles.choiceSub,
                  deliveryType === 'branch' && styles.choiceSubActive,
                ]}
              >
                Retíralo en un punto disponible
              </Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Opciones de envío</Text>

          {quoting ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={PRIMARY} />
              <Text style={styles.loadingText}>Cotizando envío...</Text>
            </View>
          ) : options.length === 0 ? (
            <Text style={styles.emptyText}>
              No encontramos opciones para esta dirección.
            </Text>
          ) : (
            options.map((item) => {
              const active = selectedCourierId === item.courier_id;

              return (
                <Pressable
                  key={`${item.courier_id}-${item.courier_name}`}
                  onPress={() => setSelectedCourierId(item.courier_id)}
                  style={styles.optionCard}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionTitle}>{item.courier_name}</Text>
                    <Text style={styles.optionSub}>
                      {item.days
                        ? `${item.days} días estimados`
                        : 'Tiempo estimado no informado'}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end', gap: 8 }}>
                    <Text style={styles.optionPrice}>
                      ${Number(item.price || 0).toLocaleString('es-CL')}
                    </Text>

                    <View style={styles.radioOuter}>
                      {active ? <View style={styles.radioInner} /> : null}
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={handleContinue}
            disabled={!selectedOption}
            style={[
              styles.primaryButton,
              !selectedOption && styles.primaryButtonDisabled,
            ]}
          >
            <Text style={styles.primaryText}>Continuar</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
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
    width: 24,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 14,
  },

  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 18,
  },

  infoCard: {
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

  choiceWrap: {
    gap: 12,
  },

  choiceCard: {
    backgroundColor: BG,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },

  choiceCardActive: {
    borderColor: PRIMARY,
  },

  choiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },

  choiceTitleActive: {
    color: PRIMARY,
  },

  choiceSub: {
    fontSize: 12,
    color: MUTED,
  },

  choiceSubActive: {
    color: PRIMARY,
  },

  optionCard: {
    backgroundColor: BG,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 12,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },

  optionSub: {
    fontSize: 12,
    color: MUTED,
    marginTop: 4,
  },

  optionPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
  },

  loadingBox: {
    paddingTop: 20,
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 8,
    color: MUTED,
  },

  emptyText: {
    color: MUTED,
    fontSize: 14,
    paddingTop: 8,
  },

  footer: {
    paddingTop: 8,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: '#F2F4F5',
    backgroundColor: '#fff',
  },

  primaryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonDisabled: {
    opacity: 0.5,
  },

  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});