import { useSellStore } from '@/features/sell/store/useSellStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1F3A44';
const BG = '#F6F6F4';
const BORDER = '#E5E7EB';
const MUTED = '#6B7280';

const CATEGORY_GROUPS = [
  {
    key: 'mujer',
    label: 'Mujer',
    items: [
      'Tops',
      'Pantalones',
      'Vestidos',
      'Chaquetas',
      'Faldas',
      'Jeans',
      'Zapatillas',
      'Botas',
      'Sandalias',
      'Tacones',
      'Mocasines',
      'Bolsos',
    ],
  },
  {
    key: 'hombre',
    label: 'Hombre',
    items: [
      'Poleras',
      'Pantalones',
      'Jeans',
      'Chaquetas',
      'Zapatillas',
      'Botas',
      'Mocasines',
      'Camisas',
    ],
  },
  {
    key: 'electronica',
    label: 'Electrónica',
    items: ['Smartphones', 'Laptops', 'Audio', 'Cámaras', 'Tablets'],
  },
  {
    key: 'hogar',
    label: 'Hogar',
    items: ['Decoración', 'Lámparas', 'Textiles', 'Almacenaje'],
  },
];

export default function CategoryScreen() {
  const { category, subcategory, setField } = useSellStore();

  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return CATEGORY_GROUPS;

    return CATEGORY_GROUPS
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [query]);

  const currentGroup = CATEGORY_GROUPS.find(
    (g) => g.key === activeGroup
  );

  const pickSubcategory = (groupLabel: string, item: string) => {
    setField('category', groupLabel);
    setField('subcategory', item);
    setField('size', '');
    router.back();
  };

  const Radio = ({ active }: { active: boolean }) => (
    <View style={styles.radioOuter}>
      {active ? <View style={styles.radioInner} /> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        
        {/* HEADER */}
        <Pressable onPress={() => router.back()} style={styles.headerRow}>
          <Ionicons name="arrow-back" size={28} color="#111" />
          <Text style={styles.title}>Seleccionar categoría</Text>
        </Pressable>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Buscar categoría"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>

        {/* 👉 SUBCATEGORIES VIEW */}
        {currentGroup ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            
            <Pressable
              onPress={() => setActiveGroup(null)}
              style={styles.backToGroups}
            >
              <Text style={{ color: PRIMARY }}>← Volver</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>
              {currentGroup.label}
            </Text>

            {currentGroup.items.map((item) => {
              const active = subcategory === item;

              return (
                <Pressable
                  key={item}
                  onPress={() =>
                    pickSubcategory(currentGroup.label, item)
                  }
                  style={styles.row}
                >
                  <Text style={styles.rowText}>{item}</Text>
                  <Radio active={active} />
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* SUGERENCIAS */}
            <Text style={styles.sectionTitle}>Sugerencias</Text>

            {filteredGroups.slice(0, 2).map((group) => {
              const active = category === group.label;

              return (
                <Pressable
                  key={group.key}
                  onPress={() => setActiveGroup(group.key)}
                  style={styles.row}
                >
                  <Text style={styles.rowText}>{group.label}</Text>
                  <Radio active={active} />
                </Pressable>
              );
            })}

            <View style={styles.divider} />

            {/* RESTO */}
            <Text style={styles.sectionTitle}>Categorías</Text>

            {filteredGroups.slice(2).map((group) => {
              const selectedInGroup =
                category === group.label && subcategory
                  ? subcategory
                  : null;

              return (
                <Pressable
                  key={group.key}
                  onPress={() => setActiveGroup(group.key)}
                  style={styles.row}
                >
                  <View>
                    <Text style={styles.rowText}>{group.label}</Text>
                    {selectedInGroup && (
                      <Text style={styles.subText}>
                        {selectedInGroup}
                      </Text>
                    )}
                  </View>

                  <Ionicons name="chevron-forward" size={20} />
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
  safe: { flex: 1, backgroundColor: '#fff' },

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

  searchBox: {
    backgroundColor: BG,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 24,
  },

  searchInput: {
    fontSize: 16,
  },

  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 18,
  },

  row: {
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rowText: {
    fontSize: 18,
  },

  subText: {
    fontSize: 13,
    color: MUTED,
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 16,
  },

  backToGroups: {
    marginBottom: 16,
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