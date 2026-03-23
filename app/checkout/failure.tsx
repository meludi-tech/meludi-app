import { Text, View } from 'react-native';

export default function FailureScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>
        Pago fallido ❌
      </Text>

      <Text style={{ marginTop: 10 }}>
        Hubo un problema con el pago.
      </Text>
    </View>
  );
}