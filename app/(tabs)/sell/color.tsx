import { useSellStore } from '@/features/sell/store/useSellStore';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';

export default function ColorScreen() {
  const { color, setField } = useSellStore();

  const [colors, setColors] = useState<any[]>([]);

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    const { data } = await supabase
      .from('colors')
      .select('*')
      .order('name');

    if (data) setColors(data);
  };

  const selectColor = (name: string) => {
    setField('color', name);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 20 }}>
          Colores
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {colors.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => selectColor(item.name)}
              style={{
                width: '30%',
                padding: 14,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text>{item.name}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}