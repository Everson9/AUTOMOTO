// apps/mobile/src/hooks/useNotificacoesAlerta.ts
//
// Hook para monitorar proximidade do usuário a alertas ativos
// e disparar notificações locais quando entrar no raio de 200m.
// Controle de alertas já notificados em memória (resetado ao fechar app).

import { useEffect, useRef, useState } from 'react';
import { LocationObject } from 'expo-location';
import type { AlertaVia, TipoAlerta } from '../screens/Mapa/useMapa';
import { solicitarPermissao, dispararNotificacaoAlerta } from '../services/notificationService';

// Raio de proximidade para disparar notificação (em metros)
const RAIO_NOTIFICACAO_M = 200;

/**
 * Calcula a distância entre dois pontos geográficos em metros.
 * Usa a fórmula de Haversine.
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
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface UseNotificacoesAlertaResult {
  /** Se permissão de notificação foi concedida */
  permissaoGranted: boolean;
}

/**
 * Hook para notificar o usuário quando se aproximar de alertas ativos.
 * @param alertas Lista de alertas ativos
 * @param location Localização atual do usuário
 * @returns Estado de permissão
 */
export function useNotificacoesAlerta(
  alertas: AlertaVia[],
  location: LocationObject | undefined
): UseNotificacoesAlertaResult {
  const [permissaoGranted, setPermissaoGranted] = useState(false);

  // Controle de alertas já notificados (em memória, resetado ao fechar app)
  const alertasNotificadosRef = useRef<Set<string>>(new Set());

  // Solicitar permissão ao montar
  useEffect(() => {
    solicitarPermissao().then(granted => {
      setPermissaoGranted(granted);
    });
  }, []);

  // Verificar proximidade a cada atualização de localização
  useEffect(() => {
    if (!location || !permissaoGranted || alertas.length === 0) {
      return;
    }

    const userLat = location.coords.latitude;
    const userLng = location.coords.longitude;

    // Verificar cada alerta
    for (const alerta of alertas) {
      // Pular se já foi notificado nesta sessão
      if (alertasNotificadosRef.current.has(alerta.id)) {
        continue;
      }

      const distancia = distanciaMetros(userLat, userLng, alerta.lat, alerta.lng);

      // Se está dentro do raio, disparar notificação
      if (distancia <= RAIO_NOTIFICACAO_M) {
        dispararNotificacaoAlerta(alerta.tipo, distancia);
        alertasNotificadosRef.current.add(alerta.id);
      }
    }
  }, [location, alertas, permissaoGranted]);

  return { permissaoGranted };
}