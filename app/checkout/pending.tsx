import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1F3A44';
const BG = '#F6F6F4';
const MUTED = '#6B7280';

export default function CheckoutPendingScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="time-outline" size={34} color="#fff" />
          </View>

          <Text style={styles.title}>Pago pendiente</Text>

          <Text style={styles.subtitle}>
            Estamos esperando confirmación del pago. Te avisaremos cuando cambie el estado.
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Qué puedes hacer ahora</Text>
            <Text style={styles.infoText}>• Revisar el chat del pedido</Text>
            <Text style={styles.infoText}>• Volver al inicio y seguir navegando</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable onPress={() => router.replace('/')} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Volver al inicio</Text>
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
    backgroundColor: PRIMARY,
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
  infoBox: {
    width: '100%',
    backgroundColor: BG,
    borderRadius: 20,
    padding: 18,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  infoText: {
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
});