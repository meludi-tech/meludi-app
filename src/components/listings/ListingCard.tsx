import { useFavorites } from '@/features/favorites/hooks/useFavorites';
import { ProtectedAction } from '@/navigation/ProtectedAction';
import { router } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  listing: any;
};

export const ListingCard = ({ listing }: Props) => {
  const { handleToggleFavorite } = useFavorites();

  return (
    <TouchableOpacity
      style={{
        flex: 1,
        margin: 6,
      }}
      onPress={() => router.push(`/product/${listing.id}`)}
    >
      <View>
        <Image
          source={{ uri: listing.cover_photo_url }}
          style={{
            width: '100%',
            height: 180,
            borderRadius: 12,
          }}
        />

        {/* ❤️ FAVORITO */}
        <ProtectedAction onPress={() => handleToggleFavorite(listing.id)}>
          {(handlePress) => (
            <TouchableOpacity
              onPress={handlePress}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 6,
              }}
            >
              <Text style={{ fontSize: 16 }}>♡</Text>
            </TouchableOpacity>
          )}
        </ProtectedAction>
      </View>

      {/* INFO */}
      <Text numberOfLines={1} style={{ marginTop: 6, fontWeight: '500' }}>
        {listing.title}
      </Text>

      {/* BADGES */}
      <View style={{ flexDirection: 'row', marginTop: 4, gap: 4 }}>
        {listing.brand && (
          <Text style={{ fontSize: 12, backgroundColor: '#eee', padding: 4, borderRadius: 6 }}>
            {listing.brand}
          </Text>
        )}

        {listing.size && (
          <Text style={{ fontSize: 12, backgroundColor: '#eee', padding: 4, borderRadius: 6 }}>
            {listing.size}
          </Text>
        )}

        {listing.condition && (
          <Text style={{ fontSize: 12, backgroundColor: '#eee', padding: 4, borderRadius: 6 }}>
            {listing.condition}
          </Text>
        )}
      </View>

      {/* PRECIO */}
      <Text style={{ marginTop: 4, fontWeight: '600' }}>
        ${listing.price_clp?.toLocaleString()}
      </Text>

      {/* PROTECCIÓN */}
      <Text style={{ fontSize: 12, color: '#666' }}>
        Pago protegido
      </Text>
    </TouchableOpacity>
  );
};