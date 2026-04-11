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

## Testes de aceitação

- [ ] Mapa carrega com tiles do OpenFreeMap em 3s em 4G
- [ ] Alertas próximos aparecem como pins no mapa
- [ ] Tap no pin abre bottom sheet com detalhes e opção de confirmar/negar
- [ ] Reporte de alerta feito em 2 toques sem digitar texto
- [ ] Heatmap de assaltos visível quando há dados na região
- [ ] Alerta de clima aparece se probabilidade > 60% nas próximas 2h
- [ ] Re-busca automática ao se mover 500m
