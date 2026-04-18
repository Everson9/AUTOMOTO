import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePerfil } from './usePerfil';

export default function PerfilScreen() {
  const router = useRouter();
  const { nome, email, iniciais, moto, loading, erro, trocarSenha, sair } = usePerfil();

  const confirmarSaida = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: sair },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header com botão voltar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Avatar e dados do usuário */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{iniciais}</Text>
          </View>
          <Text style={styles.nome}>{nome}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Card da moto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Moto cadastrada</Text>
          {moto ? (
            <View style={styles.motoCard}>
              <View style={styles.motoRow}>
                <Text style={styles.motoLabel}>Modelo</Text>
                <Text style={styles.motoValue}>{moto.modelo}</Text>
              </View>
              <View style={styles.motoDivider} />
              <View style={styles.motoRow}>
                <Text style={styles.motoLabel}>Placa</Text>
                <Text style={styles.motoValue}>{moto.placa}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.motoCardEmpty}>
              <Text style={styles.motoEmptyText}>
                {erro || 'Nenhuma moto cadastrada'}
              </Text>
            </View>
          )}
        </View>

        {/* Botões de ação */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={trocarSenha}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>Trocar senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={confirmarSaida}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#F97316',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  nome: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  motoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  motoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  motoLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  motoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  motoDivider: {
    height: 1,
    backgroundColor: '#2D2D2D',
    marginVertical: 4,
  },
  motoCardEmpty: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  motoEmptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  actionButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F97316',
  },
  logoutButton: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});