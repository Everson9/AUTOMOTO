// apps/mobile/src/components/SheetAssalto/index.tsx

import React, { forwardRef, useMemo, useImperativeHandle, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface SheetAssaltoProps {
  /** Callback chamado ao confirmar o reporte de assalto */
  onConfirm: () => void;
  /** Callback chamado ao fechar o sheet */
  onClose: () => void;
}

export interface SheetAssaltoRef {
  expand: () => void;
  close: () => void;
}

export const SheetAssalto = forwardRef<SheetAssaltoRef, SheetAssaltoProps>(
  ({ onConfirm, onClose }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      expand: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
    }));

    // Define snap points for the bottom sheet
    const snapPoints = useMemo(() => ['30%'], []);

    const handleConfirm = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onConfirm();
      bottomSheetRef.current?.close();
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
          <View style={styles.iconContainer}>
            <MaterialIcons name="shield" size={32} color="#7F1D1D" />
          </View>

          <Text style={styles.title}>Reportar Assalto</Text>
          <Text style={styles.subtitle}>
            Ajude outros motociclistas informando sobre áreas perigosas.
          </Text>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.7}
          >
            <MaterialIcons name="warning" size={20} color="#FFFFFF" />
            <Text style={styles.confirmButtonText}>Confirmar Assalto</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Esta informação será adicionada ao mapa de calor e ajudará a alertar outros usuários.
          </Text>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#1A1A1A', // Dark theme
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: '#4B5563',
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(127, 29, 29, 0.2)', // #7F1D1D with 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#9CA3AF',
    marginBottom: 24,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7F1D1D', // Red 900
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    color: '#6B7280',
    paddingHorizontal: 16,
  },
});