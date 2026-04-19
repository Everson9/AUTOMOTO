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
|---|---------------------------------------------------|-------------|-------------|
| 1 | Criação da logo Automoto                          | Identidade  | `concluído` |
| 2 | Home contextual (substituir mapa como tela inicial) | UX        | `concluído` |
| 3 | Editar moto + upload de foto real                 | Garagem     | `concluído` |
| 4 | Cadastro de moto movido para dentro da Garagem (remover do onboarding) | Garagem | `concluído` |
| 5 | Ícone da moto do usuário no mapa (substituir ponto azul) | Radar  | `concluído` |
| 6 | Ícones SVG customizados por tipo de alerta (substituir emojis) | Radar | `concluído` |
| 7 | Notificações push básicas (alertas de proximidade) | Radar       | `pendente` |
| 8 | Onboarding tutorial (primeira vez no app)         | UX          | `pendente` |
| 9 | Navegação com rota no mapa (estilo Waze, OpenRouteService) | Radar | `pendente` |
| 10 | Botão "Iniciar Viagem" funcional (gravar rota, velocidade, percurso) | Radar | `pendente` |
| 11 | Botão "Abastecimento" funcional (registrar combustível) | Garagem | `pendente` |
| 12 | Botão "Localizar Moto" (última localização estacionada) | Radar | `pendente` |
| 13 | Botão "Manutenção" funcional na Home | Garagem | `pendente` |
| 14 | Documentos digitais (CNH e CRLV) | Garagem | `pendente` |
| 15 | Preço do combustível na região | Home | `pendente` |
| 16 | Passeios e encontros da comunidade | Comunidade | `pendente` |

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

## Fase 3 — Valor e Monetização
**Objetivo:** geração de receita com Dossiê premium e features avançadas
**Critério de avanço:** 50 Dossiês pagos + 5.000 usuários ativos

| #  | Feature                                           | Módulo   | Status     |
|----|---------------------------------------------------|----------|------------|
| 1  | Cálculo de valor de venda da moto (FIPE + mods - depreciação) | Garagem | `pendente` |
| 2  | Comprovantes por mod/manutenção (foto de nota fiscal) | Garagem | `pendente` |
| 3  | Categoria "Reposição" nos mods                     | Garagem | `pendente` |
| 4  | Dossiê com valor de mercado e histórico completo    | Garagem | `pendente` |
| 5  | Página pública do Dossiê (web)                     | Garagem | `pendente` |
| 6  | Monetização do Dossiê (R$19,90 por geração)        | Negócio | `pendente` |
| 7  | Programa de afiliados                              | Negócio | `pendente` |
| 8  | Navegação com rota estilo Waze (OpenRouteService)  | Radar   | `pendente` |
| 9  | Ícone da moto do usuário no mapa                   | Radar   | `pendente` |
| 10 | Modo Comboio (GPS em grupo)                        | Comboio | `pendente` |
| 11 | Raio Antifurto                                     | Antifurto | `pendente` |
| 12 | Notificações push (alertas de proximidade, chuva)  | Infra   | `pendente` |
| 13 | Histórico de valor de mercado via FIPE              | Garagem | `pendente` |
| 14 | Mapa/navegação com trânsito na Home                 | Home    | `pendente` |
| 15 | Postagens recentes e grupos de motociclistas        | Comunidade | `pendente` |
| 16 | Badge "Em dia" com cálculo real de saúde da moto    | Garagem | `pendente` |
| 17 | Contador regressivo de próxima revisão (km/dias)   | Garagem | `pendente` |

---

## Fase 4 — Expansão Comunitária
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