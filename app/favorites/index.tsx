import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1F3A44';
const categories = ['Todo', 'Ropa', 'Zapatos', 'Accesorios'];

const mockFavorites = [
  { id: '1', title: 'Zapatillas Samba', price: '$45.000' },
  { id: '2', title: 'Zapatillas Samba', price: '$45.000' },
  { id: '3', title: 'Zapatillas Samba', price: '$45.000' },
  { id: '4', title: 'Zapatillas Samba', price: '$45.000' },
];

export default function FavoritesScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <FlatList
        data={mockFavorites}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 14 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 }}
        ListHeaderComponent={
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <Pressable onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#111827" />
              </Pressable>

              <Text style={{ flex: 1, marginLeft: 14, fontSize: 28, fontWeight: '700', color: '#111827' }}>
                Mis Favoritos
              </Text>

              <Ionicons name="search-outline" size={24} color="#111827" />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 18 }}
            >
              {categories.map((category, index) => {
                const isActive = index === 0;

                return (
                  <View
                    key={category}
                    style={{
                      height: 40,
                      paddingHorizontal: 14,
                      borderRadius: 999,
                      borderWidth: 1.5,
                      borderColor: PRIMARY,
                      backgroundColor: isActive ? PRIMARY : '#FFFFFF',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ color: isActive ? '#FFFFFF' : PRIMARY, fontSize: 14 }}>
                      {category}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/product/${item.id}`)} style={{ flex: 1, marginBottom: 22 }}>
            <View
              style={{
                backgroundColor: '#F5F5F5',
                borderRadius: 18,
                height: 170,
                marginBottom: 10,
                position: 'relative',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="heart-outline" size={16} color="#111827" />
              </View>
            </View>

            <Text style={{ fontSize: 13, color: '#111827', marginBottom: 4 }}>{item.title}</Text>
            <View
              style={{
                alignSelf: 'flex-start',
                borderRadius: 999,
                backgroundColor: '#8CA0A8',
                paddingHorizontal: 8,
                paddingVertical: 3,
                marginBottom: 6,
              }}
            >
              <Text style={{ fontSize: 10, color: '#FFFFFF' }}>adidas · 39 · Muy bueno</Text>
            </View>

            <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 2 }}>
              {item.price}
            </Text>

            <Text style={{ fontSize: 11, color: '#6B7280' }}>$47.990 + Pago protegido</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}