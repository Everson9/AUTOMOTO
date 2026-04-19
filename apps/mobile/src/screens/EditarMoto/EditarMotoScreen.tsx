// apps/mobile/src/screens/EditarMoto/EditarMotoScreen.tsx
//
// Tela para editar dados da moto e fazer upload de foto.
// Formulário com validação Zod + react-hook-form + image picker.

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEditarMoto } from './useEditarMoto';
import { MotoIlustration } from '../../components/MotoIlustration';

// Schema de validação
const motoSchema = z.object({
  modelo: z.string().min(2, 'Modelo deve ter pelo menos 2 caracteres').max(100, 'Modelo muito longo'),
  marca: z.string().max(50, 'Marca muito longa').optional(),
  ano: z.number().min(1970, 'Ano inválido').max(new Date().getFullYear() + 1, 'Ano inválido'),
  cor: z.string().max(30, 'Cor muito longa').optional(),
});

type MotoFormData = z.infer<typeof motoSchema>;

export default function EditarMotoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    loading,
    saving,
    erro,
    motoData,
    fotoUri,
    buscarMoto,
    selecionarFoto,
    salvar,
  } = useEditarMoto(id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MotoFormData>({
    resolver: zodResolver(motoSchema),
    defaultValues: {
      modelo: '',
      marca: '',
      ano: new Date().getFullYear(),
      cor: '',
    },
  });

  // Carregar dados da moto
  useEffect(() => {
    if (id) {
      buscarMoto(id);
    }
  }, [id, buscarMoto]);

  // Preencher formulário quando dados chegarem
  useEffect(() => {
    if (motoData) {
      reset({
        modelo: motoData.modelo,
        marca: motoData.marca || '',
        ano: motoData.ano,
        cor: motoData.cor || '',
      });
    }
  }, [motoData, reset]);

  // Selecionar foto da galeria
  const handleEscolherFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para escolher uma foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      selecionarFoto(result.assets[0].uri);
    }
  };

  // Tirar foto com câmera
  const handleTirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para tirar uma foto.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      selecionarFoto(result.assets[0].uri);
    }
  };

  // Menu de opções de foto
  const handleFotoPress = () => {
    const options: Array<{ text: string; onPress?: () => void; style?: 'cancel' | 'default' | 'destructive' }> = [
      { text: 'Escolher da galeria', onPress: handleEscolherFoto },
      { text: 'Tirar foto', onPress: handleTirarFoto },
    ];

    if (fotoUri && motoData?.foto_url) {
      options.push({ text: 'Remover foto', onPress: () => selecionarFoto('') });
    }

    options.push({ text: 'Cancelar', style: 'cancel' });

    Alert.alert('Foto da moto', 'Escolha uma opção', options);
  };

  // Submeter formulário
  const onSubmit = async (data: MotoFormData) => {
    const sucesso = await salvar({
      modelo: data.modelo,
      marca: data.marca || '',
      ano: data.ano,
      cor: data.cor || '',
      foto_url: fotoUri || null,
    });

    if (sucesso) {
      Alert.alert('Sucesso', 'Moto atualizada!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const handleCancelar = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancelar} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar moto</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancelar} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar moto</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Foto da moto */}
        <TouchableOpacity
          style={styles.fotoContainer}
          onPress={handleFotoPress}
          activeOpacity={0.8}
        >
          {fotoUri ? (
            <Image source={{ uri: fotoUri }} style={styles.foto} resizeMode="contain" />
          ) : motoData?.foto_url ? (
            <Image source={{ uri: motoData.foto_url }} style={styles.foto} resizeMode="contain" />
          ) : (
            <MotoIlustration tipo="default" size={120} color="#6B7280" />
          )}
          <View style={styles.fotoOverlay}>
            <Text style={styles.fotoOverlayText}>Toque para alterar</Text>
          </View>
        </TouchableOpacity>

        {/* Placa (somente leitura) */}
        {motoData && (
          <View style={styles.field}>
            <Text style={styles.label}>Placa</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{motoData.placa}</Text>
            </View>
            <Text style={styles.hint}>A placa não pode ser alterada</Text>
          </View>
        )}

        {/* Modelo */}
        <View style={styles.field}>
          <Text style={styles.label}>Modelo *</Text>
          <Controller
            control={control}
            name="modelo"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.modelo && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="Ex: CG 160 Titan"
                placeholderTextColor="#6B7280"
                autoCapitalize="words"
              />
            )}
          />
          {errors.modelo && <Text style={styles.error}>{errors.modelo.message}</Text>}
        </View>

        {/* Marca */}
        <View style={styles.field}>
          <Text style={styles.label}>Marca</Text>
          <Controller
            control={control}
            name="marca"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.marca && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="Ex: Honda"
                placeholderTextColor="#6B7280"
                autoCapitalize="words"
              />
            )}
          />
          {errors.marca && <Text style={styles.error}>{errors.marca.message}</Text>}
        </View>

        {/* Ano */}
        <View style={styles.field}>
          <Text style={styles.label}>Ano *</Text>
          <Controller
            control={control}
            name="ano"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.ano && styles.inputError]}
                value={value?.toString()}
                onChangeText={(text) => onChange(text ? parseInt(text) || 0 : 0)}
                placeholder="Ex: 2023"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                maxLength={4}
              />
            )}
          />
          {errors.ano && <Text style={styles.error}>{errors.ano.message}</Text>}
        </View>

        {/* Cor */}
        <View style={styles.field}>
          <Text style={styles.label}>Cor</Text>
          <Controller
            control={control}
            name="cor"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.cor && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="Ex: Preta"
                placeholderTextColor="#6B7280"
                autoCapitalize="words"
              />
            )}
          />
          {errors.cor && <Text style={styles.error}>{errors.cor.message}</Text>}
        </View>

        {/* Erro */}
        {erro && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>{erro}</Text>
          </View>
        )}
      </ScrollView>

      {/* Botões */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelar}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit(onSubmit)}
          disabled={saving}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#1A1A1A" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
  content: {
    padding: 20,
    paddingBottom: 24,
  },
  // Foto
  fotoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  foto: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#2D2D2D',
  },
  fotoOverlay: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  fotoOverlayText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  // Fields
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  inputError: {
    borderColor: '#E02424',
  },
  error: {
    fontSize: 12,
    color: '#E02424',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  readOnlyField: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorBox: {
    backgroundColor: 'rgba(224, 36, 36, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorBoxText: {
    fontSize: 14,
    color: '#E02424',
    textAlign: 'center',
  },
  // Footer
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#F97316',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});