import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1F3A44';
const BG = '#F6F6F4';
const MUTED = '#6B7280';
const DANGER_BG = '#FDECEC';
const DANGER = '#B91C1C';

export default function CheckoutFailureScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="close" size={34} color="#fff" />
          </View>

          <Text style={styles.title}>No pudimos procesar el pago</Text>

          <Text style={styles.subtitle}>
            Hubo un problema al intentar confirmar tu compra. No se completó el pedido.
          </Text>

          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Qué puedes hacer</Text>
            <Text style={styles.errorText}>• Intentarlo nuevamente</Text>
            <Text style={styles.errorText}>• Revisar el método de pago</Text>
            <Text style={styles.errorText}>• Volver al producto</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable onPress={() => router.back()} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Intentar otra vez</Text>
          </Pressable>

          <Pressable onPress={() => router.replace('/')} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: DANGER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: MUTED,
    textAlign: 'center',
    marginBottom: 22,
    maxWidth: 320,
  },
  errorBox: {
    width: '100%',
    backgroundColor: DANGER_BG,
    borderRadius: 20,
    padding: 18,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  footer: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: BG,
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
});