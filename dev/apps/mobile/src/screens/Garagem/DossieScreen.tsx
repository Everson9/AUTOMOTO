// apps/mobile/src/screens/Garagem/DossieScreen.tsx
//
// Tela de preview e geração do Dossiê de Procedência (PDF).
// Exibe resumo da moto e mods antes de gerar.

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDossie } from './useDossie';

export default function DossieScreen() {
  const router = useRouter();
  const {
    loading,
    erro,
    moto,
    mods,
    pdfUri,
    gerando,
    buscarDados,
    gerarPDF,
    compartilhar,
  } = useDossie();

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  const formatarValor = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatarData = (data: string): string => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarCategoria = (cat: string): string => {
    const categorias: Record<string, string> = {
      estetico: 'Estético',
      performance: 'Performance',
      seguranca: 'Segurança',
      conforto: 'Conforto',
      acessorio: 'Acessório',
    };
    return categorias[cat] || cat;
  };

  const totalInvestido = mods.reduce((acc, mod) => {
    return acc + (mod.valor_investido || 0);
  }, 0);

  const handleGerarPDF = async () => {
    const uri = await gerarPDF();
    if (uri) {
      Alert.alert(
        'PDF Gerado',
        'O Dossiê de Procedência foi gerado com sucesso!',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCompartilhar = async () => {
    await compartilhar();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{erro}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={buscarDados}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Voltar para Garagem</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!moto) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Nenhuma moto cadastrada</Text>
        <Text style={styles.emptySubtitle}>
          Cadastre uma moto na Garagem para gerar o Dossiê
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Voltar para Garagem</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dossiê de Procedência</Text>
          <Text style={styles.subtitle}>
            Revise os dados antes de gerar o PDF
          </Text>
        </View>

        {/* Card da Moto */}
        <View style={styles.motoCard}>
          <Text style={styles.motoNome}>
            {moto.marca ? `${moto.marca} ` : ''}{moto.modelo}
          </Text>
          <View style={styles.motoInfoRow}>
            <Text style={styles.motoLabel}>Placa</Text>
            <Text style={styles.motoValue}>{moto.placa}</Text>
          </View>
          <View style={styles.motoInfoRow}>
            <Text style={styles.motoLabel}>Ano</Text>
            <Text style={styles.motoValue}>{moto.ano}</Text>
          </View>
          {moto.cor && (
            <View style={styles.motoInfoRow}>
              <Text style={styles.motoLabel}>Cor</Text>
              <Text style={styles.motoValue}>{moto.cor}</Text>
            </View>
          )}
          <View style={styles.motoInfoRow}>
            <Text style={styles.motoLabel}>Quilometragem</Text>
            <Text style={styles.motoKmValue}>
              {moto.km_atual.toLocaleString('pt-BR')} km
            </Text>
          </View>
        </View>

        {/* Lista de Mods */}
        <View style={styles.modsSection}>
          <Text style={styles.sectionTitle}>Customizações ({mods.length})</Text>

          {mods.length === 0 ? (
            <View style={styles.emptyMods}>
              <Text style={styles.emptyModsText}>
                Nenhuma customização cadastrada
              </Text>
            </View>
          ) : (
            <>
              {mods.map((mod) => (
                <View key={mod.id} style={styles.modCard}>
                  <View style={styles.modHeader}>
                    <Text style={styles.modNome} numberOfLines={1}>
                      {mod.nome}
                    </Text>
                    <Text style={styles.modCategoria}>
                      {formatarCategoria(mod.categoria)}
                    </Text>
                  </View>
                  <View style={styles.modDetails}>
                    {mod.data_instalacao && (
                      <Text style={styles.modData}>
                        {formatarData(mod.data_instalacao)}
                      </Text>
                    )}
                    {mod.valor_investido !== null && (
                      <Text style={styles.modValor}>
                        {formatarValor(mod.valor_investido)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}

              {/* Total */}
              <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>Total investido</Text>
                <Text style={styles.totalValue}>{formatarValor(totalInvestido)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Botões */}
        <View style={styles.actions}>
          {!pdfUri ? (
            <TouchableOpacity
              style={styles.gerarButton}
              onPress={handleGerarPDF}
              disabled={gerando}
              activeOpacity={0.7}
            >
              {gerando ? (
                <ActivityIndicator size="small" color="#1A1A1A" />
              ) : (
                <Text style={styles.gerarButtonText}>Gerar PDF</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.compartilharButton}
                onPress={handleCompartilhar}
                activeOpacity={0.7}
              >
                <Text style={styles.compartilharButtonText}>Compartilhar PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.gerarNovamenteButton}
                onPress={handleGerarPDF}
                disabled={gerando}
                activeOpacity={0.7}
              >
                {gerando ? (
                  <ActivityIndicator size="small" color="#F97316" />
                ) : (
                  <Text style={styles.gerarNovamenteButtonText}>Gerar novo PDF</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.voltarButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.voltarButtonText}>Voltar para Garagem</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E02424',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  motoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  motoNome: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  motoInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  motoLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  motoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  motoKmValue: {
    fontSize: 18,
    color: '#F97316',
    fontWeight: '700',
  },
  modsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptyMods: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyModsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  modCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  modCategoria: {
    fontSize: 12,
    color: '#F97316',
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modData: {
    fontSize: 12,
    color: '#6B7280',
  },
  modValor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0E9F6E',
  },
  totalCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0E9F6E',
  },
  actions: {
    marginTop: 8,
  },
  gerarButton: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  gerarButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  compartilharButton: {
    backgroundColor: '#0E9F6E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  compartilharButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gerarNovamenteButton: {
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F97316',
  },
  gerarNovamenteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',
  },
  voltarButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  voltarButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  backButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 14,
    color: '#F97316',
    fontWeight: '500',
  },
});