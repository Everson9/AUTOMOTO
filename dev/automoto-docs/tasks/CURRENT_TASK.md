# CURRENT_TASK.md

> Atualizar este arquivo antes de cada sessão de desenvolvimento.
> A IA lê APENAS este arquivo + os arquivos listados em "Contexto necessário".

---

## Tarefa atual

**O que:** Onboarding tutorial — telas deslizantes na primeira abertura

**Módulo:** UX

**Fase do roadmap:** Fase 1.5 — Polimento e UX, item 8

---

## Critério de pronto

- [ ] Tutorial aparece na primeira abertura após login
- [ ] 5 slides com swipe entre eles
- [ ] Dots de paginação funcionando
- [ ] Botão "Pular" e "Começar!" funcionando
- [ ] Não aparece na segunda abertura
- [ ] Design dark consistente com o app

---

## Contexto necessário

- `docs/architecture/EXPO_ROUTER_GUIDE.md`
- `docs/architecture/CONVENTIONS.md`

---

## Status da Fase 1 (concluída em 18/04/2026)

- [x] Setup monorepo + Expo + MapLibre
- [x] Auth por email (Supabase)
- [x] Onboarding + cadastro de moto
- [x] Garagem: inventário de mods
- [x] Radar: alertas da via (Waze)
- [x] Radar: mapa de calor assaltos
- [x] Aviso de clima (Open-Meteo)
- [x] Dossiê de Procedência (PDF)

---

## Status da Fase 1.5 (em progresso)

- [x] Logo Automoto criada e integrada
- [x] Home contextual (3 tabs: Home, Radar, Garagem)
- [x] Editar moto + upload de foto
- [x] Cadastro de moto na Garagem + múltiplas motos
- [x] Ícone da moto no mapa (PNG top-view)
- [x] Ícones MaterialCommunityIcons por tipo de alerta
- [x] Notificações push básicas (foreground)
- [ ] Onboarding tutorial ← tarefa atual
- [ ] Navegação com rota no mapa

---

## Histórico de tarefas concluídas

| Data     | Tarefa                                           | Arquivos principais                        |
|----------|--------------------------------------------------|--------------------------------------------|
| 11/04/26 | Setup monorepo + Expo + MapLibre                 | apps/mobile/                               |
| 11/04/26 | Auth por email + cadastro de moto + mapa básico  | app/_layout.tsx, src/screens/Login, Cadastro, CadastrarMoto |
| 11/04/26 | Radar da Via: botão, sheet, alertas no Supabase  | useMapa.ts, BotaoAlerta, SheetAlerta |
| 12/04/26 | Correções: GestureHandler, SheetAlerta, app.json | app/_layout.tsx, SheetAlerta/index.tsx |
| 12/04/26 | MapLibre v11: migração completa da API            | app/(tabs)/radar.tsx |
| 17/04/26 | Heatmap de assaltos + BotaoAssalto + SheetAssalto | useHeatmap.ts, BotaoAssalto, SheetAssalto |
| 18/04/26 | Aviso de clima Open-Meteo + BannerClima          | climaService.ts, useClima.ts, BannerClima |
| 18/04/26 | Garagem: tab bar + inventário de mods + edição   | GaragemScreen, AdicionarModScreen, EditarModScreen |
| 18/04/26 | Dossiê de Procedência PDF + compartilhamento      | templateDossie.ts, useDossie.ts, DossieScreen |
| 18/04/26 | Home contextual + tab bar 3 tabs                 | HomeScreen, useHome.ts |
| 18/04/26 | Editar moto + upload de foto                     | EditarMotoScreen, storageService.ts |
| 18/04/26 | Cadastro de moto na Garagem + múltiplas motos    | CadastrarMotoGaragemScreen, useGaragem.ts |
| 19/04/26 | Logo Automoto integrada                          | assets/images/logo.png |
| 19/04/26 | Ícone da moto no mapa                            | MotoMarker |
| 19/04/26 | AlertaMarker + SheetDetalheAlerta                | AlertaMarker, SheetDetalheAlerta, useDetalheAlerta.ts |
| 19/04/26 | Notificações push de proximidade                 | notificationService.ts, useNotificacoesAlerta.ts |

---

## Prompt para próxima sessão
Leia os seguintes arquivos antes de começar:

tasks/CURRENT_TASK.md
docs/architecture/EXPO_ROUTER_GUIDE.md
docs/architecture/CONVENTIONS.md
apps/mobile/app/_layout.tsx

Após ler, mostre o plano de implementação e aguarde confirmação antes de começar.