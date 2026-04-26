# AI_WORKFLOW.md — Como Trabalhar com IA neste Projeto

> Este arquivo descreve o fluxo de trabalho estabelecido para usar
> Claude Code + Claude.ai de forma eficiente e segura neste projeto.

---

## Visão geral

Usamos **dois modelos de IA em paralelo**:

| IA | Onde | Função |
|----|------|---------|
| **Claude Code** | Terminal / VS Code | Escreve e edita código no projeto |
| **Claude.ai (chat)** | Browser | Analisa erros, gera prompts, revisa código, atualiza docs |

O Claude.ai atua como **supervisor** do Claude Code.
O Claude Code atua como **executor** das tarefas.

---

## Fluxo de uma sessão de desenvolvimento

### 1. Início da sessão
- Abrir o Claude Code e enviar:
Leia tasks/CURRENT_TASK.md e os arquivos listados em "Contexto necessário".
Após ler, me mostre o que entendeu da tarefa e proponha a ordem de
implementação antes de escrever qualquer código.
Aguarde minha confirmação antes de começar.

### 2. Durante a sessão
- Claude Code propõe → você traz para o Claude.ai revisar → Claude.ai gera prompt de correção se necessário → você cola no Claude Code
- **Nunca deixar o Claude Code salvar sem ver o código antes**
- Pedir sempre: *"Mostre o código antes de salvar e aguarde confirmação"*

### 3. Fim da sessão
- Pedir ao Claude Code para atualizar o `SESSION_LOG.md`
- Trazer o log para o Claude.ai atualizar o `CURRENT_TASK.md`

---

## Regras do fluxo

### Claude Code
- **Um arquivo por vez** — nunca aprovar múltiplos arquivos de uma vez
- **Ver antes de salvar** — sempre pedir para mostrar o código antes de salvar
- **Aguardar confirmação** — incluir "aguarde confirmação antes de começar" em todo prompt
- **Ler os MDs antes** — sempre incluir os arquivos de contexto relevantes no prompt

### Claude.ai (chat)
- Analisa logs de erro e identifica a causa raiz
- Gera prompts cirúrgicos para o Claude Code corrigir
- Revisa código antes de aprovar
- Atualiza SESSION_LOG.md e CURRENT_TASK.md no fim da sessão
- Sugere novos padrões para o SKILLS.md quando necessário

---

## Template de prompt padrão para o Claude Code

### Nova feature
Leia os seguintes arquivos antes de começar:

tasks/CURRENT_TASK.md
docs/modules/MODULE_[X].md
SKILLS.md (seções [X, Y])
docs/architecture/EXPO_ROUTER_GUIDE.md

Após ler, me mostre o que entendeu e proponha a ordem de implementação.
Mostre cada arquivo antes de salvar e aguarde minha confirmação a cada etapa.

### Correção de bug
Erro: [MENSAGEM DO ERRO]
Arquivo com problema: [CAMINHO]
Antes de qualquer alteração, mostre o conteúdo atual do arquivo.
Corrija apenas [PARTE ESPECÍFICA] sem alterar mais nada.
Mostre o trecho corrigido antes de salvar.

### Fim de sessão
Atualize o SESSION_LOG.md com o resumo desta sessão seguindo o formato
já existente no arquivo:

O que foi feito
Decisões tomadas
Pendências / o que não foi concluído
Próximo passo recomendado


---

## Por que esse fluxo existe

Nas primeiras sessões o Claude Code:
- Criou dois sistemas de navegação simultâneos (React Navigation + Expo Router)
- Usou hooks fora do provider correto
- Salvou arquivos sem mostrar para revisão
- Inventou dependências que não existiam no projeto

O fluxo de revisão via Claude.ai evita que esses erros cheguem ao app.
**Regra de ouro: Claude Code executa, Claude.ai supervisiona.**

---

## Quando usar cabo USB vs Wi-Fi

| Situação | Comando | Conexão |
|----------|---------|---------|
| Primeira instalação do APK | `npx expo run:android` | USB ou Wi-Fi |
| Mudança em `.env.local` | `npx expo run:android` | USB ou Wi-Fi |
| Instalação de novo pacote nativo | `npx expo run:android` | USB ou Wi-Fi |
| Alterações em `.tsx` / `.ts` | `npx expo start` | **Só Wi-Fi** |
| Alterações em estilos / lógica | Hot reload automático | **Só Wi-Fi** |

---

## Arquivos de contexto do projeto

| Arquivo | Quando ler |
|---------|-----------|
| `CLAUDE.md` | Lido automaticamente pelo Claude Code |
| `tasks/CURRENT_TASK.md` | Início de toda sessão |
| `tasks/SESSION_LOG.md` | Referência histórica |
| `SKILLS.md` | Antes de criar componente, tela, query ou formulário |
| `docs/architecture/EXPO_ROUTER_GUIDE.md` | Antes de qualquer navegação ou auth |
| `docs/architecture/AUTH_GUIDE.md` | Antes de qualquer fluxo de login/sessão |
| `docs/modules/MODULE_*.md` | Antes de implementar a feature correspondente |
| `docs/architecture/DECISIONS.md` | Antes de propor nova arquitetura |
