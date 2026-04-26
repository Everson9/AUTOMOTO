# OVERVIEW.md — Arquitetura Geral do Automoto

> Leia este arquivo quando precisar entender como as peças se conectam.
> Para detalhes de implementação, vá direto ao arquivo do módulo ou skill relevante.

---

## Diagrama de camadas

```
┌─────────────────────────────────────────────┐
│           apps/mobile (Expo RN)             │
│  Screens → Hooks → Services → Supabase SDK  │
└───────────────────┬─────────────────────────┘
                    │ HTTPS / WebSocket
┌───────────────────▼─────────────────────────┐
│              Supabase                        │
│  Auth │ PostgreSQL+PostGIS │ Realtime        │
│  Storage │ Edge Functions                    │
└───────────────────┬─────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   Open-Meteo   OpenFreeMap  Expo Push
   (clima)      (tiles mapa) (FCM/APNs)
```

---

## Fluxo de dados por feature

### Tela normal (CRUD simples)

```
Screen
  └── useNomeDaTela (hook)
        └── supabase.from('tabela').select()
              └── RLS filtra automaticamente por auth.uid()
```

### Feature com mapa

```
Screen
  └── useRadarMap (hook)
        ├── supabase.rpc('alertas_proximos', {lat, lng})  → dados
        ├── alertasParaGeoJSON(dados)                      → GeoJSON
        └── MapLibreGL.ShapeSource + Layer                → renderização
```

### Feature em tempo real (Comboio)

```
Screen
  └── useComboio (hook)
        ├── supabase.channel('comboio:id').subscribe()    → recebe updates
        ├── Zustand store                                  → estado global
        └── MapLibreGL ShapeSource                        → renderiza posições
```

### Notificação push (Alertas da Via)

```
Usuário reporta alerta
  └── supabase.from('alertas_via').insert()
        └── Trigger PostgreSQL → Edge Function
              └── Busca tokens de usuários no raio (PostGIS)
                    └── Expo Push API → FCM/APNs → dispositivos
```

---

## Responsabilidades por camada

| Camada              | Responsabilidade                                    | Não fazer                          |
|---------------------|-----------------------------------------------------|------------------------------------|
| `screens/`          | Composição visual, navegação                        | Lógica de negócio, queries diretas |
| `hooks/`            | Estado local + chamadas ao Supabase                 | Renderização, navegação            |
| `stores/`           | Estado global compartilhado entre telas             | Chamadas assíncronas diretas       |
| `services/`         | Wrappers de APIs externas (Open-Meteo, etc.)        | Estado, renderização               |
| `lib/supabase.ts`   | Instância única do cliente Supabase                 | Lógica de negócio                  |
| Edge Functions      | Operações server-side (push em massa, validações)   | Estado, chamadas ao app            |
| `packages/shared/`  | Tipos TypeScript, schemas Zod, utils puros          | Imports de React Native            |

---

## Convenções de nomenclatura de arquivos

```
screens/           PascalCase + sufixo Screen    → GaragemScreen.tsx
hooks/             camelCase + prefixo use        → useGaragem.ts
stores/            camelCase + sufixo Store       → useMotosStore.ts
services/          camelCase + sufixo Service     → climaService.ts
components/        PascalCase                     → BotaoAlerta.tsx
types/             PascalCase + sufixo .types.ts  → Moto.types.ts
utils/             camelCase                      → formatarPlaca.ts
constants/         SCREAMING_SNAKE_CASE           → MAP_STYLES.ts
```

---

## Variáveis de ambiente

```bash
# apps/mobile/.env.local
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# apps/api/.env.local (Edge Functions)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # nunca expor no frontend
EXPO_PUSH_URL=https://exp.host/--/api/v2/push/send
```

> `EXPO_PUBLIC_` → exposto no bundle do app (ok para anon key)
> Sem prefixo → apenas no servidor (nunca no app)

---

## Dependências principais e por que foram escolhidas

| Pacote                          | Motivo                                              |
|---------------------------------|-----------------------------------------------------|
| `expo` + `expo-dev-client`      | Build nativo sem ejetar; EAS Build gratuito         |
| `@maplibre/maplibre-react-native` | Fork OSS do Mapbox; mesma API; zero custo          |
| `@supabase/supabase-js`         | SDK oficial; tipos gerados automaticamente          |
| `zustand`                       | Estado global minimal; sem boilerplate              |
| `react-hook-form` + `zod`       | Formulários tipados; validação no schema            |
| `@tanstack/react-query`         | Cache de dados do servidor; evita re-fetch          |
| `expo-notifications`            | Push cross-platform; gratuito; abstrai FCM/APNs     |
| `expo-print`                    | Geração de PDF on-device; zero custo de servidor    |
| `expo-location`                 | GPS com permissões gerenciadas pelo Expo            |
| `expo-image-picker`             | Fotos de mods/recibos com compressão automática     |
| `react-native-mmkv`             | Cache offline rápido (substituto do AsyncStorage)   |
