// apps/mobile/src/screens/Garagem/useEditarMod.ts
//
// Hook de lógica para editar customização/mod.
// Atualiza o mod existente no Supabase.

import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export type CategoriaMod = 'estetico' | 'performance' | 'seguranca' | 'conforto' | 'acessorio';

export interface EditarModForm {
  nome: string;
  descricao: string;
  valorInvestido: string;
  dataInstalacao: Date | null;
  categoria: CategoriaMod;
}

export interface ModData {
  id: string;
  nome: string;
  descricao: string | null;
  valor_investido: number | null;
  data_instalacao: string | null;
  categoria: CategoriaMod;
}

export interface UseEditarModResult {
  loading: boolean;
  erro: string | null;
  modData: ModData | null;
  buscarMod: (modId: string) => Promise<boolean>;
  salvar: (form: EditarModForm) => Promise<boolean>;
  deletar: () => Promise<boolean>;
}

export function useEditarMod(): UseEditarModResult {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modData, setModData] = useState<ModData | null>(null);

  const buscarMod = useCallback(async (modId: string): Promise<boolean> => {
    setLoading(true);
    setErro(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErro('Usuário não autenticado');
        setLoading(false);
        return false;
      }

      const { data, error } = await supabase
        .from('mods')
        .select('id, nome, descricao, valor_investido, data_instalacao, categoria')
        .eq('id', modId)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        setErro('Mod não encontrado');
        setLoading(false);
        return false;
      }

      setModData(data as ModData);
      setLoading(false);
      return true;
    } catch (err: any) {
      setErro(err.message || 'Erro ao buscar mod');
      setLoading(false);
      return false;
    }
  }, []);

  const salvar = useCallback(async (form: EditarModForm): Promise<boolean> => {
    if (!modData) return false;

    setLoading(true);
    setErro(null);

    try {
      // Converter valor para número
      const valorFloat = form.valorInvestido
        ? parseFloat(form.valorInvestido.replace(',', '.'))
        : null;

      const { error: updateError } = await supabase
        .from('mods')
        .update({
          nome: form.nome,
          descricao: form.descricao || null,
          valor_investido: valorFloat,
          data_instalacao: form.dataInstalacao?.toISOString().split('T')[0] || null,
          categoria: form.categoria,
        })
        .eq('id', modData.id);

      if (updateError) {
        setErro(updateError.message);
        setLoading(false);
        return false;
      }

      setLoading(false);
      return true;
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar');
      setLoading(false);
      return false;
    }
  }, [modData]);

  const deletar = useCallback(async (): Promise<boolean> => {
    if (!modData) return false;

    setLoading(true);
    setErro(null);

    try {
      const { error: deleteError } = await supabase
        .from('mods')
        .delete()
        .eq('id', modData.id);

      if (deleteError) {
        setErro(deleteError.message);
        setLoading(false);
        return false;
      }

      setLoading(false);
      return true;
    } catch (err: any) {
      setErro(err.message || 'Erro ao deletar');
      setLoading(false);
      return false;
    }
  }, [modData]);

  return {
    loading,
    erro,
    modData,
    buscarMod,
    salvar,
    deletar,
  };
}