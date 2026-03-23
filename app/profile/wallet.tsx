import { useWallet } from '@/features/wallet/hooks/useWallet';
import {
    ActivityIndicator,
    FlatList,
    Text,
    View,
} from 'react-native';

export default function WalletScreen() {
  const { transactions, held, available, loading } = useWallet();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>
        Wallet
      </Text>

      {/* SALDOS */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 16 }}>
          Disponible: ${available.toLocaleString()}
        </Text>

        <Text style={{ marginTop: 6, color: '#666' }}>
          Retenido: ${held.toLocaleString()}
        </Text>
      </View>

      {/* HISTORIAL */}
      <Text style={{ marginTop: 20, fontWeight: '600' }}>
        Movimientos
      </Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ marginTop: 10 }}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderColor: '#eee',
            }}
          >
            <Text style={{ fontWeight: '600' }}>
              ${Number(item.amount).toLocaleString()}
            </Text>

            <Text style={{ fontSize: 12, color: '#666' }}>
              {item.type} — {item.reason || 'Movimiento'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}