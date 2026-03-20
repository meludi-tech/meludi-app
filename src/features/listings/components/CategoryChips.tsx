import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

const categories = ['Todo', 'Ropa', 'Zapatos', 'Accesorios'];

export default function CategoryChips({
  onChange,
}: {
  onChange: (category: string) => void;
}) {
  const [active, setActive] = useState('Todo');

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {categories.map((cat) => {
        const isActive = cat === active;

        return (
          <TouchableOpacity
            key={cat}
            onPress={() => {
              setActive(cat);
              onChange(cat);
            }}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: '#1F3A44',
              backgroundColor: isActive ? '#1F3A44' : '#fff',
              marginRight: 10,
            }}
          >
            <Text
              style={{
                color: isActive ? '#fff' : '#1F3A44',
                fontWeight: '500',
              }}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}