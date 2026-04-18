// apps/mobile/src/screens/Garagem/useAdicionarMod.ts
//
// Hook de lógica para adicionar customização/mod.
// Salva na tabela mods do Supabase.

import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export type CategoriaMod = 'estetico' | 'performance' | 'seguranca' | 'conforto' | 'acessorio';

export interface AdicionarModForm {
  nome: string;
  descricao: string;
  valorInvestido: string;
  dataInstalacao: Date | null;
  categoria: CategoriaMod;
}

export interface UseAdicionarModResult {
  loading: boolean;
  erro: string | null;
  salvar: (form: AdicionarModForm) => Promise<boolean>;
}

export function useAdicionarMod(): UseAdicionarModResult {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const salvar = useCallback(async (form: AdicionarModForm): Promise<boolean> => {
    setLoading(true);
    setErro(null);

    try {
      // Buscar usuário e moto ativa
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErro('Usuário não autenticado');
        setLoading(false);
        return false;
      }

      const { data: moto, error: motoError } = await supabase
        .from('motos')
        .select('id')
        .eq('user_id', user.id)
        .eq('ativa', true)
        .single();

      if (motoError || !moto) {
        setErro('Nenhuma moto cadastrada');
        setLoading(false);
        return false;
      }

      // Converter valor para número
      const valorFloat = form.valorInvestido
        ? parseFloat(form.valorInvestido.replace(',', '.'))
        : null;

      // Inserir mod
      const { error: insertError } = await supabase
        .from('mods')
        .insert({
          user_id: user.id,
          moto_id: moto.id,
          nome: form.nome,
          descricao: form.descricao || null,
          valor_investido: valorFloat,
          data_instalacao: form.dataInstalacao?.toISOString().split('T')[0] || null,
          categoria: form.categoria,
        });

      if (insertError) {
        setErro(insertError.message);
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
  }, []);

  return {
    loading,
    erro,
    salvar,
  };
}