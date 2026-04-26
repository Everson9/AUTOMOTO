// apps/mobile/src/services/climaService.ts
//
// Wrapper para a API Open-Meteo (gratuita, sem API key)
// Busca previsão horária de chuva para alertar motociclistas

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

// Resposta da API Open-Meteo (hourly)
export interface PrevisaoHoraria {
  hora: Date;
  probabilidadeChuva: number; // 0-100
  precipitacaoMm: number;
}

// Retorno do cálculo de alerta
export interface AlertaChuva {
  deveExibir: boolean;
  horasAte: number; // horas até a chuva (arredondado)
  probabilidade: number; // probabilidade máxima encontrada
  precipitacaoMm: number; // precipitação máxima esperada
}

// Clima atual para exibir na Home
export interface ClimaAtual {
  temperatura: number;
  codigoTempo: number; // WMO weather code
  descricao: string;
  icone: string; // emoji do tempo
}

// Resposta bruta da API (tipagem parcial)
interface OpenMeteoResponse {
  hourly: {
    time: string[];
    precipitation_probability: number[];
    precipitation: number[];
  };
  current?: {
    temperature_2m: number;
    weather_code: number;
  };
}

// Mapeamento de códigos WMO para descrições e emojis
const CODIGOS_TEMPO: Record<number, { descricao: string; icone: string }> = {
  0: { descricao: 'Céu limpo', icone: '☀️' },
  1: { descricao: 'Principalmente limpo', icone: '🌤️' },
  2: { descricao: 'Parcialmente nublado', icone: '⛅' },
  3: { descricao: 'Nublado', icone: '☁️' },
  45: { descricao: 'Neblina', icone: '🌫️' },
  48: { descricao: 'Neblina com geada', icone: '🌫️' },
  51: { descricao: 'Garoa leve', icone: '🌦️' },
  53: { descricao: 'Garoa moderada', icone: '🌦️' },
  55: { descricao: 'Garoa intensa', icone: '🌧️' },
  61: { descricao: 'Chuva leve', icone: '🌧️' },
  63: { descricao: 'Chuva moderada', icone: '🌧️' },
  65: { descricao: 'Chuva forte', icone: '🌧️' },
  66: { descricao: 'Chuva congelante leve', icone: '🌨️' },
  67: { descricao: 'Chuva congelante forte', icone: '🌨️' },
  71: { descricao: 'Neve leve', icone: '🌨️' },
  73: { descricao: 'Neve moderada', icone: '🌨️' },
  75: { descricao: 'Neve forte', icone: '❄️' },
  80: { descricao: 'Pancadas de chuva leve', icone: '🌦️' },
  81: { descricao: 'Pancadas de chuva moderada', icone: '🌧️' },
  82: { descricao: 'Pancadas de chuva forte', icone: '⛈️' },
  95: { descricao: 'Tempestade', icone: '⛈️' },
  96: { descricao: 'Tempestade com granizo', icone: '⛈️' },
  99: { descricao: 'Tempestade forte com granizo', icone: '⛈️' },
};

/**
 * Busca previsão horária de chuva para uma localização.
 * @param lat Latitude
 * @param lng Longitude
 * @returns Array de previsões horárias para as próximas 24h
 */
export async function buscarPrevisaoRota(
  lat: number,
  lng: number
): Promise<PrevisaoHoraria[]> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    hourly: 'precipitation_probability,precipitation',
    forecast_days: '1',
    timezone: 'America/Sao_Paulo',
  });

  const res = await fetch(`${OPEN_METEO_URL}?${params}`);

  if (!res.ok) {
    throw new Error(`Erro ao buscar clima: ${res.status}`);
  }

  const json: OpenMeteoResponse = await res.json();

  // Mapear resposta para estrutura tipada
  const previsoes: PrevisaoHoraria[] = json.hourly.time.map((t, i) => ({
    hora: new Date(t),
    probabilidadeChuva: json.hourly.precipitation_probability[i],
    precipitacaoMm: json.hourly.precipitation[i],
  }));

  return previsoes;
}

/**
 * Calcula se há risco de chuva nas próximas 2 horas.
 * Retorna informações para o aviso se probabilidade >= 60%.
 * @param previsoes Array de previsões horárias
 * @returns Objeto com deveExibir, horasAte, probabilidade e precipitacaoMm
 */
export function calcularAlertaChuva(previsoes: PrevisaoHoraria[]): AlertaChuva | null {
  const agora = new Date();
  const limiteHoras = new Date(agora.getTime() + 2 * 60 * 60 * 1000); // 2h à frente

  // Filtrar próximas 2 horas
  const proximasHoras = previsoes.filter((p) => {
    return p.hora > agora && p.hora <= limiteHoras;
  });

  // Encontrar o pico de probabilidade e precipitação
  let maxProbabilidade = 0;
  let maxPrecipitacao = 0;
  let horaPico: Date | null = null;

  for (const p of proximasHoras) {
    if (p.probabilidadeChuva > maxProbabilidade) {
      maxProbabilidade = p.probabilidadeChuva;
      maxPrecipitacao = p.precipitacaoMm;
      horaPico = p.hora;
    }
  }

  // Se probabilidade < 60%, não exibir aviso
  if (maxProbabilidade < 60 || !horaPico) {
    return null;
  }

  // Calcular horas até a chuva (arredondado para inteiro)
  const diffMs = horaPico.getTime() - agora.getTime();
  const horasAte = Math.round(diffMs / (60 * 60 * 1000));

  return {
    deveExibir: true,
    horasAte: Math.max(1, horasAte), // Mínimo 1h
    probabilidade: maxProbabilidade,
    precipitacaoMm: maxPrecipitacao,
  };
}

/**
 * Busca o clima atual para uma localização.
 * @param lat Latitude
 * @param lng Longitude
 * @returns Dados do clima atual
 */
export async function buscarClimaAtual(
  lat: number,
  lng: number
): Promise<ClimaAtual> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: 'temperature_2m,weather_code',
    timezone: 'America/Sao_Paulo',
  });

  const res = await fetch(`${OPEN_METEO_URL}?${params}`);

  if (!res.ok) {
    throw new Error(`Erro ao buscar clima atual: ${res.status}`);
  }

  const json: OpenMeteoResponse = await res.json();

  if (!json.current) {
    throw new Error('Dados de clima atual não disponíveis');
  }

  const { temperature_2m, weather_code } = json.current;
  const infoTempo = CODIGOS_TEMPO[weather_code] || { descricao: 'Indefinido', icone: '🌡️' };

  return {
    temperatura: Math.round(temperature_2m),
    codigoTempo: weather_code,
    descricao: infoTempo.descricao,
    icone: infoTempo.icone,
  };
}