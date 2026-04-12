# SESSION_LOG.md — Histórico de Sessões

## [2026-04-11] — Sessão 1

### O que foi feito
- Criada a estrutura do monorepo Turborepo com apps/ (mobile e api), packages/ (shared, ui, config)
- Criado o app Expo em apps/mobile com as dependências do MapLibre e Expo Dev Client
- Configurado o cliente Supabase com @supabase/supabase-js e AsyncStorage
- Criado o arquivo .env.local com as variáveis do Supabase
- Implementada a tela do mapa com MapLibreGL.MapView exibindo tiles do OpenFreeMap e pin na localização atual
- Criados os arquivos de migração SQL iniciais para setup, usuários e motos

### Decisões tomadas
- Utilizar @react-native-async-storage/async-storage como storage customizado para o Supabase
- Utilizar PointAnnotation para exibir o pin na localização atual no mapa
- Adicionar permissões de localização no app.json para iOS e Android

### Pendências / o que não foi concluído
- Obter a chave ANON_KEY real do Supabase para substituir o placeholder
- Testar o funcionamento completo no dispositivo Android físico

### Próximo passo recomendado
Conectar o dispositivo Android físico e testar o funcionamento do mapa com o pin na localização atual, conectado ao Supabase.

---

## [2026-04-11] — Sessão 2

### O que foi feito
- Identificado que o arquivo apps/mobile/app/(tabs)/index.tsx continha o conteúdo padrão do Expo
- Substituído o conteúdo do index.tsx pelo mapa MapLibre com tile do OpenFreeMap e pin na localização atual
- Adicionado a camada de localização do usuário (UserLocation) ao mapa
- Mantido o tratamento de permissões e mensagens de erro

### Decisões tomadas
- Utilizar o padrão de estrutura do mapa conforme documentação do MapLibre
- Manter a exibição do pin com PointAnnotation na localização atual
- Adicionar tratamento adequado de permissões de localização

### Pendências / o que não foi concluído
- Testar o funcionamento completo no dispositivo Android físico após as alterações

### Próximo passo recomendado
Testar o aplicativo no dispositivo Android físico para confirmar que o mapa está sendo exibido corretamente com o pin na localização atual.

---

## [2026-04-11] — Sessão 3

### O que foi feito
- Criada a estrutura de navegação com AuthStack e AppStack
- Criado o hook useAuth com contexto de autenticação
- Criadas as telas de autenticação (Login e Cadastro)
- Criada a tela de cadastro de moto com validação Zod
- Atualizado o cliente Supabase com listener de autenticação
- Implementada navegação condicional baseada no estado de autenticação
- Implementado redirecionamento automático para cadastro de moto caso o usuário não tenha moto cadastrada

### Decisões tomadas
- Utilizar navegação por stacks (AuthStack e AppStack) para separar áreas de autenticação e app
- Usar formulários com validação Zod para cadastro de moto
- Implementar verificação de existência de moto no início da tela principal
- Centralizar o estado de autenticação com React Context e hook personalizado

### Pendências / o que não foi concluído
- Testar o fluxo completo no dispositivo Android físico
- Verificar salvamento dos dados no Supabase

### Próximo passo recomendado
Testar o fluxo completo: abrir app → login → cadastrar moto → ver mapa, e verificar se os dados estão sendo salvos corretamente no Supabase.

---

## [2026-04-11] — Sessão 4

### O que foi feito
- Revisado e corrigido o cliente Supabase para seguir exatamente o padrão do AUTH_GUIDE.md
- Atualizado o hook useAuth para seguir o padrão do AUTH_GUIDE.md
- Criado AuthProvider separado conforme melhores práticas
- Atualizado o sistema de navegação para usar o novo padrão de autenticação
- Corrigida a tela de cadastro de moto para seguir os padrões do SKILLS.md
- Atualizados os tipos de navegação para seguir os padrões do projeto
- Melhorada a validação de formulário na tela de cadastro de moto

### Decisões tomadas
- Separar o provedor de contexto de autenticação em um componente específico
- Utilizar o padrão exato do AUTH_GUIDE.md para o hook useAuth
- Seguir os padrões de validação do SKILLS.md seção 9 para formulários
- Garantir consistência no tratamento de erros conforme SKILLS.md seção 10

### Pendências / o que não foi concluído
- Testar o fluxo completo no dispositivo Android físico
- Verificar salvamento dos dados no Supabase

### Próximo passo recomendado
Testar o fluxo completo: abrir app → login → cadastrar moto → ver mapa, e verificar se os dados estão sendo salvos corretamente no Supabase, com os padrões de código agora alinhados.

---

## [2026-04-11] — Sessão 5

### O que foi feito
- Corrigido erro de importação: `useAuthContext` estava sendo importado do local errado
- Atualizadas todas as importações de `useAuthContext` para apontar para `AuthProvider.tsx`
- Corrigidos os arquivos: `_layout.tsx`, `index.tsx` (tela principal), `Login/index.tsx` e `CadastrarMoto/index.tsx`

### Decisões tomadas
- Manter as funções de contexto em seus respectivos provedores para evitar confusão de importação
- Verificar todas as importações após refatoração de código

### Pendências / o que não foi concluído
- Testar o fluxo completo no dispositivo Android físico
- Verificar salvamento dos dados no Supabase

### Próximo passo recomendado
Testar o fluxo completo após as correções de importação.

---

## [2026-04-11] — Sessão 6

### O que foi feito
- Corrigido problema de navegação: o app estava abrindo direto na tela do mapa ignorando o fluxo de autenticação
- Implementada lógica correta de navegação condicional baseada no estado de autenticação e presença de moto cadastrada
- Corrigido o arquivo `_layout.tsx` para seguir o padrão do AUTH_GUIDE.md com verificação adequada de autenticação
- Adicionada verificação de existência de moto para redirecionamento adequado

### Decisões tomadas
- Implementar lógica de verificação de autenticação e moto antes de decidir qual rota exibir
- Separar fluxos de navegação para usuários autenticados e não autenticados
- Garantir que o provedor de autenticação envolva o layout corretamente sem interferir na estrutura do Stack

### Pendências / o que não foi concluído
- Testar o fluxo completo no dispositivo Android físico
- Verificar salvamento dos dados no Supabase

### Próximo passo recomendado
Testar o fluxo completo após as correções de navegação: o app deve agora redirecionar corretamente para login se não autenticado, e para cadastro de moto se autenticado mas sem moto cadastrada.

---

## [2026-04-11] — Sessão 7

### O que foi feito
- Corrigido problema contínuo: o app continuava indo diretamente para o mapa mesmo após as correções anteriores
- Identificado que o problema estava no tratamento do estado de loading no `_layout.tsx`
- Implementada nova lógica com flag `ready` para garantir que a navegação só ocorra após verificação completa
- Adicionado componente de loading adequado durante a verificação de autenticação e moto

### Decisões tomadas
- Usar uma flag de prontidão (`ready`) para controlar quando a navegação deve ser determinada
- Exibir um componente de loading adequado enquanto o estado de autenticação e motos está sendo verificado
- Garantir que nenhuma navegação ocorra prematuramente antes da verificação completa

### Pendências / o que não foi concluído
- Testar o fluxo completo no dispositivo Android físico
- Verificar salvamento dos dados no Supabase

### Próximo passo recomendado
Testar o fluxo completo após as correções: o app deve agora mostrar corretamente o loading enquanto verifica o estado e depois redirecionar adequadamente para login ou cadastro de moto conforme necessário.

---

## [2026-04-11] — Sessão 8

### O que foi feito
- Identificado problema fundamental: o hook `useAuth` estava considerando sessões expiradas como válidas
- Atualizado o hook `useAuth` para validar corretamente o tempo de expiração da sessão
- Implementada verificação do campo `expires_at` para determinar se o usuário está realmente autenticado
- Corrigido a lógica de `isAutenticado` para considerar apenas sessões válidas e não expiradas

### Decisões tomadas
- Validar o tempo de expiração da sessão do Supabase antes de considerar o usuário como autenticado
- Comparar `session.expires_at` com o tempo atual para determinar a validade da sessão
- Limpar o estado de autenticação quando a sessão estiver expirada

### Pendências / o que não foi concluído
- Testar o fluxo completo no dispositivo Android físico
- Verificar salvamento dos dados no Supabase

### Próximo passo recomendado
Testar o fluxo completo após as correções: o app deve agora verificar corretamente se o usuário está realmente autenticado (com sessão válida) antes de redirecionar para o mapa.

---

## [2026-04-11] — Sessão 9

### O que foi feito
- Identificado problema contínuo: o app ainda ia diretamente para o mapa mesmo após as correções anteriores
- Descoberto que o problema estava na estrutura do Expo Router com rotas aninhadas
- O layout `(tabs)` estava sendo renderizado e automaticamente exibindo a tela `index` (o mapa)
- Reformulado o `_layout.tsx` para usar `Redirect` em vez de renderizar as telas do Stack
- Implementado redirecionamento condicional baseado no estado de autenticação e moto

### Decisões tomadas
- Usar `Redirect` do Expo Router para impor o redirecionamento correto
- Remover a renderização direta das telas do Stack e usar redirecionamento baseado em estado
- Garantir que o redirecionamento ocorra apenas após verificação completa de autenticação e moto

### Pendências / o que não foi concluído
- Testar o fluxo completo no dispositivo Android físico
- Verificar salvamento dos dados no Supabase

### Próximo passo recomendado
Testar o fluxo completo após as correções: o app deve agora redirecionar corretamente para login, cadastro de moto ou mapa com base no estado de autenticação e existência de moto cadastrada.

---

## [2026-04-11] — Sessão 10

### O que foi feito
- Revertido o arquivo `_layout.tsx` para uma versão funcional estável
- Mantido o hook `useAuth` com a validação de expiração de sessão correta
- Corrigido o equilíbrio entre verificação de autenticação e navegação condicional
- Preservado o sistema de loading adequado durante verificação de estado

### Decisões tomadas
- Voltar para a abordagem de Stack com navegação condicional em vez de Redirect
- Manter a validação de sessão expirada no hook de autenticação
- Garantir que o sistema de loading funcione corretamente durante verificação

### Pendências / o que não foi concluído
- Testar o fluxo completo no dispositivo Android físico
- Verificar salvamento dos dados no Supabase

### Próximo passo recomendado
Testar o fluxo completo após as correções: o app deve agora redirecionar corretamente com base no estado de autenticação e existência de moto cadastrada, com validação de sessão expirada.

---

## [2026-04-11] — Sessão 11

### O que foi feito
- Identificado problema crítico: a query de verificação de moto usava `head: true` incorretamente
- Corrigido o parâmetro `head: true` que retornava `count` separadamente, fazendo `data?.count` ser sempre undefined
- Atualizado a query para usar `select('*', { count: 'exact', head: false })` para obter o count corretamente
- Simplificado a abordagem de navegação para não depender da renderização condicional de Stack.Screen

### Decisões tomadas
- Corrigir a query de verificação de moto para obter o count corretamente
- Manter as rotas sempre presentes mas controlar a navegação externamente
- Usar uma abordagem mais estável para controle de navegação com Expo Router

### Pendências / o que não foi concluído
- Testar o fluxo completo no dispositivo Android físico
- Verificar salvamento dos dados no Supabase

### Próximo passo recomendado
Testar o fluxo completo após as correções: o app deve agora verificar corretamente a existência de moto e controlar a navegação com base no estado de autenticação.

---

## [2026-04-11] — Sessão 12

### O que foi feito
- Identificado problema arquitetural: dois sistemas de navegação (Expo Router em `app/` e React Navigation em `src/navigation/`) 
- Abandonado completamente o sistema de navegação em `src/navigation/` (AuthNavigator, AppNavigator, MotoNavigator)
- Criados arquivos de rota do Expo Router: `login.tsx`, `cadastro.tsx`, `cadastrar-moto.tsx`
- Implementado fluxo de autenticação usando apenas Expo Router com `router.replace()` baseado no estado de autenticação
- Atualizado `_layout.tsx` para usar efeito colateral com `router.replace()` em vez de renderização condicional
- Telas em `src/screens/` continuam sendo usadas mas agora são importadas e reexportadas pelos arquivos em `app/`

### Decisões tomadas
- Usar apenas Expo Router para navegação (padrão de arquivos em `app/`)
- Controlar navegação com `router.replace()` baseado no estado de autenticação e existência de moto
- Manter as telas existentes em `src/screens/` como componentes reutilizáveis
- Abandonar totalmente o sistema de navegação em `src/navigation/`

### Pendências / o que não foi concluído
- Testar o fluxo completo no dispositivo Android físico
- Verificar salvamento dos dados no Supabase

### Próximo passo recomendado
Testar o fluxo completo após a reestruturação arquitetural: o app deve agora controlar a navegação corretamente com base no estado de autenticação usando apenas o Expo Router.

## [2026-04-11] — Sessão 13

### O que foi feito
- Corrigido `SplashScreen` usado incorretamente como componente JSX — substituído por `ActivityIndicator`
- Corrigido `app/(tabs)/index.tsx` que tinha lógica duplicada de auth e verificação de moto — removido, responsabilidade centralizada no `_layout.tsx`
- Adicionado `placeholderTextColor` e `color: '#000'` em todos os `TextInput` das telas de Login, Cadastro e CadastrarMoto
- Corrigido `handlePlacaChange` no `CadastrarMoto` que chamava `setValue` diretamente em vez do `onChange` do Controller
- Instaladas dependências faltantes: `zod`, `react-hook-form`, `@hookform/resolvers`
- Fluxo completo testado e funcionando: login → cadastro de moto → mapa

### Decisões tomadas
- Lógica de auth e verificação de moto centralizada exclusivamente no `_layout.tsx`
- Telas de conteúdo (mapa, cadastro) não fazem mais redirect — apenas renderizam
- `src/navigation/` mantido no projeto mas completamente depreciado e não utilizado

### Pendências / o que não foi concluído
- Erros de tipagem TypeScript do MapLibre no VSCode (não afetam o funcionamento)
- Verificar salvamento dos dados no Supabase pelo painel
- Testar logout e reentrada no app

### Próximo passo recomendado
Verificar no painel do Supabase se os dados de usuário e moto estão sendo salvos corretamente. Depois avançar para o próximo item do roadmap: Fase 1 item 5 — Radar: alertas da via.

## Sessão — 11/04/2026

### O que foi feito
- Corrigido erro GestureDetector: adicionado GestureHandlerRootView em app/_layout.tsx
- Corrigido SheetAlerta: adicionado enablePanDownToClose={true} para fechar com arraste
- Corrigido renderização condicional do SheetAlerta: componente sempre montado, sem {showSheet && ...}
- Corrigido import corrompido do MapLibreGL no index.tsx
- Corrigido plugin do MapLibre no app.json: de string para array ["@maplibre/maplibre-react-native", {}]
- Removidas permissões duplicadas de localização no app.json
- Feito EAS build de desenvolvimento e instalado APK no dispositivo
- Atualizado MapLibre de v10.4.2 para v11 beta (Nova Arquitetura)

### Problema em aberto
- Mapa renderizando fundo verde sem tiles de ruas
- Causa identificada: v10 do MapLibre tem suporte incompleto à Nova Arquitetura (newArchEnabled: true)
- Solução em andamento: atualização para v11 beta instalada, aguardando rebuild

### Decisões tomadas
- Mantido newArchEnabled: true (obrigatório para react-native-reanimated e worklets)
- Atualizado MapLibre para v11 beta para compatibilidade com Nova Arquitetura

### Próximo passo
- Rodar npx expo run:android com MapLibre v11 beta e testar se tiles renderizam
- Se funcionar: commitar e seguir para próxima feature do MVP
- Se não funcionar: investigar demotiles.maplibre.org como style URL de diagnóstico

SESSION_LOG.md — adicionar entrada:
markdown## Sessão — 12/04/2026

### O que foi feito
- Migração completa do MapLibre v10 para v11 beta (necessário para Nova Arquitetura)
- Reescrita do app/(tabs)/index.tsx com nova API v11: Map, Camera, UserLocation, GeoJSONSource, Layer, Marker
- Corrigido erro de fontes OpenFreeMap via TransformRequestManager.addUrlTransform
- Corrigido ícone 'accident' inválido no SheetAlerta → 'car-crash'
- Removido Marker manual de localização (redundante com UserLocation)
- Configurado trackUserLocation="course" para seguir usuário em movimento
- EAS build configurado e testado
- Mapa funcionando com ruas, labels, localização e alertas

### Decisões tomadas
- MapLibre v11 beta é a única versão compatível com newArchEnabled: true
- TransformRequestManager para redirecionar fontes OpenFreeMap → demotiles MapLibre
- trackUserLocation="course" mais adequado para app de moto

### Pendências
- Warning "Invalid geometry in line layer" — não crítico, não afeta usuário
- Ícone de alerta no mapa (SymbolLayer) ainda sem imagens reais cadastradas

### Próximo passo
- Implementar Mapa de Calor de Assaltos (heatmap colaborativo)