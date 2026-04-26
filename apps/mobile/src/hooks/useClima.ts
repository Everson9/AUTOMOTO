// apps/mobile/src/hooks/useClima.ts
//
// Hook para buscar previsão de chuva e exibir aviso amigável no mapa.
// Atualiza a cada 30 minutos.

import { useState, useEffect, useCallback } from 'react';
import { LocationObject } from 'expo-location';
import {
  buscarPrevisaoRota,
  calcularAlertaChuva,
  PrevisaoHoraria,
  AlertaChuva,
} from '../services/climaService';

// Intervalo de atualização: 30 minutos
const INTERVALO_ATUALIZACAO_MS = 30 * 60 * 1000;

// Estado do aviso de clima
interface AvisoClima {
  mensagem: string;
  alerta: AlertaChuva;
  timestamp: number;
}

// Retorno do hook
interface UseClimaResult {
  /** Se há risco de chuva (baseado na API) */
  deveExibir: boolean;
  /** Mensagem amigável para exibir no banner */
  mensagem: string;
  /** Estado de carregamento */
  loading: boolean;
  /** Erro na busca */
  erro: string | null;
  /** Fechar o aviso manualmente */
  fecharAviso: () => void;
  /** Re-exibir o aviso após fechado */
  reabrirAviso: () => void;
  /** Se o aviso foi fechado pelo usuário */
  foiFechado: boolean;
  /** Forçar atualização da previsão */
  refetch: () => Promise<void>;
}

/**
 * Hook para verificar risco de chuva e exibir aviso amigável.
 * @param location Localização atual do usuário
 * @returns Estado e ações do aviso de clima
 */
export function useClima(location: LocationObject | undefined): UseClimaResult {
  const [aviso, setAviso] = useState<AvisoClima | null>(null);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [foiFechado, setFoiFechado] = useState(false);

  /**
   * Gera mensagem amigável baseada na intensidade da chuva.
   * Tom de amigo avisando, não alarmista.
   *
   * Intensidade:
   * - < 1mm (fraca): "🌦️ Chuva fraca em ~Xh — não esquece a capa na bolsa!"
   * - 1-5mm (moderada): "🌧️ Chuva moderada em ~Xh — bota a capa antes de sair!"
   * - > 5mm (forte): "⛈️ Chuva forte em ~Xh — capa e atenção redobrada na pista!"
   */
  const gerarMensagem = useCallback((alerta: AlertaChuva): string => {
    const { horasAte, precipitacaoMm } = alerta;
    const horasTexto = horasAte <= 1 ? '~1h' : `~${horasAte}h`;

    if (precipitacaoMm < 1) {
      // Chuva fraca
      return `🌦️ Chuva fraca em ${horasTexto} — não esquece a capa na bolsa!`;
    } else if (precipitacaoMm <= 5) {
      // Chuva moderada
      return `🌧️ Chuva moderada em ${horasTexto} — bota a capa antes de sair!`;
    } else {
      // Chuva forte
      return `⛈️ Chuva forte em ${horasTexto} — capa e atenção redobrada na pista!`;
    }
  }, []);

  /**
   * Busca previsão e calcula se deve exibir aviso.
   */
  const buscarPrevisao = useCallback(async () => {
    if (!location) {
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const { coords } = location;
      const previsoes: PrevisaoHoraria[] = await buscarPrevisaoRota(
        coords.latitude,
        coords.longitude
      );

      const alerta = calcularAlertaChuva(previsoes);

      if (alerta && alerta.deveExibir) {
        setAviso({
          mensagem: gerarMensagem(alerta),
          alerta,
          timestamp: Date.now(),
        });
      } else {
        setAviso(null);
      }
    } catch (err: any) {
      setErro(err.message || 'Erro ao buscar previsão');
      setAviso(null);
    } finally {
      setLoading(false);
    }
  }, [location, gerarMensagem]);

  /**
   * Fecha o aviso manualmente.
   */
  const fecharAviso = useCallback(() => {
    setFoiFechado(true);
  }, []);

  /**
   * Re-exibir o aviso após fechado.
   */
  const reabrirAviso = useCallback(() => {
    setFoiFechado(false);
  }, []);

  /**
   * Busca inicial quando a localização estiver disponível.
   */
  useEffect(() => {
    if (location) {
      buscarPrevisao();
    }
  }, [location, buscarPrevisao]);

  /**
   * Re-verificar a cada 30 minutos.
   */
  useEffect(() => {
    if (!location) {
      return;
    }
    const interval = setInterval(() => {
      buscarPrevisao();
    }, INTERVALO_ATUALIZACAO_MS);
    return () => clearInterval(interval);
  }, [location, buscarPrevisao]);

  return {
    deveExibir: aviso !== null,
    mensagem: aviso?.mensagem ?? '',
    loading,
    erro,
    fecharAviso,
    reabrirAviso,
    foiFechado,
    refetch: buscarPrevisao,
  };
}