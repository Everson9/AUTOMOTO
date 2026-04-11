import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '../src/hooks/AuthProvider';
import { useAuthContext } from '../src/hooks/AuthProvider';
import { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isLoading: authLoading, isAutenticado } = useAuthContext();
  const [checkingMoto, setCheckingMoto] = useState(true);
  const [hasMoto, setHasMoto] = useState(false);

  useEffect(() => {
    if (!authLoading && isAutenticado && user) {
      const checkMoto = async () => {
        try {
          const { data, error } = await supabase
            .from('motos')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);

          setHasMoto((data?.count ?? 0) > 0);
        } catch (err) {
          console.error('Erro ao verificar motos:', err);
        } finally {
          setCheckingMoto(false);
        }
      };

      checkMoto();
    } else if (!isAutenticado) {
      // Usuário não está autenticado, não precisa checar moto
      setCheckingMoto(false);
    }
  }, [isAutenticado, user, authLoading]);

  // Mostrar tela vazia enquanto verifica o estado de autenticação e motos
  if (authLoading || checkingMoto) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {!isAutenticado ? (
          // Rotas não autenticadas
          <>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="cadastro" options={{ headerShown: false }} />
          </>
        ) : !hasMoto ? (
          // Usuário autenticado mas sem moto
          <Stack.Screen name="cadastrar-moto" options={{ headerShown: false }} />
        ) : (
          // Usuário autenticado com moto
          <>
            <Stack.Screen name="(tabs)" />
          </>
        )}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}