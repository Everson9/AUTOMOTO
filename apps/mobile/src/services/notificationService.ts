// apps/mobile/src/services/notificationService.ts
//
// Serviço de notificações locais para alertas de proximidade.
// Usa expo-notifications para disparar notificações quando o usuário
// se aproxima de um alerta ativo.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { TipoAlerta } from '../screens/Mapa/useMapa';

// Emojis por tipo de alerta
const EMOJI_TIPO: Record<TipoAlerta, string> = {
  oleo: '🛢️',
  areia: '🏖️',
  buraco: '⚠️',
  obra: '🚧',
  enchente: '🌊',
  acidente: '💥',
  assalto: '🚨',
  outro: '❗',
};

// Labels amigáveis por tipo
const LABEL_TIPO: Record<TipoAlerta, string> = {
  oleo: 'Óleo na pista',
  areia: 'Areia na pista',
  buraco: 'Buraco',
  obra: 'Obra na pista',
  enchente: 'Enchente',
  acidente: 'Acidente',
  assalto: 'Alerta de assalto',
  outro: 'Alerta na via',
};

// Configurar handler de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Solicita permissão de notificação ao usuário.
 * No Android 13+ (API 33+), a permissão POST_NOTIFICATIONS é obrigatória.
 * @returns true se permissão concedida, false caso contrário
 */
export async function solicitarPermissao(): Promise<boolean> {
  // Verificar status atual
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  // Se já Granted, configurar canal e retornar
  if (existingStatus === 'granted') {
    await configurarCanalAndroid();
    return true;
  }

  // Solicitar permissão (Android 13+ requer POST_NOTIFICATIONS)
  // O expo-notifications lida automaticamente com isso no Android
  // Importante: também solicitar para status 'undetermined'
  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== 'granted') {
    console.log('[notificationService] Permissão de notificação negada:', status);
    return false;
  }

  await configurarCanalAndroid();
  return true;
}

/**
 * Configura canal de notificação para Android.
 */
async function configurarCanalAndroid(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alertas-proximidade', {
      name: 'Alertas de Proximidade',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

/**
 * Formata distância de forma amigável.
 */
function formatarDistancia(metros: number): string {
  if (metros < 100) {
    return `~${Math.round(metros)}m`;
  }
  return `~${Math.round(metros / 100) * 100}m`;
}

/**
 * Dispara uma notificação local de alerta próximo.
 * @param tipo Tipo do alerta
 * @param distanciaMetros Distância aproximada em metros
 */
export async function dispararNotificacaoAlerta(
  tipo: TipoAlerta,
  distanciaMetros: number
): Promise<void> {
  const emoji = EMOJI_TIPO[tipo];
  const label = LABEL_TIPO[tipo];
  const distancia = formatarDistancia(distanciaMetros);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${emoji} ${label}`,
      body: `${distancia} à frente — tome cuidado!`,
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null, // Imediato
  });
}