import { useSellStore } from '@/features/sell/store/useSellStore';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text } from 'react-native';

const categories = ['Mujer', 'Hombre', 'Niños', 'Hogar', 'Tecnología'];

export default function Category() {
  const { setField } = useSellStore();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
      {categories.map((c) => (
        <Pressable
          key={c}
          onPress={() => {
            setField('category', c);
            router.back();
          }}
          style={{ paddingVertical: 18 }}
        >
          <Text style={{ fontSize: 16 }}>{c}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}