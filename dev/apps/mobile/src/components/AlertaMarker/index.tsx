// apps/mobile/src/components/AlertaMarker/index.tsx
//
// Marcador customizado para alertas no mapa.
// Exibe ícone MaterialCommunityIcons com fundo branco e borda colorida.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from '@maplibre/maplibre-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TipoAlerta } from '../../screens/Mapa/useMapa';

export interface AlertaMarkerProps {
  /** ID único do alerta */
  id: string;
  /** Coordenadas [longitude, latitude] */
  coordinate: [number, number];
  /** Tipo do alerta */
  tipo: TipoAlerta;
  /** Callback ao pressionar o marcador */
  onPress?: () => void;
}

// Configuração de ícone e cor por tipo de alerta (exportado para uso em outras telas)
export const ALERTA_CONFIG: Record<TipoAlerta, { icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }> = {
  oleo:     { icon: 'oil',            color: '#6B7280' },  // cinza
  areia:    { icon: 'weather-dust',   color: '#D97706' },  // âmbar escuro
  buraco:   { icon: 'alert-circle',   color: '#DC2626' },  // vermelho
  obra:     { icon: 'traffic-cone',   color: '#F97316' }, // laranja
  enchente: { icon: 'waves',          color: '#2563EB' }, // azul
  acidente: { icon: 'car-emergency',  color: '#DC2626' }, // vermelho
  assalto:  { icon: 'shield-alert',   color: '#7F1D1D' }, // vermelho escuro
  outro:    { icon: 'alert',          color: '#9CA3AF' },  // cinza claro
};

/**
 * Marcador de alerta com ícone MaterialCommunityIcons.
 * Fundo branco com borda colorida conforme tipo do alerta.
 */
export function AlertaMarker({ id, coordinate, tipo, onPress }: AlertaMarkerProps) {
  const config = ALERTA_CONFIG[tipo];

  return (
    <Marker
      id={id}
      lngLat={coordinate}
      anchor="center"
      onPress={onPress}
    >
      <View
        style={[styles.container, { borderColor: config.color }]}
        pointerEvents="none"
        accessibilityLabel={`Alerta: ${tipo}`}
        accessibilityRole="button"
      >
        <MaterialCommunityIcons
          name={config.icon}
          size={26}
          color={config.color}
        />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});