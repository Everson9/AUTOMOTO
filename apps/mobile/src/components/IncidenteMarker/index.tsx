// apps/mobile/src/components/IncidenteMarker/index.tsx
//
// Marcador customizado para incidentes da HERE API.
// Diferencia de alertas da comunidade com badge "HERE".

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Marker } from '@maplibre/maplibre-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { INCIDENTE_HERE_CONFIG, TipoIncidenteHERE } from '../../services/hereService';

export interface IncidenteMarkerProps {
  /** ID único do incidente */
  id: string;
  /** Coordenadas [longitude, latitude] */
  coordinate: [number, number];
  /** Tipo do incidente */
  tipo: TipoIncidenteHERE;
  /** Callback ao pressionar o marcador */
  onPress?: () => void;
}

/**
 * Marcador de incidente HERE com ícone MaterialCommunityIcons.
 * Fundo branco, borda colorida, e badge "HERE" no canto.
 */
export function IncidenteMarker({ id, coordinate, tipo, onPress }: IncidenteMarkerProps) {
  const config = INCIDENTE_HERE_CONFIG[tipo];

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
        accessibilityLabel={`Incidente: ${config.label}`}
        accessibilityRole="button"
      >
        <MaterialCommunityIcons
          name={config.icon}
          size={24}
          color={config.color}
        />
        {/* Badge "HERE" */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>HERE</Text>
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#1A56DB', // Azul para diferenciar de alertas da comunidade
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
});