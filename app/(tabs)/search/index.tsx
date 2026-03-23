import { ListingCard } from '@/components/listings/ListingCard';
import { useSearch } from '@/features/search/hooks/useSearch';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SearchScreen() {
  const { results, loading, search } = useSearch();

  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const onSearch = () => {
    search({
      query,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      {/* INPUT BUSQUEDA */}
      <TextInput
        placeholder="Buscar productos"
        value={query}
        onChangeText={setQuery}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 10,
          padding: 10,
          marginBottom: 10,
        }}
      />

      {/* FILTROS */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          placeholder="Min $"
          value={minPrice}
          onChangeText={setMinPrice}
          keyboardType="numeric"
          style={inputSmall}
        />

        <TextInput
          placeholder="Max $"
          value={maxPrice}
          onChangeText={setMaxPrice}
          keyboardType="numeric"
          style={inputSmall}
        />
      </View>

      {/* BOTON */}
      <TouchableOpacity
        onPress={onSearch}
        style={{
          backgroundColor: '#000',
          padding: 12,
          borderRadius: 10,
          marginTop: 10,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          Buscar
        </Text>
      </TouchableOpacity>

      {/* RESULTADOS */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ marginTop: 12 }}
          renderItem={({ item }) => (
            <ListingCard listing={item} />
          )}
        />
      )}
    </View>
  );
}

const inputSmall = {
  flex: 1,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  padding: 10,
};