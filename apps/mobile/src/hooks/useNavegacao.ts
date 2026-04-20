// apps/mobile/src/hooks/useNavegacao.ts
//
// Hook para navegação com rota: busca de endereço, cálculo de rota e controle de navegação.

import { useState, useCallback } from 'react';
import { LocationObject } from 'expo-location';
import {
  buscarEndereco,
  calcularRota,
  SugestaoEndereco,
  RotaHERE,
  Coords,
} from '../services/hereService';

export interface UseNavegacaoState {
  /** Estado da busca de endereço */
  buscaAtiva: boolean;
  query: string;
  sugestoes: SugestaoEndereco[];
  buscandoSugestoes: boolean;

  /** Estado da navegação */
  navegacaoAtiva: boolean;
  rota: RotaHERE | null;
  destinoSelecionado: SugestaoEndereco | null;

  /** Ações */
  setBuscaAtiva: (ativa: boolean) => void;
  setQuery: (query: string) => void;
  buscarSugestoes: (query: string) => Promise<void>;
  selecionarDestino: (destino: SugestaoEndereco) => Promise<void>;
  cancelarNavegacao: () => void;
}

/**
 * Hook para gerenciar navegação com rota.
 *
 * @param location - Localização atual do usuário
 */
export function useNavegacao(location: LocationObject | undefined): UseNavegacaoState {
  // Estado da busca
  const [buscaAtiva, setBuscaAtiva] = useState(false);
  const [query, setQuery] = useState('');
  const [sugestoes, setSugestoes] = useState<SugestaoEndereco[]>([]);
  const [buscandoSugestoes, setBuscandoSugestoes] = useState(false);

  // Estado da navegação
  const [navegacaoAtiva, setNavegacaoAtiva] = useState(false);
  const [rota, setRota] = useState<RotaHERE | null>(null);
  const [destinoSelecionado, setDestinoSelecionado] = useState<SugestaoEndereco | null>(null);

  /**
   * Busca sugestões de endereço a partir da query.
   */
  const buscarSugestoesCallback = useCallback(async (texto: string) => {
    if (!location || texto.length < 3) {
      setSugestoes([]);
      return;
    }

    setBuscandoSugestoes(true);

    try {
      const resultados = await buscarEndereco(
        texto,
        location.coords.latitude,
        location.coords.longitude
      );
      setSugestoes(resultados);
    } catch (error) {
      console.error('[useNavegacao] Erro ao buscar sugestões:', error);
      setSugestoes([]);
    } finally {
      setBuscandoSugestoes(false);
    }
  }, [location]);

  /**
   * Seleciona um destino e calcula a rota.
   */
  const selecionarDestino = useCallback(async (destino: SugestaoEndereco) => {
    if (!location) {
      console.warn('[useNavegacao] Localização não disponível');
      return;
    }

    const origem: Coords = {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };

    const destinoCoords: Coords = {
      lat: destino.lat,
      lng: destino.lng,
    };

    try {
      const rotaCalculada = await calcularRota(origem, destinoCoords);

      if (rotaCalculada) {
        setDestinoSelecionado(destino);
        setRota(rotaCalculada);
        setNavegacaoAtiva(true);
        setBuscaAtiva(false);
        setQuery('');
        setSugestoes([]);
      } else {
        console.warn('[useNavegacao] Não foi possível calcular a rota');
      }
    } catch (error) {
      console.error('[useNavegacao] Erro ao calcular rota:', error);
    }
  }, [location]);

  /**
   * Cancela a navegação atual.
   */
  const cancelarNavegacao = useCallback(() => {
    setNavegacaoAtiva(false);
    setRota(null);
    setDestinoSelecionado(null);
  }, []);

  return {
    // Estado da busca
    buscaAtiva,
    query,
    sugestoes,
    buscandoSugestoes,

    // Estado da navegação
    navegacaoAtiva,
    rota,
    destinoSelecionado,

    // Ações
    setBuscaAtiva,
    setQuery,
    buscarSugestoes: buscarSugestoesCallback,
    selecionarDestino,
    cancelarNavegacao,
  };
}