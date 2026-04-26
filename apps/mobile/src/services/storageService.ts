// apps/mobile/src/services/storageService.ts
//
// Serviço para upload de arquivos no Supabase Storage.
// Gerencia fotos de motos e outros assets.

import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';

const BUCKET_MOTOS = 'fotos';

/**
 * Faz upload de uma foto de moto para o Supabase Storage.
 * Usa FileSystem + base64-arraybuffer para compatibilidade com React Native.
 * @param uri URI local da imagem (do image picker)
 * @param userId ID do usuário
 * @param motoId ID da moto
 * @returns URL pública da imagem
 */
export async function uploadFotoMoto(
  uri: string,
  userId: string,
  motoId: string
): Promise<string> {
  // Extensão do arquivo
  const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${userId}/${motoId}.${ext}`;

  // Ler arquivo como base64 (React Native não suporta fetch de file://)
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64',
  });

  // Converter base64 para ArrayBuffer
  const arrayBuffer = decode(base64);

  // Upload
  const { data, error } = await supabase.storage
    .from(BUCKET_MOTOS)
    .upload(fileName, arrayBuffer, {
      cacheControl: '3600',
      upsert: true,
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    });

  if (error) {
    console.error('[storageService] Upload error:', error);
    throw new Error(error.message);
  }

  // Obter URL pública
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_MOTOS)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Deleta uma foto de moto do Storage.
 * @param url URL pública da imagem
 */
export async function deletarFotoMoto(url: string): Promise<void> {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    // Encontrar o path após o bucket name
    const bucketIndex = pathParts.findIndex(p => p === BUCKET_MOTOS);
    if (bucketIndex === -1) return;

    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from(BUCKET_MOTOS)
      .remove([filePath]);

    if (error) {
      console.error('[storageService] Delete error:', error);
    }
  } catch (err) {
    console.error('[storageService] Error parsing URL:', err);
  }
}