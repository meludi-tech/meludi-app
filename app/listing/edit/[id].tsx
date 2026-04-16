import { useEditListing } from '@/features/sell/hooks/useEditListing';
import { supabase } from '@/lib/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { handleUpdate, handleDelete } = useEditListing();

  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<any[]>([]);
  const [brandQuery, setBrandQuery] = useState('');
  const [showBrandSearch, setShowBrandSearch] = useState(false);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [brandId, setBrandId] = useState<string | null>(null);
  const [brandName, setBrandName] = useState('');
  const [size, setSize] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      const { data: brandData } = await supabase
        .from('brands')
        .select('id, name')
        .eq('is_active', true)
        .order('name', { ascending: true })
        .limit(500);

      setBrands(brandData || []);

      if (data) {
        setTitle(data.title || '');
        setPrice(String(data.price_clp || ''));
        setBrandId(data.brand_id || null);
        setBrandName(data.brand || '');
        setSize(data.size || '');
        setCondition(data.condition || '');
        setDescription(data.description || '');
      }

      setLoading(false);
    };

    fetch();
  }, [id]);

  const filteredBrands = useMemo(() => {
    if (!brandQuery.trim()) return brands.slice(0, 30);

    return brands
      .filter((b) =>
        b.name.toLowerCase().includes(brandQuery.toLowerCase())
      )
      .slice(0, 30);
  }, [brands, brandQuery]);

  const onSave = async () => {
    try {
      await handleUpdate(id, {
        title,
        price_clp: Number(price),
        brand_id: brandId,
        brand: brandName,
        size,
        condition,
        description,
      });

      Alert.alert('Actualizado ✅');
      router.back();
    } catch (e) {
      console.log('EDIT LISTING ERROR:', e);
      Alert.alert('Error al actualizar');
    }
  };

  const onDelete = async () => {
    Alert.alert('Eliminar producto', '¿Seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await handleDelete(id);
          router.replace('/profile/my-listings');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 16 }}>
        Editar producto
      </Text>

      <Input label="Título" value={title} onChange={setTitle} />
      <Input
        label="Precio"
        value={price}
        onChange={(v: string) => setPrice(v.replace(/[^0-9]/g, ''))}
      />

      <Text style={{ marginBottom: 6 }}>Marca</Text>
      <Pressable
        onPress={() => setShowBrandSearch(!showBrandSearch)}
        style={inputBox}
      >
        <Text>{brandName || 'Seleccionar marca'}</Text>
      </Pressable>

      {showBrandSearch && (
        <View style={{ marginBottom: 16 }}>
          <TextInput
            placeholder="Buscar marca"
            value={brandQuery}
            onChangeText={setBrandQuery}
            style={inputBox}
          />

          {filteredBrands.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => {
                setBrandId(b.id);
                setBrandName(b.name);
                setBrandQuery('');
                setShowBrandSearch(false);
              }}
              style={{ paddingVertical: 10 }}
            >
              <Text>{b.name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Input label="Talla" value={size} onChange={setSize} />
      <Input label="Estado" value={condition} onChange={setCondition} />
      <Input
        label="Descripción"
        value={description}
        onChange={setDescription}
        multiline
      />

      <TouchableOpacity
        onPress={onSave}
        style={{
          marginTop: 20,
          backgroundColor: '#000',
          padding: 14,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          Guardar cambios
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onDelete}
        style={{
          marginTop: 12,
          backgroundColor: 'red',
          padding: 14,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          Eliminar producto
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const Input = ({
  label,
  value,
  onChange,
  multiline = false,
}: any) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ marginBottom: 4 }}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      style={{
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        minHeight: multiline ? 100 : 44,
        textAlignVertical: multiline ? 'top' : 'center',
      }}
    />
  </View>
);

const inputBox = {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  padding: 10,
  marginBottom: 12,
};