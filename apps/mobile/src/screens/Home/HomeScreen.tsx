// apps/mobile/src/screens/Home/HomeScreen.tsx
//
// Tela Home contextual do Automoto.
// Exibe moto ativa, clima, alertas e atalhos.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';
import * as Location from 'expo-location';
import { useHome } from './useHome';
import { MotoIlustration, TipoMoto } from '../../components/MotoIlustration';
import { AtalhoCard } from '../../components/AtalhoCard';

const logo = require('../../../assets/images/logo.png');

// Mapeamento de tipos de alerta para emoji
const EMOJI_ALERTA: Record<string, string> = {
  oleo: '🛢️',
  areia: '🏖️',
  buraco: '🕳️',
  obra: '🚧',
  enchente: '🌊',
  acidente: '💥',
  assalto: '🚨',
  outro: '❓',
};

// Formata distância para exibição
function formatarDistancia(metros: number): string {
  if (metros < 1000) {
    return `${Math.round(metros)}m`;
  }
  return `${(metros / 1000).toFixed(1)}km`;
}

export default function HomeScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | undefined>(undefined);
  const [editandoKm, setEditandoKm] = useState(false);
  const [novoKm, setNovoKm] = useState('');
  const [atualizandoKm, setAtualizandoKm] = useState(false);

  const {
    saudacao,
    iniciais,
    moto,
    clima,
    alertas,
    dicaDoDia,
    loading,
    erro,
    refetch,
    atualizarKm,
  } = useHome(location);

  // Obter localização
  useEffect(() => {
    const obterLocalizacao = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setLocation(loc);
        }
      } catch (err) {
        console.error('[HomeScreen] Erro ao obter localização:', err);
      }
    };

    obterLocalizacao();
  }, []);

  // Navegação para perfil
  const handleGoToPerfil = useCallback(() => {
    router.push('/perfil');
  }, [router]);

  // Navegação para Radar (tab)
  const handleGoToRadar = useCallback(() => {
    router.push('/(tabs)/radar');
  }, [router]);

  // Navegação para Garagem (tab)
  const handleGoToGaragem = useCallback(() => {
    router.push('/(tabs)/garagem');
  }, [router]);

  // Em breve
  const handleEmBreve = useCallback(() => {
    Alert.alert('Em breve', 'Esta funcionalidade estará disponível em uma próxima atualização.');
  }, []);

  // Editar KM
  const handleIniciarEdicaoKm = useCallback(() => {
    if (moto) {
      setNovoKm(moto.km_atual.toString());
      setEditandoKm(true);
    }
  }, [moto]);

  // Salvar KM
  const handleSalvarKm = useCallback(async () => {
    const kmNumerico = parseInt(novoKm, 10);
    if (isNaN(kmNumerico) || kmNumerico < 0) {
      Alert.alert('Erro', 'Digite um KM válido');
      return;
    }

    setAtualizandoKm(true);
    try {
      await atualizarKm(kmNumerico);
      setEditandoKm(false);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível atualizar o KM');
    } finally {
      setAtualizandoKm(false);
    }
  }, [novoKm, atualizarKm]);

  // Cancelar edição
  const handleCancelarEdicaoKm = useCallback(() => {
    setEditandoKm(false);
    setNovoKm('');
  }, []);

  // Renderizar card da moto
  const renderCardMoto = () => {
    if (!moto) {
      return (
        <View style={styles.cardMotoEmpty}>
          <Text style={styles.cardMotoEmptyText}>
            Nenhuma moto cadastrada
          </Text>
          <TouchableOpacity
            style={styles.cardMotoEmptyButton}
            onPress={() => router.push('/cadastrar-moto')}
            activeOpacity={0.7}
          >
            <Text style={styles.cardMotoEmptyButtonText}>Cadastrar moto</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const tipoMoto = (moto.tipo || 'default') as TipoMoto;

    return (
      <View style={styles.cardMoto}>
        {/* Foto ou ilustração */}
        <View style={styles.motoImageContainer}>
          {moto.foto_url ? (
            <Image source={{ uri: moto.foto_url }} style={styles.motoImage} resizeMode="cover" />
          ) : (
            <MotoIlustration tipo={tipoMoto} size={80} color="#F97316" />
          )}
        </View>

        {/* Dados da moto */}
        <View style={styles.motoInfo}>
          <Text style={styles.motoModelo} numberOfLines={1}>
            {moto.marca ? `${moto.marca} ` : ''}{moto.modelo}
          </Text>
          <Text style={styles.motoPlaca}>{moto.placa}</Text>

          {/* KM editável */}
          <View style={styles.motoKmContainer}>
            {editandoKm ? (
              <View style={styles.motoKmEditContainer}>
                <TextInput
                  style={styles.motoKmInput}
                  value={novoKm}
                  onChangeText={setNovoKm}
                  keyboardType="numeric"
                  placeholder="KM"
                  placeholderTextColor="#6B7280"
                />
                <TouchableOpacity
                  style={styles.motoKmSaveButton}
                  onPress={handleSalvarKm}
                  disabled={atualizandoKm}
                >
                  {atualizandoKm ? (
                    <ActivityIndicator size="small" color="#1A1A1A" />
                  ) : (
                    <Text style={styles.motoKmSaveText}>✓</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.motoKmCancelButton} onPress={handleCancelarEdicao}>
                  <Text style={styles.motoKmCancelText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.motoKmDisplay}
                onPress={handleIniciarEdicaoKm}
                activeOpacity={0.7}
              >
                <Text style={styles.motoKmLabel}>KM</Text>
                <Text style={styles.motoKmValue}>{moto.km_atual.toLocaleString('pt-BR')}</Text>
                <Text style={styles.motoKmEdit}>✏️</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Status badge */}
          <View style={styles.motoStatusBadge}>
            <View style={styles.motoStatusDot} />
            <Text style={styles.motoStatusText}>Em dia</Text>
          </View>
        </View>
      </View>
    );
  };

  // Renderizar card de clima
  const renderCardClima = () => {
    return (
      <View style={styles.cardClima}>
        {clima ? (
          <>
            <Text style={styles.climaIcone}>{clima.icone}</Text>
            <View style={styles.climaInfo}>
              <Text style={styles.climaTemp}>{clima.temperatura}°C</Text>
              <Text style={styles.climaDesc}>{clima.descricao}</Text>
            </View>
          </>
        ) : (
          <View style={styles.climaLoading}>
            <ActivityIndicator size="small" color="#F97316" />
            <Text style={styles.climaLoadingText}>Carregando clima...</Text>
          </View>
        )}
      </View>
    );
  };

  // Renderizar alertas
  const renderAlertas = () => {
    if (alertas.length === 0) {
      return (
        <View style={styles.alertasEmpty}>
          <Text style={styles.alertasEmptyText}>
            Nenhum alerta na região — pista limpa! 🤙
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.alertasList}
        contentContainerStyle={styles.alertasContent}
      >
        {alertas.map((alerta) => (
          <View key={alerta.id} style={styles.alertaItem}>
            <Text style={styles.alertaEmoji}>
              {EMOJI_ALERTA[alerta.tipo] || '📍'}
            </Text>
            <Text style={styles.alertaTipo}>
              {alerta.tipo.charAt(0).toUpperCase() + alerta.tipo.slice(1)}
            </Text>
            <Text style={styles.alertaDist}>
              {formatarDistancia(alerta.distancia_m)}
            </Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  if (loading && !moto && !clima) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor="#F97316"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.saudacao}>{saudacao}</Text>
          <TouchableOpacity
            style={styles.perfilButton}
            onPress={handleGoToPerfil}
            activeOpacity={0.7}
          >
            <Text style={styles.perfilButtonText}>{iniciais}</Text>
          </TouchableOpacity>
        </View>

        {/* Card da moto ativa */}
        <View style={styles.section}>
          {renderCardMoto()}
        </View>

        {/* Card de clima */}
        <View style={styles.section}>
          {renderCardClima()}
        </View>

        {/* Alertas recentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas na sua região</Text>
          {renderAlertas()}
        </View>

        {/* Grade de atalhos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atalhos rápidos</Text>
          <View style={styles.atalhos}>
            <View style={styles.atalhosRow}>
              <AtalhoCard
                emoji="🗺️"
                label="Abrir Radar"
                onPress={handleGoToRadar}
              />
              <AtalhoCard
                emoji="🏍️"
                label="Minha Garagem"
                onPress={handleGoToGaragem}
              />
            </View>
            <View style={styles.atalhosRow}>
              <AtalhoCard
                emoji="▶️"
                label="Iniciar Viagem"
                onPress={handleEmBreve}
                disabled
              />
              <AtalhoCard
                emoji="⛽"
                label="Abastecimento"
                onPress={handleEmBreve}
                disabled
              />
            </View>
            <View style={styles.atalhosRow}>
              <AtalhoCard
                emoji="📍"
                label="Localizar Moto"
                onPress={handleEmBreve}
                disabled
              />
              <AtalhoCard
                emoji="🔧"
                label="Manutenção"
                onPress={handleEmBreve}
                disabled
              />
            </View>
          </View>
        </View>

        {/* Dica do dia */}
        <View style={styles.section}>
          <View style={styles.dicaCard}>
            <Text style={styles.dicaTitulo}>💡 Dica do dia</Text>
            <Text style={styles.dicaTexto}>{dicaDoDia.texto}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  logo: {
    width: 48,
    height: 48,
  },
  saudacao: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  perfilButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  perfilButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  // Card da moto
  cardMoto: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardMotoEmpty: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    padding: 24,
    alignItems: 'center',
  },
  cardMotoEmptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  cardMotoEmptyButton: {
    backgroundColor: '#F97316',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cardMotoEmptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  motoImageContainer: {
    marginRight: 16,
  },
  motoImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  motoInfo: {
    flex: 1,
  },
  motoModelo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  motoPlaca: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  motoKmContainer: {
    marginBottom: 8,
  },
  motoKmDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  motoKmLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 4,
  },
  motoKmValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginRight: 6,
  },
  motoKmEdit: {
    fontSize: 12,
  },
  motoKmEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  motoKmInput: {
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: '#F97316',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    color: '#FFFFFF',
    width: 80,
    marginRight: 8,
  },
  motoKmSaveButton: {
    backgroundColor: '#F97316',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
  },
  motoKmSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  motoKmCancelButton: {
    backgroundColor: '#2D2D2D',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  motoKmCancelText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  motoStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 159, 110, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  motoStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0E9F6E',
    marginRight: 4,
  },
  motoStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0E9F6E',
  },
  // Card de clima
  cardClima: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  climaIcone: {
    fontSize: 40,
    marginRight: 16,
  },
  climaInfo: {
    flex: 1,
  },
  climaTemp: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  climaDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  climaLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  climaLoadingText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  // Alertas
  alertasList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  alertasContent: {
    paddingRight: 16,
  },
  alertaItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  alertaEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  alertaTipo: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  alertaDist: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  alertasEmpty: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    padding: 16,
    alignItems: 'center',
  },
  alertasEmptyText: {
    fontSize: 14,
    color: '#0E9F6E',
    textAlign: 'center',
  },
  // Atalhos
  atalhos: {
    gap: 12,
  },
  atalhosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  // Dica do dia
  dicaCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    padding: 16,
  },
  dicaTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',
    marginBottom: 8,
  },
  dicaTexto: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
});