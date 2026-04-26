// apps/mobile/src/services/hereService.ts
//
// Serviço de integração com HERE Maps API.
// - Incidentes de trânsito (Traffic API)
// - Geocoding (busca de endereço)
// - Routing (cálculo de rota)

import { MaterialCommunityIcons } from '@expo/vector-icons';

// ============================================================================
// TIPOS
// ============================================================================

export interface BBox {
  lat1: number; // latitude sudoeste
  lng1: number; // longitude sudoeste
  lat2: number; // latitude nordeste
  lng2: number; // longitude nordeste
}

export interface Coords {
  lat: number;
  lng: number;
}

export type TipoIncidenteHERE = 'ACCIDENT' | 'ROAD_CLOSURE' | 'CONSTRUCTION';

export interface IncidenteHERE {
  id: string;
  tipo: TipoIncidenteHERE;
  lat: number;
  lng: number;
  descricao: string;
  severidade: 'critical' | 'major' | 'minor';
  origem: 'here'; // Para distinguir de alertas da comunidade
}

export interface SugestaoEndereco {
  id: string;
  label: string;           // "Av. Paulista, 1000 - São Paulo, SP"
  endereco: string;        // "Av. Paulista, 1000"
  cidade: string;          // "São Paulo"
  estado: string;          // "SP"
  lat: number;
  lng: number;
}

export interface InstrucaoRota {
  texto: string;           // "Vire à direita na Av. Paulista"
  distanciaMetros: number;
  duracaoSegundos: number;
  tipo: string;            // "turn right", "continue", etc.
}

export interface RotaHERE {
  distanciaMetros: number;
  tempoSegundos: number;
  polyline: Coords[];      // Array de {lat, lng}
  instrucoes: InstrucaoRota[];
  destino: {
    lat: number;
    lng: number;
    label: string;
  };
}

// Configuração de ícone e cor por tipo de incidente HERE
export const INCIDENTE_HERE_CONFIG: Record<TipoIncidenteHERE, {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  label: string;
}> = {
  ACCIDENT: {
    icon: 'car-emergency',
    color: '#DC2626',      // vermelho
    label: 'Acidente',
  },
  ROAD_CLOSURE: {
    icon: 'road-variant',
    color: '#7F1D1D',      // vermelho escuro
    label: 'Via interditada',
  },
  CONSTRUCTION: {
    icon: 'construction',
    color: '#F97316',      // laranja
    label: 'Obra na pista',
  },
};

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const HERE_API_KEY = process.env.EXPO_PUBLIC_HERE_API_KEY;

if (!HERE_API_KEY) {
  console.warn('[hereService] EXPO_PUBLIC_HERE_API_KEY não configurada');
}

// ============================================================================
// FUNÇÃO: DECODIFICAR FLEXPOLYLINE (HERE format)
// ============================================================================

/**
 * Decodifica uma flexpolyline do HERE para array de coordenadas.
 * Baseado no algoritmo oficial HERE flexpolyline.
 *
 * @see https://github.com/heremaps/flexible-polyline
 */
export function decodeFlexPolyline(encoded: string): Coords[] {
  if (!encoded || encoded.length === 0) {
    return [];
  }

  const coords: Coords[] = [];
  let lat = 0;
  let lng = 0;

  // Tabela de decodificação base40
  const DECODING_TABLE = [
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, -1, -1, -1, -1, -1, -1,
    -1, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
    24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, -1, -1, -1,
    -1, -1, -1, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67,
    -1, -1, -1, -1, -1,
  ];

  const CharCodeTable = [
    63, // '?'
    95, // '_'
    126, // '~'
    45, // '-'
    33, // '!'
    36, // '$'
    39, // '\''
    40, // '('
    41, // ')'
    42, // '*'
    43, // '+'
    44, // ','
    59, // ';'
    60, // '<'
    61, // '='
    62, // '>'
    // 48-57: '0'-'9'
    // 65-90: 'A'-'Z'
    // 97-122: 'a'-'z'
  ];

  // Mapear caracteres para tabela de índices
  const charToIndex: Record<number, number> = {};
  CharCodeTable.forEach((code, idx) => {
    charToIndex[code] = idx;
  });
  for (let i = 0; i < 10; i++) charToIndex[48 + i] = 15 + i;     // '0'-'9': 15-24
  for (let i = 0; i < 26; i++) charToIndex[65 + i] = 25 + i;     // 'A'-'Z': 25-50
  for (let i = 0; i < 26; i++) charToIndex[97 + i] = 51 + i;     // 'a'-'z': 51-76

  // Decodificar usando o método do HERE flexpolyline
  let index = 0;
  const latLngPrecision = 1e5; // Precisão padrão HERE

  while (index < encoded.length) {
    // Decodificar latitude
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      const charCode = encoded.charCodeAt(index++);
      byte = charToIndex[charCode] ?? 0;
      result += (byte & 31) << shift;
      shift += 5;
    } while (byte >= 32 && index < encoded.length);

    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    // Decodificar longitude
    shift = 0;
    result = 0;

    do {
      const charCode = encoded.charCodeAt(index++);
      byte = charToIndex[charCode] ?? 0;
      result += (byte & 31) << shift;
      shift += 5;
    } while (byte >= 32 && index < encoded.length);

    lng += (result & 1) ? ~(result >> 1) : (result >> 1);

    coords.push({
      lat: lat / latLngPrecision,
      lng: lng / latLngPrecision,
    });
  }

  return coords;
}

// ============================================================================
// FUNÇÃO: BUSCAR INCIDENTES DE TRÂNSITO
// ============================================================================

/**
 * Busca incidentes de trânsito na área especificada usando HERE Traffic API v6.3.
 *
 * @param bbox - Bounding box da área visível no mapa
 * @returns Array de incidentes formatados
 *
 * @see https://developer.here.com/documentation/traffic-api/dev_guide/topics/incident-data.html
 */
export async function buscarIncidentes(bbox: BBox): Promise<IncidenteHERE[]> {
  if (!HERE_API_KEY) {
    console.warn('[buscarIncidentes] API key não configurada');
    return [];
  }

  const { lat1, lng1, lat2, lng2 } = bbox;

  // HERE Traffic API v6.3 — formato: bbox:oeste,sul,leste,norte
  const url = new URL('https://data.traffic.hereapi.com/traffic/6.3/incidents.json');

  url.searchParams.set('apiKey', HERE_API_KEY);
  url.searchParams.set('in', `bbox:${lng1},${lat1},${lng2},${lat2}`);

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      const text = await response.text();
      console.error('[buscarIncidentes] Erro HTTP:', response.status, text);
      return [];
    }

    const data = await response.json();

    // HERE v6.3 retorna { incidents: [...] }
    const items = data.incidents || [];

    const incidentes: IncidenteHERE[] = [];

    for (const item of items) {
      // Tipos HERE v6.3: ACCIDENT, ROAD_CLOSURE, CONSTRUCTION, WEATHER, MASS_TRANSIT
      const tipoHERE = item.type;
      let tipo: TipoIncidenteHERE;

      if (tipoHERE === 'ACCIDENT') {
        tipo = 'ACCIDENT';
      } else if (tipoHERE === 'ROAD_CLOSURE') {
        tipo = 'ROAD_CLOSURE';
      } else if (tipoHERE === 'CONSTRUCTION') {
        tipo = 'CONSTRUCTION';
      } else {
        // Ignorar tipos que não nos interessam
        continue;
      }

      // Localização: HERE v6.3 usa location.shape ou location.lat/lng
      let lat: number;
      let lng: number;

      if (item.location?.shape?.polyline) {
        // polyline é array de [lat, lng, lat, lng, ...]
        const polyline = item.location.shape.polyline;
        if (polyline.length >= 2) {
          lat = polyline[0];
          lng = polyline[1];
        } else {
          continue;
        }
      } else if (item.location?.lat !== undefined && item.location?.lng !== undefined) {
        lat = item.location.lat;
        lng = item.location.lng;
      } else {
        continue;
      }

      if (isNaN(lat) || isNaN(lng)) continue;

      // Severidade: criticality pode ser string ou objeto
      const criticality = item.criticality;
      let severidade: 'critical' | 'major' | 'minor' = 'minor';
      if (criticality === 'CRITICAL' || criticality === 'MAJOR') {
        severidade = criticality === 'CRITICAL' ? 'critical' : 'major';
      }

      // Descrição: TMC é o padrão, com description em多种 idiomas
      const descricao = item.TMC?.description?.[0]?.text ||
                       item.TMC?.description?.pt?.text ||
                       INCIDENTE_HERE_CONFIG[tipo].label;

      incidentes.push({
        id: item.id || `here-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        tipo,
        lat,
        lng,
        descricao,
        severidade,
        origem: 'here',
      });
    }

    return incidentes;
  } catch (error) {
    console.error('[buscarIncidentes] Erro:', error);
    return [];
  }
}

// ============================================================================
// FUNÇÃO: BUSCAR ENDEREÇO (Geocoding)
// ============================================================================

/**
 * Busca sugestões de endereço a partir de uma query.
 *
 * @param query - Texto de busca (ex: "Av. Paulista")
 * @param lat - Latitude da localização atual (para priorizar resultados próximos)
 * @param lng - Longitude da localização atual
 * @returns Array de sugestões de endereço
 *
 * @see https://developer.here.com/documentation/geocoding-search-api/dev_guide/topics/endpoint-geocode-batch.html
 */
export async function buscarEndereco(
  query: string,
  lat: number,
  lng: number
): Promise<SugestaoEndereco[]> {
  if (!HERE_API_KEY) {
    console.warn('[buscarEndereco] API key não configurada');
    return [];
  }

  if (!query || query.length < 3) {
    return [];
  }

  const url = new URL('https://geocode.search.hereapi.com/v1/geocode');

  url.searchParams.set('apiKey', HERE_API_KEY);
  url.searchParams.set('q', query);
  url.searchParams.set('at', `${lat},${lng}`); // Localização atual para priorizar
  url.searchParams.set('lang', 'pt-BR');
  url.searchParams.set('limit', '5');

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      const text = await response.text();
      console.error('[buscarEndereco] Erro HTTP:', response.status, text);
      return [];
    }

    const data = await response.json();

    // HERE retorna { items: [...] }
    const items = data.items || [];

    return items.map((item: any, index: number) => {
      const address = item.address || {};

      return {
        id: item.id || `addr-${index}-${Date.now()}`,
        label: address.label || query,
        endereco: [address.street, address.houseNumber].filter(Boolean).join(', ') || address.label,
        cidade: address.city || '',
        estado: address.stateCode || address.state || '',
        lat: item.position?.lat || 0,
        lng: item.position?.lng || 0,
      };
    }).filter((item: SugestaoEndereco) => item.lat !== 0 && item.lng !== 0);
  } catch (error) {
    console.error('[buscarEndereco] Erro:', error);
    return [];
  }
}

// ============================================================================
// FUNÇÃO: CALCULAR ROTA
// ============================================================================

/**
 * Calcula uma rota entre origem e destino.
 *
 * @param origem - Coordenadas de origem
 * @param destino - Coordenadas de destino
 * @returns Dados da rota ou null se erro
 *
 * @see https://developer.here.com/documentation/routing-api/dev_guide/topics/send-request.html
 */
export async function calcularRota(
  origem: Coords,
  destino: Coords
): Promise<RotaHERE | null> {
  if (!HERE_API_KEY) {
    console.warn('[calcularRota] API key não configurada');
    return null;
  }

  const url = new URL('https://router.hereapi.com/v8/routes');

  url.searchParams.set('apiKey', HERE_API_KEY);
  url.searchParams.set('transportMode', 'car'); // HERE v8 não suporta motorcycle/scooter
  url.searchParams.set('origin', `${origem.lat},${origem.lng}`);
  url.searchParams.set('destination', `${destino.lat},${destino.lng}`);
  url.searchParams.set('return', 'polyline,summary,actions,instructions'); // actions necessário para instructions
  url.searchParams.set('lang', 'pt-BR');

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      const text = await response.text();
      console.error('[calcularRota] Erro HTTP:', response.status, text);
      return null;
    }

    const data = await response.json();

    // HERE retorna { routes: [...] }
    const route = data.routes?.[0];
    if (!route) {
      console.warn('[calcularRota] Nenhuma rota encontrada');
      return null;
    }

    // Extrair resumo
    const section = route.sections?.[0];
    if (!section) {
      console.warn('[calcularRota] Seção não encontrada');
      return null;
    }

    const summary = section.summary || {};
    const distanciaMetros = summary.length || 0;
    const tempoSegundos = summary.duration || 0;

    // Decodificar polyline
    const encodedPolyline = section.polyline;
    const polyline = decodeFlexPolyline(encodedPolyline);

    // Extrair instruções
    const instrucoes: InstrucaoRota[] = (section.actions || []).map((action: any, idx: number) => ({
      texto: action.instruction || '',
      distanciaMetros: action.length || 0,
      duracaoSegundos: action.duration || 0,
      tipo: action.action || '',
    }));

    // Destino
    const arrival = section.arrival || section.destination;
    const destinoInfo = {
      lat: arrival?.place?.location?.lat || destino.lat,
      lng: arrival?.place?.location?.lng || destino.lng,
      label: arrival?.place?.name || 'Destino',
    };

    return {
      distanciaMetros,
      tempoSegundos,
      polyline,
      instrucoes,
      destino: destinoInfo,
    };
  } catch (error) {
    console.error('[calcularRota] Erro:', error);
    return null;
  }
}

// ============================================================================
// FUNÇÃO: FORMATAR DISTÂNCIA
// ============================================================================

/**
 * Formata distância em metros para string legível.
 */
export function formatarDistancia(metros: number): string {
  if (metros >= 1000) {
    const km = metros / 1000;
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(metros)} m`;
}

// ============================================================================
// FUNÇÃO: FORMATAR TEMPO
// ============================================================================

/**
 * Formata tempo em segundos para string legível.
 */
export function formatarTempo(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const minsRestantes = minutos % 60;

  if (horas > 0) {
    return `${horas}h ${minsRestantes} min`;
  }
  return `${minutos} min`;
}

// ============================================================================
// FUNÇÃO: CALCULAR BBOX A PARTIR DE CENTRO
// ============================================================================

/**
 * Calcula bounding box a partir de um centro e raio em km.
 */
export function calcularBBox(lat: number, lng: number, raioKm: number): BBox {
  // 1 grau de latitude ≈ 111 km
  // 1 grau de longitude ≈ 111 * cos(lat) km
  const latOffset = raioKm / 111;
  const lngOffset = raioKm / (111 * Math.cos(lat * Math.PI / 180));

  return {
    lat1: lat - latOffset, // sudoeste
    lng1: lng - lngOffset,
    lat2: lat + latOffset, // nordeste
    lng2: lng + lngOffset,
  };
}