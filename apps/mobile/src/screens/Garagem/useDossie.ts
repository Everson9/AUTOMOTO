// apps/mobile/src/screens/Garagem/useDossie.ts
//
// Hook para gerar Dossiê de Procedência (PDF).
// Busca dados da moto e mods, gera HTML e PDF.

import { useState, useCallback } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { supabase } from '../../lib/supabase';
import { templateDossie, DossieData } from '../../utils/templateDossie';

export interface DossieMotoData {
  id: string;
  modelo: string;
  marca: string | null;
  placa: string;
  ano: number;
  cor: string | null;
  km_atual: number;
}

export interface DossieModData {
  id: string;
  nome: string;
  categoria: string;
  descricao: string | null;
  data_instalacao: string | null;
  valor_investido: number | null;
}

export interface UseDossieResult {
  loading: boolean;
  erro: string | null;
  moto: DossieMotoData | null;
  mods: DossieModData[];
  pdfUri: string | null;
  gerando: boolean;
  buscarDados: () => Promise<boolean>;
  gerarPDF: () => Promise<string | null>;
  compartilhar: () => Promise<void>;
}

export function useDossie(): UseDossieResult {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [moto, setMoto] = useState<DossieMotoData | null>(null);
  const [mods, setMods] = useState<DossieModData[]>([]);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);

  const buscarDados = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setErro(null);

    try {
      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErro('Usuário não autenticado');
        setLoading(false);
        return false;
      }

      // Buscar moto ativa
      const { data: motoData, error: motoError } = await supabase
        .from('motos')
        .select('id, modelo, marca, placa, ano, cor, km_atual')
        .eq('user_id', user.id)
        .eq('ativa', true)
        .single();

      if (motoError || !motoData) {
        setErro('Nenhuma moto cadastrada');
        setLoading(false);
        return false;
      }

      setMoto(motoData as DossieMotoData);

      // Buscar mods da moto
      const { data: modsData, error: modsError } = await supabase
        .from('mods')
        .select('id, nome, categoria, descricao, data_instalacao, valor_investido')
        .eq('moto_id', motoData.id)
        .order('created_at', { ascending: false });

      if (modsError) {
        setMods([]);
      } else {
        setMods(modsData as DossieModData[]);
      }

      setLoading(false);
      return true;
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar dados');
      setLoading(false);
      return false;
    }
  }, []);

  const gerarPDF = useCallback(async (): Promise<string | null> => {
    if (!moto) {
      setErro('Nenhuma moto cadastrada');
      return null;
    }

    setGerando(true);
    setErro(null);

    try {
      // Preparar dados para o template
      const dataGeracao = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const dossieData: DossieData = {
        moto: {
          placa: moto.placa,
          modelo: moto.modelo,
          marca: moto.marca,
          ano: moto.ano,
          km_atual: moto.km_atual,
          cor: moto.cor,
        },
        mods: mods.map(mod => ({
          nome: mod.nome,
          categoria: mod.categoria,
          descricao: mod.descricao,
          data_instalacao: mod.data_instalacao,
          valor_investido: mod.valor_investido,
        })),
        dataGeracao,
      };

      // Gerar HTML
      const html = templateDossie(dossieData);

      // Gerar PDF
      const { uri } = await Print.printToFileAsync({ html });

      setPdfUri(uri);
      return uri;
    } catch (err: any) {
      setErro(err.message || 'Erro ao gerar PDF');
      return null;
    } finally {
      setGerando(false);
    }
  }, [moto, mods]);

  const compartilhar = useCallback(async (): Promise<void> => {
    if (!pdfUri) {
      setErro('Nenhum PDF gerado');
      return;
    }

    try {
      // Verificar se sharing está disponível
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        setErro('Compartilhamento não disponível neste dispositivo');
        return;
      }

      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartilhar Dossiê de Procedência',
        UTI: 'com.adobe.pdf',
      });
    } catch (err: any) {
      setErro(err.message || 'Erro ao compartilhar');
    }
  }, [pdfUri]);

  return {
    loading,
    erro,
    moto,
    mods,
    pdfUri,
    gerando,
    buscarDados,
    gerarPDF,
    compartilhar,
  };
}