import { Text, View } from 'react-native';

export default function PendingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>
        Pago pendiente ⏳
      </Text>

      <Text style={{ marginTop: 10 }}>
        Estamos procesando tu pago.
      </Text>
    </View>
  );
}