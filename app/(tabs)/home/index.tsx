import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1F3A44';
const BG = '#FFFFFF';
const SOFT = '#F3F4F6';
const TEXT = '#111827';
const MUTED = '#6B7280';

const SCREEN_WIDTH = Dimensions.get('window').width;
const H_PADDING = 20;
const GAP = 14;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - GAP) / 2;

const categories = ['Todo', 'Ropa', 'Zapatos', 'Accesorios', 'Tecnología'];

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState('Todo');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    loadFeed();
  }, []);

  // 🔥 FEED DESDE BACKEND INTELIGENTE
  const loadFeed = async () => {
    try {
      const { data, error } = await supabase
  .from('listings')
  .select(`
    id,
    title,
    price_clp,
    condition,
    brand,
    size,
    category,
    created_at,
    listing_photos ( url )
  `)
  .eq('status', 'ACTIVE')
  .order('created_at', { ascending: false })
  .limit(30);
  if (error) {
  console.log('Feed error:', error);
  setListings([]);
} else {
  const mapped = (data || []).map((item: any) => ({
    ...item,
    cover_photo_url: item.listing_photos?.[0]?.url || null,
  }));

  setListings(mapped);
}

      if (error) {
        console.log('Feed error:', error);
        setListings([]);
      } else {
        setListings(data || []);
      }
    } catch (err) {
      console.log('Unexpected error:', err);
      setListings([]);
    }

    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }, []);

  const filteredListings = useMemo(() => {
    if (activeCategory === 'Todo') return listings;

    return listings.filter(
      (item) =>
        item.category?.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [activeCategory, listings]);

  const renderHeader = () => (
    <View>
      {/* HEADER */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <View>
          <Text style={{ fontSize: 16, color: MUTED }}>Buen día 👋</Text>
          <Text style={{ fontSize: 24, fontWeight: '700', color: TEXT }}>
            Francisca
          </Text>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <Pressable
            onPress={() => router.push('/notifications')}
            style={{ marginRight: 16 }}
          >
            <Ionicons name="notifications-outline" size={26} />
          </Pressable>

          <Pressable onPress={() => router.push('/favorites')}>
            <Ionicons name="heart-outline" size={26} />
          </Pressable>
        </View>
      </View>

      {/* SEARCH */}
      <Pressable
        onPress={() => router.push('/(tabs)/search')}
        style={{
          backgroundColor: SOFT,
          borderRadius: 16,
          padding: 14,
          marginBottom: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: '#999' }}>Buscar en meludi</Text>
        <Ionicons name="options-outline" size={20} color={PRIMARY} />
      </Pressable>

      {/* TITLE */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '700' }}>Para ti</Text>
        <Text style={{ color: PRIMARY }}>See All</Text>
      </View>

      {/* CATEGORIES */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 20 }}
      >
        {categories.map((cat) => {
          const active = cat === activeCategory;

          return (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: PRIMARY,
                backgroundColor: active ? PRIMARY : BG,
                marginRight: 10,
              }}
            >
              <Text style={{ color: active ? BG : PRIMARY }}>{cat}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }: any) => {
    return (
      <Pressable
        onPress={() => router.push(`/product/${item.id}`)}
        style={{
          width: CARD_WIDTH,
        }}
      >
        {/* IMAGE */}
        <View
          style={{
            height: CARD_WIDTH * 1.1,
            backgroundColor: '#eee',
            borderRadius: 22,
            overflow: 'hidden',
            marginBottom: 10,
          }}
        >
          {item.cover_photo_url && (
            <Image
              source={{ uri: item.cover_photo_url }}
              style={{ width: '100%', height: '100%' }}
            />
          )}

          {/* HEART */}
          <Pressable
            onPress={() => router.push('/(auth)/signup')}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: '#fff',
              borderRadius: 999,
              padding: 6,
            }}
          >
            <Ionicons name="heart-outline" size={16} />
          </Pressable>
        </View>

        {/* TITLE */}
        <Text
          numberOfLines={1}
          style={{
            fontSize: 14,
            marginBottom: 6,
            fontWeight: '500',
          }}
        >
          {item.title}
        </Text>

        {/* BADGES */}
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 8,
          }}
        >
          {item.brand && <Badge label={item.brand} />}
          {item.size && <Badge label={item.size} />}
          {item.condition && <Badge label={item.condition} />}
        </View>

        {/* PRICE */}
        <Text style={{ fontSize: 18, fontWeight: '700' }}>
          ${Number(item.price_clp || 0).toLocaleString('es-CL')}
        </Text>

        <Text style={{ fontSize: 12, color: MUTED }}>
          $990 · Pago protegido
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredListings}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{
            paddingHorizontal: H_PADDING,
            paddingBottom: 40,
          }}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View
      style={{
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        marginRight: 6,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          fontSize: 11,
          color: '#374151',
        }}
      >
        {label}
      </Text>
    </View>
  );
}