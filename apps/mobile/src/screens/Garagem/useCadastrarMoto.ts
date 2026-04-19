// apps/mobile/src/screens/Garagem/useCadastrarMoto.ts
//
// Hook para a tela de cadastro de moto.
// Gerencia criação de nova moto com upload de foto.

import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadFotoMoto } from '../../services/storageService';

// Tipos de moto disponíveis
export type TipoMoto = 'street' | 'sport' | 'touring' | 'cruiser' | 'trail' | 'scooter' | 'custom';

// Dados para cadastro de nova moto
export interface CadastrarMotoData {
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cor: string;
  tipo: TipoMoto;
  km_atual: number;
  foto_url: string | null;
}

export interface UseCadastrarMotoResult {
  loading: boolean;
  erro: string | null;
  fotoUri: string | null;
  selecionarFoto: (uri: string) => void;
  cadastrar: (dados: CadastrarMotoData) => Promise<{ success: boolean; motoId?: string }>;
}

export function useCadastrarMoto(): UseCadastrarMotoResult {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  const selecionarFoto = useCallback((uri: string) => {
    setFotoUri(uri);
  }, []);

  const cadastrar = useCallback(async (dados: CadastrarMotoData): Promise<{ success: boolean; motoId?: string }> => {
    setLoading(true);
    setErro(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErro('Usuário não autenticado');
        setLoading(false);
        return { success: false };
      }

      let fotoUrl = dados.foto_url;

      // Se há foto selecionada (URI local), fazer upload primeiro
      if (fotoUri && !fotoUri.startsWith('http')) {
        // Gerar ID temporário para o upload (crypto.randomUUID não existe em React Native)
        const tempId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        fotoUrl = await uploadFotoMoto(fotoUri, user.id, tempId);
      }

      // Desativar todas as motos do usuário (para que a nova seja a ativa)
      await supabase
        .from('motos')
        .update({ ativa: false })
        .eq('user_id', user.id);

      // Inserir nova moto
      const { data, error } = await supabase
        .from('motos')
        .insert([{
          user_id: user.id,
          placa: dados.placa.toUpperCase(),
          modelo: dados.modelo,
          marca: dados.marca || null,
          ano: dados.ano,
          cor: dados.cor || null,
          tipo: dados.tipo,
          km_atual: dados.km_atual,
          foto_url: fotoUrl,
          ativa: true,
        }])
        .select('id')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Se fez upload com ID temporário, renomear arquivo com ID correto
      if (fotoUri && !fotoUri.startsWith('http') && data.id) {
        // O arquivo foi salvo com UUID temporário, mas como usamos upsert,
        // o ideal seria renomear. Por simplicidade, o arquivo mantém o nome temporário.
        // Isso não afeta o funcionamento.
      }

      setLoading(false);
      return { success: true, motoId: data.id };
    } catch (err: any) {
      setErro(err.message || 'Erro ao cadastrar moto');
      setLoading(false);
      return { success: false };
    }
  }, [fotoUri]);

  return {
    loading,
    erro,
    fotoUri,
    selecionarFoto,
    cadastrar,
  };
}