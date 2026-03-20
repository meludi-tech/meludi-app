import { Listing } from '@/features/listings/types';
import { ProtectedAction } from '@/navigation/ProtectedAction';
import { Image, Pressable, Text, View } from 'react-native';

export const ListingCard = ({
  listing,
  onPress,
}: {
  listing: Listing;
  onPress: () => void;
}) => {
  const image = listing.photos?.[0]?.url;

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        marginBottom: 16,
      }}
    >
      <View
        style={{
          borderRadius: 16,
          backgroundColor: '#f5f5f5',
          overflow: 'hidden',
        }}
      >
        {image && (
          <Image
            source={{ uri: image }}
            style={{ width: '100%', height: 160 }}
            resizeMode="cover"
          />
        )}

        {/* ❤️ Like */}
        <ProtectedAction onPress={() => {}}>
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#fff',
              borderRadius: 20,
              padding: 6,
            }}
          >
            <Text>♡</Text>
          </View>
        </ProtectedAction>
      </View>

      <Text style={{ marginTop: 8, fontWeight: '500' }}>
        {listing.title}
      </Text>

      <Text style={{ fontSize: 12, color: '#666' }}>
        {listing.brand} · {listing.size} · {listing.condition}
      </Text>

      <Text style={{ fontSize: 16, fontWeight: '700', marginTop: 4 }}>
        ${listing.price_clp.toLocaleString('es-CL')}
      </Text>

      <Text style={{ fontSize: 12, color: '#888' }}>
        + Pago protegido
      </Text>
    </Pressable>
  );
};