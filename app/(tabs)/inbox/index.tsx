import { useChat } from '@/features/chat/hooks/useChat';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function InboxScreen() {
  const { threads, loading } = useChat();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!threads.length) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text>No tienes mensajes aún</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={threads}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/chat/${item.id}`)}
          style={{
            padding: 16,
            borderBottomWidth: 1,
            borderColor: '#eee',
          }}
        >
          <Text style={{ fontWeight: '600' }}>
            Conversación
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}