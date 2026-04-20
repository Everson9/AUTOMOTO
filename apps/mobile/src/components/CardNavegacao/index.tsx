// apps/mobile/src/components/CardNavegacao/index.tsx
//
// Card de navegação que exibe destino, distância e ETA.
// Aparece no topo do mapa durante a navegação.

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RotaHERE, SugestaoEndereco, formatarDistancia, formatarTempo } from '../../services/hereService';

export interface CardNavegacaoProps {
  /** Destino selecionado */
  destino: SugestaoEndereco;
  /** Dados da rota calculada */
  rota: RotaHERE;
  /** Callback para cancelar a navegação */
  onCancelar: () => void;
}

/**
 * Card de navegação exibido durante uma rota ativa.
 * Mostra destino, distância total e tempo estimado.
 */
export function CardNavegacao({ destino, rota, onCancelar }: CardNavegacaoProps) {
  const distanciaFormatada = formatarDistancia(rota.distanciaMetros);
  const tempoFormatado = formatarTempo(rota.tempoSegundos);

  // Truncar nome do destino se muito longo
  const destinoResumido = destino.endereco.length > 30
    ? destino.endereco.substring(0, 30) + '...'
    : destino.endereco;

  return (
    <View style={styles.container}>
      {/* Botão cancelar */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onCancelar}
        accessibilityLabel="Cancelar navegação"
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Informações do destino */}
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="map-marker"
            size={20}
            color="#F97316"
            style={styles.icon}
          />
          <Text style={styles.label} numberOfLines={1}>
            {destinoResumido}
          </Text>
        </View>

        {/* Distância e tempo */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <MaterialCommunityIcons
              name="map-marker-distance"
              size={16}
              color="#9CA3AF"
            />
            <Text style={styles.statValue}>{distanciaFormatada}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color="#9CA3AF"
            />
            <Text style={styles.statValue}>{tempoFormatado}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F97316', // Borda âmbar para destaque
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    color: '#D1D5DB',
    fontSize: 13,
    marginLeft: 4,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#374151',
    marginHorizontal: 12,
  },
});