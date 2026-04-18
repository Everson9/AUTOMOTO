# CURRENT_TASK.md

> Atualizar este arquivo antes de cada sessão de desenvolvimento.
> A IA lê APENAS este arquivo + os arquivos listados em "Contexto necessário".

---

## Tarefa atual

**O que:** Criação da logo Automoto

**Módulo:** Identidade

**Fase do roadmap:** Fase 1.5 — Polimento e UX, item 1

---

## Critério de pronto

- [ ] Logo criada em formato SVG
- [ ] Logo funciona em dark e light backgrounds
- [ ] Logo integrada nas telas de auth (Login, Cadastro)
- [ ] Logo integrada na Home (header)
- [ ] Logo integrada na Garagem (header)
- [ ] Dossiê PDF atualizado com logo real
- [ ] Versão PNG exportada para stores e materiais

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

## Contexto necessário

- [ ] `docs/modules/MODULE_IDENTIDADE.md`

---

## Diretrizes de design

Conforme MODULE_IDENTIDADE.md:

**Conceito:** motociclismo urbano, tecnologia e segurança
**Estilo:** moderno, minimalista, funciona bem em dark e light
**Paleta:**
- Background: #0D0D0D (primário), #1A1A1A (secundário)
- Accent: #F97316 (laranja/âmbar)
- Texto: #FFFFFF (primário), #9CA3AF (secundário)

---

## Histórico de tarefas concluídas

| Data     | Tarefa                                           | Arquivos principais                        |
|----------|--------------------------------------------------|--------------------------------------------|
| 11/04/26 | Setup monorepo + Expo + MapLibre                 | apps/mobile/                               |
| 11/04/26 | Auth por email + cadastro de moto + mapa básico  | app/_layout.tsx, src/screens/Login, Cadastro, CadastrarMoto |
| 11/04/26 | Radar da Via: botão, sheet, alertas no Supabase  | app/(tabs)/index.tsx, useMapa.ts, BotaoAlerta, SheetAlerta |
| 12/04/26 | Correções: GestureHandler, SheetAlerta, app.json | app/_layout.tsx, SheetAlerta/index.tsx, app.json |
| 12/04/26 | MapLibre v11: migração completa da API            | app/(tabs)/index.tsx |
| 17/04/26 | Heatmap de assaltos + BotaoAssalto + SheetAssalto | useHeatmap.ts, BotaoAssalto, SheetAssalto |
| 18/04/26 | Aviso de clima Open-Meteo + BannerClima          | climaService.ts, useClima.ts, BannerClima |
| 18/04/26 | Garagem: tab bar + inventário de mods + edição   | GaragemScreen, AdicionarModScreen, EditarModScreen |
| 18/04/26 | Dossiê de Procedência PDF + compartilhamento      | templateDossie.ts, useDossie.ts, DossieScreen |

---

## Prompt para próxima sessão
Leia os seguintes arquivos antes de começar:

tasks/CURRENT_TASK.md
docs/modules/MODULE_IDENTIDADE.md

Após ler, me mostre o que entendeu da tarefa e proponha
a ordem de implementação antes de escrever qualquer código.
Aguarde minha confirmação antes de começar.