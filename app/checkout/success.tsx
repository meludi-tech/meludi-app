import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1F3A44';
const BG = '#F6F6F4';
const MUTED = '#6B7280';

type SuccessParams = {
  orderId?: string;
  conversationId?: string;
  listingId?: string;
};

export default function CheckoutSuccessScreen() {
  const { orderId, conversationId } = useLocalSearchParams<SuccessParams>();

  const handleGoToChat = () => {
    if (!conversationId) {
      router.replace('/');
      return;
    }

    router.replace(`/chat/${conversationId}`);
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark" size={34} color="#fff" />
          </View>

          <Text style={styles.title}>Compra confirmada</Text>

          <Text style={styles.subtitle}>
            Tu pedido ya fue creado y quedó conectado al chat con el vendedor.
          </Text>

          {orderId ? (
            <View style={styles.orderBox}>
              <Text style={styles.orderLabel}>Orden</Text>
              <Text style={styles.orderValue}>#{orderId.slice(0, 8).toUpperCase()}</Text>
            </View>
          ) : null}

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={PRIMARY} />
              <Text style={styles.infoText}>
                Desde el chat podrás seguir el estado del pedido.
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark-outline" size={18} color={PRIMARY} />
              <Text style={styles.infoText}>
                El pago queda protegido hasta confirmar entrega.
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color={PRIMARY} />
              <Text style={styles.infoText}>
                Cuando el vendedor prepare el envío, verás la actualización en tiempo real.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable onPress={handleGoToChat} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Ir al chat</Text>
          </Pressable>

          <Pressable onPress={handleGoHome} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
          </Pressable>
        </View>
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

  orderBox: {
    backgroundColor: BG,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 20,
    alignItems: 'center',
  },

  orderLabel: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 4,
  },

  orderValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },

  infoBox: {
    width: '100%',
    backgroundColor: BG,
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
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
    backgroundColor: '#F3F4F6',
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