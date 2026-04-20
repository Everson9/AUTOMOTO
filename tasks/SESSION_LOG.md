# SESSION_LOG.md — Log de Sessões

---

## 2026-04-18 — Cadastro de Moto na Garagem

### Resumo
Movido o cadastro de moto do onboarding forçado para dentro da tela da Garagem, permitindo múltiplas motos por usuário.

### Novos arquivos criados
- `src/screens/Garagem/useCadastrarMoto.ts` — Hook de lógica de cadastro
- `src/screens/Garagem/CadastrarMotoGaragemScreen.tsx` — Tela de cadastro com formulário + image picker
- `app/garagem/cadastrar-moto.tsx` — Rota de cadastro

### Arquivos modificados
- `app/_layout.tsx` — Removido redirecionamento forçado para cadastro; removido Stack.Screen "garagem" (warning)
- `src/screens/Garagem/useGaragem.ts` — Adicionados tipos `MotoLista`, função `ativarMoto()`, estado `motos`
- `src/screens/Garagem/GaragemScreen.tsx` — CTA "Adicionar moto", lista de motos, troca de moto ativa
- `src/screens/Home/HomeScreen.tsx` — CTA redireciona para `/garagem/cadastrar-moto`

### RPC criada no Supabase
```sql
CREATE OR REPLACE FUNCTION public.ativar_moto(p_moto_id UUID, p_user_id UUID)
RETURNS VOID ...
```
- Desativa todas as motos do usuário e ativa a selecionada

### Funcionalidades implementadas
1. **Múltiplas motos**: usuário pode ter N motos cadastradas
2. **Moto ativa**: apenas uma moto está ativa por vez (campo `ativa = true`)
3. **CTA na Garagem**: botão "Adicionar moto" quando sem moto
4. **CTA na Home**: botão "Cadastrar moto" quando sem moto
5. **Lista de motos**: exibe outras motos com botão "Ativar"
6. **Onboarding removido**: login vai direto para Home, sem forçar cadastro

### Fixes aplicados
- `crypto.randomUUID()` substituído por `Date.now() + Math.random()` (não existe em React Native)
- Parâmetros da RPC `ativar_moto` corrigidos: `{ p_moto_id, p_user_id }`
- Removido `<Stack.Screen name="garagem" />` que causava warning de rota inexistente

### Critérios de pronto atendidos
- [x] Botão "Adicionar moto" na Garagem quando não há moto
- [x] CTA na Home quando não há moto
- [x] Suporte a múltiplas motos com selector
- [x] Login vai direto para Home sem forçar cadastro
- [x] Após cadastro, redireciona para Garagem
- [x] RPC `ativar_moto` documentada no SCHEMA.md

---

## 2026-04-18 — Editar Moto + Upload de Foto

### Resumo
Implementação completa da funcionalidade de editar dados da moto e fazer upload de foto real.

### Novos arquivos criados
- `src/services/storageService.ts` — Serviço de upload para Supabase Storage usando base64 + expo-file-system/legacy
- `src/screens/EditarMoto/useEditarMoto.ts` — Hook de lógica da tela de edição
- `src/screens/EditarMoto/EditarMotoScreen.tsx` — Tela de edição com formulário e image picker
- `app/garagem/editar-moto.tsx` — Rota de edição

### Arquivos modificados
- `src/screens/Garagem/useGaragem.ts` — Adicionada função `atualizarMoto()`
- `src/screens/Garagem/GaragemScreen.tsx` — Navegação para editar moto
- `src/screens/Home/HomeScreen.tsx` — Botão editar (⚙️) ao lado do KM

### Dependências instaladas
- `expo-image-picker` — Seleção de fotos (galeria/câmera)
- `expo-file-system` — Leitura de arquivos locais
- `base64-arraybuffer` — Conversão base64 para ArrayBuffer

### Funcionalidades implementadas
1. **Editar moto**: modelo, marca, ano, cor (placa somente leitura)
2. **Upload de foto**: galeria ou câmera, sem crop obrigatório (`allowsEditing: false`)
3. **Preview da foto**: exibição com `resizeMode="contain"`, sem cortar
4. **Bucket Supabase**: `fotos` — path `{user_id}/{moto_id}.jpg`
5. **Navegação**: `router.back()` para voltar à origem (Home ou Garagem)

### Fixes aplicados
- Import `expo-file-system/legacy` para evitar warning de depreciação
- `allowsEditing: false` para não forçar crop
- Upload via `FileSystem.readAsStringAsync()` + `decode()` do base64-arraybuffer (React Native não suporta fetch de file://)

### Critérios de pronto atendidos
- [x] Usuário consegue editar todos os campos da moto
- [x] Upload de foto funciona com galeria e câmera
- [x] Foto aparece no card da moto (Home e Garagem)
- [x] Dados atualizados persistem no Supabase
- [x] Navegação funciona: Garagem → Editar → Salvar → voltar

---

## 2026-04-18 — Home Contextual

### Resumo
Criação da Home contextual como nova tela inicial do app, substituindo o mapa.

### Mudanças na navegação
- Tab bar expandida de 2 para 3 tabs: Home, Radar, Garagem
- `app/(tabs)/index.tsx` agora aponta para HomeScreen
- `app/(tabs)/radar.tsx` criado a partir do antigo index.tsx (mapa)

### Novos arquivos criados
- `src/components/AtalhoCard/index.tsx` — botão de atalho reutilizável
- `src/screens/Home/useHome.ts` — hook de dados da Home
- `src/screens/Home/HomeScreen.tsx` — tela Home contextual
- `app/(tabs)/index.tsx` — wrapper para HomeScreen

### Arquivos modificados
- `src/services/climaService.ts` — adicionada função `buscarClimaAtual()` com mapeamento de códigos WMO para descrições e emojis
- `app/(tabs)/_layout.tsx` — atualizado de 2 para 3 tabs
- `apps/mobile/src/screens/Login/index.tsx` — logo integrada (240x240)
- `apps/mobile/src/screens/Cadastro/index.tsx` — logo integrada (240x240)

### Features implementadas na Home
1. **Header**: logo 48x48 + saudação por horário + botão perfil com iniciais do usuário
2. **Card da moto ativa**: foto/ilustração SVG por tipo + modelo + placa + KM editável inline + badge "Em dia"
3. **Card de clima**: temperatura atual + condição meteorológica (Open-Meteo API)
4. **Alertas recentes**: lista horizontal dos 5 alertas mais próximos (até 5km)
5. **Grade de atalhos**: 6 botões em 2 colunas (2 funcionais, 4 "Em breve")
6. **Dica do dia**: array de 15 dicas, sorteada aleatoriamente a cada abertura

### Botões "Em breve"
- Iniciar Viagem → Alert "Em breve"
- Abastecimento → Alert "Em breve"
- Localizar Moto → Alert "Em breve"
- Manutenção → Alert "Em breve"

### Bug fix
- Corrigido cálculo das iniciais do usuário no ícone de perfil — agora usa `user_metadata.nome` corretamente e extrai até 2 caracteres maiúsculos

### Critérios de pronto atendidos
- [x] Tab bar com 3 tabs (Home, Radar, Garagem)
- [x] Home abre como tela inicial após login
- [x] Saudação com nome do usuário e horário
- [x] Card da moto ativa com KM editável
- [x] Card de clima com dados reais
- [x] Alertas recentes na região
- [x] Grade de atalhos funcionais
- [x] Dica do dia aleatória
- [x] Logo no header da Home

---

## 2026-04-18 — Ícone da Moto no Mapa

### Resumo
Substituído o ponto azul genérico do mapa por um ícone SVG customizado representando a moto do usuário, com rotação conforme direção do movimento.

### Novos arquivos criados
- `src/hooks/useMotoAtiva.ts` — Hook para buscar tipo da moto ativa do usuário
- `src/components/MotoMarker/index.tsx` — Marcador customizado com ícone de moto

### Arquivos modificados
- `app/(tabs)/radar.tsx` — Substituído `UserLocation` por `MotoMarker`, removido import de UserLocation

### Funcionalidades implementadas
1. **Tipo da moto ativa**: Hook `useMotoAtiva` busca tipo da moto com `ativa = true` no Supabase
2. **Mapeamento de tipos**: Tipos do banco ('street', 'touring', 'cruiser') mapeados para tipos do SVG ('naked', 'naked', 'custom')
3. **Marcador customizado**: `PointAnnotation` com círculo âmbar (#F97316), borda branca 2px, sombra
4. **Rotação animada**: Ícone gira suavemente conforme heading usando `Animated.spring`
5. **Fallback**: Exibe ícone 'default' quando usuário não tem moto cadastrada

### Correção aplicada
- `Marker` substituído por `PointAnnotation` pois Marker não suporta children React Native
- `PointAnnotation.coordinate` usa formato `[longitude, latitude]` (já correto)

### Critérios de pronto atendidos
- [x] Usuário vê sua moto no mapa (não ponto azul)
- [x] Ícone muda conforme tipo de moto
- [x] Ícone aponta na direção do movimento
- [x] Fallback para ícone genérico se não houver moto

---

## 2026-04-19 — Ícone da Moto no Mapa (PNG)

### Resumo
Implementação final do marcador customizado da posição do usuário no mapa usando PNG top-view da motorcycle.

### Arquivos modificados
- `src/components/MotoMarker/index.tsx` — Refatorado para usar PNG em vez de SVG
- `app/(tabs)/radar.tsx` — Adicionado filter no heatmap, removido useMotoAtiva

### Funcionalidades implementadas
1. **PNG top-view**: Imagem `motorcycle.png` (512x512) exibida em 72x72px
2. **Rotação animada**: Ícone gira suavemente conforme heading com `Animated.spring`
3. **z-index**: `style={{ zIndex: 999 }}` garante que moto fica acima de outros markers
4. **Sem fundo**: Removido círculo âmbar — só a imagem da moto

### Correções aplicadas
- `PointAnnotation` não existe no MapLibre v11, usando `Marker` que aceita children React Native
- Propriedade de coordenadas é `lngLat` (não `coordinate`) na API v11
- `anchor` é string `"center"` (não objeto `{x, y}`)
- Adicionado `filter={['==', ['geometry-type'], 'Point']}` no HeatmapLayer para evitar warning de geometria inválida

### Critérios de pronto atendidos
- [x] Usuário vê sua moto no mapa (não ponto azul)
- [x] Ícone aponta na direção do movimento
- [x] Marcador fica acima dos outros elementos do mapa

---

## 2026-04-19 — MaterialCommunityIcons nos Alertas + DetalheAlertaSheet

### Resumo
Substituição de emojis por ícones MaterialCommunityIcons nos alertas do mapa e da Home, implementação do sheet de detalhes com confirmar/negar, e proteções contra duplicação.

### Novos arquivos criados
- `src/components/AlertaMarker/index.tsx` — Marcador de alerta com ícone + cor por tipo
- `src/components/SheetDetalheAlerta/index.tsx` — Bottom sheet de detalhes do alerta
- `src/hooks/useDetalheAlerta.ts` — Hook para confirmar/negar alertas com AsyncStorage
- `supabase/migrations/20260419100000_create_alertas_rpc.sql` — RPCs para verificação de duplicados

### Arquivos modificados
- `app/(tabs)/radar.tsx` — Integração do AlertaMarker, SheetDetalheAlerta, zoom fix
- `src/screens/Home/HomeScreen.tsx` — Ícones MaterialCommunityIcons na seção de alertas
- `src/components/SheetAlerta/index.tsx` — Ícones MaterialCommunityIcons ao invés de emojis
- `src/screens/Mapa/useMapa.ts` — Verificação de alerta duplicado via RPC

### Mapeamento de ícones (ALERTA_CONFIG)
| Tipo | Ícone | Cor |
|------|-------|-----|
| oleo | oil | #6B7280 (cinza) |
| areia | weather-dust | #D97706 (âmbar) |
| buraco | alert-circle | #DC2626 (vermelho) |
| obra | traffic-cone | #F97316 (laranja) |
| enchente | waves | #2563EB (azul) |
| acidente | car-emergency | #DC2626 (vermelho) |
| assalto | shield-alert | #7F1D1D (vermelho escuro) |
| outro | alert | #9CA3AF (cinza claro) |

### Funcionalidades implementadas
1. **AlertaMarker**: marcador com ícone MaterialCommunityIcons em fundo branco + borda colorida (52x52px)
2. **SheetDetalheAlerta**: bottom sheet com tipo, confirmações, negações, botões confirmar/negar
3. **Proteção de voto duplicado**: AsyncStorage armazena IDs votados, impede re-voto
4. **Proteção de alerta duplicado**: RPC `verificar_alerta_duplicado` verifica raio de 100m
5. **Desativação automática**: alerta desativado quando `negacoes >= 5 && negacoes > confirmacoes`

### Fixes aplicados
- **1 toque para abrir sheet**: `setTimeout(() => sheetRef?.expand(), 100)` garante que estado atualiza antes de expandir
- **zoom maxZoom=20**: valor incorreto era 22, ajustado para 20
- **zoomLevel inicial=17**: zoom inicial do mapa
- **pointerEvents="none"**: View interna do AlertaMarker permite toque passar para Marker
- **Ícones TypeScript**: `construction` e `car-crash` não existem → `traffic-cone` e `car-emergency`

### RPCs criadas
```sql
-- Verificar alerta duplicado (mesmo tipo, raio 100m)
CREATE FUNCTION verificar_alerta_duplicado(p_tipo, p_lat, p_lng, p_raio_metros)

-- Incrementar confirmações
CREATE FUNCTION incrementar_confirmacoes(alerta_id UUID)

-- Incrementar negações
CREATE FUNCTION incrementar_negacoes(alerta_id UUID)
```

### Critérios de pronto atendidos
- [x] Alertas no mapa usam ícones (não emojis)
- [x] Home exibe ícones (não emojis)
- [x] SheetAlerta usa ícones (não emojis)
- [x] Toque no alerta abre sheet de detalhes
- [x] Usuário pode confirmar ou negar alerta
- [x] Usuário não pode votar duas vezes no mesmo alerta
- [x] Alerta duplicado incrementa confirmação em vez de criar novo
- [x] Alerta com muitas negações é desativado automaticamente

---

## 2026-04-19 — Notificações Push de Proximidade (Foreground)

### Resumo
Implementação de notificações locais que alertam o usuário quando se aproxima de um alerta ativo na via (raio de 200m), funcionando com o app aberto.

### Novos arquivos criados
- `src/services/notificationService.ts` — Serviço de permissão e disparo de notificações
- `src/hooks/useNotificacoesAlerta.ts` — Hook que monitora proximidade e dispara notificações

### Dependências instaladas
- `expo-notifications` — API de notificações locais do Expo

### Arquivos modificados
- `app/(tabs)/radar.tsx` — Integração do hook `useNotificacoesAlerta`
- `automoto-docs/docs/modules/MODULE_RADAR.md` — Seção "Notificações background (Fase 2)"

### Funcionalidades implementadas
1. **Permissão de notificação**: solicitada automaticamente ao entrar no Radar
2. **Cálculo de distância**: fórmula de Haversine para distância entre usuário e alerta
3. **Notificação local**: disparada quando distância < 200m
4. **Título com emoji + tipo**: ex: "⚠️ Buraco", "🚨 Alerta de assalto"
5. **Body com distância**: ex: "~150m à frente — tome cuidado!"
6. **Controle de duplicados**: `Set<string>` em memória impede notificar o mesmo alerta duas vezes na sessão
7. **Canal Android**: configurado com importância alta e vibração

### Mapeamento de emojis por tipo
| Tipo | Emoji | Label |
|------|-------|-------|
| oleo | 🛢️ | Óleo na pista |
| areia | 🏖️ | Areia na pista |
| buraco | ⚠️ | Buraco |
| obra | 🚧 | Obra na pista |
| enchente | 🌊 | Enchente |
| acidente | 💥 | Acidente |
| assalto | 🚨 | Alerta de assalto |
| outro | ❗ | Alerta na via |

### Bug fix
- Corrigido `solicitarPermissao()` para Android 13+: sempre chamar `requestPermissionsAsync()` quando status não for `granted`, pois o status pode ser `undefined` ou `denied` na primeira vez

### Documentação Fase 2
Adicionado no MODULE_RADAR.md: stack necessária para background notifications (expo-task-manager + expo-location background), implementação referência com `defineTask`, e permissões Android adicionais.

### Critérios de pronto atendidos
- [x] Permissão solicitada ao entrar no Radar
- [x] Notificação dispara ao se aproximar de alerta (200m)
- [x] Título com emoji + tipo, body com distância
- [x] Mesmo alerta não notifica duas vezes (Set em memória)
- [x] Background documentado no MODULE_RADAR.md para Fase 2

---

## 2026-04-19 — Onboarding Tutorial

### Resumo
Implementação do tutorial de primeira abertura com 5 slides deslizantes, exibido apenas na primeira vez após o login.

### Novos arquivos criados
- `src/screens/Onboarding/OnboardingScreen.tsx` — Tela com 5 slides deslizantes
- `app/onboarding.tsx` — Wrapper da rota

### Arquivos modificados
- `app/_layout.tsx` — Verificação de onboarding após autenticação

### Estrutura dos slides
| Slide | Tipo | Conteúdo |
|-------|------|----------|
| 1 | Welcome | Logo + "Bem-vindo ao Automoto" + subtítulo |
| 2 | Feature | Ícone `map-marker-alert` + "Radar da Via" |
| 3 | Feature | Ícone `alert-plus` + "Reporte e ajude" |
| 4 | Feature | Ícone `garage` + "Sua Garagem" |
| 5 | Feature | Ícone `bell-alert` + "Alertas de proximidade" |

### Funcionalidades implementadas
1. **5 slides com swipe horizontal**: FlatList com `pagingEnabled`
2. **Dots de paginação**: indicadores sincronizados com slide atual
3. **Botão "Pular"**: canto superior direito, exceto no último slide
4. **Botão "Próximo"**: slides 1-4, navega para próximo slide
5. **Botão "Começar!"**: slide 5, finaliza onboarding
6. **Persistência**: `AsyncStorage.setItem('onboarding_concluido', 'true')`
7. **Fluxo de navegação**: login → verificar onboarding → /onboarding ou /(tabs)

### Lógica do _layout.tsx
```tsx
// Fluxo atualizado:
// isLoading → spinner
// !isAutenticado → /login
// isAutenticado && !onboardingChecked → verificar AsyncStorage
// isAutenticado && !onboardingConcluido → /onboarding
// isAutenticado && onboardingConcluido → /(tabs)
```

### Design visual
- Fundo: #0D0D0D
- Ícones: MaterialCommunityIcons size=80, cor âmbar #F97316
- Título: branco 28px bold
- Descrição: cinza #9CA3AF 16px centralizado
- Dots ativos: âmbar #F97316
- Dots inativos: cinza #4B5563
- Botões: dark theme consistente com PerfilScreen

### Critérios de pronto atendidos
- [x] Tutorial aparece na primeira abertura após login
- [x] 5 slides com swipe entre eles
- [x] Dots de paginação funcionando
- [x] Botão "Pular" e "Começar!" funcionando
- [x] Não aparece na segunda abertura (AsyncStorage)
- [x] Design dark consistente com o app

---

## 2026-04-20 — Integração HERE Maps (Incidentes + Navegação)

### Resumo
Integração completa da HERE Maps API para incidentes de trânsito em tempo real e navegação com rota (busca de endereço + cálculo de rota + polyline).

### Novos arquivos criados
- `src/services/hereService.ts` — Serviço de integração HERE API (buscarIncidentes, buscarEndereco, calcularRota, decodeFlexPolyline, formatarDistancia, formatarTempo, calcularBBox)
- `src/hooks/useHereTraffic.ts` — Hook para buscar incidentes HERE com polling de 5 min e re-fetch ao mover 500m
- `src/hooks/useNavegacao.ts` — Hook de estado da navegação (busca, rota, destino)
- `src/components/IncidenteMarker/index.tsx` — Marcador de incidentes HERE com badge azul
- `src/components/BuscaDestino/index.tsx` — Input de busca de endereço com autocompletar
- `src/components/CardNavegacao/index.tsx` — Card com info da rota (destino, distância, ETA)

### Arquivos modificados
- `app/(tabs)/radar.tsx` — Integração de incidentes HERE, navegação, polyline da rota, busca de endereço

### Funcionalidades implementadas
1. **HERE Traffic API v7**: busca de incidentes (acidente, via interditada, obra) na área visível
2. **HERE Geocoding API**: busca de endereço com autocompletar em PT-BR
3. **HERE Routing API v8**: cálculo de rota com modo `car` e instruções
4. **Flexpolyline**: decodificação manual da polyline HERE para coordenadas
5. **IncidenteMarker**: marcador com ícone + cor por tipo + badge "HERE" azul
6. **BuscaDestino**: input com lista de sugestões (até 5 resultados)
7. **CardNavegacao**: card no topo com destino, distância (km/m), ETA (min/h)
8. **Polyline da rota**: GeoJSON Source/Layer para linha azul no mapa

### Fixes aplicados
- **API URL 404**: HERE Traffic API migrou de `/traffic/6.3/incidents.json` para `/v7/incidents` com formato bbox diferente (`in=bbox:lng,lat,lng,lat`)
- **transportMode inválido**: HERE Routing v8 NÃO aceita `motorcycle` ou `scooter` — alterado para `car`
- **return parameter**: `instructions` requer `actions` no return — alterado para `polyline,summary,actions,instructions`

### Configuração
- `EXPO_PUBLIC_HERE_API_KEY` em `.env.local`
- Free tier: 2.500 requests/dia por API (suporta ~400-500 MAU)

### Pendência conhecida
- **Polyline não renderiza**: o cálculo da rota funciona (distância e ETA aparecem), mas a linha azul no mapa não está sendo desenhada. GeoJSONSource/Layer configurado, mas precisa debug.

### Critérios de pronto
- [x] HERE API integrada no serviço de mapa (hereService.ts)
- [x] Incidentes HERE renderizados no mapa (IncidenteMarker)
- [ ] Navegação com rota funcional (polyline pendente)
- [ ] Testado em Android físico