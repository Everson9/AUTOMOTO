# SKILLS.md — Guia de Habilidades e Padrões do Automoto

> Como trabalhar neste projeto. Leia antes de escrever qualquer código.
> Este arquivo ensina os padrões, não descreve features — para features, veja `docs/modules/`.

---

## 1. Skill: Criar um Componente React Native

### Quando usar
Sempre que precisar de um novo elemento visual reutilizável.

### Estrutura obrigatória

```tsx
// packages/ui/src/components/NomeDoComponente/index.tsx

import { StyleSheet, View } from 'react-native'
import { colors, spacing, typography } from '../../tokens'

// 1. Tipos primeiro, sempre exportados
export interface NomeDoComponenteProps {
  /** Descrição do que faz */
  propriedade: string
  /** Callback chamado ao pressionar */
  onPress?: () => void
  /** Variante visual */
  variant?: 'primary' | 'secondary'
}

// 2. Componente como função nomeada (não arrow function no export)
export function NomeDoComponente({
  propriedade,
  onPress,
  variant = 'primary',
}: NomeDoComponenteProps) {
  return (
    <View style={[styles.container, styles[variant]]}>
      {/* conteúdo */}
    </View>
  )
}

// 3. Styles no final, fora do componente
const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  primary: {
    backgroundColor: colors.brand.primary,
  },
  secondary: {
    backgroundColor: colors.background.secondary,
  },
})
```

### Checklist antes de finalizar um componente
- [ ] Props tipadas e exportadas
- [ ] Valor default para props opcionais
- [ ] `StyleSheet.create` (nunca objeto inline em render)
- [ ] Testado em Android físico
- [ ] Funciona sem props opcionais (estado default faz sentido)
- [ ] Acessibilidade: `accessibilityLabel` em elementos interativos

---

## 2. Skill: Criar uma Screen (Tela)

### Estrutura de arquivo

```
apps/mobile/src/screens/
  NomeDaTela/
    index.tsx          → componente principal da tela
    NomeDaTela.types.ts → tipos locais
    useNomeDaTela.ts   → lógica extraída em hook
    NomeDaTela.test.tsx → testes
```

### Template de screen

```tsx
// apps/mobile/src/screens/NomeDaTela/index.tsx

import { useNomeDaTela } from './useNomeDaTela'
import type { RootStackParamList } from '../../navigation/types'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

type Props = NativeStackScreenProps<RootStackParamList, 'NomeDaTela'>

export function NomeDaTela({ navigation, route }: Props) {
  const { dados, isLoading, erro, handleAcao } = useNomeDaTela(route.params)

  if (isLoading) return <LoadingScreen />
  if (erro) return <ErrorScreen message={erro} />

  return (
    <SafeAreaView style={styles.container}>
      {/* conteúdo */}
    </SafeAreaView>
  )
}
```

### Hook de lógica da tela

```tsx
// apps/mobile/src/screens/NomeDaTela/useNomeDaTela.ts

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export function useNomeDaTela(params?: TipoParams) {
  const [dados, setDados] = useState<TipoDados | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    async function carregar() {
      try {
        setIsLoading(true)
        // lógica de busca
      } catch (e) {
        setErro('Erro ao carregar dados')
      } finally {
        setIsLoading(false)
      }
    }
    carregar()
  }, [params?.id])

  return { dados, isLoading, erro }
}
```

---

## 3. Skill: Query no Supabase

### Padrão para SELECT

```typescript
// Sempre tipar o retorno com os tipos gerados pelo Supabase
import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase.generated'

type Moto = Database['public']['Tables']['motos']['Row']

async function buscarMotosDoUsuario(userId: string): Promise<Moto[]> {
  const { data, error } = await supabase
    .from('motos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    // Nunca silenciar erros do Supabase
    console.error('[buscarMotosDoUsuario]', error)
    throw new Error(error.message)
  }

  return data ?? []
}
```

### Padrão para INSERT

```typescript
async function cadastrarMoto(
  dados: Database['public']['Tables']['motos']['Insert']
) {
  const { data, error } = await supabase
    .from('motos')
    .insert(dados)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
```

### Padrão para queries geoespaciais (PostGIS)

```typescript
// Buscar alertas num raio de X metros a partir de um ponto
async function buscarAlertasProximos(lat: number, lng: number, raioMetros = 5000) {
  const { data, error } = await supabase.rpc('alertas_proximos', {
    lat,
    lng,
    raio_metros: raioMetros,
  })

  if (error) throw new Error(error.message)
  return data
}

// A função SQL correspondente fica em: docs/database/SCHEMA.md#funções-rpc
```

### Padrão para Realtime

```typescript
// Em um hook React
useEffect(() => {
  const channel = supabase
    .channel(`comboio:${sessaoId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comboio_members',
        filter: `sessao_id=eq.${sessaoId}`,
      },
      (payload) => {
        // atualizar estado local
      }
    )
    .subscribe()

  // SEMPRE limpar o canal no cleanup
  return () => {
    supabase.removeChannel(channel)
  }
}, [sessaoId])
```

---

## 4. Skill: Adicionar uma Layer no Mapa (MapLibre)

### Anatomia de uma layer

```tsx
import MapLibreGL from '@maplibre/maplibre-react-native'

// Estrutura padrão: Source → Layer(s)
// Source = onde estão os dados (GeoJSON, URL de tiles, etc.)
// Layer = como renderizar os dados (símbolos, heatmap, fill, line)

<MapLibreGL.ShapeSource
  id="id-unico-da-source"          // deve ser único no mapa
  shape={geoJsonObject}             // GeoJSON FeatureCollection
  onPress={handlePress}             // opcional: toque em features
  cluster                           // opcional: agrupar pontos próximos
  clusterRadius={50}
>
  {/* Uma source pode ter múltiplas layers */}
  <MapLibreGL.SymbolLayer
    id="id-unico-da-layer"
    style={layerStyle}
  />
</MapLibreGL.ShapeSource>
```

### Templates por tipo de layer

**Pins com ícones (SymbolLayer)**
```tsx
const pinStyle = {
  iconImage: ['match', ['get', 'tipo'],
    'oleo',   'icon-oleo',
    'areia',  'icon-areia',
    'buraco', 'icon-buraco',
    'icon-default',
  ],
  iconSize: 1.2,
  iconAllowOverlap: true,
  textField: ['get', 'titulo'],       // opcional: label abaixo do pin
  textOffset: [0, 1.5],
  textSize: 12,
  textOptional: true,                 // esconde texto se sobrepor
}
```

**Heatmap de densidade**
```tsx
const heatmapStyle = {
  heatmapRadius: ['interpolate', ['linear'], ['zoom'], 10, 20, 15, 40],
  heatmapOpacity: 0.75,
  heatmapWeight: ['coalesce', ['get', 'peso'], 1],
  heatmapColor: [
    'interpolate', ['linear'], ['heatmap-density'],
    0,   'rgba(0,0,0,0)',
    0.2, 'rgba(255,195,0,0.5)',
    0.5, 'rgba(255,87,51,0.7)',
    1.0, 'rgba(199,0,57,0.9)',
  ],
}
```

**Polígono de área (FillLayer)**
```tsx
const fillStyle = {
  fillColor: '#FF573320',
  fillOutlineColor: '#FF5733',
}
```

**Linha de rota (LineLayer)**
```tsx
const lineStyle = {
  lineColor: '#1A56DB',
  lineWidth: 4,
  lineCap: 'round',
  lineJoin: 'round',
}
```

### Ícones customizados no mapa

```tsx
// Registrar ícones uma vez na raiz do mapa
<MapLibreGL.Images
  images={{
    'icon-oleo':   require('../assets/map/oleo.png'),
    'icon-areia':  require('../assets/map/areia.png'),
    'icon-buraco': require('../assets/map/buraco.png'),
    'icon-moto':   require('../assets/map/moto.png'),
  }}
/>
```

### Converter dados do Supabase para GeoJSON

```typescript
// packages/shared/src/utils/geo.ts

import type { Feature, FeatureCollection, Point } from 'geojson'

export function alertasParaGeoJSON(alertas: AlertaVia[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: alertas.map((a) => ({
      type: 'Feature',
      id: a.id,
      geometry: {
        type: 'Point',
        // PostGIS retorna {x: lng, y: lat} quando parsado
        coordinates: [a.geom.x, a.geom.y],
      },
      properties: {
        id:    a.id,
        tipo:  a.tipo,
        titulo: a.titulo,
        peso:  a.confirmacoes,
      },
    })),
  }
}
```

---

## 5. Skill: Push Notification com Expo

### Pedir permissão e salvar token

```typescript
// apps/mobile/src/lib/notifications.ts

import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { supabase } from './supabase'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export async function registrarPushToken(userId: string) {
  if (!Device.isDevice) return null  // não funciona em simulador

  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return null

  const token = (await Notifications.getExpoPushTokenAsync()).data

  // Salvar token no Supabase para envio server-side
  await supabase
    .from('push_tokens')
    .upsert({ user_id: userId, token, updated_at: new Date().toISOString() })

  return token
}
```

### Enviar notificação via Edge Function

```typescript
// apps/api/supabase/functions/enviar-alerta-via/index.ts

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

async function enviarPush(tokens: string[], mensagem: ExpoPushMessage) {
  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tokens.map((to) => ({ to, ...mensagem }))),
  })
  return response.json()
}

// Uso
await enviarPush(tokensDosUsuariosProximos, {
  title: '⚠️ Alerta na via',
  body: 'Óleo na pista reportado a 300m à frente',
  data: { tipo: 'alerta_via', alertaId: '123' },
  sound: 'default',
})
```

---

## 6. Skill: Edge Function no Supabase

### Estrutura de uma Edge Function

```typescript
// apps/api/supabase/functions/nome-da-funcao/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Tratar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Cliente com service_role para operações administrativas
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const body = await req.json()

    // lógica da função...
    const resultado = await processarAlgo(supabase, body)

    return new Response(JSON.stringify({ data: resultado }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
```

### Invocar Edge Function no app

```typescript
const { data, error } = await supabase.functions.invoke('nome-da-funcao', {
  body: { parametro: 'valor' },
})
```

### Deploy

```bash
supabase functions deploy nome-da-funcao --project-ref SEU_PROJECT_REF
```

---

## 7. Skill: Criar uma Migração de Banco de Dados

### Convenção de nomenclatura

```
supabase/migrations/
  YYYYMMDDHHMMSS_descricao_curta.sql
  
  Exemplos:
  20240101120000_create_motos_table.sql
  20240102090000_add_geom_to_alertas.sql
  20240103150000_create_rpc_alertas_proximos.sql
```

### Template de migração

```sql
-- supabase/migrations/20240101120000_create_motos_table.sql

-- Sempre envolver em transação implícita (Supabase faz isso automaticamente)

-- 1. Criar tabela
CREATE TABLE IF NOT EXISTS public.motos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  placa       VARCHAR(8) NOT NULL,
  modelo      VARCHAR(100) NOT NULL,
  ano         SMALLINT NOT NULL,
  km_atual    INTEGER NOT NULL DEFAULT 0,
  foto_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Índices (sempre antes das políticas)
CREATE INDEX idx_motos_user_id ON public.motos(user_id);

-- 3. RLS (Row Level Security) — SEMPRE habilitar
ALTER TABLE public.motos ENABLE ROW LEVEL SECURITY;

-- 4. Políticas
CREATE POLICY "usuarios veem apenas suas motos"
  ON public.motos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "usuarios criam suas motos"
  ON public.motos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usuarios atualizam suas motos"
  ON public.motos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usuarios deletam suas motos"
  ON public.motos FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Trigger para updated_at automático
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.motos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

### Rodar migrações

```bash
# Aplicar todas as migrações pendentes
supabase db push

# Gerar nova migração a partir de diff
supabase db diff --use-migra nova_migracao

# Resetar banco local (cuidado: destrói dados)
supabase db reset
```

---

## 8. Skill: Gerenciar Estado Global

### Quando usar Zustand

Para estado global que precisa ser acessível em várias telas sem prop drilling.
**Não usar para:** dados do servidor (use React Query / hooks Supabase).

```typescript
// apps/mobile/src/stores/useMotosStore.ts

import { create } from 'zustand'
import type { Database } from '../types/supabase.generated'

type Moto = Database['public']['Tables']['motos']['Row']

interface MotosState {
  // Estado
  motos: Moto[]
  motoAtiva: Moto | null
  
  // Ações (nomes sempre começam com verbo)
  setMotos: (motos: Moto[]) => void
  setMotoAtiva: (moto: Moto) => void
  adicionarMoto: (moto: Moto) => void
  removerMoto: (id: string) => void
}

export const useMotosStore = create<MotosState>((set) => ({
  motos: [],
  motoAtiva: null,

  setMotos: (motos) => set({ motos }),
  setMotoAtiva: (moto) => set({ motoAtiva: moto }),
  
  adicionarMoto: (moto) =>
    set((state) => ({ motos: [...state.motos, moto] })),
  
  removerMoto: (id) =>
    set((state) => ({
      motos: state.motos.filter((m) => m.id !== id),
    })),
}))
```

### Regra de ouro do estado

```
Dados do servidor   → Hook customizado com Supabase (não store global)
Estado de UI local  → useState no próprio componente
Estado entre telas  → Zustand store
Formulários         → React Hook Form (não store)
Navegação           → React Navigation params
```

---

## 9. Skill: Formulários com React Hook Form

```tsx
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 1. Schema de validação
const schemaCadastroMoto = z.object({
  placa: z.string().length(7, 'Placa inválida').regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, 'Formato inválido'),
  modelo: z.string().min(2, 'Modelo obrigatório').max(100),
  ano: z.number().min(1970).max(new Date().getFullYear() + 1),
  km_atual: z.number().min(0).max(9999999),
})

type FormCadastroMoto = z.infer<typeof schemaCadastroMoto>

// 2. Uso no componente
export function FormCadastrarMoto({ onSuccess }: { onSuccess: () => void }) {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormCadastroMoto>({
    resolver: zodResolver(schemaCadastroMoto),
    defaultValues: { km_atual: 0 },
  })

  const onSubmit = async (dados: FormCadastroMoto) => {
    await cadastrarMoto(dados)
    onSuccess()
  }

  return (
    <View>
      <Controller
        control={control}
        name="placa"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Placa"
            value={value}
            onChangeText={(v) => onChange(v.toUpperCase())}
            error={errors.placa?.message}
          />
        )}
      />
      {/* outros campos... */}
      <Button
        title="Cadastrar"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
      />
    </View>
  )
}
```

---

## 10. Skill: Tratamento de Erros

### Padrão de erro consistente

```typescript
// packages/shared/src/utils/errors.ts

export class AutomotoError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string  // mensagem amigável para exibir ao usuário
  ) {
    super(message)
    this.name = 'AutomotoError'
  }
}

// Exemplos de erros de domínio
export const Errors = {
  MOTO_NAO_ENCONTRADA: new AutomotoError(
    'Moto not found',
    'MOTO_NOT_FOUND',
    'Moto não encontrada. Verifique se ela ainda está cadastrada.'
  ),
  PLACA_JA_CADASTRADA: new AutomotoError(
    'Plate already registered',
    'PLATE_DUPLICATE',
    'Esta placa já está cadastrada no sistema.'
  ),
} as const
```

### Boundary de erro em telas

```tsx
// Erros de rede / Supabase → exibir mensagem amigável + botão de retry
// Erros de validação → exibir inline no formulário
// Erros críticos → logar e mostrar tela de erro genérica

function tratarErroSupabase(error: PostgrestError): string {
  switch (error.code) {
    case '23505': return 'Este registro já existe.'
    case '23503': return 'Referência inválida.'
    case 'PGRST116': return 'Registro não encontrado.'
    default: return 'Algo deu errado. Tente novamente.'
  }
}
```

---

## 11. Skill: Reduzir Custo de Token com IA

> Estas são as regras para trabalhar com Claude Code neste projeto de forma eficiente.

## 12. Skill: Bottom Sheet

### Pacote padrão do projeto
`@gorhom/bottom-sheet`

### Instalação
```bash
npx expo install @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler
```

### Estrutura obrigatória
```tsx
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { useRef, useCallback } from 'react'

const bottomSheetRef = useRef<BottomSheet>(null)
const snapPoints = ['25%', '50%']

const handleOpen = useCallback(() => {
  bottomSheetRef.current?.expand()
}, [])

const handleClose = useCallback(() => {
  bottomSheetRef.current?.close()
}, [])

return (
  <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={snapPoints}>
    <BottomSheetView>
      {/* conteúdo */}
    </BottomSheetView>
  </BottomSheet>
)
```

### Regras
- Sempre `index={-1}` para começar fechado
- Nunca usar Modal do React Native para isso
- Sempre fazer cleanup no unmount

---

## 13. Skill: Pontos no Mapa (PointAnnotation vs ShapeSource)

### Regra de escolha
- **Menos de 50 pontos** → `PointAnnotation` (mais simples)
- **50+ pontos ou heatmap** → `ShapeSource` + `SymbolLayer` com GeoJSON

### Menos de 50 pontos — PointAnnotation
```tsx
{alertas.map((alerta) => (
  <MapLibreGL.PointAnnotation
    key={alerta.id}
    id={alerta.id}
    coordinate={[alerta.longitude, alerta.latitude]}
  >
    <View style={styles.marker}>
      <Text>{alerta.icone}</Text>
    </View>
  </MapLibreGL.PointAnnotation>
))}
```

### 50+ pontos — ShapeSource + SymbolLayer
```tsx
const geojson = {
  type: 'FeatureCollection',
  features: alertas.map((a) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [a.longitude, a.latitude] },
    properties: { categoria: a.categoria },
  }))
}

<MapLibreGL.ShapeSource id="alertas" shape={geojson}>
  <MapLibreGL.SymbolLayer id="alertas-icons" style={{ iconSize: 1.5 }} />
</MapLibreGL.ShapeSource>
```

### Regras
- Nunca misturar os dois sistemas para o mesmo conjunto de dados
- `id` do `PointAnnotation` deve ser único — usar o `id` do banco
- Coordenadas sempre no formato `[longitude, latitude]` — nessa ordem


### Regra 1: Carregue apenas o contexto necessário

**Antes de pedir código**, identifique:
- Em qual módulo a feature se encaixa → leia só aquele `docs/modules/MODULE_*.md`
- Qual tabela do banco está envolvida → leia só a seção relevante de `docs/database/SCHEMA.md`
- Existe um padrão já definido aqui no SKILLS.md? → use ele, não peça um novo

**Evite pedir:**
- "Me explique todo o projeto" → leia `CLAUDE.md` você mesmo
- "Como funciona o módulo X?" → leia `docs/modules/MODULE_X.md`
- "Qual é o schema do banco?" → leia `docs/database/SCHEMA.md`

### Regra 2: Use tarefas atômicas

Escreva `tasks/CURRENT_TASK.md` antes de abrir o Claude Code.
Uma boa tarefa tem:
- **O que**: uma frase descrevendo a entrega
- **Arquivos afetados**: lista dos arquivos que serão tocados
- **Critério de pronto**: como saber que terminou

Exemplo ruim: "Implementar o módulo de manutenção"
Exemplo bom: "Criar a tela `ManutencaoListScreen` que exibe as manutenções da moto ativa, buscando de `supabase.from('manutencoes')`, com loading state e empty state"

### Regra 3: Use os snippets deste arquivo

Quando precisar de um padrão já documentado aqui (query Supabase, layer do mapa, Edge Function), copie o template e adapte. Não peça para a IA gerar do zero — ela vai criar algo diferente do padrão.

### Regra 4: Um arquivo por vez

Peça para a IA modificar um arquivo por vez. Commits atômicos = fácil de revisar e de reverter.

### Regra 5: Contexto mínimo para correção de bug

Ao reportar um bug, forneça:
1. O arquivo exato com o problema
2. O erro completo (mensagem + stack trace)
3. O comportamento esperado vs atual
4. **Nada mais** — não cole o projeto inteiro

---

## Glossário do Projeto

| Termo          | Significado no contexto do Automoto                          |
|----------------|--------------------------------------------------------------|
| `moto ativa`   | A moto selecionada atualmente pelo usuário (pode ter várias) |
| `alerta`       | Ocorrência reportada na via (óleo, areia, buraco, etc.)      |
| `comboio`      | Sessão de viagem compartilhada em grupo                      |
| `furto`        | Ocorrência de roubo/furto ativada pelo usuário               |
| `avistamento`  | Confirmação de localização de moto roubada por outro usuário |
| `dossiê`       | PDF de procedência gerado para venda da moto                 |
| `parceiro`     | Oficina ou loja com cadastro pago no app                     |
| `guardião`     | Usuário com alto nível de contribuição comunitária           |
