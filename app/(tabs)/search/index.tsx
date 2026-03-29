import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const categories = [
  "Mujer",
  "Hombre",
  "Moda de diseño",
  "Niños",
  "Hogar",
  "Electrónica",
  "Entretenimiento",
  "Hobbies y coleccionismo",
  "Deportes",
];

export default function SearchScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F1E22" }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#0A1417",
            borderRadius: 14,
            paddingHorizontal: 14,
            height: 52,
            marginBottom: 18,
          }}
        >
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Busca artículos o miembros"
            placeholderTextColor="#9CA3AF"
            style={{
              flex: 1,
              marginLeft: 10,
              color: "#FFFFFF",
              fontSize: 16,
            }}
          />
          <Ionicons name="camera-outline" size={20} color="#6E8A94" />
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            rowGap: 12,
          }}
        >
          {categories.map((category) => (
            <Pressable
              key={category}
              style={{
                width: "48.5%",
                minHeight: 96,
                backgroundColor: "#0A1417",
                borderRadius: 16,
                padding: 16,
                justifyContent: "flex-start",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 17,
                  fontWeight: "600",
                  lineHeight: 22,
                }}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}