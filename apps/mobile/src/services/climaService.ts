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

// Resposta bruta da API (tipagem parcial)
interface OpenMeteoResponse {
  hourly: {
    time: string[];
    precipitation_probability: number[];
    precipitation: number[];
  };
}

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