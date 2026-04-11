import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../hooks/AuthProvider';

// Esquema de validação com Zod - seguindo padrão do SKILLS.md seção 9
const schemaCadastroMoto = z.object({
  placa: z.string().length(7, 'Placa inválida').regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, 'Formato inválido'),
  modelo: z.string().min(2, 'Modelo obrigatório').max(100),
  ano: z.number().min(1970).max(new Date().getFullYear() + 1),
  km_atual: z.number().min(0).max(9999999),
});

type FormData = z.infer<typeof schemaCadastroMoto>;

export default function CadastrarMotoScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuthContext();

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(schemaCadastroMoto),
    defaultValues: {
      placa: '',
      modelo: '',
      ano: new Date().getFullYear(),
      km_atual: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    setLoading(true);
    try {
      // Salvar no Supabase - seguindo padrão do SKILLS.md seção 3
      const { data: motoData, error } = await supabase
        .from('motos')
        .insert([{
          user_id: user.id,
          placa: data.placa.toUpperCase(), // garantir formato correto
          modelo: data.modelo,
          ano: data.ano,
          km_atual: data.km_atual,
          ativa: true, // Define esta moto como ativa
        }])
        .select()
        .single();

      if (error) {
        // Segundo padrão do SKILLS.md seção 10
        console.error('[cadastrarMoto]', error);
        throw new Error(error.message);
      }

      Alert.alert('Sucesso', 'Moto cadastrada com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (err: any) {
      // Segundo padrão do SKILLS.md seção 10
      console.error('[cadastrarMoto]', err);
      Alert.alert('Erro', err.message || 'Erro ao cadastrar moto');
    } finally {
      setLoading(false);
    }
  };

  const handlePlacaChange = (text: string) => {
    // Permitir apenas letras e números, converter para maiúsculas
    const formatted = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    setValue('placa', formatted, { shouldValidate: true });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastrar Moto</Text>

      <Controller
        control={control}
        name="placa"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Placa *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: ABC1D23"
              value={value}
              onChangeText={handlePlacaChange}
              maxLength={8}
              autoCapitalize="characters"
            />
            {errors.placa && <Text style={styles.error}>{errors.placa.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="modelo"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Modelo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: CG 160 Titan"
              value={value}
              onChangeText={onChange}
              autoCapitalize="words"
            />
            {errors.modelo && <Text style={styles.error}>{errors.modelo.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="ano"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ano *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 2023"
              value={value?.toString()}
              onChangeText={(text) => onChange(text ? parseInt(text) : null)}
              keyboardType="numeric"
              maxLength={4}
            />
            {errors.ano && <Text style={styles.error}>{errors.ano.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="km_atual"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>KM Atual *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 12000"
              value={value?.toString()}
              onChangeText={(text) => onChange(text ? parseInt(text) || 0 : 0)}
              keyboardType="numeric"
            />
            {errors.km_atual && <Text style={styles.error}>{errors.km_atual.message}</Text>}
          </View>
        )}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Cadastrar Moto</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#1A56DB',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  error: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#1A56DB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});