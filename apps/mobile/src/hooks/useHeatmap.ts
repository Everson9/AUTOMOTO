// apps/mobile/src/hooks/useHeatmap.ts

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LocationObject } from 'expo-location';

export interface HeatmapPoint {
  id: string;
  lat: number;
  lng: number;
  peso: number; // 0.0 to 1.0, temporal decay weight
  created_at: string;
}

export interface HeatmapFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id: string;
    peso: number;
  };
}

export interface HeatmapFeatureCollection {
  type: 'FeatureCollection';
  features: HeatmapFeature[];
}

interface AlertaAssaltoDB {
  id: string;
  lng: number;
  lat: number;
  created_at: string;
}

/**
 * Hook to fetch assault alerts and calculate heatmap weights with temporal decay.
 * Weight formula: peso = Math.max(0, 1 - (diasAtras / 7))
 * Alerts older than 7 days have weight 0 and are not included.
 */
export function useHeatmap(currentLocation?: LocationObject) {
  const [heatmapData, setHeatmapData] = useState<HeatmapFeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Duração do decaimento temporal (7 dias)
  const DECAY_DAYS = 7;

  /**
   * Calculate temporal decay weight for an alert.
   * Returns value between 0 and 1, where:
   * - 1.0 = alert created just now
   * - 0.5 = alert created 3.5 days ago
   * - 0.0 = alert created 7 or more days ago
   */
  const calcularPeso = (createdAt: string): number => {
    const criado = new Date(createdAt);
    const agora = new Date();
    const diasAtras = (agora.getTime() - criado.getTime()) / (1000 * 60 * 60 * 24);

    const peso = Math.max(0, 1 - (diasAtras / DECAY_DAYS));
    return peso;
  };

  /**
   * Fetch all active 'assalto' alerts and calculate heatmap weights.
   */
  const buscarAlertasAssalto = async () => {
    setIsLoading(true);
    setErro(null);

    try {
      // Buscar todos os alertas de assalto ativos (não expirados) via RPC
      const { data, error } = await supabase.rpc('assaltos_para_heatmap');

      if (error) {
        console.error('[buscarAlertasAssalto]', error);
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        setHeatmapData({
          type: 'FeatureCollection',
          features: [],
        });
        return;
      }

      // Processar cada alerta e calcular peso
      const features: HeatmapFeature[] = (data as AlertaAssaltoDB[])
        .map(alerta => {
          const peso = calcularPeso(alerta.created_at);

          // Ignorar alertas com peso 0 (mais de 7 dias)
          if (peso <= 0) {
            return null;
          }

          return {
            type: 'Feature' as const,
            id: alerta.id,
            geometry: {
              type: 'Point' as const,
              coordinates: [alerta.lng, alerta.lat],
            },
            properties: {
              id: alerta.id,
              peso,
            },
          };
        })
        .filter((f): f is HeatmapFeature => f !== null);

      setHeatmapData({
        type: 'FeatureCollection',
        features,
      });
    } catch (error: any) {
      console.error('[buscarAlertasAssalto]', error);
      setErro(error.message || 'Erro ao carregar alertas de assalto');
      setHeatmapData({
        type: 'FeatureCollection',
        features: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Recarregar quando a localização mudar (para futuras otimizações de raio)
  useEffect(() => {
    buscarAlertasAssalto();
  }, [currentLocation]);

  // Intervalo para atualizar pesos a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      buscarAlertasAssalto();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  return {
    heatmapData,
    isLoading,
    erro,
    refetch: buscarAlertasAssalto,
  };
}