// apps/mobile/src/components/SheetAlerta/index.tsx

import React, { forwardRef, useMemo, useImperativeHandle, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';

// Define the alert types based on the enum from the database
export type TipoAlerta = 'oleo' | 'areia' | 'buraco' | 'obra' | 'enchente' | 'acidente' | 'outro';

export interface SheetAlertaProps {
  /** Callback chamado ao selecionar um tipo de alerta */
  onSelectTipo: (tipo: TipoAlerta) => void;
  /** Callback chamado ao fechar o sheet */
  onClose: () => void;
}

export interface SheetAlertaRef {
  expand: () => void;
  close: () => void;
}

export const SheetAlerta = forwardRef<SheetAlertaRef, SheetAlertaProps>(
  ({ onSelectTipo, onClose }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      expand: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
    }));

    // Define snap points for the bottom sheet
    const snapPoints = useMemo(() => ['25%', '50%'], []);

    // Alert types with their corresponding icons and colors
    const alertTypes = [
      { key: 'oleo', label: 'Óleo na pista', icon: 'oil-barrel', color: '#F59E0B' },
      { key: 'areia', label: 'Areia na curva', icon: 'terrain', color: '#D97706' },
      { key: 'buraco', label: 'Buraco', icon: 'waves', color: '#EF4444' },
      { key: 'obra', label: 'Obra', icon: 'construction', color: '#8B5CF6' },
      { key: 'enchente', label: 'Enchente', icon: 'water', color: '#3B82F6' },
      { key: 'acidente', label: 'Acidente', icon: 'car-crash', color: '#EC4899' },
      { key: 'outro', label: 'Outro', icon: 'help-outline', color: '#6B7280' },
    ];

    const handleSelectTipo = (tipo: TipoAlerta) => {
      onSelectTipo(tipo);
    };

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={onClose}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.content}>
          <Text style={styles.title}>Selecione o tipo de alerta</Text>
          <Text style={styles.subtitle}>Toque em uma categoria para reportar</Text>

          <View style={styles.gridContainer}>
            {alertTypes.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.alertOption, { borderColor: item.color }]}
                onPress={() => handleSelectTipo(item.key as TipoAlerta)}
                accessibilityLabel={item.label}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                  <MaterialIcons name={item.icon as any} size={24} color={item.color} />
                </View>
                <Text style={styles.optionLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: '#D1D5DB',
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  alertOption: {
    width: '48%',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#374151',
    fontWeight: '500',
  },
});