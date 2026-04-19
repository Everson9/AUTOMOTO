// apps/mobile/src/components/SheetDetalheAlerta/index.tsx
//
// Bottom sheet com detalhes do alerta ao tocar no marcador.
// Permite confirmar ou negar a presença do alerta.

import React, { forwardRef, useMemo, useImperativeHandle, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { TipoAlerta } from '../../screens/Mapa/useMapa';

// Nomes em português por tipo de alerta
const NOMES_TIPO: Record<TipoAlerta, string> = {
  oleo: 'Óleo na pista',
  areia: 'Areia/cascalho',
  buraco: 'Buraco',
  obra: 'Obra',
  enchente: 'Alagamento',
  acidente: 'Acidente',
  assalto: 'Assalto/furto',
  outro: 'Outro perigo',
};

// Configuração de ícone e cor por tipo de alerta (mesmo do AlertaMarker)
const ALERTA_CONFIG: Record<TipoAlerta, { icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }> = {
  oleo:     { icon: 'oil',            color: '#6B7280' },
  areia:    { icon: 'weather-dust',   color: '#D97706' },
  buraco:   { icon: 'alert-circle',   color: '#DC2626' },
  obra:     { icon: 'traffic-cone',   color: '#F97316' },
  enchente: { icon: 'waves',          color: '#2563EB' },
  acidente: { icon: 'car-emergency',  color: '#DC2626' },
  assalto:  { icon: 'shield-alert',   color: '#7F1D1D' },
  outro:    { icon: 'alert',          color: '#9CA3AF' },
};

export interface AlertaDetalhe {
  id: string;
  tipo: TipoAlerta;
  confirmacoes: number;
  negacoes: number;
  criado_em?: string;
}

export interface SheetDetalheAlertaProps {
  /** Dados do alerta selecionado */
  alerta: AlertaDetalhe | null;
  /** Se o usuário já votou neste alerta */
  jaVotou: boolean;
  /** Callback ao confirmar o alerta */
  onConfirmar: () => void;
  /** Callback ao negar o alerta */
  onNegar: () => void;
  /** Callback ao fechar o sheet */
  onClose: () => void;
}

export interface SheetDetalheAlertaRef {
  expand: () => void;
  close: () => void;
}

/**
 * Calcula texto relativo de tempo (ex: "há 5 min", "há 2h", "há 1 dia")
 */
function formatarTempoRelativo(dataIso?: string): string {
  if (!dataIso) return 'recentemente';

  const data = new Date(dataIso);
  const agora = new Date();
  const diffMs = agora.getTime() - data.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffHoras / 24);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffHoras < 24) return `há ${diffHoras}h`;
  if (diffDias === 1) return 'há 1 dia';
  return `há ${diffDias} dias`;
}

export const SheetDetalheAlerta = forwardRef<SheetDetalheAlertaRef, SheetDetalheAlertaProps>(
  ({ alerta, jaVotou, onConfirmar, onNegar, onClose }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);

    useImperativeHandle(ref, () => ({
      expand: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
    }));

    const snapPoints = useMemo(() => ['45%'], []);

    if (!alerta) return null;

    const config = ALERTA_CONFIG[alerta.tipo];
    const nomeTipo = NOMES_TIPO[alerta.tipo];
    const tempoRelativo = formatarTempoRelativo(alerta.criado_em);
    const total = (alerta.confirmacoes || 0) + (alerta.negacoes || 0);
    const percentualConfirma = total > 0 ? (alerta.confirmacoes / total) * 100 : 100;

    const handleConfirmar = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onConfirmar();
      bottomSheetRef.current?.close();
    };

    const handleNegar = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNegar();
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
          {/* Header com ícone e tipo */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => bottomSheetRef.current?.close()}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
              <MaterialCommunityIcons name={config.icon} size={32} color={config.color} />
            </View>

            <Text style={styles.title}>{nomeTipo}</Text>
            <Text style={styles.subtitle}>{tempoRelativo}</Text>
          </View>

          {/* Estatísticas */}
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#16A34A" />
              <Text style={styles.statText}>{alerta.confirmacoes || 0} pessoas confirmaram</Text>
            </View>
            <View style={styles.statRow}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#DC2626" />
              <Text style={styles.statText}>{alerta.negacoes || 0} pessoas negaram</Text>
            </View>
          </View>

          {/* Barra de confiabilidade */}
          <View style={styles.confidenceBar}>
            <View style={[styles.confidenceFill, { width: `${percentualConfirma}%` }]} />
          </View>

          {/* Botões de ação */}
          {jaVotou ? (
            <View style={styles.votedContainer}>
              <MaterialCommunityIcons name="check-circle-outline" size={20} color="#6B7280" />
              <Text style={styles.votedText}>Você já avaliou este alerta</Text>
            </View>
          ) : (
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmar}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="check" size={24} color="#FFFFFF" />
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.denyButton}
                onPress={handleNegar}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
                <Text style={styles.denyButtonText}>Não está mais aqui</Text>
              </TouchableOpacity>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#1A1A1A',
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
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statsContainer: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#DC2626',
    borderRadius: 3,
    marginBottom: 24,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 3,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  denyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  denyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  votedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  votedText: {
    fontSize: 14,
    color: '#6B7280',
  },
});