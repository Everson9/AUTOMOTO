import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { AuthProvider } from '../src/hooks/AuthProvider';
import { useAuthContext } from '../src/hooks/AuthProvider';
import { supabase } from '../src/lib/supabase';
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

    const redirect = async () => {
      if (!isAutenticado || !user) {
        router.replace('/login');
        return;
      }

      const { count } = await supabase
        .from('motos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      router.replace((count ?? 0) > 0 ? '/(tabs)' : '/cadastrar-moto');
    };

    redirect();
  }, [isAutenticado, user, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1A56DB" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="cadastrar-moto" />
    </Stack>
  );
}