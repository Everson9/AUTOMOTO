// apps/mobile/src/screens/Home/useHome.ts
//
// Hook de lógica da tela Home.
// Busca moto ativa, clima, alertas e gera dica do dia.

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../hooks/AuthProvider';
import { LocationObject } from 'expo-location';
import { buscarClimaAtual, ClimaAtual } from '../../services/climaService';

// Moto ativa (simplificado, sem mods)
export interface MotoAtiva {
  id: string;
  modelo: string;
  marca: string | null;
  placa: string;
  km_atual: number;
  foto_url: string | null;
  tipo: string;
}

// Alerta próximo (simplificado para lista)
export interface AlertaProximo {
  id: string;
  tipo: string;
  distancia_m: number;
}

// Dica do dia
export interface DicaDoDia {
  texto: string;
}

export interface UseHomeResult {
  saudacao: string;
  iniciais: string;
  moto: MotoAtiva | null;
  clima: ClimaAtual | null;
  alertas: AlertaProximo[];
  dicaDoDia: DicaDoDia;
  loading: boolean;
  erro: string | null;
  refetch: () => Promise<void>;
  atualizarKm: (novoKm: number) => Promise<void>;
}

// Array de dicas para motociclistas
const DICAS: DicaDoDia[] = [
  { texto: 'Verifique o nível do óleo a cada 1.000km' },
  { texto: 'Calibre os pneus semanalmente para melhor desempenho' },
  { texto: 'Confira a pressão dos pneus com os pneus frios' },
  { texto: 'Limpe e lubrifique a corrente a cada 500km ou após chuva' },
  { texto: 'Verifique o freio antes de cada viagem longa' },
  { texto: 'Mantenha a vela点火 no prazo — revisão a cada 6.000km' },
  { texto: 'Use capas de chuva que cabem dentro do banco' },
  { texto: 'Atrase a troca de marcha para economizar combustível' },
  { texto: 'Faça uma revisão completa a cada 10.000km' },
  { texto: 'Confira as pastilhas de freio a cada 5.000km' },
  { texto: 'Mantenha o filtro de ar limpo para melhor performance' },
  { texto: 'Verifique o reflletores e lanternas regularmente' },
  { texto: 'Não esqueça do capacete — ele salva vidas!' },
  { texto: 'Sempre use luvas para proteger as mãos' },
  { texto: 'Mantenha distância de segurança dos veículos à frente' },
];

/**
 * Gera saudação baseada no horário do dia.
 */
function getSaudacaoHorario(): string {
  const hora = new Date().getHours();
  if (hora >= 5 && hora < 12) {
    return 'Bom dia';
  } else if (hora >= 12 && hora < 18) {
    return 'Boa tarde';
  } else {
    return 'Boa noite';
  }
}

/**
 * Hook principal da tela Home.
 */
export function useHome(location?: LocationObject): UseHomeResult {
  const { user } = useAuthContext();

  const [moto, setMoto] = useState<MotoAtiva | null>(null);
  const [clima, setClima] = useState<ClimaAtual | null>(null);
  const [alertas, setAlertas] = useState<AlertaProximo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Nome do usuário (campo 'nome' no user_metadata)
  const nomeUsuario = user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Motociclista';
  const saudacaoHorario = getSaudacaoHorario();

  // Saudação completa: "Bom dia, Everson!"
  const saudacao = `${saudacaoHorario}, ${nomeUsuario}!`;

  // Iniciais para o avatar (primeira letra do primeiro nome)
  const iniciais = nomeUsuario
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Dica do dia (aleatória a cada abertura)
  const [dicaDoDia] = useState<DicaDoDia>(() => {
    const indice = Math.floor(Math.random() * DICAS.length);
    return DICAS[indice];
  });

  /**
   * Busca todos os dados da Home.
   */
  const buscarDados = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      // Buscar moto ativa em paralelo com clima e alertas
      const [motoResult, climaResult, alertasResult] = await Promise.allSettled([
        // Moto ativa
        supabase
          .from('motos')
          .select('id, modelo, marca, placa, km_atual, foto_url, tipo')
          .eq('user_id', user.id)
          .eq('ativa', true)
          .maybeSingle(),

        // Clima atual (se tiver localização)
        location
          ? buscarClimaAtual(location.coords.latitude, location.coords.longitude)
          : Promise.resolve(null),

        // Alertas próximos (se tiver localização)
        location
          ? supabase.rpc('alertas_proximos', {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              raio_metros: 5000,
            })
          : Promise.resolve({ data: [] }),
      ]);

      // Processar moto
      if (motoResult.status === 'fulfilled' && motoResult.value.data) {
        setMoto(motoResult.value.data as MotoAtiva);
      } else {
        setMoto(null);
      }

      // Processar clima
      if (climaResult.status === 'fulfilled' && climaResult.value) {
        setClima(climaResult.value);
      } else {
        setClima(null);
      }

      // Processar alertas
      if (alertasResult.status === 'fulfilled' && alertasResult.value.data) {
        // Pegar apenas os 5 mais próximos
        const alertasOrdenados = (alertasResult.value.data as AlertaProximo[])
          .sort((a, b) => a.distancia_m - b.distancia_m)
          .slice(0, 5);
        setAlertas(alertasOrdenados);
      } else {
        setAlertas([]);
      }
    } catch (err: any) {
      console.error('[useHome] Erro ao buscar dados:', err);
      setErro(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [user, location]);

  /**
   * Atualiza o KM da moto ativa.
   */
  const atualizarKm = useCallback(async (novoKm: number) => {
    if (!moto) return;

    const { error } = await supabase
      .from('motos')
      .update({ km_atual: novoKm })
      .eq('id', moto.id);

    if (error) {
      throw new Error(error.message);
    }

    setMoto({ ...moto, km_atual: novoKm });
  }, [moto]);

  // Buscar dados ao montar e quando user/location mudar
  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  return {
    saudacao,
    iniciais,
    moto,
    clima,
    alertas,
    dicaDoDia,
    loading,
    erro,
    refetch: buscarDados,
    atualizarKm,
  };
}