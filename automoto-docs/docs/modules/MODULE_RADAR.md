# MODULE_RADAR.md — Módulo: Radar da Rua

> Fase do roadmap: **Fase 1 completo**

---

## O que é

Tela central do app. Mapa interativo com layers de alertas da via, mapa de calor de assaltos, vagas de estacionamento e previsão de clima contextualizada à rota.

---

## Telas

| Tela                   | Rota              | Fase |
|------------------------|-------------------|------|
| `RadarScreen`          | `/radar` (tab)    | 1    |
| `ReportarAlertaSheet`  | bottom sheet      | 1    |
| `DetalheAlertaSheet`   | bottom sheet      | 1    |
| `PrevisaoClimaScreen`  | `/radar/clima`    | 1    |
| `VagasMapScreen`       | `/radar/vagas`    | 2    |

---

## Tabelas envolvidas

- `alertas_via` — alertas reportados na via
- `vagas` — estacionamentos (Fase 2)
- RPC: `alertas_proximos(lat, lng, raio_metros)`

---

## Layers do mapa (ordem de renderização, de baixo para cima)

```
1. Tiles base (OpenFreeMap)
2. HeatmapLayer "assaltos"          → geom de alertas tipo assalto/furto
3. FillLayer "zonas de risco"        → polígonos de área de risco (futuro)
4. SymbolLayer "alertas-via"         → pins de alertas (óleo, areia, etc.)
5. SymbolLayer "vagas"               → pins de estacionamento (Fase 2)
6. SymbolLayer "user-location"       → posição do usuário (sobreposto a tudo)
```

---

## Lógica de negócio crítica

### Atualização dos alertas

Os alertas são buscados uma vez ao abrir a tela e re-buscados:
- A cada 5 minutos (polling simples no MVP)
- Quando o usuário se mover mais de 500m do ponto de busca anterior

```typescript
const RAIO_BUSCA_METROS = 5000
const INTERVALO_POLLING_MS = 5 * 60 * 1000  // 5 min
const DISTANCIA_RE_BUSCA_METROS = 500

function deveReBuscar(posAtual: LatLng, posUltimaBusca: LatLng): boolean {
  return distanciaMetros(posAtual, posUltimaBusca) > DISTANCIA_RE_BUSCA_METROS
}
```

### Vida útil dos alertas

Os alertas expiram automaticamente pelo banco (`expira_em`). O app não precisa controlar isso — a query já filtra `expira_em > NOW()`.

```typescript
// Vida útil por tipo ao criar o alerta
const VIDA_UTIL: Record<TipoAlertaVia, number> = {
  oleo:     2 * 60 * 60 * 1000,   // 2 horas
  areia:    4 * 60 * 60 * 1000,   // 4 horas
  buraco:   7 * 24 * 60 * 60 * 1000,  // 7 dias
  obra:     48 * 60 * 60 * 1000,  // 48 horas
  enchente: 6 * 60 * 60 * 1000,   // 6 horas
  acidente: 3 * 60 * 60 * 1000,   // 3 horas
  outro:    2 * 60 * 60 * 1000,   // 2 horas
}

function calcularExpiracao(tipo: TipoAlertaVia): Date {
  return new Date(Date.now() + VIDA_UTIL[tipo])
}
```

### Deduplicação de reportes

Ao criar um alerta, verificar se já existe um alerta ativo do mesmo tipo em raio de 100m:

```sql
-- Verificar duplicata antes de inserir (via RPC)
SELECT id FROM public.alertas_via
WHERE tipo = $1
  AND ativo = TRUE
  AND expira_em > NOW()
  AND ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography, 100)
LIMIT 1;
-- Se encontrar → incrementar confirmacoes em vez de criar novo
-- Se não encontrar → inserir novo alerta
```

### Integração com clima (Open-Meteo)

```typescript
// services/climaService.ts

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast'

interface PrevisaoHoraria {
  hora: Date
  probabilidadeChuva: number  // 0-100
  precipitacaoMm: number
}

async function buscarPrevisaoRota(lat: number, lng: number): Promise<PrevisaoHoraria[]> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    hourly: 'precipitation_probability,precipitation',
    forecast_days: '1',
    timezone: 'America/Sao_Paulo',
  })

  const res = await fetch(`${OPEN_METEO_URL}?${params}`)
  const json = await res.json()

  return json.hourly.time.map((t: string, i: number) => ({
    hora: new Date(t),
    probabilidadeChuva: json.hourly.precipitation_probability[i],
    precipitacaoMm: json.hourly.precipitation[i],
  }))
}

// Alerta se chuva > 60% nas próximas 2 horas
function deveAlertar(previsao: PrevisaoHoraria[]): boolean {
  const proximasDuasHoras = previsao.filter(
    (p) => p.hora > new Date() && p.hora < new Date(Date.now() + 2 * 60 * 60 * 1000)
  )
  return proximasDuasHoras.some((p) => p.probabilidadeChuva >= 60)
}
```

### Decisão de UX: Aviso de clima

O aviso de chuva é implementado como **banner sutil no mapa**, não como notificação push.

**Motivo:** Notificações push exigem infraestrutura mais complexa (Expo Push + serviço em background). Para o MVP, o banner no mapa é suficiente e menos intrusivo.

**Características do banner:**
- Tom amigável: `"🌧️ Chuva possível em ~1h — lembra da capa?"`
- Aparece apenas quando o app está aberto no mapa
- Some automaticamente após 8 segundos ou ao tocar no X
- Não bloqueia interação com o mapa
- Re-verifica a cada 30 minutos

**Notificações push** ficam para a **Fase 2**, quando implementarmos alertas de proximidade em tempo real. Exemplos de casos de uso:
- "Vai chover amanhã cedo — prepara a capa" (noite anterior)
- "Em 1h pode chover — você está na rua?" (app em background)

Requer: Expo Push + Edge Function com agendamento no Supabase (verificar previsão periodicamente e disparar push se probabilidade >= 60%).

---

## UX crítica: interface projetada para luvas

O formulário de reporte de alerta deve ter:
- Botões com `minHeight: 64` (toque com luva)
- Máximo 2 toques do início ao reporte final
- Zero campos de texto livre no fluxo principal
- Feedback háptico a cada seleção (`expo-haptics`)

```tsx
// Fluxo do bottom sheet de reporte
// Passo 1: Selecionar tipo (grid de 6 botões grandes com ícone + label)
// Passo 2: Confirmar (localização auto, botão grande "CONFIRMAR")
// Total: 2 toques
```

---

## Notificações de proximidade

Ao receber uma notificação push de alerta próximo:
- Título: emoji da categoria + distância ("⚠️ 280m à frente")
- Body: descrição do tipo ("Óleo na pista reportado")
- Ao tocar: abrir RadarScreen centralizado no alerta
- Sem som se `@silent` configurado pelo usuário

---

## Moderação de alertas (sistema de votos)

### Implementação atual (MVP)
- 1 voto por usuário por alerta (persistido via AsyncStorage)
- Alerta desativado automaticamente quando: `negacoes >= 5 AND negacoes > confirmacoes`
- Expiração natural por tempo (campo `expira_em`) como proteção adicional

### Limitações do MVP
- Usuário mal-intencionado pode criar múltiplas contas para negar alertas
- Sem distinção de peso entre usuários novos e frequentes

### Evolução planejada (Fase 2) — Sistema de reputação
Inspirado no modelo do Waze:
- Usuários frequentes e com histórico confiável têm peso maior no voto
- Usuários novos têm peso menor (ex: 0.5x)
- Quem nega alertas que depois são confirmados por muitos usuários perde reputação
- Quem reporta alertas que são confirmados ganha reputação
- Threshold de desativação passa a ser ponderado por reputação, não só contagem simples
- Campo sugerido na tabela `profiles`: `reputacao DECIMAL DEFAULT 1.0`

---

## Notificações background (Fase 2)

O MVP (Fase 1) implementa notificações apenas com o app em foreground.

**Fase 2:** notificar mesmo com app em segundo plano.

### Stack necessária
- `expo-task-manager` — registrar background task
- `expo-location` — modo background (`enableBackgroundTrackingAsync`)
- Permissão `ACCESS_BACKGROUND_LOCATION` no Android

### Fluxo
1. App registra background task `BACKGROUND_LOCATION_TASK`
2. Sistema operacional dispara a task periodicamente com location update
3. Task verifica alertas próximos via RPC `alertas_proximos`
4. Se encontrar alerta novo (não notificado antes), dispara notificação local
5. Persistir alertas notificados em AsyncStorage (sobrevive entre sessões)

### Implementação referência
```typescript
// apps/mobile/src/tasks/backgroundLocationTask.ts

import { defineTask } from 'expo-task-manager';
import * as Location from 'expo-location';
import { dispararNotificacaoAlerta } from '../services/notificationService';

const BACKGROUND_LOCATION_TASK = 'background-location-task';

defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error || !data) return;

  const { coords } = data as Location.LocationObjectCoords;

  // Buscar alertas próximos via Supabase RPC
  // Verificar AsyncStorage para não duplicar
  // Disparar notificação se necessário
});

// Registrar no app
await Location.enableBackgroundTrackingAsync(BACKGROUND_LOCATION_TASK);
```

### Permissões adicionais (Android)
```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

---

## Estratégia de dados — modelo híbrido

O Radar usa uma estratégia híbrida de dados para resolver o **problema do cold start**:

- **HERE Maps API** — fornece incidentes de trânsito e navegação com rota
- **Comunidade Automoto** — adiciona dados específicos de motociclistas (óleo, areia, buracos, assaltos)

### Fonte base: HERE Maps API

HERE oferece APIs robustas de trânsito e navegação com free tier generoso.

**APIs utilizadas:**

1. **Traffic Incidents API** — incidentes de trânsito em tempo real
   - Endpoint: `https://data.traffic.hereapi.com/traffic/6.3/incidents.json`
   - Parâmetros: `bbox`, `criticality`
   - Tipos cobertos: `ACCIDENT`, `ROAD_CLOSURE`, `CONSTRUCTION`

2. **Geocoding API** — busca de endereço
   - Endpoint: `https://geocode.search.hereapi.com/v1/geocode`
   - Parâmetros: `q`, `at` (localização atual para priorizar)
   - Retorna até 5 sugestões em português

3. **Routing API** — cálculo de rota
   - Endpoint: `https://router.hereapi.com/v8/routes`
   - `transportMode=motorcycle` — modo moto!
   - Retorna polyline + instruções + resumo

**Implementação:**
- `src/services/hereService.ts` — funções de API
- `src/hooks/useHereTraffic.ts` — hook para incidentes
- `src/hooks/useNavegacao.ts` — hook para navegação com rota

### Fonte especializada: Comunidade Automoto

Incidentes específicos de motociclistas que o HERE não cobre:

- **Óleo na pista** — risco de derrapagem
- **Areia na pista** — risco de derrapagem
- **Buracos** — risco de queda
- **Assaltos/furtos** — segurança (heat map e alertas pontuais)

### Diferenciação visual

- **Incidentes HERE**: marcador com badge "HERE" azul
- **Alertas comunidade**: marcador com ícone temático (sem badge)

### Merge de dados

```typescript
// Incidentes do HERE
interface IncidenteHERE {
  id: string;
  tipo: 'ACCIDENT' | 'ROAD_CLOSURE' | 'CONSTRUCTION';
  lat: number;
  lng: number;
  severidade: 'critical' | 'major' | 'minor';
  origem: 'here';
}

// Alertas da comunidade (existentes)
interface AlertaVia {
  id: string;
  tipo: 'oleo' | 'areia' | 'buraco' | 'obra' | 'enchente' | 'acidente' | 'assalto' | 'outro';
  lat: number;
  lng: number;
  confirmacoes: number;
  origem: 'automoto';
}

// Renderizar ambos no mapa, com marcação visual diferente
```

### Navegação com rota

**UX do fluxo:**
1. Botão "🔍 Buscar destino" (canto superior esquerdo)
2. Input de busca com autocompletar
3. Seleção de destino → cálculo de rota
4. Linha azul no mapa (`#2563EB`)
5. Card com destino, distância, ETA
6. Botão cancelar para limpar rota

**Componentes:**
- `BuscaDestino` — input + lista de sugestões
- `CardNavegacao` — card com info da rota ativa
- `useNavegacao` — hook de estado da navegação

### Custo

- Free tier HERE: 2.500 requests/dia por API
- Consumo estimado: ~4-6 requests/dia por usuário ativo
- Capacidade: ~400-500 usuários ativos/dia no free tier
- Fase 2: avaliar plano pago quando passar de 1.000 MAU

---

## Testes de aceitação

- [ ] Mapa carrega com tiles do OpenFreeMap em 3s em 4G
- [ ] Alertas próximos aparecem como pins no mapa
- [ ] Tap no pin abre bottom sheet com detalhes e opção de confirmar/negar
- [ ] Reporte de alerta feito em 2 toques sem digitar texto
- [ ] Heatmap de assaltos visível quando há dados na região
- [ ] Alerta de clima aparece se probabilidade > 60% nas próximas 2h
- [ ] Re-busca automática ao se mover 500m
