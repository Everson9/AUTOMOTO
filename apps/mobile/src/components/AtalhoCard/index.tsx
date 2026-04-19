// apps/mobile/src/components/AtalhoCard/index.tsx
//
// Botão de atalho reutilizável para a Home.
// Grid 2 colunas com ícone, label e indicador de "em breve".

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';

export interface AtalhoCardProps {
  emoji: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function AtalhoCard({ emoji, label, onPress, disabled = false, loading = false }: AtalhoCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.cardDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#F97316" />
      ) : (
        <>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={[styles.label, disabled && styles.labelDisabled]} numberOfLines={2}>
            {label}
          </Text>
          {disabled && (
            <Text style={styles.emBreve}>Em breve</Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 80,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  emoji: {
    fontSize: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  labelDisabled: {
    color: '#9CA3AF',
  },
  emBreve: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
});