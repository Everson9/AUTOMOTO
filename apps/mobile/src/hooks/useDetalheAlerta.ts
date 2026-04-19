// apps/mobile/src/hooks/useDetalheAlerta.ts
//
// Hook para confirmar ou negar alertas na via.
// Persiste votos no AsyncStorage para evitar duplicação.
// Desativa automaticamente alertas com muitas negações.

import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const ALERTAS_VOTADOS_KEY = 'alertas_votados';

export interface UseDetalheAlertaOptions {
  /** Callback chamado quando um alerta é desativado automaticamente */
  onAlertaDesativado?: (id: string) => void;
}

export interface UseDetalheAlertaReturn {
  /** Incrementa confirmações do alerta */
  confirmar: (id: string) => Promise<void>;
  /** Incrementa negações do alerta */
  negar: (id: string) => Promise<void>;
  /** Verifica se o usuário já votou neste alerta */
  jaVotou: (id: string) => Promise<boolean>;
  /** Estado de loading durante operação */
  isLoading: boolean;
  /** Mensagem de erro, se houver */
  erro: string | null;
}

/**
 * Recupera lista de IDs de alertas votados do AsyncStorage.
 */
async function getAlertasVotados(): Promise<Set<string>> {
  try {
    const json = await AsyncStorage.getItem(ALERTAS_VOTADOS_KEY);
    if (json) {
      const arr = JSON.parse(json);
      return new Set(arr);
    }
  } catch (e) {
    console.error('[getAlertasVotados]', e);
  }
  return new Set();
}

/**
 * Salva lista de IDs de alertas votados no AsyncStorage.
 */
async function saveAlertasVotados(ids: Set<string>): Promise<void> {
  try {
    const json = JSON.stringify([...ids]);
    await AsyncStorage.setItem(ALERTAS_VOTADOS_KEY, json);
  } catch (e) {
    console.error('[saveAlertasVotados]', e);
  }
}

/**
 * Hook para gerenciar confirmações e negações de alertas.
 * Atualiza diretamente no Supabase e persiste votos no AsyncStorage.
 * Desativa automaticamente alertas com negacoes >= 5 e negacoes > confirmacoes.
 */
export function useDetalheAlerta(options?: UseDetalheAlertaOptions): UseDetalheAlertaReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const jaVotou = useCallback(async (id: string): Promise<boolean> => {
    const votados = await getAlertasVotados();
    return votados.has(id);
  }, []);

  const confirmar = useCallback(async (id: string) => {
    setIsLoading(true);
    setErro(null);

    try {
      // Verificar se já votou
      const votados = await getAlertasVotados();
      if (votados.has(id)) {
        setErro('Você já avaliou este alerta');
        return;
      }

      // Incrementar confirmações
      const { data: alerta } = await supabase
        .from('alertas_via')
        .select('confirmacoes')
        .eq('id', id)
        .single();

      if (alerta) {
        await supabase
          .from('alertas_via')
          .update({ confirmacoes: (alerta.confirmacoes || 0) + 1 })
          .eq('id', id);
      }

      // Salvar no AsyncStorage
      votados.add(id);
      await saveAlertasVotados(votados);
    } catch (error: any) {
      console.error('[useDetalheAlerta.confirmar]', error);
      setErro(error.message || 'Erro ao confirmar alerta');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const negar = useCallback(async (id: string) => {
    setIsLoading(true);
    setErro(null);

    try {
      // Verificar se já votou
      const votados = await getAlertasVotados();
      if (votados.has(id)) {
        setErro('Você já avaliou este alerta');
        return;
      }

      // Buscar valores atuais e incrementar negações
      const { data: alerta } = await supabase
        .from('alertas_via')
        .select('confirmacoes, negacoes')
        .eq('id', id)
        .single();

      if (alerta) {
        const novasNegacoes = (alerta.negacoes || 0) + 1;
        await supabase
          .from('alertas_via')
          .update({ negacoes: novasNegacoes })
          .eq('id', id);

        // Verificar se deve desativar: negacoes >= 5 E negacoes > confirmacoes
        if (novasNegacoes >= 5 && novasNegacoes > (alerta.confirmacoes || 0)) {
          await supabase
            .from('alertas_via')
            .update({ ativo: false })
            .eq('id', id);

          // Notificar callback se fornecido
          options?.onAlertaDesativado?.(id);
        }
      }

      // Salvar no AsyncStorage
      votados.add(id);
      await saveAlertasVotados(votados);
    } catch (error: any) {
      console.error('[useDetalheAlerta.negar]', error);
      setErro(error.message || 'Erro ao negar alerta');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    confirmar,
    negar,
    jaVotou,
    isLoading,
    erro,
  };
}