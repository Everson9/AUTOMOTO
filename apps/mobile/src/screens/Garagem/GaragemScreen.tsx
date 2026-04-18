// apps/mobile/src/screens/Garagem/GaragemScreen.tsx
//
// Tela principal da Garagem.
// Exibe card da moto, KM editável e lista de mods.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGaragem } from './useGaragem';
import { MotoIlustration, TipoMoto } from '../../components/MotoIlustration';
import { ModCard } from '../../components/ModCard';

export default function GaragemScreen() {
  const router = useRouter();
  const { moto, mods, loading, erro, refetch, atualizarKm } = useGaragem();
  const [editandoKm, setEditandoKm] = useState(false);
  const [kmInput, setKmInput] = useState('');
  const [salvandoKm, setSalvandoKm] = useState(false);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{erro}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!moto) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Nenhuma moto cadastrada</Text>
        <Text style={styles.emptySubtitle}>
          Adicione sua moto para começar a usar o Automoto
        </Text>
      </View>
    );
  }

  const handleEditarKm = () => {
    setKmInput(moto.km_atual.toString());
    setEditandoKm(true);
  };

  const handleSalvarKm = async () => {
    const novoKm = parseInt(kmInput, 10);
    if (isNaN(novoKm) || novoKm < 0) {
      Alert.alert('Erro', 'Digite um KM válido');
      return;
    }

    setSalvandoKm(true);
    try {
      await atualizarKm(novoKm);
      setEditandoKm(false);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Erro ao atualizar KM');
    } finally {
      setSalvandoKm(false);
    }
  };

  const handleCancelarKm = () => {
    setEditandoKm(false);
    setKmInput('');
  };

  const handleGerarDossie = () => {
    Alert.alert('Em breve', 'A funcionalidade de Dossiê estará disponível em breve!');
  };

  const handleEditarMoto = () => {
    // TODO: navegar para tela de edição
    Alert.alert('Em breve', 'Tela de edição em desenvolvimento');
  };

  const handleAdicionarMod = () => {
    router.push('/garagem/adicionar-mod');
  };

  const tipoMoto = (moto.tipo as TipoMoto) || 'default';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Card da moto */}
        <View style={styles.motoCard}>
          {/* Ilustração ou foto */}
          <View style={styles.motoImageContainer}>
            {moto.foto_url ? (
              <Image source={{ uri: moto.foto_url }} style={styles.motoFoto} />
            ) : (
              <MotoIlustration tipo={tipoMoto} size={140} />
            )}
          </View>

          {/* Dados da moto */}
          <View style={styles.motoInfo}>
            <Text style={styles.motoModelo}>
              {moto.marca ? `${moto.marca} ` : ''}
              {moto.modelo}
            </Text>
            <Text style={styles.motoPlaca}>{moto.placa}</Text>
            <Text style={styles.motoAno}>{moto.ano}</Text>

            {/* KM editável */}
            <TouchableOpacity
              style={styles.kmContainer}
              onPress={editandoKm ? undefined : handleEditarKm}
              activeOpacity={0.7}
              accessibilityLabel="Editar quilometragem"
            >
              {editandoKm ? (
                <View style={styles.kmEditContainer}>
                  <TextInput
                    style={styles.kmInput}
                    value={kmInput}
                    onChangeText={setKmInput}
                    keyboardType="numeric"
                    autoFocus
                    selectTextOnFocus
                  />
                  <Text style={styles.kmLabel}>km</Text>
                  <TouchableOpacity
                    style={styles.kmSaveButton}
                    onPress={handleSalvarKm}
                    disabled={salvandoKm}
                  >
                    {salvandoKm ? (
                      <ActivityIndicator size="small" color="#F97316" />
                    ) : (
                      <Text style={styles.kmSaveText}>✓</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.kmCancelButton} onPress={handleCancelarKm}>
                    <Text style={styles.kmCancelText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.kmValue}>
                    {moto.km_atual.toLocaleString('pt-BR')}
                  </Text>
                  <Text style={styles.kmLabel}>km</Text>
                  <Text style={styles.kmEditIcon}>✏️</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Botões de ação */}
          <View style={styles.motoActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEditarMoto}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Editar moto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dossieButton}
              onPress={handleGerarDossie}
              activeOpacity={0.7}
            >
              <Text style={styles.dossieButtonText}>Gerar Dossiê PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seção de Mods */}
        <View style={styles.modsSection}>
          <View style={styles.modsHeader}>
            <Text style={styles.modsTitle}>Mods & Customizações</Text>
            <TouchableOpacity
              style={styles.addModButton}
              onPress={handleAdicionarMod}
              activeOpacity={0.7}
            >
              <Text style={styles.addModIcon}>+</Text>
            </TouchableOpacity>
          </View>

          {mods.length === 0 ? (
            <View style={styles.emptyMods}>
              <Text style={styles.emptyModsText}>
                Nenhum mod cadastrado ainda
              </Text>
              <Text style={styles.emptyModsSubtext}>
                Adicione sua primeira customização!
              </Text>
            </View>
          ) : (
            mods.map((mod) => (
              <ModCard
                key={mod.id}
                nome={mod.nome}
                categoria={mod.categoria}
                descricao={mod.descricao}
                dataInstalacao={mod.data_instalacao}
                valorInvestido={mod.valor_investido}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
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
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  motoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  motoImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  motoFoto: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#2D2D2D',
  },
  motoInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  motoModelo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  motoPlaca: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  motoAno: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  kmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  kmValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F97316',
  },
  kmLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 6,
  },
  kmEditIcon: {
    fontSize: 14,
    marginLeft: 8,
  },
  kmEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kmInput: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F97316',
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 80,
    textAlign: 'center',
  },
  kmSaveButton: {
    marginLeft: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0E9F6E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kmSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  kmCancelButton: {
    marginLeft: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E02424',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kmCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  motoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2D2D2D',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',
  },
  dossieButton: {
    flex: 1,
    backgroundColor: '#F97316',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dossieButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modsSection: {
    marginTop: 8,
  },
  modsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addModButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addModIcon: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  emptyMods: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyModsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  emptyModsSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
});