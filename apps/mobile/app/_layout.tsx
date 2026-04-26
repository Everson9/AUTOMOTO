import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from '../src/hooks/AuthProvider';
import { useAuthContext } from '../src/hooks/AuthProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const ONBOARDING_KEY = 'onboarding_concluido';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutNav />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="cadastro" />
          <Stack.Screen name="cadastrar-moto" />
          <Stack.Screen name="perfil" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="garagem" />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { user, isLoading, isAutenticado } = useAuthContext();
  const [onboardingConcluido, setOnboardingConcluido] = useState<boolean | null>(null);

  // Verificar onboarding após autenticação confirmada
  useEffect(() => {
    if (isLoading) return;
    if (!isAutenticado || !user) return;

    const checkOnboarding = async () => {
      try {
        const concluido = await AsyncStorage.getItem(ONBOARDING_KEY);
        setOnboardingConcluido(concluido === 'true');
      } catch (error) {
        console.error('[RootLayoutNav] Erro ao verificar onboarding:', error);
        setOnboardingConcluido(false);
      }
    };

    checkOnboarding();
  }, [isLoading, isAutenticado, user]);

  // Loading state - mostrar spinner
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' }}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  // Não autenticado - redirecionar para login
  if (!isAutenticado || !user) {
    return <Redirect href="/login" />;
  }

  // Autenticado mas onboarding ainda não verificado - mostrar spinner
  if (onboardingConcluido === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' }}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  // Autenticado - redirecionar baseado no onboarding
  if (!onboardingConcluido) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
