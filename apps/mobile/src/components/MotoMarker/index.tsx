// apps/mobile/src/components/MotoMarker/index.tsx
//
// Marcador customizado para a posição do usuário no mapa.
// Exibe PNG da moto rotacionando conforme heading (direção do movimento).

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { Marker } from '@maplibre/maplibre-react-native';

export interface MotoMarkerProps {
  /** Coordenadas [longitude, latitude] */
  coordinate: [number, number];
  /** Direção do movimento em graus (0-360) */
  heading: number;
}

/**
 * Marcador de posição do usuário com imagem de moto customizada.
 * Rotaciona suavemente conforme a direção do movimento.
 */
export function MotoMarker({ coordinate, heading }: MotoMarkerProps) {
  const rotationAnim = useRef(new Animated.Value(0)).current;

  // Animar rotação quando heading muda
  useEffect(() => {
    // Calcular diferença angular para menor rotação
    const currentRotation = rotationAnim.__getValue?.() || 0;
    let delta = heading - currentRotation;

    // Normalizar para menor rotação (-180 a 180)
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;

    Animated.spring(rotationAnim, {
      toValue: currentRotation + delta,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [heading, rotationAnim]);

  const rotateStyle = {
    transform: [
      {
        rotate: rotationAnim.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        }) as any,
      },
    ],
  };

  return (
    <Marker
      id="user-location"
      lngLat={coordinate}
      anchor="center"
      style={{ zIndex: 999 }}
    >
      <Animated.View style={[styles.container, rotateStyle]}>
        <Image
          source={require('../../../assets/images/motorcycle.png')}
          style={styles.motoImage}
          resizeMode="contain"
        />
      </Animated.View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  motoImage: {
    width: 72,
    height: 72,
  },
});