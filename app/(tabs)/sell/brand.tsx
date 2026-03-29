import { useSellStore } from '@/features/sell/store/useSellStore';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function BrandScreen() {
  const { brand, setField } = useSellStore();

  const [brands, setBrands] = useState<any[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    const { data } = await supabase
      .from('brands')
      .select('*')
      .order('name');

    if (data) setBrands(data);
  };

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(query.toLowerCase())
  );

  const selectBrand = (name: string) => {
    setField('brand', name);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 20 }}>
          Marca
        </Text>

        {/* SEARCH */}
        <TextInput
          placeholder="Buscar marcas"
          value={query}
          onChangeText={setQuery}
          style={{
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 12,
            padding: 14,
            marginBottom: 20,
          }}
        />

        {filtered.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => selectBrand(item.name)}
            style={{
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#F3F4F6',
            }}
          >
            <Text style={{ fontSize: 16 }}>{item.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}