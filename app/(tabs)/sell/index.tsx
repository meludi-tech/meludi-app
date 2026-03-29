import {
  createListing,
  uploadListingImages,
} from '@/features/sell/api/createListing';
import { useSellStore } from '@/features/sell/store/useSellStore';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SellScreen() {
  const {
    title,
    description,
    price,
    category,
    brand,
    size,
    condition,
    color, // ✅ NUEVO
    images,
    setField,
    addImages,
    reset,
  } = useSellStore();

  const [loading, setLoading] = useState(false);

  // 📸 PICK IMAGES
  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a: any) => a.uri);
      addImages(uris);
    }
  };

  // 🚀 PUBLICAR
  const handlePublish = async () => {
    if (!title || !price || images.length === 0) {
      Alert.alert('Completa título, precio y fotos');
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('No user');

      const listing = await createListing(
        {
          title,
          description,
          price,
          category,
          brand,
          size,
          condition,
          color, // ✅ NUEVO
        },
        user.id
      );

      await uploadListingImages(images, listing.id);

      Alert.alert('Publicado 🚀');

      reset();
      router.replace('/(tabs)/home');
    } catch (err) {
      console.log(err);
      Alert.alert('Error al publicar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 140,
        }}
      >
        {/* HEADER */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            marginBottom: 20,
          }}
        >
          Vender
        </Text>

        {/* 📸 FOTOS */}
        <Pressable
          onPress={pickImages}
          style={{
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 16,
            padding: 20,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 14 }}>+ Agregar fotos</Text>
        </Pressable>

        {/* PREVIEW */}
        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
          >
            {images.map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 12,
                  marginRight: 10,
                }}
              />
            ))}
          </ScrollView>
        )}

        {/* INPUTS */}
        <Input
          label="Título"
          value={title}
          placeholder="Ej: Chaqueta Zara negra"
          onChange={(v: string) => setField('title', v)}
        />

        <Select label="Categoría" value={category} route="/(tabs)/sell/category" />

        <Select label="Marca" value={brand} route="/(tabs)/sell/brand" />

        <Select label="Talla" value={size} route="/(tabs)/sell/size" />

        <Select label="Estado" value={condition} route="/(tabs)/sell/condition" />

        {/* 🎨 COLOR NUEVO */}
        <Select label="Color" value={color} route="/(tabs)/sell/color" />

        <Input
          label="Precio"
          value={price}
          placeholder="Ej: 25000"
          keyboard="numeric"
          onChange={(v: string) => setField('price', v)}
        />

        <Input
          label="Descripción"
          value={description}
          placeholder="Describe tu producto"
          multiline
          onChange={(v: string) => setField('description', v)}
        />

        {/* BOTÓN */}
        <Pressable
          onPress={handlePublish}
          style={{
            backgroundColor: '#1F3A44',
            padding: 18,
            borderRadius: 16,
            marginTop: 24,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            {loading ? 'Publicando...' : 'Publicar'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- COMPONENTES ---------------- */

function Input({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  keyboard,
}: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ marginBottom: 6 }}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline={multiline}
        keyboardType={keyboard}
        style={{
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 12,
          padding: 14,
          height: multiline ? 80 : 50,
        }}
      />
    </View>
  );
}

function Select({ label, value, route }: any) {
  return (
    <Pressable
      onPress={() => router.push(route)}
      style={{ marginBottom: 16 }}
    >
      <Text style={{ marginBottom: 6 }}>{label}</Text>

      <View
        style={{
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 12,
          padding: 14,
        }}
      >
        <Text style={{ color: value ? '#000' : '#9CA3AF' }}>
          {value || 'Seleccionar'}
        </Text>
      </View>
    </Pressable>
  );
}