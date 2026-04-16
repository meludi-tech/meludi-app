import {
  createListing,
  uploadListingImages,
} from '@/features/sell/api/createListing';
import { useSellStore } from '@/features/sell/store/useSellStore';
import { useAuthStore } from '@/stores/auth.store';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
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

export const options = {
  headerShown: false,
};

const PRIMARY = '#1F3A44';
const BG = '#F6F6F4';
const MUTED = '#6B7280';

export default function SellScreen() {
  const { user, status } = useAuthStore();

  const {
    title,
    description,
    price,
    subcategory,
    brand_id,
    brand_name,
    size,
    condition,
    color,
    images,
    package_size, // ✅ FIX
    setField,
    addImages,
    removeImage,
    reset,
  } = useSellStore();

  const [loading, setLoading] = useState(false);

  const earnings = useMemo(() => {
    const p = Number(price || 0);
    if (!p) return 0;
    const fee = p >= 300000 ? 0.1 : 0.09;
    return Math.floor(p * (1 - fee));
  }, [price]);

  const feeAmount = useMemo(() => {
    const p = Number(price || 0);
    if (!p) return 0;
    const fee = p >= 300000 ? 0.1 : 0.09;
    return Math.floor(p * fee);
  }, [price]);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permiso requerido');

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 10,
    });

    if (!result.canceled) {
      addImages(result.assets.map((a) => a.uri));
    }
  };

  const handlePublish = async () => {
    if (!user) return router.push('/(auth)/signup');

    if (status !== 'verified') {
      return Alert.alert('Necesitas verificar tu identidad');
    }

    if (!title.trim()) return Alert.alert('Falta título');
    if (!brand_id && !brand_name) return Alert.alert('Selecciona marca');
    if (!size) return Alert.alert('Selecciona talla');
    if (!condition) return Alert.alert('Selecciona estado');
    if (!package_size) return Alert.alert('Selecciona tamaño del paquete'); // ✅ FIX
    if (!price || Number(price) <= 0) return Alert.alert('Precio inválido');
    if (images.length < 4) return Alert.alert('Mínimo 4 fotos');

    try {
      setLoading(true);

      const listing = await createListing(
        {
          title,
          description,
          price,
          subcategory,
          brand_id,
          brand_name,
          size,
          condition,
          color,
          package_size, // ✅ FIX
        },
        user.id
      );

      await uploadListingImages(images, listing.id);

      Alert.alert('Publicado 🚀');
      reset();
      router.replace('/');
    } catch (e) {
      console.log(e);
      Alert.alert('Error al publicar');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX LABEL
  const packageLabel =
    package_size === 'S'
      ? 'Pequeño'
      : package_size === 'M'
      ? 'Mediano'
      : package_size === 'L'
      ? 'Grande'
      : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>

        <Text style={{ fontSize: 26, fontWeight: '700', marginBottom: 20 }}>
          Publicar producto
        </Text>

        {/* FOTOS */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.label}>Fotos</Text>

          <Pressable onPress={pickImages} style={styles.photoButton}>
            <Text style={{ color: '#fff', fontSize: 20 }}>＋</Text>
          </Pressable>

          <Text style={styles.helper}>
            Sube imágenes claras y bien iluminadas.
          </Text>
          <Text style={styles.helper}>
            Puedes subir hasta 8 imágenes.
          </Text>

          <ScrollView horizontal style={{ marginTop: 12 }}>
            {images.map((uri: string, i: number) => (
              <View key={uri + i} style={{ marginRight: 10 }}>
                <Image source={{ uri }} style={styles.image} />
                <Pressable onPress={() => removeImage(uri)} style={styles.remove}>
                  <Text style={{ color: '#fff' }}>×</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>

        <Input
          label="Título"
          placeholder="Ej: Blazer Zara beige talla M"
          value={title}
          onChange={(v: string) => setField('title', v)}
        />

        <Input
          label="Descripción"
          placeholder="Detalla estado, uso y cualquier información relevante."
          value={description}
          multiline
          onChange={(v: string) => setField('description', v)}
        />

        <SelectRow label="Categoría" value={subcategory} onPress={() => router.push('/(tabs)/sell/category')} />
        <SelectRow label="Marca" value={brand_name} onPress={() => router.push('/(tabs)/sell/brand')} />
        <SelectRow label="Talla" value={size} onPress={() => router.push('/(tabs)/sell/size')} />

        <SelectRow
          label="Estado"
          value={condition}
          subtitle="Selecciona el estado del producto"
          onPress={() => router.push('/(tabs)/sell/condition')}
        />

        <SelectRow
          label="Colores"
          value={color?.[0]}
          onPress={() => router.push('/(tabs)/sell/color')}
        />

        <SelectRow
          label="Tamaño del paquete"
          value={packageLabel}
          subtitle="Para artículos livianos o compactos."
          onPress={() => router.push('/(tabs)/sell/package')}
        />

        <Input
          label="Precio"
          value={price}
          onChange={(v: string) => setField('price', v.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
        />

        {!!price && (
          <View style={styles.summary}>
            <Row label="Precio del producto" value={price} />
            <Row label="Gestión de venta protegida (8%)" value={-feeAmount} />
            <Row label="Total ganancia" value={earnings} bold />
          </View>
        )}

        <Pressable onPress={handlePublish} style={styles.button}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            {loading ? 'Publicando...' : 'Publicar producto'}
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

// COMPONENTES (sin cambios)
function Input({ label, value, onChange, placeholder, multiline, keyboardType }: any) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline={multiline}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

function SelectRow({ label, value, subtitle, onPress }: any) {
  return (
    <Pressable onPress={onPress} style={styles.selectCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.selectLabel}>{label}</Text>

        {value ? (
          <>
            <Text style={styles.selectValue}>{value}</Text>
            {subtitle && <Text style={styles.selectSub}>{subtitle}</Text>}
          </>
        ) : (
          <Text style={styles.placeholder}>Seleccionar</Text>
        )}
      </View>

      <View style={styles.radioOuter}>
        {value && <View style={styles.radioInner} />}
      </View>
    </Pressable>
  );
}

function Row({ label, value, bold }: any) {
  return (
    <View style={styles.row}>
      <Text style={{ color: MUTED }}>{label}</Text>
      <Text style={{ fontWeight: bold ? '700' : '400' }}>
        ${Number(value).toLocaleString('es-CL')}
      </Text>
    </View>
  );
}

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  label: { fontSize: 14, marginBottom: 6 },
  input: { backgroundColor: BG, borderRadius: 16, padding: 16 },
  helper: { fontSize: 12, color: MUTED, marginTop: 4 },
  image: { width: 90, height: 90, borderRadius: 12 },
  remove: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#111',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectCard: {
    backgroundColor: BG,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectLabel: { fontSize: 14, marginBottom: 4 },
  selectValue: { fontSize: 15, fontWeight: '500' },
  selectSub: { fontSize: 12, color: MUTED },
  placeholder: { color: '#9CA3AF' },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
  },
  photoButton: {
    width: 140,
    height: 50,
    borderRadius: 25,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    backgroundColor: BG,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  button: {
    backgroundColor: PRIMARY,
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },
});