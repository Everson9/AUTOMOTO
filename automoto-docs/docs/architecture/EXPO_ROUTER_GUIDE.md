# EXPO_ROUTER_GUIDE.md — Regras de Navegação

> LEIA ESTE ARQUIVO antes de implementar qualquer navegação ou autenticação.
> Erros aqui custaram 12 sessões de retrabalho.

---

## Regra fundamental

Este projeto usa **Expo Router exclusivamente**.
Nunca criar NavigationContainer, Stack do React Navigation, AuthNavigator,
AppNavigator ou qualquer navigator em `src/navigation/`.
A pasta `src/navigation/` existe mas está DEPRECIADA — não usar.

---

## Como o Expo Router funciona

Rotas = arquivos físicos na pasta `app/`.
Se o arquivo não existe em `app/`, a rota não existe. Ponto final.
app/
_layout.tsx        → layout raiz, controla auth
login.tsx          → tela de login
cadastro.tsx       → tela de cadastro
cadastrar-moto.tsx → tela de cadastro de moto
(tabs)/
index.tsx        → mapa (home autenticada)

---

## Como controlar autenticação

**Único lugar que faz redirect: `app/_layout.tsx`**
Nenhuma outra tela deve chamar `router.replace()` baseado em auth.

Padrão correto:

```tsx
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  )
}

function RootLayoutNav() {
  const { isAutenticado, isLoading } = useAuthContext() // filho do AuthProvider

  useEffect(() => {
    if (isLoading) return
    if (!isAutenticado) {
      router.replace('/login')
    } else {
      router.replace('/(tabs)')
    }
  }, [isAutenticado, isLoading])

  return <Stack screenOptions={{ headerShown: false }} />
}
```

---

## Erros comuns — nunca repetir

| Erro | Por que acontece | Como evitar |
|------|-----------------|-------------|
| App vai direto pro mapa | Rota `(tabs)` existe no disco, Expo Router a carrega | Redirect no `_layout.tsx` via `router.replace()` |
| `useAuthContext` undefined | Chamado no mesmo componente que renderiza o `AuthProvider` | Sempre chamar em componente filho do `AuthProvider` |
| Rotas não encontradas | Arquivo não existe em `app/` | Criar arquivo físico em `app/` para cada rota |
| Tela preta | `_layout.tsx` retorna `null` sem `<Stack>` | Sempre retornar `<Stack>` mesmo durante loading |
| Stack.Screen condicional ignorado | Expo Router ignora renderização condicional de rotas | Usar `router.replace()` para controlar navegação |

---

## Regras para telas de conteúdo

Telas em `app/(tabs)/` e demais rotas **não fazem redirect de auth**.
Elas apenas renderizam seu conteúdo.
Quem protege as rotas é o `_layout.tsx`.

```tsx
// app/(tabs)/index.tsx — CORRETO
export default function HomeScreen() {
  // Sem useAuthContext, sem router.replace, sem verificação de moto
  // Só renderiza o mapa
  return <MapaScreen />
}
```

---

## Arquivos em app/ são wrappers

Telas complexas ficam em `src/screens/` e são reexportadas:

```tsx
// app/login.tsx
export { default } from '../src/screens/Login'
```

Isso mantém o código organizado sem duplicar lógica.