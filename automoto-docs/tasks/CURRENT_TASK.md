# CURRENT_TASK.md

> Atualizar este arquivo antes de cada sessão de desenvolvimento.
> A IA lê APENAS este arquivo + os arquivos listados em "Contexto necessário".

---

## Tarefa atual

**O que:** Implementar o Radar da Via — reportar e visualizar alertas no mapa

**Módulo:** Radar

**Fase do roadmap:** Fase 1 — MVP Core

---

## Critério de pronto

- [ ] Botão flutuante no mapa para reportar alerta
- [ ] Bottom sheet com categorias: óleo na pista, areia em curva, buraco, obra, enchente
- [ ] Alerta salvo no Supabase com coordenada GPS + categoria + user_id + timestamp
- [ ] Alertas próximos carregados do Supabase e exibidos no mapa como ícones
- [ ] Expiração automática por categoria conforme tabela do MODULE_RADAR.md
- [ ] Testado no Android físico

---

## Arquivos que serão criados ou modificados
apps/mobile/src/screens/Mapa/index.tsx         → modificar (adicionar botão + camada de alertas)
apps/mobile/src/screens/Mapa/useMapa.ts        → criar (lógica extraída)
apps/mobile/src/components/BotaoAlerta/        → criar (botão flutuante)
apps/mobile/src/components/SheetAlerta/        → criar (bottom sheet de categorias)
supabase/migrations/XXXX_create_alertas.sql    → criar (tabela alertas_via)

---

## Contexto necessário

- [ ] `SKILLS.md` → seções 1, 2, 3
- [ ] `docs/modules/MODULE_RADAR.md` → spec completa do Radar
- [ ] `docs/database/SCHEMA.md` → schema da tabela alertas_via
- [ ] `docs/architecture/MAPLIBRE_GUIDE.md` → como adicionar camadas no mapa
- [ ] `docs/architecture/EXPO_ROUTER_GUIDE.md` → regras de navegação

---

## Decisões já tomadas

- Expo Router exclusivamente para navegação
- Lógica de auth centralizada no `_layout.tsx`
- Telas complexas em `src/screens/`, arquivos em `app/` são só wrappers

---

## Histórico de tarefas concluídas

| Data     | Tarefa                                           | Arquivos principais                        |
|----------|--------------------------------------------------|--------------------------------------------|
| 11/04/26 | Setup monorepo + Expo + MapLibre                 | apps/mobile/                               |
| 11/04/26 | Auth por email + cadastro de moto + mapa básico  | app/_layout.tsx, src/screens/Login, Cadastro, CadastrarMoto |

Prompt pra primeira sessão do Radar:
Leia os seguintes arquivos antes de começar:
- tasks/CURRENT_TASK.md
- docs/modules/MODULE_RADAR.md
- docs/database/SCHEMA.md (seção alertas_via)
- docs/architecture/MAPLIBRE_GUIDE.md
- docs/architecture/EXPO_ROUTER_GUIDE.md
- SKILLS.md (seções 1, 2, 3)

Após ler, me mostre o que entendeu da tarefa e proponha
a ordem de implementação antes de escrever qualquer código.
Aguarde minha confirmação antes de começar.