// apps/mobile/src/components/BotaoAlerta/index.tsx

import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export interface BotaoAlertaProps {
  /** Callback chamado ao pressionar o botão */
  onPress: () => void;
}

export function BotaoAlerta({ onPress }: BotaoAlertaProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessibilityLabel="Reportar alerta na via"
    >
      <View style={styles.button}>
        <MaterialIcons name="warning" size={24} color="#FFFFFF" />
        <Text style={styles.buttonText}>Alerta</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626', // Red 600
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