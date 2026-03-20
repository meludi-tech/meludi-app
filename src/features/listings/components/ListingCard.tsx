import { toggleFavorite } from '@/features/favorites/api/toggleFavorite';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Listing } from '../hooks/useFeedListings';

export default function ListingCard({ item }: { item: Listing }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const image = item.photos?.[0]?.url;

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserId(user.id);

      const { data } = await supabase
        .from('listing_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('listing_id', item.id)
        .single();

      if (data) setLiked(true);
    };

    load();
  }, []);

  const handleLike = async () => {
    if (!userId) {
      router.push('/(auth)/signup');
      return;
    }

    await toggleFavorite({
      userId,
      listingId: item.id,
      isLiked: liked,
    });

    setLiked(!liked);
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/product/${item.id}`)}
      style={{ flex: 1, marginBottom: 20 }}
    >
      <View
        style={{
          backgroundColor: '#f2f2f2',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {image && (
          <Image
            source={{ uri: image }}
            style={{ width: '100%', height: 180 }}
            resizeMode="cover"
          />
        )}

        {/* ❤️ */}
        <TouchableOpacity
          onPress={handleLike}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: '#fff',
            borderRadius: 999,
            padding: 6,
          }}
        >
          <Text>{liked ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ marginTop: 8, fontWeight: '500' }}>
        {item.title}
      </Text>

      <Text style={{ fontSize: 16, fontWeight: '700', marginTop: 4 }}>
        ${item.price.toLocaleString()}
      </Text>

      <Text style={{ color: '#777', fontSize: 12, marginTop: 2 }}>
        Pago protegido
      </Text>
    </TouchableOpacity>
  );
}