// apps/mobile/src/components/BuscaDestino/index.tsx
//
// Input de busca de endereço com lista de sugestões (HERE Geocoding).

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SugestaoEndereco } from '../../services/hereService';

export interface BuscaDestinoProps {
  /** Se a busca está ativa (visível) */
  visivel: boolean;
  /** Texto atual da busca */
  query: string;
  /** Lista de sugestões */
  sugestoes: SugestaoEndereco[];
  /** Se está buscando sugestões */
  carregando: boolean;
  /** Callback quando texto muda */
  onQueryChange: (query: string) => void;
  /** Callback para buscar sugestões */
  onBuscar: (query: string) => void;
  /** Callback ao selecionar uma sugestão */
  onSelecionar: (destino: SugestaoEndereco) => void;
  /** Callback para fechar a busca */
  onFechar: () => void;
}

/**
 * Componente de busca de destino com autocompletar.
 */
export function BuscaDestino({
  visivel,
  query,
  sugestoes,
  carregando,
  onQueryChange,
  onBuscar,
  onSelecionar,
  onFechar,
}: BuscaDestinoProps) {
  const [inputValue, setInputValue] = useState(query);

  // Sincronizar input com query externa
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  // Debounce da busca (300ms)
  useEffect(() => {
    if (inputValue.length < 3) return;

    const timer = setTimeout(() => {
      onBuscar(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, onBuscar]);

  // Fechar com teclado
  const handleFechar = () => {
    Keyboard.dismiss();
    onFechar();
  };

  // Selecionar sugestão
  const handleSelecionar = (sugestao: SugestaoEndereco) => {
    Keyboard.dismiss();
    onSelecionar(sugestao);
  };

  if (!visivel) return null;

  return (
    <View style={styles.container}>
      {/* Input de busca */}
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color="#9CA3AF"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Buscar destino..."
          placeholderTextColor="#6B7280"
          value={inputValue}
          onChangeText={(text) => {
            setInputValue(text);
            onQueryChange(text);
          }}
          autoFocus={true}
          returnKeyType="search"
          onSubmitEditing={() => onBuscar(inputValue)}
        />
        {carregando && (
          <ActivityIndicator size="small" color="#F97316" style={styles.loader} />
        )}
        <TouchableOpacity
          onPress={handleFechar}
          style={styles.closeButton}
          accessibilityLabel="Fechar busca"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="close" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Lista de sugestões */}
      {sugestoes.length > 0 && (
        <View style={styles.sugestoesContainer}>
          <FlatList
            data={sugestoes}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.sugestaoItem}
                onPress={() => handleSelecionar(item)}
                accessibilityLabel={`Selecionar ${item.label}`}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name="map-marker"
                  size={20}
                  color="#F97316"
                  style={styles.sugestaoIcon}
                />
                <View style={styles.sugestaoContent}>
                  <Text style={styles.sugestaoLabel} numberOfLines={1}>
                    {item.endereco}
                  </Text>
                  <Text style={styles.sugestaoCidade} numberOfLines={1}>
                    {item.cidade}, {item.estado}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}

      {/* Mensagem quando não há resultados */}
      {inputValue.length >= 3 && !carregando && sugestoes.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum endereço encontrado</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 0, // Remove padding padrão Android
  },
  loader: {
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  sugestoesContainer: {
    marginTop: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    maxHeight: 240,
    overflow: 'hidden',
  },
  sugestaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  sugestaoIcon: {
    marginRight: 12,
  },
  sugestaoContent: {
    flex: 1,
  },
  sugestaoLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  sugestaoCidade: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#374151',
    marginLeft: 44, // Alinha com texto
  },
  emptyContainer: {
    marginTop: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});