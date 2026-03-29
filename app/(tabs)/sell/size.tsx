import { useSellStore } from '@/features/sell/store/useSellStore';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

const CLOTHING = ['XS', 'S', 'M', 'L', 'XL'];
const SHOES = ['36', '37', '38', '39', '40', '41', '42', '43'];

export default function SizeScreen() {
  const { size, setField, category } = useSellStore();

  const sizes = category === 'Calzado' ? SHOES : CLOTHING;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 20 }}>
          Talla
        </Text>

        {sizes.map((s) => (
          <Pressable
            key={s}
            onPress={() => {
              setField('size', s);
              router.back();
            }}
            style={{
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#F3F4F6',
            }}
          >
            <Text style={{ fontSize: 16 }}>{s}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}