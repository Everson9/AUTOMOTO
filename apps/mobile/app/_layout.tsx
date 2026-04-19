import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { AuthProvider } from '../src/hooks/AuthProvider';
import { useAuthContext } from '../src/hooks/AuthProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { user, isLoading, isAutenticado } = useAuthContext();

  useEffect(() => {
    if (isLoading) return;

    if (!isAutenticado || !user) {
      router.replace('/login');
    } else {
      router.replace('/(tabs)');
    }
  }, [isAutenticado, user, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' }}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="cadastrar-moto" />
      <Stack.Screen name="perfil" />
    </Stack>
  );
}