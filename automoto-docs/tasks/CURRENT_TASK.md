# CURRENT_TASK.md

> Atualizar este arquivo antes de cada sessão de desenvolvimento.
> A IA lê APENAS este arquivo + os arquivos listados em "Contexto necessário".
> Não deixar contexto desnecessário aqui — mantém o custo de token baixo.

---

## Tarefa atual

**O que:** Implementar o fluxo completo: login → cadastro de moto → visualização no mapa

**Módulo:** Autenticação e Garagem Virtual

**Fase do roadmap:** Fase 1 — MVP Core

---

## Critério de pronto

- [ ] Fluxo completo: abrir app → login → cadastrar moto → ver mapa
- [ ] Dados salvos no Supabase (verificar no painel)
- [ ] Testado no Android físico
- [ ] Tipos TypeScript sem erros

---

## Arquivos que serão criados ou modificados

```
apps/mobile/src/screens/Login/index.tsx             → criar
apps/mobile/src/screens/Cadastro/index.tsx          → criar
apps/mobile/src/screens/CadastrarMoto/index.tsx     → criar
apps/mobile/src/hooks/useAuth.ts                    → criar
apps/mobile/src/navigation/AuthNavigator.tsx        → criar
apps/mobile/src/navigation/AppNavigator.tsx         → criar
apps/mobile/src/navigation/types.ts                 → criar
apps/mobile/src/lib/supabase.ts                     → modificar (adicionar listener de auth)
apps/mobile/app/_layout.tsx                         → modificar (adicionar navegação condicional)
```

---

## Contexto necessário

> A IA deve ler APENAS estes arquivos além deste:

- [x] `SKILLS.md` → padrões de código (seções 2, 3, 9)
- [x] `docs/modules/MODULE_GARAGEM.md` → spec da feature
- [x] `docs/database/SCHEMA.md#tabela-motos` → schema da tabela envolvida
- [x] `docs/architecture/AUTH_GUIDE.md` → guia de autenticação

---

## Decisões já tomadas para esta tarefa

- Usar estrutura de navegação por stacks (AuthStack e AppStack)
- Seguir padrão de screens do SKILLS.md seção 2
- Implementar validação de formulários com Zod conforme SKILLS.md seção 9

---

## Bloqueios / dúvidas

- Nenhum bloqueio identificado

---

## Histórico de tarefas concluídas

_Mover a tarefa atual para cá quando concluir, com data e resumo._

| Data       | Tarefa                                      | Arquivos principais             |
|------------|---------------------------------------------|---------------------------------|
| 11/04/26 | Implementação do mapa básico com localização | app/(tabs)/index.tsx            |
