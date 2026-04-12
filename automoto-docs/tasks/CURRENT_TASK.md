# CURRENT_TASK.md

> Atualizar este arquivo antes de cada sessão de desenvolvimento.
> A IA lê APENAS este arquivo + os arquivos listados em "Contexto necessário".

---

## Tarefa atual

**O que:** Resolver mapa verde — tiles vetoriais não renderizam no Android

**Módulo:** Radar (infraestrutura do mapa)

**Fase do roadmap:** Fase 1 — MVP Core

---

## Critério de pronto

- [ ] Mapa exibindo ruas, edifícios e tiles vetoriais no Android físico
- [ ] MapLibre v11 beta funcionando com newArchEnabled: true

---

## Status atual

### O que já foi implementado (Radar da Via)
- [x] Botão flutuante no mapa para reportar alerta (BotaoAlerta)
- [x] Bottom sheet com categorias: óleo, areia, buraco, obra, enchente, acidente, outro (SheetAlerta)
- [x] Alerta salvo no Supabase com coordenada GPS + categoria + user_id + timestamp
- [x] Alertas carregados do Supabase e exibidos no mapa
- [x] GestureHandlerRootView corrigido em app/_layout.tsx
- [x] SheetAlerta com enablePanDownToClose={true}
- [x] SheetAlerta sempre montado (sem renderização condicional)

### Problema em aberto
- Mapa renderiza fundo verde sem tiles de ruas
- Causa: MapLibre v10 tem suporte incompleto à Nova Arquitetura (newArchEnabled: true)
- Solução em andamento: MapLibre atualizado para v11 beta, aguardando rebuild

---

## Próximo passo imediato

1. Verificar versão instalada do MapLibre v11:
   `Select-String "version" node_modules/@maplibre/maplibre-react-native/package.json`
2. Rodar: `npx expo run:android`
3. Testar se mapa mostra ruas
4. Se ainda verde: testar com `styleURL="https://demotiles.maplibre.org/style.json"` para diagnóstico

---

## Arquivos principais do Radar
apps/mobile/app/(tabs)/index.tsx              → tela do mapa
apps/mobile/src/screens/Mapa/useMapa.ts       → lógica de alertas
apps/mobile/src/components/BotaoAlerta/       → botão flutuante
apps/mobile/src/components/SheetAlerta/       → bottom sheet de categorias
apps/mobile/app/_layout.tsx                   → GestureHandlerRootView + auth

---

## Contexto necessário

- [ ] `SKILLS.md` → seções 1, 2, 3
- [ ] `docs/modules/MODULE_RADAR.md`
- [ ] `docs/architecture/MAPLIBRE_GUIDE.md`
- [ ] `docs/architecture/EXPO_ROUTER_GUIDE.md`

---

## Decisões já tomadas

- Expo Router exclusivamente para navegação
- Lógica de auth centralizada no `_layout.tsx`
- newArchEnabled: true obrigatório (reanimated + worklets exigem)
- MapLibre v11 beta para compatibilidade com Nova Arquitetura

---

## Histórico de tarefas concluídas

| Data     | Tarefa                                           | Arquivos principais                        |
|----------|--------------------------------------------------|--------------------------------------------|
| 11/04/26 | Setup monorepo + Expo + MapLibre                 | apps/mobile/                               |
| 11/04/26 | Auth por email + cadastro de moto + mapa básico  | app/_layout.tsx, src/screens/Login, Cadastro, CadastrarMoto |
| 11/04/26 | Radar da Via: botão, sheet, alertas no Supabase  | app/(tabs)/index.tsx, useMapa.ts, BotaoAlerta, SheetAlerta |
| 11/04/26 | Correções: GestureHandler, SheetAlerta, plugin MapLibre, app.json | app/_layout.tsx, SheetAlerta/index.tsx, app.json |

---

## Prompt para próxima sessão
Leia os seguintes arquivos antes de começar:

tasks/CURRENT_TASK.md
docs/architecture/MAPLIBRE_GUIDE.md
apps/mobile/app/(tabs)/index.tsx
apps/mobile/src/components/SheetAlerta/index.tsx

Após ler, me mostre o que entendeu da situação atual e
proponha o próximo passo para resolver o mapa verde.
Aguarde minha confirmação antes de começar.