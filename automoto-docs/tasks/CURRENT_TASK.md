# CURRENT_TASK.md

> Atualizar este arquivo antes de cada sessão de desenvolvimento.
> A IA lê APENAS este arquivo + os arquivos listados em "Contexto necessário".

---

## Tarefa atual

**O que:** Próxima feature do MVP — Mapa de Calor de Assaltos

**Módulo:** Radar

**Fase do roadmap:** Fase 1 — MVP Core

---

## Critério de pronto

- [ ] Botão para reportar assalto no mapa
- [ ] Dados salvos no Supabase com coordenada GPS + timestamp
- [ ] Heatmap exibido no mapa usando HeatmapLayer
- [ ] Decay temporal: ocorrências antigas pesam menos
- [ ] Testado no Android físico

---

## Status do Radar da Via (concluído)

- [x] Botão flutuante no mapa para reportar alerta (BotaoAlerta)
- [x] Bottom sheet com categorias: óleo, areia, buraco, obra, enchente, acidente, outro
- [x] Alerta salvo no Supabase com coordenada GPS + categoria + user_id + timestamp
- [x] Alertas carregados do Supabase e exibidos no mapa
- [x] Mapa funcionando com ruas e labels (MapLibre v11)
- [x] Localização do usuário com seta de direção (UserLocation)
- [x] Camera seguindo usuário com trackUserLocation="course"
- [x] GestureHandlerRootView corrigido
- [x] SheetAlerta com enablePanDownToClose
- [x] Fontes do OpenFreeMap corrigidas via TransformRequestManager

---

## Arquivos principais
apps/mobile/app/(tabs)/index.tsx              → tela do mapa
apps/mobile/src/screens/Mapa/useMapa.ts       → lógica de alertas
apps/mobile/src/components/BotaoAlerta/       → botão flutuante
apps/mobile/src/components/SheetAlerta/       → bottom sheet
apps/mobile/app/_layout.tsx                   → GestureHandlerRootView + auth

---

## Contexto necessário

- [ ] `docs/modules/MODULE_RADAR.md`
- [ ] `docs/architecture/MAPLIBRE_GUIDE.md`
- [ ] `SKILLS.md` → seções 3, 4

---

## Decisões já tomadas

- Expo Router exclusivamente para navegação
- newArchEnabled: true obrigatório (reanimated + worklets exigem)
- MapLibre v11 beta — única versão compatível com Nova Arquitetura
- OpenFreeMap liberty como style URL
- TransformRequestManager para corrigir endpoint de fontes
- trackUserLocation="course" para seguir usuário em movimento

---

## Histórico de tarefas concluídas

| Data     | Tarefa                                           | Arquivos principais                        |
|----------|--------------------------------------------------|--------------------------------------------|
| 11/04/26 | Setup monorepo + Expo + MapLibre                 | apps/mobile/                               |
| 11/04/26 | Auth por email + cadastro de moto + mapa básico  | app/_layout.tsx, src/screens/Login, Cadastro, CadastrarMoto |
| 11/04/26 | Radar da Via: botão, sheet, alertas no Supabase  | app/(tabs)/index.tsx, useMapa.ts, BotaoAlerta, SheetAlerta |
| 12/04/26 | Correções: GestureHandler, SheetAlerta, app.json | app/_layout.tsx, SheetAlerta/index.tsx, app.json |
| 12/04/26 | MapLibre v11: migração completa da API, mapa funcionando com ruas | app/(tabs)/index.tsx |

---

## Prompt para próxima sessão
Leia os seguintes arquivos antes de começar:

tasks/CURRENT_TASK.md
docs/modules/MODULE_RADAR.md
docs/architecture/MAPLIBRE_GUIDE.md
apps/mobile/app/(tabs)/index.tsx
SKILLS.md (seções 3, 4)

Após ler, me mostre o que entendeu da tarefa e proponha
a ordem de implementação antes de escrever qualquer código.
Aguarde minha confirmação antes de começar.