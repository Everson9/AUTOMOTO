# CONVENTIONS.md — Convenções de Código

---

## Idioma

| Contexto                                 | Idioma       | Exemplo                        |
|------------------------------------------|--------------|--------------------------------|
| Nomes de variáveis de domínio            | Português    | `motoAtiva`, `alertasProximos` |
| Comentários de lógica de negócio         | Português    | `// Expirar alerta após 2h`    |
| Hooks, utils, tipos genéricos            | Inglês       | `useDebounce`, `formatDate`    |
| Nomes de tabelas no banco                | snake_case PT| `alertas_via`, `comboio_members` |
| Nomes de funções RPC                     | snake_case PT| `alertas_proximos`             |
| Commits                                  | Inglês       | `feat: add moto registration`  |

---

## Estrutura de imports (ordem obrigatória)

```typescript
// 1. React e React Native
import { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'

// 2. Bibliotecas externas
import MapLibreGL from '@maplibre/maplibre-react-native'
import { z } from 'zod'

// 3. Pacotes internos do monorepo
import { formatarPlaca } from '@automoto/shared'
import { Button } from '@automoto/ui'

// 4. Imports do próprio app (absolutos)
import { supabase } from '../lib/supabase'
import { useMotosStore } from '../stores/useMotosStore'

// 5. Imports relativos
import { useGaragem } from './useGaragem'
import type { GaragemScreenProps } from './Garagem.types'
```

---

## Padrões de commit (Conventional Commits)

```
feat:     nova feature
fix:      correção de bug
docs:     mudança em documentação
style:    formatação (sem mudança de lógica)
refactor: refatoração sem nova feature ou fix
test:     adicionar ou corrigir testes
chore:    atualização de deps, configs

Exemplos:
feat(garagem): add moto registration screen
fix(mapa): fix heatmap not updating after new report
docs(skills): add edge function pattern
refactor(comboio): extract location update to hook
```

---

## TypeScript

```typescript
// ✅ Tipos explícitos em funções públicas
export async function buscarMoto(id: string): Promise<Moto | null> {}

// ✅ Interface para props de componentes
export interface MotoCardProps {
  moto: Moto
  onPress: (id: string) => void
}

// ✅ Type para unions simples
type TipoAlerta = 'oleo' | 'areia' | 'buraco' | 'obra' | 'enchente'

// ❌ Evitar any — se inevitável, comentar o porquê
const dados = resposta as any // TODO: tipar após atualizar SDK

// ✅ Non-null assertion só quando você TEM CERTEZA
const userId = session.user!.id  // garantido pelo middleware de auth

// ✅ Tipos do Supabase sempre gerados, nunca escritos à mão
import type { Database } from '../types/supabase.generated'
type Moto = Database['public']['Tables']['motos']['Row']
```

---

## React Native específico

```tsx
// ✅ StyleSheet.create sempre — nunca objeto inline em render
const styles = StyleSheet.create({ container: { flex: 1 } })

// ❌ Nunca
<View style={{ flex: 1, backgroundColor: 'red' }}>

// ✅ Acessibilidade em elementos interativos
<TouchableOpacity
  accessibilityLabel="Reportar alerta na via"
  accessibilityRole="button"
>

// ✅ keyExtractor único e estável em listas
<FlatList
  keyExtractor={(item) => item.id}
  // Nunca usar index como key em listas mutáveis
/>

// ✅ Memo em componentes pesados (listas, mapas)
export const MotoCard = React.memo(function MotoCard(props: MotoCardProps) {})
```

---

## Supabase / SQL

```sql
-- Tabelas sempre com:
-- - id UUID como PK
-- - created_at TIMESTAMPTZ DEFAULT NOW()
-- - updated_at TIMESTAMPTZ DEFAULT NOW() + trigger
-- - RLS habilitado
-- - Políticas explícitas (não confiar em ausência de política)

-- Nomes de políticas em português, descritivos
CREATE POLICY "usuarios veem apenas suas motos"
  ON public.motos FOR SELECT
  USING (auth.uid() = user_id);

-- Índices em todas as foreign keys e colunas de filtro frequente
CREATE INDEX idx_alertas_via_geom ON public.alertas_via USING GIST(geom);
CREATE INDEX idx_alertas_via_expira_em ON public.alertas_via(expira_em);
```

---

## Tamanho de arquivo

| Tipo           | Máximo recomendado | Ação se ultrapassar          |
|----------------|--------------------|------------------------------|
| Componente     | 150 linhas         | Extrair sub-componentes      |
| Hook           | 100 linhas         | Dividir em hooks menores     |
| Screen         | 200 linhas         | Extrair componentes e hooks  |
| Util / Service | 200 linhas         | Dividir por responsabilidade |
| Migração SQL   | Sem limite         | Uma responsabilidade por arquivo |
