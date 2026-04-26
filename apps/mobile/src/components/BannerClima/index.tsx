// apps/mobile/src/components/BannerClima/index.tsx
//
// Banner amigável de aviso de chuva no topo do mapa.
// Animação slide down/up, fecha após 30s, ao tocar no X ou arrastar para cima.

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  PanResponder,
} from 'react-native';

// Tempo até fechar automaticamente: 30 segundos
const TEMPO_AUTO_FECHAR_MS = 30000;
// Distância mínima de arraste para fechar
const DISTANCIA_FECHAMENTO_PX = 60;

export interface BannerClimaProps {
  /** Mensagem amigável a exibir */
  mensagem: string;
  /** Callback ao fechar o banner */
  onClose: () => void;
  /** Se deve mostrar o banner */
  visivel: boolean;
  /** Callback quando o timer expira */
  onTimeout?: () => void;
}

/**
 * Banner de aviso de chuva com animação slide.
 * Tom amigável, não alarmista.
 */
export function BannerClima({ mensagem, onClose, visivel, onTimeout }: BannerClimaProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const panRef = useRef(new Animated.ValueXY()).current;

  /**
   * Fechar com animação (slide up)
   */
  const handleClose = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Resetar pan
    panRef.setValue({ x: 0, y: 0 });

    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [onClose, slideAnim, panRef]);

  /**
   * PanResponder para fechar ao arrastar para cima
   */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Só capturar se for swipe vertical
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        // Só permitir arrastar para cima (valores negativos)
        if (gestureState.dy < 0) {
          panRef.setValue({ x: 0, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -DISTANCIA_FECHAMENTO_PX) {
          // Arrastou suficiente para cima - fechar
          handleClose();
        } else {
          // Retornar à posição original
          Animated.spring(panRef, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  /**
   * Animação de entrada e timer de auto-fechamento
   */
  useEffect(() => {
    if (visivel) {
      // Resetar pan ao abrir
      panRef.setValue({ x: 0, y: 0 });

      // Animar entrada
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-fechar após 30 segundos
      timeoutRef.current = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          onTimeout?.();
          onClose();
        });
      }, TEMPO_AUTO_FECHAR_MS);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visivel, slideAnim, panRef, onClose, onTimeout]);

  if (!visivel) {
    return null;
  }

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { translateY: panRef.y },
          ],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.mensagem}>{mensagem}</Text>
        <TouchableOpacity
          onPress={handleClose}
          style={styles.closeButton}
          accessibilityLabel="Fechar aviso de chuva"
          accessibilityRole="button"
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 100,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D3748',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 56,
  },
  mensagem: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  closeButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  closeIcon: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});