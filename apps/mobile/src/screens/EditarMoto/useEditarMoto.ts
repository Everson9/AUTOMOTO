// apps/mobile/src/screens/EditarMoto/useEditarMoto.ts
//
// Hook para a tela de edição de moto.
// Gerencia busca de dados, upload de foto e salvamento.

import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadFotoMoto } from '../../services/storageService';

// Dados completos da moto (inclui placa para exibição)
export interface MotoData {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cor: string;
  foto_url: string | null;
}

// Dados que podem ser editados e salvos
export interface EditarMotoData {
  modelo: string;
  marca: string;
  ano: number;
  cor: string;
  foto_url: string | null;
}

export interface UseEditarMotoResult {
  loading: boolean;
  saving: boolean;
  erro: string | null;
  motoData: MotoData | null;
  fotoUri: string | null;
  buscarMoto: (motoId: string) => Promise<void>;
  selecionarFoto: (uri: string) => void;
  salvar: (dados: EditarMotoData) => Promise<boolean>;
}

export function useEditarMoto(motoId: string | null): UseEditarMotoResult {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [motoData, setMotoData] = useState<MotoData | null>(null);
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  const buscarMoto = useCallback(async (id: string) => {
    setLoading(true);
    setErro(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErro('Usuário não autenticado');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('motos')
        .select('id, placa, modelo, marca, ano, cor, foto_url')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        setErro('Moto não encontrada');
        setLoading(false);
        return;
      }

      setMotoData({
        id: data.id,
        placa: data.placa,
        modelo: data.modelo,
        marca: data.marca || '',
        ano: data.ano,
        cor: data.cor || '',
        foto_url: data.foto_url,
      });
      setFotoUri(data.foto_url);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar moto');
    } finally {
      setLoading(false);
    }
  }, []);

  const selecionarFoto = useCallback((uri: string) => {
    setFotoUri(uri);
  }, []);

  const salvar = useCallback(async (dados: EditarMotoData): Promise<boolean> => {
    if (!motoId) {
      setErro('ID da moto não informado');
      return false;
    }

    setSaving(true);
    setErro(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErro('Usuário não autenticado');
        setSaving(false);
        return false;
      }

      let fotoUrl = dados.foto_url;

      // Se há uma nova foto selecionada (URI local), fazer upload
      if (fotoUri && !fotoUri.startsWith('http')) {
        fotoUrl = await uploadFotoMoto(fotoUri, user.id, motoId);
      }

      const { error } = await supabase
        .from('motos')
        .update({
          modelo: dados.modelo,
          marca: dados.marca || null,
          ano: dados.ano,
          cor: dados.cor || null,
          foto_url: fotoUrl,
        })
        .eq('id', motoId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      setSaving(false);
      return true;
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar');
      setSaving(false);
      return false;
    }
  }, [motoId, fotoUri]);

  return {
    loading,
    saving,
    erro,
    motoData,
    fotoUri,
    buscarMoto,
    selecionarFoto,
    salvar,
  };
}