import { useCreateListing } from '@/features/sell/hooks/useCreateListing';
import { ProtectedAction } from '@/navigation/ProtectedAction';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SellScreen() {
  const { handleCreateListing } = useCreateListing();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);

      const listing = await handleCreateListing({
        title,
        description,
        price_clp: Number(price),
        brand,
        size,
        condition,
        cover_photo_url:
          'https://via.placeholder.com/400x400.png?text=Producto',
      });

      Alert.alert('Publicado 🎉');

      // 👉 ir al producto recién creado
      router.push(`/product/${listing.id}`);
    } catch (e) {
      console.log(e);
      Alert.alert('Error al publicar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 16 }}>
        Vender
      </Text>

      <Input label="Título" value={title} onChange={setTitle} />
      <Input label="Precio" value={price} onChange={setPrice} keyboardType="numeric" />
      <Input label="Marca" value={brand} onChange={setBrand} />
      <Input label="Talla" value={size} onChange={setSize} />
      <Input label="Estado" value={condition} onChange={setCondition} />

      <Input
        label="Descripción"
        value={description}
        onChange={setDescription}
        multiline
      />

      <ProtectedAction onPress={onSubmit}>
        {(handlePress) => (
          <TouchableOpacity
            onPress={handlePress}
            style={{
              marginTop: 20,
              backgroundColor: '#000',
              padding: 14,
              borderRadius: 10,
            }}
            disabled={loading}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>
              {loading ? 'Publicando...' : 'Publicar'}
            </Text>
          </TouchableOpacity>
        )}
      </ProtectedAction>
    </ScrollView>
  );
}

const Input = ({
  label,
  value,
  onChange,
  multiline = false,
  keyboardType = 'default',
}: any) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ marginBottom: 4 }}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      keyboardType={keyboardType}
      style={{
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
      }}
    />
  </View>
);