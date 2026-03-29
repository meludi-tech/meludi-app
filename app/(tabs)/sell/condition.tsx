import { useSellStore } from '@/features/sell/store/useSellStore';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

const CONDITIONS = [
  'Nuevo con etiquetas',
  'Nuevo sin etiquetas',
  'Muy bueno',
  'Bueno',
  'Satisfactorio',
];

export default function ConditionScreen() {
  const { setField } = useSellStore();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 20 }}>
          Estado
        </Text>

        {CONDITIONS.map((c) => (
          <Pressable
            key={c}
            onPress={() => {
              setField('condition', c);
              router.back();
            }}
            style={{
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#F3F4F6',
            }}
          >
            <Text style={{ fontSize: 16 }}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}