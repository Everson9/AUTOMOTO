// apps/mobile/src/components/ModCard/index.tsx
//
// Card de customização/mod da moto.
// Exibe nome, categoria, descrição, data e valor.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface ModCardProps {
  /** Nome do mod */
  nome: string;
  /** Categoria do mod */
  categoria: string;
  /** Descrição/observação (opcional) */
  descricao?: string | null;
  /** Data de instalação (opcional) */
  dataInstalacao?: string | null;
  /** Valor investido (opcional) */
  valorInvestido?: number | null;
  /** Callback ao pressionar o card */
  onPress?: () => void;
}

/**
 * Card de customização da moto.
 * Design dark com borda sutil e destaque no nome.
 */
export function ModCard({
  nome,
  categoria,
  descricao,
  dataInstalacao,
  valorInvestido,
  onPress,
}: ModCardProps) {
  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const content = (
    <>
      <View style={styles.header}>
        <Text style={styles.nome} numberOfLines={1}>
          {nome}
        </Text>
        <Text style={styles.categoria}>{categoria}</Text>
      </View>

      {descricao && (
        <Text style={styles.descricao} numberOfLines={2}>
          {descricao}
        </Text>
      )}

      <View style={styles.footer}>
        {dataInstalacao && (
          <Text style={styles.data}>{formatarData(dataInstalacao)}</Text>
        )}
        {valorInvestido !== null && valorInvestido !== undefined && (
          <Text style={styles.valor}>{formatarValor(valorInvestido)}</Text>
        )}
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityLabel={`Mod: ${nome}`}
        accessibilityRole="button"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  categoria: {
    fontSize: 12,
    color: '#F97316',
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  descricao: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  data: {
    fontSize: 12,
    color: '#6B7280',
  },
  valor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0E9F6E',
  },
});