# Arquitetura Decision Records (ADRs)

## ADR-009: Expo Router como único sistema de navegação

**Data:** 2026-04-11

**Status:** Aceito

### Contexto
As sessões 3 e 4 introduziram React Navigation puro 
(AuthNavigator, AppNavigator) em paralelo ao Expo Router, causando 
conflito onde o Expo Router ignorava toda a lógica de auth.

### Decisão
Usar exclusivamente Expo Router para navegação. 
Nenhum NavigationContainer ou Stack do React Navigation fora do 
contexto do Expo Router.

### Consequências
- Rotas de auth controladas por arquivos físicos em app/
- Redirecionamento via router.replace() no _layout.tsx
- src/navigation/ depreciado e não utilizado