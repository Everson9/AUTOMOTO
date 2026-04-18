// apps/mobile/src/screens/Garagem/EditarModScreen.tsx
//
// Tela para editar customização/mod da moto.
// Formulário com validação Zod + react-hook-form.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEditarMod, CategoriaMod } from './useEditarMod';

// Schema de validação
const modSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome muito longo'),
  descricao: z.string().max(500, 'Descrição muito longa').optional(),
  valorInvestido: z.string().optional(),
  dataInstalacao: z.date().optional().nullable(),
  categoria: z.enum(['estetico', 'performance', 'seguranca', 'conforto', 'acessorio']),
});

type ModFormData = z.infer<typeof modSchema>;

const CATEGORIAS: { value: CategoriaMod; label: string }[] = [
  { value: 'estetico', label: 'Estético' },
  { value: 'performance', label: 'Performance' },
  { value: 'seguranca', label: 'Segurança' },
  { value: 'conforto', label: 'Conforto' },
  { value: 'acessorio', label: 'Acessório' },
];

export default function EditarModScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loading, erro, modData, buscarMod, salvar, deletar } = useEditarMod();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<CategoriaMod>('estetico');
  const [dataPickerVisible, setDataPickerVisible] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ModFormData>({
    resolver: zodResolver(modSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      valorInvestido: '',
      dataInstalacao: null,
      categoria: 'estetico',
    },
  });

  // Buscar dados do mod ao carregar
  useEffect(() => {
    if (id) {
      buscarMod(id);
    }
  }, [id, buscarMod]);

  // Preencher formulário quando dados chegarem
  useEffect(() => {
    if (modData) {
      reset({
        nome: modData.nome,
        descricao: modData.descricao || '',
        valorInvestido: modData.valor_investido?.toString() || '',
        dataInstalacao: modData.data_instalacao ? new Date(modData.data_instalacao) : null,
        categoria: modData.categoria,
      });
      setCategoriaSelecionada(modData.categoria);
      if (modData.data_instalacao) {
        setDataSelecionada(new Date(modData.data_instalacao));
      }
    }
  }, [modData, reset]);

  const onSubmit = async (data: ModFormData) => {
    const sucesso = await salvar({
      nome: data.nome,
      descricao: data.descricao || '',
      valorInvestido: data.valorInvestido || '',
      dataInstalacao: data.dataInstalacao || null,
      categoria: data.categoria,
    });

    if (sucesso) {
      Alert.alert('Sucesso', 'Customização atualizada!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const handleCancelar = () => {
    router.back();
  };

  const handleDeletar = () => {
    if (!modData) return;

    Alert.alert(
      'Remover mod',
      'Deseja remover este mod?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            const sucesso = await deletar();
            if (sucesso) {
              router.back();
            } else {
              Alert.alert('Erro', 'Não foi possível remover o mod');
            }
          },
        },
      ]
    );
  };

  if (loading && !modData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancelar} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar customização</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!modData && erro) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancelar} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar customização</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{erro}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => id && buscarMod(id)}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Editar customização</Text>
        <TouchableOpacity onPress={handleDeletar} style={styles.deleteButton}>
          <MaterialIcons name="delete" size={24} color="#E02424" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Nome */}
        <View style={styles.field}>
          <Text style={styles.label}>Nome *</Text>
          <Controller
            control={control}
            name="nome"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.nome && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="Ex: Escapamento Akrapovic"
                placeholderTextColor="#6B7280"
                maxLength={200}
              />
            )}
          />
          {errors.nome && <Text style={styles.errorText}>{errors.nome.message}</Text>}
        </View>

        {/* Categoria */}
        <View style={styles.field}>
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.categoriaContainer}>
            {CATEGORIAS.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoriaButton,
                  categoriaSelecionada === cat.value && styles.categoriaButtonActive,
                ]}
                onPress={() => {
                  setCategoriaSelecionada(cat.value);
                  setValue('categoria', cat.value);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoriaText,
                    categoriaSelecionada === cat.value && styles.categoriaTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Descrição */}
        <View style={styles.field}>
          <Text style={styles.label}>Descrição (opcional)</Text>
          <Controller
            control={control}
            name="descricao"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea, errors.descricao && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="Detalhes sobre a modificação..."
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            )}
          />
          {errors.descricao && <Text style={styles.errorText}>{errors.descricao.message}</Text>}
        </View>

        {/* Valor */}
        <View style={styles.field}>
          <Text style={styles.label}>Valor investido (opcional)</Text>
          <Controller
            control={control}
            name="valorInvestido"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.valorInvestido && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="R$ 0,00"
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
              />
            )}
          />
        </View>

        {/* Data de instalação */}
        <View style={styles.field}>
          <Text style={styles.label}>Data de instalação (opcional)</Text>
          <Controller
            control={control}
            name="dataInstalacao"
            render={({ field: { onChange, value } }) => (
              <>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => {
                    setDataSelecionada(value || new Date());
                    setDataPickerVisible(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dateButtonText}>
                    {value
                      ? value.toLocaleDateString('pt-BR')
                      : 'Selecionar data'}
                  </Text>
                </TouchableOpacity>

                {dataPickerVisible && (
                  <DateTimePicker
                    value={dataSelecionada || new Date()}
                    mode="date"
                    display={Platform.OS === 'android' ? 'default' : 'default'}
                    onChange={(event, selectedDate) => {
                      setDataPickerVisible(false);
                      if (event.type === 'set' && selectedDate) {
                        onChange(selectedDate);
                        setDataSelecionada(selectedDate);
                      }
                    }}
                    themeVariant="dark"
                    maximumDate={new Date()}
                  />
                )}
              </>
            )}
          />
        </View>

        {/* Mensagem de erro */}
        {erro && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorMessage}>{erro}</Text>
          </View>
        )}
      </ScrollView>

      {/* Botões de ação */}
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
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  content: {
    padding: 20,
    paddingBottom: 24,
  },
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#E02424',
    marginTop: 4,
  },
  categoriaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoriaButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  categoriaButtonActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: '#F97316',
  },
  categoriaText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  categoriaTextActive: {
    color: '#F97316',
    fontWeight: '600',
  },
  dateButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorMessage: {
    fontSize: 14,
    color: '#E02424',
    textAlign: 'center',
  },
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