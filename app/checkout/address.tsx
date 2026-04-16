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
const MUTED = '#6B7280';

type Address = {
  id: string;
  label: string;
  address: string;
  city: string;
  region: string;
  is_default: boolean;
};

type AddressParams = {
  listingId?: string;
  acceptedOfferId?: string;
  acceptedOfferPrice?: string;
};

export default function AddressScreen() {
  const {
    listingId,
    acceptedOfferId,
    acceptedOfferPrice,
  } = useLocalSearchParams<AddressParams>();

  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    void loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/(auth)/login');
        return;
      }

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('ADDRESS ERROR:', error);
        setAddresses([]);
      } else {
        const rows = (data || []) as Address[];
        setAddresses(rows);

        const defaultAddress = rows.find((a) => a.is_default);
        if (defaultAddress) {
          setSelected(defaultAddress.id);
        } else if (rows.length > 0) {
          setSelected(rows[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === selected) || null,
    [addresses, selected]
  );

  const selectedAddressLabel = useMemo(() => {
    if (!selectedAddress) return undefined;

    return `${selectedAddress.label} · ${selectedAddress.address}, ${selectedAddress.city}`;
  }, [selectedAddress]);

  const handleContinue = () => {
    if (!selected || !listingId) return;

    router.push({
      pathname: '/checkout/shipping',
      params: {
        listingId,
        addressId: selected,
        ...(selectedAddressLabel ? { addressLabel: selectedAddressLabel } : {}),
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>

          <Text style={styles.title}>Direcciones</Text>

          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* LISTA */}
          {addresses.map((item) => {
            const active = selected === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() => setSelected(item.id)}
                style={styles.card}
              >
                <View style={styles.iconWrap}>
                  <Ionicons name="location" size={18} color="#fff" />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.labelRow}>
                    <Text style={styles.cardTitle}>{item.label}</Text>

                    {item.is_default && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Default</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.cardSub}>
                    {item.address}, {item.city}
                  </Text>
                </View>

                <View style={styles.radioOuter}>
                  {active && <View style={styles.radioInner} />}
                </View>
              </Pressable>
            );
          })}

          {/* ADD */}
          <Pressable style={styles.addButton}>
            <Text style={styles.addText}>Agregar nueva dirección</Text>
          </Pressable>
        </ScrollView>

        {/* CTA */}
        <View style={styles.footer}>
          <Pressable
            onPress={handleContinue}
            style={[
              styles.primaryButton,
              !selected && styles.primaryButtonDisabled,
            ]}
            disabled={!selected}
          >
            <Text style={styles.primaryText}>Usar esta dirección</Text>
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
    marginTop: 10,
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },

  card: {
    backgroundColor: BG,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },

  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  labelRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
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

  badge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  badgeText: {
    fontSize: 10,
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

  addButton: {
    marginTop: 10,
    backgroundColor: '#E5E7EB',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
  },

  addText: {
    fontWeight: '600',
    color: '#374151',
  },

  footer: {
    paddingVertical: 16,
  },

  primaryButton: {
    backgroundColor: PRIMARY,
    padding: 18,
    borderRadius: 24,
    alignItems: 'center',
  },

  primaryButtonDisabled: {
    opacity: 0.5,
  },

  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
});