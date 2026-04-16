import { signOut } from '@/features/auth/api/signOut';
import { useAuthStore } from '@/stores/auth.store';
import { router } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, status } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('No pudimos cerrar sesión', error?.message || 'Intenta de nuevo.');
    }
  };

 if (!user) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            marginBottom: 12,
            textAlign: 'center',
            color: '#111827',
          }}
        >
          Perfil
        </Text>

        <Text
          style={{
            color: '#6B7280',
            marginBottom: 24,
            lineHeight: 22,
            textAlign: 'center',
          }}
        >
          Para entrar a tu perfil necesitas crear cuenta o iniciar sesión.
        </Text>

        <Pressable
          onPress={() => router.push('/(auth)/signup')}
          style={{
            backgroundColor: '#1F3A44',
            padding: 16,
            borderRadius: 16,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
            Crear cuenta
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(auth)/login')}
          style={{
            borderWidth: 1.5,
            borderColor: '#111827',
            padding: 16,
            borderRadius: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#111827', fontWeight: '600' }}>
            Iniciar sesión
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 32,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: '#111827',
            marginBottom: 8,
          }}
        >
          Perfil
        </Text>

        <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 24 }}>
          {user.email}
        </Text>

        <View
          style={{
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 18,
            padding: 18,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#111827',
              marginBottom: 8,
            }}
          >
            Estado de cuenta
          </Text>

          <Text style={{ color: '#6B7280' }}>
            {status === 'verified'
              ? 'Identidad verificada'
              : 'Tu identidad aún no está verificada'}
          </Text>
        </View>

        {status !== 'verified' && (
          <Pressable
            onPress={() => router.push('/verify')}
            style={{
              backgroundColor: '#1F3A44',
              height: 56,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
              Verificar identidad
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={() =>
            Alert.alert('Cerrar sesión', '¿Quieres salir de tu cuenta?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Salir', style: 'destructive', onPress: handleSignOut },
            ])
          }
          style={{
            height: 56,
            borderRadius: 18,
            borderWidth: 1.5,
            borderColor: '#111827',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#111827', fontSize: 16, fontWeight: '600' }}>
            Cerrar sesión
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}