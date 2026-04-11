import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthContext } from '../../src/hooks/AuthProvider';
import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';

export default function ProtectedLayout() {
  const colorScheme = useColorScheme();
  const { user, isAutenticado } = useAuthContext();
  const [shouldRedirectToMoto, setShouldRedirectToMoto] = useState(false);
  const [checkingMoto, setCheckingMoto] = useState(true);

  useEffect(() => {
    if (isAutenticado && user) {
      const checkMoto = async () => {
        try {
          const { data, error } = await supabase
            .from('motos')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);

          const hasMoto = (data?.count ?? 0) > 0;
          setShouldRedirectToMoto(!hasMoto);
        } catch (err) {
          console.error('Erro ao verificar motos:', err);
        } finally {
          setCheckingMoto(false);
        }
      };

      checkMoto();
    } else {
      setCheckingMoto(false);
    }
  }, [isAutenticado, user]);

  // Ainda verificando se o usuário tem moto
  if (checkingMoto) {
    return null; // ou um componente de loading
  }

  // Se o usuário estiver autenticado mas não tiver moto, redireciona para cadastro
  if (isAutenticado && shouldRedirectToMoto) {
    return <Stack.Screen name="../cadastrar-moto" />;
  }

  // Layout protegido com as telas que só usuários autenticados podem acessar
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="../cadastrar-moto" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}