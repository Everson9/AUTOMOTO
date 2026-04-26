# MIGRATION_CONTEXT.md — Contexto Completo do Projeto

> Lido por uma IA no início de cada nova sessão de chat.
> Mantenha este arquivo atualizado ao final de cada sessão.

---

## 1. O que é o Automoto

**Automoto** — app mobile (Expo + React Native) para motociclistas urbanos brasileiros.

Hub único que combina:
- **Radar da Via**: alertas colaborativos (óleo, areia, buracos, assaltos) + incidentes HERE Maps + navegação com rota
- **Garagem**: inventário de motos, mods, documentos, Dossiê de Procedência em PDF
- **Home**: tela inicial contextual com dados da moto, clima e alertas próximos

**Público-alvo:** motociclistas urbanos brasileiros que usam moto como meio de transporte principal.

**Status:** em desenvolvimento ativo (Fase 1.5 — polimento e UX para beta fechado).

---

## 2. Stack Tecnológica Completa

### Frontend (Mobile)
```
Expo (React Native) · @maplibre/maplibre-react-native · Supabase JS SDK
Zustand (estado global) · expo-router (navegação por arquivos)
react-hook-form + zod · expo-notifications · expo-location
expo-image-picker · expo-print (PDF) · react-native-mmkv
```

### Backend
```
Supabase (PostgreSQL + PostGIS + Auth + Realtime + Storage + Edge Functions)
```

### APIs Externas
```
OpenFreeMap — tiles de mapa (gratuito, sem limite)
HERE Maps API v7/v8 — incidentes de trânsito, geocoding, routing
Open-Meteo — clima (gratuito, sem API key)
Expo Push — notificações push
```

### Infraestrutura
```
Turborepo (monorepo) · pnpm workspaces
EAS Build (build nativo Android/iOS) · EAS Update (updates OTA)
```

### Custo atual: **R$ 0/mês** (tudo free tier)

---

## 3. Status Atual

### O que está funcionando
- **Autenticação** por email (Supabase Auth)
- **Onboarding** tutorial de 5 slides (primeira abertura)
- **Home** contextual: card da moto ativa, clima, alertas recentes, atalhos
- **Radar** com mapa MapLibre + OpenFreeMap:
  - Marcador customizado da moto do usuário (PNG top-view)
  - Alertas da comunidade (óleo, areia, buraco, obra, enchente, assalto)
  - Ícones MaterialCommunityIcons (sem emojis)
  - Sistema de votos (confirmar/negar) com proteção de duplicata
  - Notificações de proximidade (foreground, raio 200m)
  - **HERE Maps**: incidentes de trânsito (badge azul), busca de endereço, cálculo de rota (distância + ETA)
- **Garagem**: múltiplas motos, cadastro, edição com upload de foto, ativação
- **Tab bar** com 3 tabs: Home, Radar, Garagem
- **Perfil**: logout, gerenciamento de conta

### Pendências abertas (Fase 1.5)
1. **Linha azul da rota HERE** não renderiza no mapa (GeoJSONSource/Layer configurado, polyline não aparece)
2. **Incidentes HERE retornam 404** — endpoint pode estar com formato errado
3. **Warning `Stack.Screen name="garagem"`** persiste no `app/_layout.tsx`

### Funcionalidades pendentes (Fase 1.5)
- Botão "Iniciar Viagem" funcional (gravar rota, velocidade, percurso)
- Botão "Abastecimento" funcional
- Botão "Localizar Moto" (última localização estacionada)
- Botão "Manutenção" funcional
- Documentos digitais (CNH e CRLV)
- Preço do combustível na região

---

## 4. Pendências Imediatas (Próximas 3 Tarefas)

### Tarefa 1: Corrigir polyline da rota HERE
**Arquivos:** `apps/mobile/app/(tabs)/radar.tsx`, `apps/mobile/src/services/hereService.ts`

A função `calcularRota` retorna distância e ETA corretos, mas a linha azul não aparece no mapa. GeoJSONSource e LineLayer estão configurados.

**Possíveis causas:**
- GeoJSONSource não recebe coordenadas no formato correto
- LineLayer com configuração errada (espera `[lng, lat]`)
- z-index ou ordem de renderização

### Tarefa 2: Corrigir endpoint de incidentes HERE (404)
**Arquivo:** `apps/mobile/src/services/hereService.ts`

Incidentes HERE retornam 404. O endpoint pode ter migrado de formato. Verificar documentação HERE Traffic API v7.

### Tarefa 3: Remover warning do Stack.Screen "garagem"
**Arquivo:** `apps/mobile/app/_layout.tsx`

Warning: `Stack.Screen name="garagem"` definido mas rota inexistente.

---

## 5. Estrutura de Pastas Principais

```
apps/
├── mobile/                    # App Expo principal
│   ├── app/                  # Rotas Expo Router (arquivos = rotas)
│   │   ├── (tabs)/           # Rotas de tab (Home, Radar, Garagem)
│   │   │   ├── index.tsx     # HomeScreen wrapper
│   │   │   ├── radar.tsx     # RadarScreen
│   │   │   └── _layout.tsx   # Tab bar layout
│   │   ├── _layout.tsx       # Root layout (auth check)
│   │   ├── login.tsx
│   │   ├── cadastro.tsx
│   │   ├── onboarding.tsx
│   │   └── garagem/
│   │       ├── cadastrar-moto.tsx
│   │       └── editar-moto.tsx
│   └── src/
│       ├── components/       # Componentes reutilizáveis
│       │   ├── AlertaMarker/
│       │   ├── IncidenteMarker/   # HERE
│       │   ├── MotoMarker/
│       │   ├── BuscaDestino/      # HERE
│       │   ├── CardNavegacao/     # HERE
│       │   └── SheetDetalheAlerta/
│       ├── hooks/             # useNome.ts (lógica de tela)
│       ├── screens/           # Telas completas (home, garagem, etc.)
│       ├── services/          # Wrappers de APIs externas
│       │   ├── supabase.ts
│       │   ├── climaService.ts
│       │   ├── hereService.ts
│       │   └── storageService.ts
│       └── utils/             # Funções puras helpers
│
├── api/                      # Supabase Edge Functions
│
packages/
├── shared/                   # Tipos TypeScript, schemas Zod, utils
└── ui/                       # Componentes RN compartilhados

automoto-docs/
└── docs/
    ├── ROADMAP.md
    ├── architecture/
    │   ├── OVERVIEW.md
    │   ├── DECISIONS.md       # ADRs aceitos
    │   ├── CONVENTIONS.md
    │   ├── AUTH_GUIDE.md
    │   ├── EXPO_ROUTER_GUIDE.md
    │   └── MAPLIBRE_GUIDE.md
    ├── modules/
    │   ├── MODULE_RADAR.md
    │   ├── MODULE_GARAGEM.md
    │   └── ...
    └── database/
        └── SCHEMA.md

tasks/
├── CURRENT_TASK.md           # Tarefa em andamento
├── SESSION_LOG.md            # Log de todas as sessões
└── MIGRATION_CONTEXT.md      # Este arquivo
```

---

## 6. Variáveis de Ambiente Necessárias

```bash
# apps/mobile/.env.local
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_HERE_API_KEY=seu_here_api_key
# EXPO_PUBLIC_OPEN_METEO_URL=https://api.open-meteo.com/v1/forecast  # não precisa, direto

# apps/api/.env.local (Edge Functions — nunca no frontend)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Nota:** `EXPO_PUBLIC_` é exposto no bundle JS (seguro para anon key e HERE key pública). Variáveis sem prefixo nunca saem do servidor.

---

## 7. Como Rodar o Projeto Localmente

### Pré-requisitos
- Node.js 20+
- pnpm 9+
- Android Studio (SDK 34+) ou celular físico Android
- Dev Client Expo (`npx expo-dev-client`)

### Instalação
```bash
# 1. Clonar e instalar dependências
git clone <repo>
cd AUTOMOTO
pnpm install

# 2. Configurar ambiente
cp apps/mobile/.env.example apps/mobile/.env.local
# Editar .env.local com suas chaves Supabase e HERE

# 3. Gerar tipos do Supabase
cd apps/mobile && npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts

# 4. Abrir no Android (emulador ou celular)
cd apps/mobile && npx expo run:android
```

### Comandos úteis
```bash
# Rodar no Android
npx expo run:android

# Build EAS (produção)
eas build --platform android --profile production

# Update OTA
eas update --platform android

# Type check
pnpm typecheck

# Lint
pnpm lint

# Testes
pnpm test
```

### Importante
- **MapLibre não funciona no Expo Go** — é necessário buildar com Dev Client ou EAS Build
- Para desenvolver, usar `npx expo run:android` (gera build debug local)

---

## 8. Decisões Arquiteturais Importantes (ADRs)

### ADR-001: MapLibre + OpenFreeMap (zero custo)
MapLibre é fork OSS do Mapbox GL com API idêntica. OpenFreeMap tem tiles gratuitos sem limite. Migrar para Mapbox = trocar URL de tile.

**⚠️ Não funciona no Expo Go** — exige Dev Client.

### ADR-002: Supabase como backend completo
PostgreSQL + PostGIS + Auth + Realtime + Storage + Edge Functions em um produto. Free tier: 500MB PG, 1GB storage, 200 conexões realtime.

### ADR-003: Turborepo Monorepo
`packages/shared` contém tipos e utils compartilhados entre frontend e backend. Um `pnpm install` instala tudo.

### ADR-004: PDF on-device com expo-print
Dossiê gerado no dispositivo do usuário, salvo no Supabase Storage. Zero custo de servidor.

### ADR-005: Open-Meteo para clima
Gratuito, sem API key, dados equivalentes ao OpenWeatherMap.

### ADR-006: Email no MVP, SMS na Fase 2
Zero custo, zero setup. SMS via Twilio quando houver receita.

### ADR-007: Expo Router como único sistema de navegação
**Crítico:** Não usar React Navigation puro em paralelo com Expo Router. Isso causa conflitos. Sempre usar `router.replace()` do expo-router para navegação programática.

### ADR-008: Estratégia híbrida de dados
- **HERE Maps**: incidentes gerais (acidentes, obras, fechamentos) + navegação com rota
- **Comunidade Automoto**: alertas específicos de motociclistas (óleo, areia, buracos, assaltos)

Diferenciação visual: marcadores HERE têm badge azul "HERE".

### ADR-009: HERE Routing API — transportMode=motorcycle
HERE Routing v8 **não aceita `motorcycle` nem `scooter`** — usar `car`. A API foi testada e aceita apenas `car`.

---

## 9. Padrões de Código

### Nomenclatura de arquivos
```
screens/        PascalCase + Screen  → HomeScreen.tsx
hooks/         camelCase + use       → useHome.ts
stores/        camelCase + Store     → useMotosStore.ts
services/      camelCase + Service   → climaService.ts
components/    PascalCase            → BotaoAlerta.tsx
types/         PascalCase + .types.ts → Moto.types.ts
utils/         camelCase             → formatarPlaca.ts
constants/     SCREAMING_SNAKE_CASE  → MAP_STYLES.ts
```

### Estrutura de uma tela
```
Screen (componente visual)
  └── useNomeTela (hook — lógica e queries)
        └── supabase.from('tabela').select()  (queries diretas no hook)
```

### Idioma
- **Negócio/domain**: português (nomes de variáveis, tipos, comentários)
- **Padrões técnicos**: inglês (hooks, utils, types genéricos)

### TypeScript
- Sempre tipar — nenhum `any` sem comentário justificando
- Usar tipos do Supabase gerados automaticamente (`src/lib/database.types.ts`)

### Supabase
- RLS sempre ativo — cada tabela precisa de política de segurança
- Queries no hook, não na screen
- RPC para operações server-side (validações, queries geoespaciais complexas)

### Auth (expo-router)
```tsx
// app/_layout.tsx — padrão declarativo com Redirect
<Redirect href={isLoading ? undefined : isAutenticado ? '/onboarding' : '/login'} />
// ⚠️ NÃO usar isLoading como condição no Redirect (causa loop infinito)
// Usar: isLoading ? undefined : isAutenticado ? '/(tabs)' : '/login'
```

### Navegação
- Usar `router.replace()` para redirect programático
- Não misturar React Navigation com Expo Router
- Arquivos físicos em `app/` = rotas

---

## 10. Avisos e Armadilhas Conhecidas

### Loop infinito no _layout.tsx
**Problema:** `isLoading` alternando entre `true`/`false` causa loop no Redirect.

**Solução:** Usar padrão declarativo:
```tsx
<Redirect href={isLoading ? undefined : isAutenticado ? '/(tabs)' : '/login'} />
```

### crypto.randomUUID() não existe no React Native
**Problema:** `crypto.randomUUID()` causa erro em produção Android.

**Solução:** Usar `Date.now() + Math.random()` como fallback, ou polyfill.

### PointAnnotation não existe no MapLibre v11
**Problema:** Componentes MapLibre v10 não existem no v11.

**Solução:** Usar `Marker` com `children` React Native. Propriedade de coordenadas é `lngLat` (não `coordinate`). `anchor` é string `"center"` (não objeto).

### HERE Routing API — transportMode inválido
**Problema:** `transportMode=motorcycle` ou `scooter` retorna erro.

**Solução:** Usar `transportMode=car`.

### HERE Traffic API v7 — endpoint 404
**Problema:** O endpoint `/traffic/6.3/incidents.json` migrou.

**Solução:** Usar `/v7/incidents` com parâmetro bbox no formato `in=bbox:lng,lat,lng,lat`.

### async/await em construtores
**Problema:** `constructor` não pode ser `async`.

**Solução:** Não fazer chamadas assíncronas no construtor. Usar `useEffect` ou estado inicial diferente.

### Stack.Screen "garagem" warning
**Problema:** `Stack.Screen name="garagem"` definido mas rota inexistente.

**Solução:** Remover do `app/_layout.tsx`. A Garagem agora é uma tab, não uma rota de stack.

### Projetos Supabase pausados
**Problema:** Free tier pausa após 7 dias de inatividade.

**Solução:** Acessar o projeto manualmente pelo dashboard para despausar.

---

*Atualizado em: 2026-04-26 | Versão: 1.0*
