import { useSellStore } from '@/features/sell/store/useSellStore';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1F3A44';
const BG = '#F6F6F4';
const MUTED = '#6B7280';

type ColorRow = {
  id: string;
  name: string;
};

export default function ColorScreen() {
  const { color = [], setField } = useSellStore();

  const [colors, setColors] = useState<ColorRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadColors();
  }, []);

  const loadColors = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('colors')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      console.log('COLORS ERROR:', error);
      setColors([]);
    } else {
      setColors(data || []);
    }

    setLoading(false);
  };

  const selectColor = (name: string) => {
    // 🔥 single select (como diseño)
    setField('color', [name]);
  };

  const Radio = ({ active }: { active: boolean }) => (
    <View style={styles.radioOuter}>
      {active ? <View style={styles.radioInner} /> : null}
    </View>
  );

  const suggestions = colors.slice(0, 2);
  const rest = colors.slice(2);

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>

        {/* HEADER */}
        <Pressable onPress={() => router.back()} style={styles.headerRow}>
          <Ionicons name="arrow-back" size={28} color="#111" />
          <Text style={styles.title}>Seleccionar colores</Text>
        </Pressable>

        {loading ? (
          <View style={{ paddingTop: 40, alignItems: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* SUGERENCIAS */}
            {suggestions.length > 0 && (
              <>
                <Text style={styles.section}>Sugerencias</Text>

                {suggestions.map((item) => {
                  const active = color.includes(item.name);

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => selectColor(item.name)}
                      style={styles.row}
                    >
                      <Text style={styles.rowText}>{item.name}</Text>
                      <Radio active={active} />
                    </Pressable>
                  );
                })}
              </>
            )}

            {/* DIVIDER */}
            <View style={styles.divider} />

            {/* RESTO */}
            <Text style={styles.section}>Categorías</Text>

            {rest.map((item) => {
              const active = color.includes(item.name);

              return (
                <Pressable
                  key={item.id}
                  onPress={() => selectColor(item.name)}
                  style={styles.row}
                >
                  <Text style={styles.rowText}>{item.name}</Text>
                  <Radio active={active} />
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    flex: 1,
  },

  section: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 10,
  },

  row: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rowText: {
    fontSize: 16,
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
  },
});