# CONTEXT_BUDGET.md — Guia de Uso Eficiente de IA

> Como usar Claude Code (ou qualquer IA) neste projeto gastando o mínimo de tokens
> e obtendo o máximo de qualidade. Leia uma vez e siga como rotina.

---

## O problema que este guia resolve

LLMs têm uma "janela de contexto" — elas só conseguem "ver" X tokens por vez.
Jogar o projeto inteiro na janela:
- Custa mais tokens (= mais caro)
- Reduz qualidade (atenção diluída)
- Aumenta a chance de contradições e alucinações

A solução é **contexto cirúrgico**: dar à IA exatamente o que ela precisa, nada mais.

---

## Hierarquia de arquivos por custo de contexto

```
Sempre lido (baixo custo, alta utilidade):
  CLAUDE.md               → ~300 tokens, orienta tudo
  tasks/CURRENT_TASK.md   → ~200 tokens, foco da sessão

Lido sob demanda (médio custo, alta especificidade):
  SKILLS.md               → ~2.000 tokens, só a seção relevante
  docs/modules/MODULE_*.md → ~800 tokens cada
  docs/architecture/*.md   → ~600 tokens cada

Nunca lido inteiro (alto custo, use buscas):
  docs/database/SCHEMA.md → ~1.500 tokens — busque a tabela específica
  Código fonte             → peça a IA para ler o arquivo específico
```

---

## Rotina de início de sessão (5 minutos)

```
1. Atualizar tasks/CURRENT_TASK.md com a tarefa do dia
2. Abrir Claude Code
3. Claude lê CLAUDE.md automaticamente
4. Você diz: "Leia tasks/CURRENT_TASK.md e comece"
5. Claude pede os arquivos que precisar — você aprova um por um

NÃO faça:
  ❌ "Aqui está todo o projeto, me ajude com X"
  ❌ Colar código de múltiplos arquivos sem contexto
  ❌ "Me explique como funciona tudo antes de começar"
```

---

## Templates de prompts eficientes

### Para criar uma nova feature

```
Tarefa: criar [NOME DA TELA]

Contexto necessário que você já tem:
- CLAUDE.md (lido automaticamente)
- tasks/CURRENT_TASK.md

Contexto adicional que você precisa ler:
- docs/modules/MODULE_[X].md (seção [Y])
- SKILLS.md (seção [Z] — ex: "Skill 1: Criar Componente")

Entregáveis:
1. apps/mobile/src/screens/[NomeDaTela]/index.tsx
2. apps/mobile/src/screens/[NomeDaTela]/use[NomeDaTela].ts

Critérios:
- Seguir exatamente os padrões de SKILLS.md
- Tipos TypeScript sem any
- Loading state e empty state implementados
```

### Para corrigir um bug

```
Bug: [DESCRIÇÃO EM UMA LINHA]

Arquivo com problema:
[caminho/do/arquivo.tsx]

Erro exato:
[mensagem de erro completa + stack trace]

Comportamento esperado:
[o que deveria acontecer]

Comportamento atual:
[o que está acontecendo]

NÃO precisa ler nenhum outro arquivo além deste.
```

### Para refatorar código existente

```
Refatorar: [caminho/do/arquivo.ts]

Motivo: [por que refatorar — ex: "ficou grande demais", "duplicação com X"]

Padrão para seguir: SKILLS.md seção [X]

Restrições:
- Não mudar a interface pública (nomes de funções exportadas)
- Não alterar comportamento — apenas estrutura
```

### Para adicionar uma coluna no banco

```
Migração: adicionar coluna [nome] na tabela [tabela]

Tipo: [tipo SQL]
Nullable: [sim/não]
Default: [valor ou NULL]

Verificar em: docs/database/SCHEMA.md#[tabela]
Seguir convenções de: docs/database/SCHEMA.md#setup-inicial

Arquivos a criar:
- supabase/migrations/[timestamp]_add_[coluna]_to_[tabela].sql
- Regenerar: packages/shared/src/types/supabase.generated.ts
```

---

## O que NÃO pedir para a IA fazer

| Pedido                              | Por que evitar                          | Alternativa                           |
|-------------------------------------|-----------------------------------------|---------------------------------------|
| "Explique todo o projeto"           | Alto custo, você já tem os docs         | Leia CLAUDE.md você mesmo             |
| "Quais são todas as tabelas?"       | Alto custo                              | Leia docs/database/SCHEMA.md          |
| "Crie tudo do módulo X de uma vez"  | Output gigante, difícil de revisar      | Dividir em tarefas atômicas           |
| "Revise todo o código"              | Sem foco, resultado genérico            | "Revise [arquivo específico] para X"  |
| "Gere testes para tudo"             | Sem contexto dos casos de uso           | "Gere testes para [função específica]"|

---

## Tamanho ideal de tarefa

```
Muito grande (dividir):
  "Implementar o módulo de Garagem"
  "Criar toda a autenticação"
  "Fazer o mapa funcionar"

Tamanho certo:
  "Criar a tela GaragemHomeScreen que exibe a moto ativa com foto, placa e status"
  "Adicionar validação Zod ao formulário CadastrarMotoScreen"
  "Criar a Edge Function que expira alertas vencidos"

Muito pequeno (fazer você mesmo):
  "Trocar uma cor"
  "Corrigir um typo"
  "Adicionar um console.log"
```

---

## Revisão de output da IA

Sempre verificar antes de aceitar o código gerado:

```
□ Segue as convenções de CONVENTIONS.md?
□ Usou os padrões de SKILLS.md (não inventou um padrão novo)?
□ TypeScript sem any não justificado?
□ Nenhum secret hardcoded?
□ RLS habilitado em novas tabelas?
□ Componentes com StyleSheet.create (não objetos inline)?
□ Cleanup de useEffect (canais Realtime, intervals, subscriptions)?
□ Tratamento de erro explícito (não silenciado)?
```
