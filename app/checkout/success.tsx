import { Text, View } from 'react-native';

export default function SuccessScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>
        Pago exitoso 🎉
      </Text>

      <Text style={{ marginTop: 10 }}>
        Tu compra fue procesada correctamente.
      </Text>
    </View>
  );
}