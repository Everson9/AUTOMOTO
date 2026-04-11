# CLAUDE.md — Automoto

> Este arquivo é lido automaticamente pelo Claude Code em cada sessão.
> Mantenha-o enxuto. Detalhes ficam nos arquivos referenciados.

---

## O que é este projeto

**Automoto** — app mobile (Expo + React Native) para motociclistas urbanos brasileiros.
Hub único: segurança na via, gestão de manutenção, comunidade e antifurto.

**Status atual:** pré-desenvolvimento (estrutura sendo montada)

---

## Stack em uma linha

```
Expo (React Native) · MapLibre + OpenFreeMap · Supabase (PG + PostGIS + Realtime + Auth + Storage) · Edge Functions · Expo Push · Open-Meteo · Turborepo
```

Custo atual: **R$ 0/mês** (tudo free tier)

---

## Estrutura do monorepo

```
apps/mobile/        → App Expo
apps/api/           → Supabase Edge Functions
packages/shared/    → Types, schemas Zod, utils
packages/ui/        → Componentes RN reutilizáveis
packages/config/    → ESLint, TSConfig
```

---

## Onde está cada coisa

| Preciso saber sobre...        | Leia este arquivo                          |
|-------------------------------|--------------------------------------------|
| Arquitetura geral             | `docs/architecture/OVERVIEW.md`            |
| Uma feature específica        | `docs/modules/MODULE_[nome].md`            |
| Schema do banco               | `docs/database/SCHEMA.md`                  |
| Convenções de código          | `docs/architecture/CONVENTIONS.md`         |
| Roadmap e fases               | `docs/ROADMAP.md`                          |
| Tarefa atual em andamento     | `tasks/CURRENT_TASK.md`                    |
| Decisões já tomadas           | `docs/architecture/DECISIONS.md`           |
| Padrões de componentes        | `docs/architecture/COMPONENT_PATTERNS.md`  |
| Integração com Supabase       | `docs/architecture/SUPABASE_GUIDE.md`      |
| Integração com MapLibre       | `docs/architecture/MAPLIBRE_GUIDE.md`      |

---

## Regras que sempre se aplicam

1. **Nunca leia o projeto inteiro** — use a tabela acima para ir direto ao arquivo relevante
2. **Português no código de negócio** (nomes de variáveis de domínio, comentários), **inglês em padrões técnicos** (hooks, utils, tipos genéricos)
3. **Tipos TypeScript sempre** — nada de `any` sem comentário explicando o porquê
4. **Cada componente tem responsabilidade única** — se ficou grande, dividir
5. **Supabase RLS sempre ativo** — nenhuma tabela sem política de segurança
6. **Nunca commitar secrets** — tudo em `.env.local`, nunca no repositório

---

## Comandos mais usados

```bash
# Rodar o app no celular (Android)
cd apps/mobile && npx expo run:android

# Rodar testes
pnpm test

# Build de produção
eas build --platform android --profile production

# Checar tipos
pnpm typecheck

# Lint
pnpm lint
```

---

## Contexto de sessão rápido

Antes de começar qualquer tarefa, leia:
1. `tasks/CURRENT_TASK.md` → o que está sendo feito agora
2. O arquivo do módulo relevante em `docs/modules/`
3. Nada mais, a não ser que o arquivo acima peça explicitamente

---

*Atualizado em: 2025 | Versão do doc: 1.0*
