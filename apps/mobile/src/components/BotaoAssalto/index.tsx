// apps/mobile/src/components/BotaoAssalto/index.tsx

import { StyleSheet, TouchableOpacity, View, Text, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';

export interface BotaoAssaltoProps {
  /** Callback chamado ao pressionar o botão */
  onPress: () => void;
  /** Se o botão deve estar visível (animado) */
  visivel?: boolean;
}

export function BotaoAssalto({ onPress, visivel = true }: BotaoAssaltoProps) {
  const opacity = useRef(new Animated.Value(visivel ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(visivel ? 1 : 0.8)).current;

  useEffect(() => {
    if (visivel) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visivel, opacity, scale]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPress();
  };

  return (
    <Animated.View
      style={[styles.container, { opacity, transform: [{ scale }] }]}
      pointerEvents={visivel ? 'auto' : 'none'}
    >
      <TouchableOpacity
        onPress={handlePress}
        accessibilityLabel="Reportar assalto na região"
        activeOpacity={0.7}
      >
        <View style={styles.button}>
          <MaterialIcons name="shield" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Assalto</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 1000,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7F1D1D', // Red 900 - vermelho escuro conforme design system
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    gap: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});