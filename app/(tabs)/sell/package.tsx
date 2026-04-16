import { useSellStore } from '@/features/sell/store/useSellStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const options = {
  headerShown: false,
};

const PRIMARY = '#1F3A44';
const BG = '#F6F6F4';
const BORDER = '#E5E7EB';
const MUTED = '#6B7280';

const PACKAGE_OPTIONS = [
  {
    value: 'S' as const,
    title: 'Pequeño',
    description: 'Para artículos livianos o compactos.',
  },
  {
    value: 'M' as const,
    title: 'Mediano (recomendado)',
    description: 'Para prendas, zapatos o accesorios.',
  },
  {
    value: 'L' as const,
    title: 'Grande',
    description: 'Para artículos voluminosos.',
  },
];

export default function PackageScreen() {
  const { package_size, setField } = useSellStore();

  const handleSelect = (value: 'S' | 'M' | 'L') => {
    setField('package_size', value);
  };

  const handleSave = () => {
    if (!package_size) return;
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <Ionicons name="arrow-back" size={28} color="#111" />
          <Text style={styles.title}>Seleccionar tamaño del paquete</Text>
        </Pressable>

        <View style={styles.divider} />

        <View style={styles.optionsWrapper}>
          {PACKAGE_OPTIONS.map((item) => {
            const active = package_size === item.value;

            return (
              <Pressable
                key={item.value}
                onPress={() => handleSelect(item.value)}
                style={styles.optionCard}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                  <Text style={styles.optionDescription}>
                    {item.description}
                  </Text>
                </View>

                <View style={styles.radioOuter}>
                  {active ? <View style={styles.radioInner} /> : null}
                </View>
              </Pressable>
            );
          })}

          <Pressable style={styles.infoCard}>
            <Text style={styles.infoText}>Ver detalles de tamaños y cobertura</Text>
            <Ionicons name="search-outline" size={28} color="#111" />
          </Pressable>
        </View>

        <Pressable
          onPress={handleSave}
          disabled={!package_size}
          style={[
            styles.button,
            !package_size && { opacity: 0.5 },
          ]}
        >
          <Text style={styles.buttonText}>Agregar tamaño del paquete</Text>
        </Pressable>
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
    paddingBottom: 24,
  },

  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
    flex: 1,
  },

  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginTop: 26,
    marginBottom: 24,
  },

  optionsWrapper: {
    gap: 16,
  },

  optionCard: {
    backgroundColor: BG,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  optionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },

  optionDescription: {
    fontSize: 14,
    color: MUTED,
  },

  radioOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: PRIMARY,
  },

  infoCard: {
    backgroundColor: BG,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 26,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  infoText: {
    fontSize: 16,
    color: '#111',
    flex: 1,
    marginRight: 12,
  },

  button: {
    marginTop: 'auto',
    backgroundColor: PRIMARY,
    borderRadius: 28,
    paddingVertical: 22,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});