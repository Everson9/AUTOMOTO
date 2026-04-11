# SUPABASE_GUIDE.md — Guia de Integração Supabase

> Referência rápida. Para schema completo: `docs/database/SCHEMA.md`

---

## Setup do cliente

```typescript
// apps/mobile/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { MMKV } from 'react-native-mmkv'
import type { Database } from '../types/supabase.generated'

// Storage customizado usando MMKV (mais rápido que AsyncStorage)
const storage = new MMKV()
const mmkvStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
}

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: mmkvStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

---

## Gerar tipos TypeScript

Sempre que alterar o schema, regenerar:

```bash
supabase gen types typescript \
  --project-id SEU_PROJECT_ID \
  > packages/shared/src/types/supabase.generated.ts
```

Ou localmente (com Supabase CLI rodando):
```bash
supabase gen types typescript --local \
  > packages/shared/src/types/supabase.generated.ts
```

---

## Autenticação

```typescript
// Login com email
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@email.com',
  password: 'senha123',
})

// Cadastro
const { data, error } = await supabase.auth.signUp({
  email, password,
  options: { data: { nome: 'João' } }  // metadata extra
})

// Logout
await supabase.auth.signOut()

// Ouvir mudanças de sessão
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') { /* redirecionar para home */ }
  if (event === 'SIGNED_OUT') { /* redirecionar para login */ }
})

// Usuário atual
const { data: { user } } = await supabase.auth.getUser()
```

---

## Storage (upload de fotos)

```typescript
// Upload de foto de mod
async function uploadFotoMod(uri: string, motoId: string): Promise<string> {
  const fileName = `mods/${motoId}/${Date.now()}.jpg`

  // Converter URI local para Blob
  const response = await fetch(uri)
  const blob = await response.blob()

  const { error } = await supabase.storage
    .from('fotos')           // nome do bucket
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    })

  if (error) throw new Error(error.message)

  // Retornar URL pública
  const { data } = supabase.storage.from('fotos').getPublicUrl(fileName)
  return data.publicUrl
}
```

### Buckets necessários

Criar no dashboard do Supabase:

| Bucket    | Público | Uso                               |
|-----------|---------|-----------------------------------|
| `fotos`   | Sim     | Fotos de motos, mods, recibos     |
| `dossies` | Sim     | PDFs do Dossiê (via QR code)      |
| `bos`     | Não     | B.O.s do Raio Antifurto (privado) |

Política de storage para `fotos` (usuário gerencia suas próprias fotos):
```sql
-- No dashboard: Storage > Policies
-- Allow authenticated users to upload to their own folder
CREATE POLICY "upload proprio"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'fotos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Realtime

```typescript
// Ouvir updates de membros do comboio
const channel = supabase
  .channel(`comboio-${id}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'comboio_members',
    filter: `comboio_id=eq.${id}`,
  }, (payload) => {
    const membro = payload.new as ComboioMember
    atualizarPosicaoNoMapa(membro)
  })
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') console.log('Realtime conectado')
  })

// Desinscrever quando sair da tela
return () => supabase.removeChannel(channel)
```

**Importante:** habilitar Realtime para a tabela `comboio_members` no dashboard:
`Database > Replication > Tables > comboio_members ✓`

---

## Limites do free tier

| Recurso                    | Limite free          | Ação ao atingir              |
|----------------------------|----------------------|------------------------------|
| Banco de dados             | 500 MB               | Arquivar dados antigos       |
| Storage                    | 1 GB                 | Comprimir fotos antes de upload |
| Realtime conexões          | 200 simultâneas      | Throttle de updates do Comboio |
| Edge Function invocações   | 500k/mês             | Cache de respostas            |
| Auth (usuários ativos/mês) | 50.000               | Upgrade para Pro ($25/mês)   |
| Inatividade do projeto     | Pausa após 7 dias    | Acessar manualmente 1x/semana |

---

## Comandos CLI essenciais

```bash
# Login
supabase login

# Inicializar no projeto
supabase init

# Linkar com projeto remoto
supabase link --project-ref SEU_REF

# Aplicar migrações
supabase db push

# Pull do schema remoto
supabase db pull

# Deploy de Edge Function
supabase functions deploy nome-da-funcao

# Logs de Edge Function
supabase functions logs nome-da-funcao --tail
```
