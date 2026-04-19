// apps/mobile/src/screens/Garagem/useGaragem.ts
//
// Hook de lógica da tela Garagem.
// Busca moto ativa, lista de mods e todas as motos do usuário.

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface MotoAtiva {
  id: string;
  modelo: string;
  marca: string | null;
  placa: string;
  ano: number;
  cor: string | null;
  km_atual: number;
  foto_url: string | null;
  tipo: string;
}

export interface MotoLista {
  id: string;
  modelo: string;
  marca: string | null;
  placa: string;
  foto_url: string | null;
  tipo: string;
  ativa: boolean;
}

export interface ModItem {
  id: string;
  nome: string;
  descricao: string | null;
  data_instalacao: string | null;
  valor_investido: number | null;
  categoria: string;
}

export interface UseGaragemResult {
  moto: MotoAtiva | null;
  motos: MotoLista[];
  mods: ModItem[];
  loading: boolean;
  erro: string | null;
  refetch: () => Promise<void>;
  atualizarKm: (novoKm: number) => Promise<void>;
  atualizarMoto: (dados: Partial<MotoAtiva>) => Promise<void>;
  ativarMoto: (motoId: string) => Promise<void>;
}

export function useGaragem(): UseGaragemResult {
  const [moto, setMoto] = useState<MotoAtiva | null>(null);
  const [motos, setMotos] = useState<MotoLista[]>([]);
  const [mods, setMods] = useState<ModItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const buscarDados = useCallback(async () => {
    setLoading(true);
    setErro(null);

    try {
      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErro('Usuário não autenticado');
        setLoading(false);
        return;
      }

      // Buscar todas as motos do usuário
      const { data: motosData, error: motosError } = await supabase
        .from('motos')
        .select('id, modelo, marca, placa, foto_url, tipo, ativa')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (motosError) {
        setMotos([]);
      } else {
        setMotos(motosData as MotoLista[]);
      }

      // Buscar moto ativa
      const { data: motoData, error: motoError } = await supabase
        .from('motos')
        .select('id, modelo, marca, placa, ano, cor, km_atual, foto_url, tipo')
        .eq('user_id', user.id)
        .eq('ativa', true)
        .single();

      if (motoError || !motoData) {
        setMoto(null);
        setMods([]);
        setLoading(false);
        return;
      }

      setMoto(motoData as MotoAtiva);

      // Buscar mods da moto
      const { data: modsData, error: modsError } = await supabase
        .from('mods')
        .select('id, nome, descricao, data_instalacao, valor_investido, categoria')
        .eq('moto_id', motoData.id)
        .order('created_at', { ascending: false });

      if (modsError) {
        setMods([]);
      } else {
        setMods(modsData as ModItem[]);
      }
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  const atualizarKm = useCallback(async (novoKm: number) => {
    if (!moto) return;

    const { error } = await supabase
      .from('motos')
      .update({ km_atual: novoKm })
      .eq('id', moto.id);

    if (error) {
      throw new Error(error.message);
    }

    setMoto({ ...moto, km_atual: novoKm });
  }, [moto]);

  const atualizarMoto = useCallback(async (dados: Partial<MotoAtiva>) => {
    if (!moto) return;

    const { error } = await supabase
      .from('motos')
      .update(dados)
      .eq('id', moto.id);

    if (error) {
      throw new Error(error.message);
    }

    setMoto({ ...moto, ...dados });
  }, [moto]);

  const ativarMoto = useCallback(async (motoId: string) => {
    // Buscar userId antes de chamar a RPC
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { error } = await supabase.rpc('ativar_moto', {
      p_moto_id: motoId,
      p_user_id: user.id,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Rebuscar dados após ativar
    await buscarDados();
  }, [buscarDados]);

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  return {
    moto,
    motos,
    mods,
    loading,
    erro,
    refetch: buscarDados,
    atualizarKm,
    atualizarMoto,
    ativarMoto,
  };
}