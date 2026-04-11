# AUTH_GUIDE.md — Guia de Autenticação

> Leia este arquivo quando implementar qualquer fluxo de login, cadastro ou sessão.
> Auth por e-mail é **Fase 1**. Auth por SMS/telefone é **Fase 2**.

---

## Estratégia geral

Supabase Auth gerencia toda a autenticação. Nenhum token é armazenado manualmente — o SDK cuida da sessão via AsyncStorage seguro.

```
Fase 1: e-mail + senha   (simples, zero custo, validação rápida)
Fase 2: OTP por SMS      (adicionar Twilio via Supabase — tem cota gratuita)
```

A troca de e-mail para SMS não exige reescrita — apenas habilitar o provider no painel do Supabase e ajustar a tela de login.

---

## Setup do cliente Supabase

```typescript
// apps/mobile/src/lib/supabase.ts

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase.generated'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // obrigatório no React Native
  },
})
```

> ⚠️ Nunca usar `localStorage` — não existe no React Native. Sempre `AsyncStorage`.

---

## Fase 1 — Autenticação por e-mail

### Cadastro

```typescript
// apps/mobile/src/services/auth.ts

export async function cadastrarComEmail(email: string, senha: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      // Dados extras que vão para auth.users.raw_user_meta_data
      // O trigger `on_auth_user_created` copia para public.users
      data: { nome: '' },
    },
  })
  if (error) throw new Error(error.message)
  return data
}
```

### Login

```typescript
export async function loginComEmail(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) throw new Error(error.message)
  return data.session
}
```

### Logout

```typescript
export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}
```

---

## Fase 2 — Autenticação por SMS (OTP)

Ativar no painel do Supabase: **Authentication → Providers → Phone** → habilitar Twilio.

### Enviar OTP

```typescript
export async function enviarOTPSMS(telefone: string) {
  // Formato E.164: +5511999999999
  const { error } = await supabase.auth.signInWithOtp({ phone: telefone })
  if (error) throw new Error(error.message)
}
```

### Verificar OTP

```typescript
export async function verificarOTPSMS(telefone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: telefone,
    token,
    type: 'sms',
  })
  if (error) throw new Error(error.message)
  return data.session
}
```

---

## Hook de sessão

Centraliza o estado de autenticação para todas as telas.

```typescript
// apps/mobile/src/hooks/useAuth.ts

import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Recuperar sessão persistida
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Ouvir mudanças de autenticação (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { session, user, isLoading, isAutenticado: !!session }
}
```

---

## Criação automática do perfil do usuário

Quando um novo usuário é criado pelo Supabase Auth, um trigger de banco cria automaticamente o registro em `public.users`.

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_create_users_trigger.sql

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nome, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

> Isso garante que `public.users` sempre existe antes de qualquer operação de negócio — nunca assumir que o perfil existe sem verificar.

---

## Proteção de rotas (navegação)

```tsx
// apps/mobile/src/navigation/RootNavigator.tsx

import { useAuth } from '../hooks/useAuth'

export function RootNavigator() {
  const { isAutenticado, isLoading } = useAuth()

  if (isLoading) return <SplashScreen />

  return (
    <NavigationContainer>
      {isAutenticado ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  )
}

// AuthStack: Login, Cadastro, EsqueciSenha
// AppStack: Tabs principais (Mapa, Garagem, SOS, Perfil)
```

---

## Onboarding obrigatório após primeiro login

**Decisão de produto:** o app é inútil sem moto cadastrada. O onboarding força o cadastro de pelo menos uma moto antes de liberar o app.

```typescript
// Verificar se o usuário tem moto cadastrada
async function temMotoCadastrada(userId: string): Promise<boolean> {
  const { count } = await supabase
    .from('motos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
  return (count ?? 0) > 0
}

// Na AppStack: se não tem moto → redirecionar para OnboardingScreen
// Essa verificação acontece UMA VEZ após o login, não em todo launch
```

---

## Variáveis de ambiente

```bash
# .env.local (nunca commitar)
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Prefixo EXPO_PUBLIC_ = exposto ao bundle do app
# Sem esse prefixo = acessível apenas em Edge Functions (server-side)
```

---

## Checklist de implementação — Fase 1

- [ ] Cliente Supabase configurado com AsyncStorage
- [ ] Telas: `LoginScreen`, `CadastroScreen`, `EsqueciSenhaScreen`
- [ ] Hook `useAuth` implementado e testado
- [ ] Trigger `on_auth_user_created` na migração do banco
- [ ] `RootNavigator` separando AuthStack e AppStack
- [ ] Redirecionamento para onboarding se sem moto cadastrada
- [ ] Logout acessível nas configurações do perfil

## Checklist de implementação — Fase 2 (adicional)

- [ ] Twilio habilitado no Supabase Auth
- [ ] Telas `EnviarSMSScreen` e `VerificarOTPScreen`
- [ ] Máscara de telefone no campo de entrada (formato E.164)
- [ ] Fallback para e-mail se SMS falhar (usuário já cadastrado)
