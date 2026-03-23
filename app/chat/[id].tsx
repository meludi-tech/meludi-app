import { useChat } from '@/features/chat/hooks/useChat';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { messages, send } = useChat(id);

  const [text, setText] = useState('');

  const onSend = async () => {
    if (!text) return;
    await send(text);
    setText('');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* MENSAJES */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <Text>{item.text}</Text>
          </View>
        )}
      />

      {/* INPUT */}
      <View
        style={{
          flexDirection: 'row',
          padding: 10,
          borderTopWidth: 1,
          borderColor: '#eee',
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Escribe..."
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 10,
            padding: 10,
          }}
        />

        <TouchableOpacity
          onPress={onSend}
          style={{
            marginLeft: 8,
            backgroundColor: '#000',
            padding: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#fff' }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}