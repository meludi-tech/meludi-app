import { Text, View } from 'react-native';

export default function PublicHome() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
      }}
    >
      <Text>Feed público</Text>
    </View>
  );
}