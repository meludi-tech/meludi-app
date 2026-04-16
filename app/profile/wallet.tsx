import { useWallet } from '@/features/wallet/hooks/useWallet';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function WalletScreen() {
  const { transactions, held, available, loading } = useWallet();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>Tu dinero</Text>

      {/* SALDOS */}
      <View style={styles.balanceBox}>
        <Text style={styles.availableLabel}>Disponible</Text>
        <Text style={styles.availableAmount}>
          ${available.toLocaleString()}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.heldLabel}>En protección</Text>
        <Text style={styles.heldAmount}>
          ${held.toLocaleString()}
        </Text>

        <Text style={styles.info}>
          Este dinero se libera automáticamente 48h después de la entrega.
        </Text>
      </View>

      {/* HISTORIAL */}
      <Text style={styles.sectionTitle}>Movimientos</Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ marginTop: 10 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Aún no tienes movimientos
          </Text>
        }
        renderItem={({ item }) => {
          const isPositive = Number(item.amount) > 0;

          return (
            <View style={styles.item}>
              <View>
                <Text style={styles.itemTitle}>
                  {item.reason || 'Movimiento'}
                </Text>

                <Text style={styles.itemSubtitle}>
                  {item.type}
                </Text>
              </View>

              <Text
                style={[
                  styles.amount,
                  { color: isPositive ? '#0A7F5A' : '#111' },
                ]}
              >
                {isPositive ? '+' : ''}
                ${Number(item.amount).toLocaleString()}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
  },

  balanceBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F6F6F4',
    borderRadius: 14,
  },

  availableLabel: {
    fontSize: 14,
    color: '#666',
  },

  availableAmount: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 14,
  },

  heldLabel: {
    fontSize: 14,
    color: '#666',
  },

  heldAmount: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },

  info: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },

  sectionTitle: {
    marginTop: 24,
    fontWeight: '600',
    fontSize: 16,
  },

  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  itemTitle: {
    fontWeight: '500',
  },

  itemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  amount: {
    fontWeight: '600',
  },

  empty: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  },
});