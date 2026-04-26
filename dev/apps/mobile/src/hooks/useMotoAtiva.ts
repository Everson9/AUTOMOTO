// apps/mobile/src/hooks/useMotoAtiva.ts
//
// Hook para buscar o tipo da moto ativa do usuário.
// Usado pelo MotoMarker no mapa para exibir o ícone correto.

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type TipoMoto = 'naked' | 'sport' | 'scooter' | 'trail' | 'custom' | 'default';

export interface UseMotoAtivaResult {
  tipo: TipoMoto;
  loading: boolean;
}

/**
 * Busca o tipo da moto ativa do usuário.
 * Retorna 'default' se não houver moto cadastrada.
 */
export function useMotoAtiva(): UseMotoAtivaResult {
  const [tipo, setTipo] = useState<TipoMoto>('default');
  const [loading, setLoading] = useState(true);

  const buscarTipo = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTipo('default');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('motos')
        .select('tipo')
        .eq('user_id', user.id)
        .eq('ativa', true)
        .single();

      if (error || !data) {
        setTipo('default');
      } else {
        // Mapear tipos do banco para tipos do componente
        const tipoMapeado = mapearTipo(data.tipo);
        setTipo(tipoMapeado);
      }
    } catch (err) {
      console.error('[useMotoAtiva] Erro ao buscar tipo:', err);
      setTipo('default');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    buscarTipo();
  }, [buscarTipo]);

  return { tipo, loading };
}

/**
 * Mapeia o tipo do banco para o tipo do componente MotoIlustration.
 * O banco pode ter tipos como 'street', 'touring', 'cruiser' que não existem no SVG.
 */
function mapearTipo(tipoBanco: string): TipoMoto {
  const mapeamento: Record<string, TipoMoto> = {
    street: 'naked',
    sport: 'sport',
    scooter: 'scooter',
    trail: 'trail',
    custom: 'custom',
    touring: 'naked',    // touring similar a naked no visual
    cruiser: 'custom',   // cruiser similar a custom
  };

  return mapeamento[tipoBanco] || 'default';
}