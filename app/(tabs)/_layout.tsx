import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1F3A44",
        tabBarInactiveTintColor: "#9CA3AF",

        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",

          height: 60 + insets.bottom, // 👈 clave
          paddingBottom: insets.bottom, // 👈 clave
          paddingTop: 6,
        },

        tabBarLabelStyle: {
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search/index"
        options={{
          title: "Buscar",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search-outline" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="sell"
        options={{
          title: "Vender",
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle-outline" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="inbox/index"
        options={{
          title: "Mensajes",
          tabBarIcon: ({ color }) => (
            <Ionicons name="mail-outline" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}