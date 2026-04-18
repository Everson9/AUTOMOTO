# ROADMAP.md — Roadmap de Desenvolvimento

---

## Fase 1 — MVP Core
**Objetivo:** 5.000 usuários ativos e validação do modelo freemium  
**Critério de avanço:** 1.000 MAU + pelo menos 1 Dossiê pago

| # | Feature                        | Módulo   | Status     | Arquivo de spec                        |
|---|--------------------------------|----------|------------|----------------------------------------|
| 1 | Setup monorepo + Expo + MapLibre | Infra   | `concluído` | `docs/architecture/OVERVIEW.md`        |
| 2 | Auth por email (Supabase)      | Auth     | `concluído` | —                                      |
| 3 | Onboarding + cadastro de moto  | Garagem  | `concluído` | `docs/modules/MODULE_GARAGEM.md`       |
| 4 | Garagem: inventário de mods    | Garagem  | `concluído` | `docs/modules/MODULE_GARAGEM.md`       |
| 5 | Radar: alertas da via (Waze)   | Radar    | `concluído` | `docs/modules/MODULE_RADAR.md`         |
| 6 | Radar: mapa de calor assaltos  | Radar    | `concluído` | `docs/modules/MODULE_RADAR.md`         |
| 7 | Aviso de clima (Open-Meteo)    | Radar    | `concluído` | `docs/modules/MODULE_RADAR.md`         |
| 8 | Dossiê de Procedência (PDF)    | Garagem  | `concluído`| `docs/modules/MODULE_GARAGEM.md`       |

---

## Fase 1.5 — Polimento e UX
**Objetivo:** App redondinho e pronto para beta fechado na Play Store  
**Critério de avanço:** Todos os itens concluídos + app publicado em beta fechado

| # | Feature                                           | Módulo      | Status     |
|---|---------------------------------------------------|-------------|------------|
| 1 | Criação da logo Automoto                          | Identidade  | `pendente` |
| 2 | Home contextual (substituir mapa como tela inicial) | UX          | `pendente` |
| 3 | Editar moto + upload de foto real                 | Garagem     | `pendente` |
| 4 | Cadastro de moto movido para dentro da Garagem (remover do onboarding) | Garagem | `pendente` |
| 5 | Ícone da moto do usuário no mapa (substituir ponto azul) | Radar  | `pendente` |
| 6 | Ícones SVG customizados por tipo de alerta (substituir emojis) | Radar | `pendente` |
| 7 | Notificações push básicas (alertas de proximidade) | Radar       | `pendente` |
| 8 | Onboarding tutorial (primeira vez no app)         | UX          | `pendente` |
| 9 | Navegação com rota no mapa (estilo Waze, OpenRouteService) | Radar | `pendente` |

---

## Fase 2 — Retenção e Utilidade Diária
**Objetivo:** usuário abre o app todo dia + primeiras parcerias B2B  
**Critério de avanço:** 10.000 MAU + 3 oficinas parceiras + retenção D30 > 25%

| # | Feature                          | Módulo   | Status     |
|---|----------------------------------|----------|------------|
| 1 | Auth por SMS/telefone            | Auth     | `pendente` |
| 2 | Gestão de manutenção + alertas   | Garagem  | `pendente` |
| 3 | Dashboard de combustível         | Garagem  | `pendente` |
| 4 | Mapeamento de vagas              | Radar    | `pendente` |
| 5 | Rede SOS + oficinas validadas    | Apoio    | `pendente` |
| 6 | Gamificação: pontos + ranking    | Comunidade| `pendente` |
| 7 | Cache offline (MMKV)             | Infra    | `pendente` |

---

## Fase 3 — Expansão Comunitária
**Objetivo:** viralização orgânica por impacto social

| # | Feature                         | Módulo     | Status     | Arquivo de spec                         |
|---|---------------------------------|------------|------------|-----------------------------------------|
| 1 | Raio Antifurto completo         | Antifurto  | `pendente` | `docs/modules/MODULE_ANTIFURTO.md`      |
| 2 | Modo Comboio (GPS em grupo)     | Comboio    | `pendente` | `docs/modules/MODULE_COMBOIO.md`        |
| 3 | Página pública do Dossiê (web)  | Garagem    | `pendente` | —                                       |
| 4 | Programa de afiliados           | Negócio    | `pendente` | —                                       |

---

## Status possíveis
- `pendente` — ainda não começou
- `em progresso` — sendo desenvolvido agora (ver `tasks/CURRENT_TASK.md`)
- `em revisão` — código pronto, aguardando review/teste
- `concluído` — em produção
- `bloqueado` — depende de algo externo
