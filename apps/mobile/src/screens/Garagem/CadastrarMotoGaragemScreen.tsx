// apps/mobile/src/screens/Garagem/CadastrarMotoGaragemScreen.tsx
//
// Tela para cadastrar nova moto dentro da Garagem.
// Formulário com validação Zod + react-hook-form + image picker.

import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCadastrarMoto, TipoMoto } from './useCadastrarMoto';
import { MotoIlustration } from '../../components/MotoIlustration';

// Schema de validação
const motoSchema = z.object({
  placa: z.string()
    .length(7, 'Placa deve ter 7 caracteres')
    .regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, 'Formato inválido. Ex: ABC1D23'),
  modelo: z.string().min(2, 'Modelo deve ter pelo menos 2 caracteres').max(100, 'Modelo muito longo'),
  marca: z.string().max(50, 'Marca muito longa').optional(),
  ano: z.number().min(1970, 'Ano inválido').max(new Date().getFullYear() + 1, 'Ano inválido'),
  cor: z.string().max(30, 'Cor muito longa').optional(),
  tipo: z.enum(['street', 'sport', 'touring', 'cruiser', 'trail', 'scooter', 'custom']),
  km_atual: z.number().min(0, 'KM inválido').max(9999999, 'KM inválido'),
});

type MotoFormData = z.infer<typeof motoSchema>;

const TIPOS_MOTO: { value: TipoMoto; label: string }[] = [
  { value: 'street', label: 'Street' },
  { value: 'sport', label: 'Sport' },
  { value: 'touring', label: 'Touring' },
  { value: 'cruiser', label: 'Cruiser' },
  { value: 'trail', label: 'Trail' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'custom', label: 'Custom' },
];

export default function CadastrarMotoGaragemScreen() {
  const router = useRouter();
  const {
    loading,
    erro,
    fotoUri,
    selecionarFoto,
    cadastrar,
  } = useCadastrarMoto();
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoMoto>('street');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MotoFormData>({
    resolver: zodResolver(motoSchema),
    defaultValues: {
      placa: '',
      modelo: '',
      marca: '',
      ano: new Date().getFullYear(),
      cor: '',
      tipo: 'street',
      km_atual: 0,
    },
  });

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

    if (fotoUri) {
      options.push({ text: 'Remover foto', onPress: () => selecionarFoto('') });
    }

    options.push({ text: 'Cancelar', style: 'cancel' });

    Alert.alert('Foto da moto', 'Escolha uma opção', options);
  };

  // Submeter formulário
  const onSubmit = async (data: MotoFormData) => {
    const result = await cadastrar({
      placa: data.placa.toUpperCase(),
      modelo: data.modelo,
      marca: data.marca || '',
      ano: data.ano,
      cor: data.cor || '',
      tipo: data.tipo,
      km_atual: data.km_atual,
      foto_url: fotoUri || null,
    });

    if (result.success) {
      Alert.alert('Sucesso', 'Moto cadastrada!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const handleCancelar = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancelar} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adicionar moto</Text>
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
          ) : (
            <View style={styles.fotoPlaceholder}>
              <MotoIlustration tipo="default" size={80} color="#6B7280" />
              <Text style={styles.fotoPlaceholderText}>Toque para adicionar foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Placa */}
        <View style={styles.field}>
          <Text style={styles.label}>Placa *</Text>
          <Controller
            control={control}
            name="placa"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.placa && styles.inputError]}
                value={value}
                onChangeText={(text) => onChange(text.replace(/[^A-Za-z0-9]/g, '').toUpperCase())}
                placeholder="ABC1D23"
                placeholderTextColor="#6B7280"
                maxLength={7}
                autoCapitalize="characters"
              />
            )}
          />
          {errors.placa && <Text style={styles.error}>{errors.placa.message}</Text>}
        </View>

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

        {/* Tipo */}
        <View style={styles.field}>
          <Text style={styles.label}>Tipo *</Text>
          <Controller
            control={control}
            name="tipo"
            render={({ field: { onChange, value } }) => (
              <View style={styles.tipoContainer}>
                {TIPOS_MOTO.map((tipo) => (
                  <TouchableOpacity
                    key={tipo.value}
                    style={[
                      styles.tipoButton,
                      value === tipo.value && styles.tipoButtonActive,
                    ]}
                    onPress={() => {
                      onChange(tipo.value);
                      setTipoSelecionado(tipo.value);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.tipoText,
                        value === tipo.value && styles.tipoTextActive,
                      ]}
                    >
                      {tipo.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        {/* KM Atual */}
        <View style={styles.field}>
          <Text style={styles.label}>KM Atual</Text>
          <Controller
            control={control}
            name="km_atual"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.km_atual && styles.inputError]}
                value={value?.toString()}
                onChangeText={(text) => onChange(text ? parseInt(text) || 0 : 0)}
                placeholder="Ex: 12000"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
              />
            )}
          />
          {errors.km_atual && <Text style={styles.error}>{errors.km_atual.message}</Text>}
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
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#1A1A1A" />
          ) : (
            <Text style={styles.saveButtonText}>Cadastrar</Text>
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
  fotoPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoPlaceholderText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
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
  // Tipo selector
  tipoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tipoButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  tipoButtonActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: '#F97316',
  },
  tipoText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  tipoTextActive: {
    color: '#F97316',
    fontWeight: '600',
  },
  // Error
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