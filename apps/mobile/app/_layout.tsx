import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, Stack } from 'expo-router';
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
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { user, isLoading, isAutenticado } = useAuthContext();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingConcluido, setOnboardingConcluido] = useState(false);

  // Verificar onboarding apenas após autenticação confirmada
  useEffect(() => {
    if (isLoading) return;

    if (!isAutenticado || !user) {
      router.replace('/login');
      return;
    }

    // Usuário autenticado - verificar se já viu o onboarding
    const checkOnboarding = async () => {
      try {
        const concluido = await AsyncStorage.getItem(ONBOARDING_KEY);
        setOnboardingConcluido(concluido === 'true');
        setOnboardingChecked(true);
      } catch (error) {
        console.error('[RootLayoutNav] Erro ao verificar onboarding:', error);
        setOnboardingConcluido(false);
        setOnboardingChecked(true);
      }
    };

    checkOnboarding();
  }, [isAutenticado, user, isLoading]);

  // Navegar após verificar onboarding
  useEffect(() => {
    if (!onboardingChecked) return;

    if (onboardingConcluido) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
  }, [onboardingChecked, onboardingConcluido]);

  if (isLoading || !onboardingChecked) {
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
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}