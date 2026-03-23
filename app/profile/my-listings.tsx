import { ListingCard } from '@/components/listings/ListingCard';
import { useMyListings } from '@/features/sell/hooks/useMyListings';
import { router } from 'expo-router';
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function MyListingsScreen() {
  const { listings, loading } = useMyListings();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!listings.length) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          No tienes productos aún
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/sell')}
          style={{
            marginTop: 20,
            backgroundColor: '#000',
            padding: 12,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center' }}>
            Publicar producto
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 8 }}
        renderItem={({ item }) => <ListingCard listing={item} />}
      />
    </View>
  );
}