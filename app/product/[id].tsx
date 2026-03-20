import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    View,
} from 'react-native';

import { ProductGallery } from '@/components/listings/ProductGallery';
import { createPreference } from '@/features/checkout/api/createPreference';
import { getListingById } from '@/features/listings/api/getListingById';
import { Listing } from '@/features/listings/types';
import { ProtectedAction } from '@/navigation/ProtectedAction';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      setLoading(true);
      const data = await getListingById(String(id));
      setListing(data);
    } catch (error) {
      console.error('Error loading listing:', error);
      Alert.alert('Error', 'No pudimos cargar este producto.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!listing) return;

    try {
      setBuying(true);

      const response = await createPreference({
        listingId: listing.id,
      });

      const checkoutUrl =
        response.init_point || response.sandbox_init_point;

      if (!checkoutUrl) {
        throw new Error('No se recibió init_point desde Mercado Pago');
      }

      await Linking.openURL(checkoutUrl);
    } catch (error) {
      console.error('Error creating preference:', error);
      Alert.alert(
        'Error',
        'No pudimos iniciar el checkout. Intenta de nuevo.'
      );
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (!listing) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          backgroundColor: '#fff',
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          Producto no disponible
        </Text>
        <Text style={{ color: '#666', textAlign: 'center' }}>
          Este producto ya no está disponible o no pudimos encontrarlo.
        </Text>
      </View>
    );
  }

  const images = listing.photos?.map((photo) => photo.url) ?? [];
  const itemPrice = listing.price_clp;
  const insuranceFee = 990;
  const totalWithProtection = itemPrice + insuranceFee;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <ProductGallery images={images} />

        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: '#111',
            }}
          >
            {listing.title}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: '#667085',
              marginTop: 6,
            }}
          >
            {listing.brand} · {listing.size} · {listing.condition}
          </Text>

          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              color: '#111',
              marginTop: 16,
            }}
          >
            ${itemPrice.toLocaleString('es-CL')}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: '#667085',
              marginTop: 4,
            }}
          >
            ${(totalWithProtection).toLocaleString('es-CL')} total con protección
          </Text>

          <ProtectedAction onPress={() => {}}>
            <Text
              style={{
                marginTop: 18,
                fontSize: 15,
                fontWeight: '500',
                color: '#1F3A44',
              }}
            >
              ♡ Guardar
            </Text>
          </ProtectedAction>
        </View>
      </ScrollView>

      <View
        style={{
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: '#ECECEC',
          backgroundColor: '#fff',
        }}
      >
        <ProtectedAction onPress={handleBuy}>
          <View
            style={{
              backgroundColor: '#1F3A44',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: buying ? 0.75 : 1,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontWeight: '600',
                fontSize: 16,
              }}
            >
              {buying ? 'Cargando...' : 'Comprar'}
            </Text>
          </View>
        </ProtectedAction>
      </View>
    </View>
  );
}