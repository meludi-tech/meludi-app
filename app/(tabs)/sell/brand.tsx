import { useSellStore } from '@/features/sell/store/useSellStore';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Brand = {
  id: string;
  name: string;
};

const PRIMARY = '#1F3A44';
const BG = '#F6F6F4';
const BORDER = '#E5E7EB';
const MUTED = '#6B7280';

export default function BrandScreen() {
  const { setField, brand_name } = useSellStore();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('brands')
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true })
      .limit(100);

    if (error) {
      console.log('BRANDS ERROR:', error);
      setBrands([]);
    } else {
      setBrands(data || []);
    }

    setLoading(false);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return brands.slice(0, 40);

    return brands
      .filter((b) => b.name.toLowerCase().includes(q))
      .slice(0, 40);
  }, [brands, query]);

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    return brands.some((b) => b.name.toLowerCase() === q);
  }, [brands, query]);

  const suggestions = useMemo(() => filtered.slice(0, 2), [filtered]);
  const restBrands = useMemo(() => filtered.slice(2), [filtered]);

  const selectBrand = (brand: Brand) => {
    setField('brand_id', brand.id);
    setField('brand_name', brand.name);
    router.back();
  };

  const useCustomBrand = () => {
    const value = query.trim();
    if (!value) return;

    setField('brand_id', null);
    setField('brand_name', value);
    router.back();
  };

  const Radio = ({ active }: { active: boolean }) => (
    <View style={styles.radioOuter}>
      {active ? <View style={styles.radioInner} /> : null}
    </View>
  );

  const BrandRow = ({
    label,
    active,
    onPress,
    showDivider = false,
    rightIcon,
  }: {
    label: string;
    active?: boolean;
    onPress: () => void;
    showDivider?: boolean;
    rightIcon?: React.ReactNode;
  }) => (
    <>
      <Pressable onPress={onPress} style={styles.row}>
        <Text style={styles.rowText}>{label}</Text>
        {rightIcon ?? <Radio active={!!active} />}
      </Pressable>
      {showDivider ? <View style={styles.divider} /> : null}
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.headerRow}>
          <Ionicons name="arrow-back" size={28} color="#111" />
          <Text style={styles.title}>Seleccionar marca</Text>
        </Pressable>

        <View style={styles.searchBox}>
          <TextInput
            placeholder="Buscar marca"
            placeholderTextColor="#111"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="words"
            style={styles.searchInput}
          />
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator />
          </View>
        ) : (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {query.trim().length > 0 && !exactMatch && (
              <View style={{ marginBottom: 18 }}>
                <BrandRow
                  label={`Usar "${query.trim()}"`}
                  onPress={useCustomBrand}
                  rightIcon={<Ionicons name="add" size={22} color="#111" />}
                />
              </View>
            )}

            {suggestions.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Sugerencias</Text>
                <View style={styles.sectionList}>
                  {suggestions.map((brand) => (
                    <BrandRow
                      key={brand.id}
                      label={brand.name}
                      active={brand.name === brand_name}
                      onPress={() => selectBrand(brand)}
                    />
                  ))}
                </View>
              </>
            )}

            {restBrands.length > 0 && (
              <>
                <View style={styles.dividerLarge} />
                <Text style={styles.sectionTitle}>Categorías</Text>
                <View style={styles.sectionList}>
                  {restBrands.map((brand, index) => (
                    <BrandRow
                      key={brand.id}
                      label={brand.name}
                      active={brand.name === brand_name}
                      onPress={() => selectBrand(brand)}
                      showDivider={index !== restBrands.length - 1}
                    />
                  ))}
                </View>
              </>
            )}

            {!filtered.length && query.trim().length === 0 && (
              <Text style={styles.emptyText}>No encontramos marcas.</Text>
            )}

            {!filtered.length && query.trim().length > 0 && exactMatch && (
              <Text style={styles.emptyText}>No encontramos más coincidencias.</Text>
            )}
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
    marginBottom: 22,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
    flex: 1,
  },

  searchBox: {
    backgroundColor: BG,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 28,
  },

  searchInput: {
    fontSize: 16,
    color: '#111',
  },

  loadingWrap: {
    paddingTop: 40,
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
    marginBottom: 18,
  },

  sectionList: {
    marginBottom: 8,
  },

  row: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  rowText: {
    fontSize: 18,
    color: '#111',
    flex: 1,
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
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

  divider: {
    height: 1,
    backgroundColor: BORDER,
  },

  dividerLarge: {
    height: 1,
    backgroundColor: BORDER,
    marginBottom: 18,
  },

  emptyText: {
    paddingTop: 12,
    color: MUTED,
    fontSize: 15,
  },
});