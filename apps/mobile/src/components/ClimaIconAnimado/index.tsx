// apps/mobile/src/components/ClimaIconAnimado/index.tsx
//
// Ícone de chuva animado com balanço suave.
// Rotação de -10° a +10° em loop infinito, 1.5s por ciclo.

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface ClimaIconAnimadoProps {
  size?: number;
}

export function ClimaIconAnimado({ size = 20 }: ClimaIconAnimadoProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de balanço: -10° a +10° em loop
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 750, // metade do ciclo (ida)
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 750, // metade do ciclo (volta)
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [rotateAnim]);

  // Interpolar de 0-1 para -10° a +10°
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '10deg'],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ rotate: rotation }] }]}>
      <Text style={[styles.icon, { fontSize: size }]}>🌧️</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    // Estilo base do texto do emoji
  },
});