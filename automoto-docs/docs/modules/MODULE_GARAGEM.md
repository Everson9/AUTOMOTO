# MODULE_GARAGEM.md — Módulo: Garagem Virtual

> Leia este arquivo quando for trabalhar em qualquer feature da Garagem.
> Fase do roadmap: **Fase 1 (cadastro + mods + PDF)** e **Fase 2 (manutenção + combustível)**

---

## O que é

Central de gestão do veículo. O usuário registra sua moto, acompanha manutenções, documenta customizações e gera o Dossiê de Procedência para venda.

---

## Telas

| Tela                      | Rota de navegação           | Fase |
|---------------------------|------------------------------|------|
| `GaragemHomeScreen`       | `/garagem`                   | 1    |
| `CadastrarMotoScreen`     | `/garagem/moto/nova`         | 1    |
| `EditarMotoScreen`        | `/garagem/moto/:id/editar`   | 1    |
| `ModsListScreen`          | `/garagem/moto/:id/mods`     | 1    |
| `AdicionarModScreen`      | `/garagem/moto/:id/mods/novo`| 1    |
| `DossieScreen`            | `/garagem/dossie`            | 1    |
| `ManutencaoListScreen`    | `/garagem/moto/:id/manutencao`| 2   |
| `AdicionarManutencaoScreen`| `/garagem/moto/:id/manutencao/nova`| 2 |
| `CombustivelScreen`       | `/garagem/combustivel`       | 2    |

---

## Dados e tabelas envolvidas

- `motos` — tabela principal
- `mods` — customizações
- `manutencoes` — histórico de manutenção
- `abastecimentos` — registros de combustível

Schema completo: `docs/database/SCHEMA.md`

---

## Lógica de negócio crítica

### Moto ativa
Cada usuário pode ter múltiplas motos cadastradas. Apenas uma é a "moto ativa" (flag `ativa = true`). Ao trocar de moto ativa, as outras ficam `ativa = false`. A home da Garagem sempre exibe a moto ativa.

```typescript
// Ao ativar uma moto, desativar as outras
async function ativarMoto(motoId: string, userId: string) {
  // Transação: desativar todas + ativar a escolhida
  await supabase.rpc('ativar_moto', { moto_id: motoId, p_user_id: userId })
}
```

### Cálculo de saúde da moto
Cada item de manutenção tem um `proxima_km` e/ou `proximo_em`. O sistema calcula a porcentagem de "vida útil" consumida:

```typescript
function calcularSaudeItem(kmAtual: number, kmUltima: number, intervaloPadrao: number): number {
  const kmDesde = kmAtual - kmUltima
  const porcentagem = (kmDesde / intervaloPadrao) * 100
  return Math.min(porcentagem, 100)  // cap em 100%
}

// Status baseado na porcentagem
function statusSaude(pct: number): 'ok' | 'atencao' | 'urgente' {
  if (pct < 70) return 'ok'
  if (pct < 90) return 'atencao'
  return 'urgente'
}
```

### Geração do Dossiê (PDF)

O PDF é gerado on-device com `expo-print`. O template é um HTML string montado no app.

```typescript
// Fluxo de geração
async function gerarDossie(motoId: string) {
  // 1. Buscar todos os dados necessários em paralelo
  const [moto, manutencoes, mods] = await Promise.all([
    buscarMoto(motoId),
    buscarManutencoes(motoId),
    buscarMods(motoId),
  ])

  // 2. Montar HTML do template
  const html = templateDossie({ moto, manutencoes, mods })

  // 3. Gerar PDF
  const { uri } = await Print.printToFileAsync({ html })

  // 4. Upload para Supabase Storage (para o QR code)
  const publicUrl = await uploadDossie(uri, motoId)

  // 5. Registrar geração no banco (para controle de pagamento)
  await registrarGeracaoDossie(motoId, publicUrl)

  return { uri, publicUrl }
}
```

### Alertas de manutenção

Intervalos padrão por tipo (hardcoded no MVP, crowdsourcing futuro):

```typescript
// packages/shared/src/constants/manutencao.ts

export const INTERVALOS_MANUTENCAO: Record<string, { km: number; dias: number }> = {
  troca_oleo:         { km: 3000,  dias: 90  },
  lubrificacao_corrente: { km: 500, dias: 7  },
  tensao_corrente:    { km: 1000,  dias: 30  },
  fluido_freio:       { km: 10000, dias: 365 },
  pneu_dianteiro:     { km: 20000, dias: 730 },
  pneu_traseiro:      { km: 15000, dias: 547 },
  vela_ignicao:       { km: 8000,  dias: 365 },
  filtro_ar:          { km: 6000,  dias: 180 },
  revisao_geral:      { km: 10000, dias: 365 },
}
```

---

## Estados de UI

### GaragemHomeScreen

```
sem moto cadastrada  → CTA para cadastrar primeira moto
moto cadastrada      → card da moto ativa + grid de saúde + botões de ação
múltiplas motos      → selector de moto no topo
```

### ManutencaoListScreen

```
loading              → skeleton de 3 cards
lista vazia          → empty state com CTA para adicionar
lista com itens      → agrupado por status (urgente → atenção → ok)
```

---

## Componentes específicos deste módulo

```
GaragemScreen/
  MotoCard            → card resumo da moto com foto e dados principais
  SaudeGrid           → grid de itens de manutenção com indicador visual
  SaudeItem           → item individual com barra de progresso e status
  ModCard             → card de customização com fotos antes/depois
  ManutencaoCard      → registro de manutenção com data, km, valor
  AbastecimentoChart  → gráfico de consumo km/L ao longo do tempo
  DossiePreview       → preview do PDF antes de gerar/pagar
```

---

## Regras de monetização neste módulo

- Listar mods e manutenções: **gratuito**
- Gerar PDF do Dossiê: **R$ 19,90 por geração** (verificar `dossie_pagamentos` antes de gerar)
- Plano Premium: gerações ilimitadas (verificar `subscriptions` do usuário)
- MVP: geração gratuita para os primeiros 100 usuários (flag `early_adopter` no perfil)

---

## Features planejadas (pós-MVP)

### Categoria "Reposição" nos mods
Adicionar categoria para peças trocadas por necessidade (espelho, retrovisor, etc.) além das categorias estéticas. Tanto reposições quanto customizações entram no Dossiê como evidência de procedência.

### Comprovantes nos mods e manutenções
Upload de foto de nota fiscal ou comprovante em cada mod e manutenção. Armazenado no Supabase Storage (bucket `fotos`). Aparece no Dossiê PDF como evidência de procedência. Aplicável tanto a customizações quanto a reposições de peças.

### Comprovantes de manutenção
- Upload de fotos de recibos/notas fiscais
- Armazenamento em bucket `fotos` no Supabase Storage
- Campo `foto_recibo_url` já existe na tabela `manutencoes`
- OCR futuro para auto-preenchimento de dados da nota

### Cálculo de valor de venda da moto
- Base: valor FIPE consultado automaticamente por modelo/ano
- + Valorização por mods (com fator de aproveitamento — nem todo mod vale 100% na revenda)
- - Depreciação por km rodados e tempo de uso
- - Penalização por manutenções atrasadas
- Resultado: faixa de valor (mínimo/máximo) para não travar o vendedor
- Valor editável pelo usuário: app sugere, usuário pode ajustar manualmente
- No Dossiê aparece como "Valor estimado pelo app: R$ X" ou "Valor definido pelo proprietário: R$ X"
- Objetivo: ser conservador o suficiente para não prejudicar o vendedor na negociação

### Histórico de valor de mercado
- Integração com tabela FIPE para estimar valor de mercado
- Cálculo de depreciação vs. valorização por mods e manutenções
- Gráfico de evolução do valor ao longo do tempo

---

## Testes de aceitação (Fase 1)

- [ ] Usuário consegue cadastrar uma moto com placa, modelo, ano e foto
- [ ] Usuário consegue adicionar um mod com fotos antes/depois
- [ ] Usuário consegue gerar um PDF do Dossiê com pelo menos 1 mod cadastrado
- [ ] O QR code no PDF abre a página pública correta
- [ ] Trocar de moto ativa atualiza toda a UI da Garagem
