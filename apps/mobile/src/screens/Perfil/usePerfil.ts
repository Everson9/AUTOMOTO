import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../hooks/AuthProvider';
import { Alert } from 'react-native';

export interface Moto {
  id: string;
  modelo: string;
  placa: string;
  ano: number;
  km_atual: number;
  ativa: boolean;
}

export interface UsePerfilReturn {
  nome: string;
  email: string;
  iniciais: string;
  moto: Moto | null;
  loading: boolean;
  erro: string | null;
  trocarSenha: () => Promise<void>;
  sair: () => Promise<void>;
}

export function usePerfil(): UsePerfilReturn {
  const { user } = useAuthContext();
  const router = useRouter();

  const [moto, setMoto] = useState<Moto | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const nome = user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Usuário';
  const email = user?.email || '';
  const iniciais = nome
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const buscarMoto = async () => {
      try {
        setLoading(true);
        setErro(null);

        const { data, error: queryError } = await supabase
          .from('motos')
          .select('id, modelo, placa, ano, km_atual, ativa')
          .eq('user_id', user.id)
          .eq('ativa', true)
          .maybeSingle();

        if (queryError) {
          console.error('[usePerfil] Erro ao buscar moto:', queryError);
          setErro('Não foi possível carregar os dados da moto');
        } else {
          setMoto(data);
        }
      } catch (err) {
        console.error('[usePerfil] Erro inesperado:', err);
        setErro('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    buscarMoto();
  }, [user]);

  const trocarSenha = useCallback(async () => {
    if (!email) {
      Alert.alert('Erro', 'Email não disponível');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'automoto://reset-password',
      });

      if (error) {
        console.error('[usePerfil] Erro ao enviar email:', error);
        Alert.alert('Erro', 'Não foi possível enviar o email de redefinição');
      } else {
        Alert.alert(
          'Email enviado',
          'Verifique sua caixa de entrada para redefinir sua senha.'
        );
      }
    } catch (err) {
      console.error('[usePerfil] Erro inesperado:', err);
      Alert.alert('Erro', 'Ocorreu um erro ao processar sua solicitação');
    }
  }, [email]);

  const sair = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[usePerfil] Erro ao sair:', error);
        Alert.alert('Erro', 'Não foi possível sair da conta');
      } else {
        router.replace('/login');
      }
    } catch (err) {
      console.error('[usePerfil] Erro inesperado:', err);
      Alert.alert('Erro', 'Ocorreu um erro ao sair da conta');
    }
  }, [router]);

  return {
    nome,
    email,
    iniciais,
    moto,
    loading,
    erro,
    trocarSenha,
    sair,
  };
}