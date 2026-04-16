import { CONDITION_OPTIONS } from '@/features/sell/config/sellOptions';
import { useSellStore } from '@/features/sell/store/useSellStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
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

export default function ConditionScreen() {
  const { condition, setField } = useSellStore();

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
          <Text style={styles.title}>Seleccionar estado</Text>
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false}>

          {CONDITION_OPTIONS.map((item) => {
            const active = condition === item.label;

            return (
              <Pressable
                key={item.label}
                onPress={() => {
                  setField('condition', item.label);
                  router.back();
                }}
                style={styles.card}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.label,
                      active && { color: PRIMARY },
                    ]}
                  >
                    {item.label}
                  </Text>

                  <Text style={styles.description}>
                    {item.description}
                  </Text>
                </View>

                <Radio active={active} />
              </Pressable>
            );
          })}
        </ScrollView>
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

  card: {
    backgroundColor: BG,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },

  description: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 18,
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