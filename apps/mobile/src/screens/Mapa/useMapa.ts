// apps/mobile/src/screens/Mapa/useMapa.ts

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { LocationObject } from 'expo-location';
import { useAuthContext } from '../../hooks/AuthProvider';

// Define the alert types based on the enum from the database
export type TipoAlerta = 'oleo' | 'areia' | 'buraco' | 'obra' | 'enchente' | 'acidente' | 'assalto' | 'outro';

export interface AlertaVia {
  id: string;
  tipo: TipoAlerta;
  lat: number;
  lng: number;
  confirmacoes: number;
  expira_em: string; // ISO string
  distancia_m: number;
}

export interface AlertaViaInsert {
  tipo: TipoAlerta;
  geom: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  criado_por: string;
  descricao?: string;
  expira_em: string; // ISO string
}

export interface AlertaFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: string;
    tipo: TipoAlerta;
    confirmacoes: number;
  };
}

export interface AlertasGeoJSON {
  type: 'FeatureCollection';
  features: AlertaFeature[];
}

export function useMapa(currentLocation?: LocationObject) {
  const { user } = useAuthContext();
  const [alertas, setAlertas] = useState<AlertaVia[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  // Vida útil dos alertas conforme MODULE_RADAR.md
  const VIDA_UTIL: Record<TipoAlerta, number> = {
    oleo:     2 * 60 * 60 * 1000,   // 2 horas
    areia:    4 * 60 * 60 * 1000,   // 4 horas
    buraco:   7 * 24 * 60 * 60 * 1000,  // 7 dias
    obra:     48 * 60 * 60 * 1000,  // 48 horas
    enchente: 6 * 60 * 60 * 1000,   // 6 horas
    acidente: 3 * 60 * 60 * 1000,   // 3 horas
    assalto:  7 * 24 * 60 * 60 * 1000,  // 7 dias (mesmo período do heatmap)
    outro:    2 * 60 * 60 * 1000,   // 2 horas
  };

  // Calcular expiração baseado no tipo de alerta
  const calcularExpiracao = (tipo: TipoAlerta): Date => {
    return new Date(Date.now() + VIDA_UTIL[tipo]);
  };

  // Buscar alertas próximos da localização atual
  const buscarAlertasProximos = async () => {
    if (!currentLocation) {
      setErro('Localização atual não disponível');
      return;
    }

    setIsLoading(true);
    setErro(null);

    try {
      const { data, error } = await supabase.rpc('alertas_proximos', {
        lat: currentLocation.coords.latitude,
        lng: currentLocation.coords.longitude,
        raio_metros: 5000, // 5km de raio
      });

      if (error) {
        console.error('[buscarAlertasProximos]', error);
        throw new Error(error.message);
      }

      setAlertas(data || []);
    } catch (error: any) {
      console.error('[buscarAlertasProximos]', error);
      setErro(error.message || 'Erro ao buscar alertas próximos');
      setAlertas([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reportar um novo alerta
  const reportarAlerta = async (tipo: TipoAlerta, descricao?: string) => {
    if (!user || !currentLocation) {
      throw new Error('Usuário não autenticado ou localização indisponível');
    }

    try {
      const expiraEm = calcularExpiracao(tipo);

      const novoAlerta = {
        tipo,
        geom: `SRID=4326;POINT(${currentLocation.coords.longitude} ${currentLocation.coords.latitude})`,
        criado_por: user.id,
        descricao,
        expira_em: expiraEm.toISOString(),
      };

      const { error } = await supabase
        .from('alertas_via')
        .insert(novoAlerta);

      if (error) {
        console.error('[reportarAlerta]', error);
        throw new Error(error.message);
      }

      // Após criar o alerta, atualizar a lista de alertas
      await buscarAlertasProximos();
    } catch (error: any) {
      console.error('[reportarAlerta]', error);
      throw error;
    }
  };

  // Recarregar alertas quando a localização mudar
  useEffect(() => {
    if (currentLocation) {
      buscarAlertasProximos();
    }
  }, [currentLocation]);

  // Criar GeoJSON memoizado para evitar recriação a cada render
  const alertasGeoJSON: AlertasGeoJSON = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: alertas.map(alerta => ({
      type: 'Feature' as const,
      id: alerta.id,
      geometry: {
        type: 'Point' as const,
        coordinates: [alerta.lng, alerta.lat] as [number, number],
      },
      properties: {
        id: alerta.id,
        tipo: alerta.tipo,
        confirmacoes: alerta.confirmacoes,
      },
    })),
  }), [alertas]);

  return {
    alertas,
    alertasGeoJSON,
    isLoading,
    erro,
    reportarAlerta,
    refetch: buscarAlertasProximos,
  };
}