// apps/mobile/src/hooks/useHereTraffic.ts
//
// Hook para buscar incidentes de trânsito da HERE API.
// Atualiza a cada 5 minutos ou quando o usuário se move mais de 500m.

import { useState, useEffect, useCallback, useRef } from 'react';
import { LocationObject } from 'expo-location';
import {
  buscarIncidentes,
  IncidenteHERE,
  calcularBBox,
} from '../services/hereService';

// Configurações
const INTERVALO_BUSCA_MS = 5 * 60 * 1000; // 5 minutos
const DISTANCIA_REBUSCA_METROS = 500;

// Estado do hook
export interface UseHereTrafficState {
  incidentes: IncidenteHERE[];
  isLoading: boolean;
  erro: string | null;
  refetch: () => Promise<void>;
}

/**
 * Calcula distância entre duas coordenadas em metros (fórmula de Haversine).
 */
function distanciaMetros(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Raio da Terra em metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Hook para buscar incidentes de trânsito da HERE API.
 *
 * @param location - Localização atual do usuário
 * @param raioKm - Raio de busca em km (padrão: 5km)
 */
export function useHereTraffic(
  location: LocationObject | undefined,
  raioKm: number = 5
): UseHereTrafficState {
  const [incidentes, setIncidentes] = useState<IncidenteHERE[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Última posição de busca para calcular distância
  const ultimaPosicaoRef = useRef<{ lat: number; lng: number } | null>(null);

  // Buscar incidentes
  const buscar = useCallback(async () => {
    if (!location) {
      return;
    }

    const lat = location.coords.latitude;
    const lng = location.coords.longitude;

    // Verificar se deve re-buscar (distância > 500m ou primeira vez)
    const deveRebuscar = !ultimaPosicaoRef.current ||
      distanciaMetros(
        ultimaPosicaoRef.current.lat,
        ultimaPosicaoRef.current.lng,
        lat,
        lng
      ) > DISTANCIA_REBUSCA_METROS;

    if (!deveRebuscar) {
      return;
    }

    setIsLoading(true);
    setErro(null);

    try {
      const bbox = calcularBBox(lat, lng, raioKm);
      const dados = await buscarIncidentes(bbox);

      setIncidentes(dados);
      ultimaPosicaoRef.current = { lat, lng };
    } catch (error: any) {
      console.error('[useHereTraffic] Erro ao buscar incidentes:', error);
      setErro(error.message || 'Erro ao buscar incidentes');
    } finally {
      setIsLoading(false);
    }
  }, [location, raioKm]);

  // Buscar quando a localização mudar
  useEffect(() => {
    buscar();
  }, [buscar]);

  // Polling a cada 5 minutos
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (location) {
        buscar();
      }
    }, INTERVALO_BUSCA_MS);

    return () => clearInterval(intervalo);
  }, [location, buscar]);

  // Função para forçar atualização
  const refetch = useCallback(async () => {
    ultimaPosicaoRef.current = null; // Forçar re-busca
    await buscar();
  }, [buscar]);

  return {
    incidentes,
    isLoading,
    erro,
    refetch,
  };
}