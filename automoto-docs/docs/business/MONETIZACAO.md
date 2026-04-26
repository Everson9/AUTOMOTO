# MONETIZACAO.md — Estratégia de Monetização

> Este arquivo documenta as regras de negócio de monetização do Automoto.
> Leia antes de implementar qualquer feature que envolva planos, pagamentos ou parceiros.

---

## Modelo geral

**Freemium estratégico + B2B.** A base gratuita gera o valor dos dados comunitários que torna o produto premium irresistível — e os dados do usuário tornam a publicidade B2B ultra-segmentada.

```
Receita B2C:  Dossiê de Procedência (avulso) + Plano Premium (assinatura)
Receita B2B:  Mensalidade de Oficinas Parceiras + Publicidade segmentada
```

---

## B2C — Usuário Final

### Plano Free

O plano free existe para maximizar a base de usuários e qualidade dos dados comunitários. Todas as features de segurança e utilidade diária são gratuitas.

| Feature                           | Free | Premium |
|-----------------------------------|------|---------|
| Garagem Virtual (básico)          | ✅   | ✅      |
| Radar da Rua completo             | ✅   | ✅      |
| Alertas de clima                  | ✅   | ✅      |
| Modo Comboio                      | ✅   | ✅      |
| Raio Antifurto                    | ✅   | ✅      |
| Dossiê de Procedência             | R$ 19,90/geração | Ilimitado |
| Publicidade no app                | ✅   | ❌      |
| Histórico estendido (> 6 meses)   | ❌   | ✅      |
| Exportação de dados               | ❌   | ✅      |

### Dossiê de Procedência — pay-per-use

O principal produto de conversão. Estratégia:

- **Avulso:** R$ 19,90 por geração (pay-per-use)
- **Premium:** ilimitado incluso na assinatura
- **MVP:** N primeiras gerações gratuitas como estratégia de aquisição (N a definir: sugestão 3 gerações)

```typescript
// Lógica de verificação antes de gerar o PDF
async function podeGerarDossie(userId: string): Promise<{
  pode: boolean
  motivo?: 'premium' | 'geracoes_gratuitas_disponiveis' | 'pagamento_necessario'
}> {
  const plano = await buscarPlanoUsuario(userId)
  if (plano === 'premium') return { pode: true, motivo: 'premium' }

  const geracoesGratuitas = await contarGeracoesGratuitas(userId)
  if (geracoesGratuitas < LIMITE_GERACOES_GRATUITAS) {
    return { pode: true, motivo: 'geracoes_gratuitas_disponiveis' }
  }

  return { pode: false, motivo: 'pagamento_necessario' }
}
```

### Plano Premium — assinatura

Implementar na **Fase 2**, após validar a demanda pelo Dossiê avulso.

- Processamento de pagamento: **RevenueCat** (abstrai App Store + Google Play)
- Não implementar pagamento próprio — App Store e Google Play exigem seus sistemas para assinaturas in-app

```typescript
// Verificar status do plano via RevenueCat
import Purchases from 'react-native-purchases'

async function verificarPlano(): Promise<'free' | 'premium'> {
  const customerInfo = await Purchases.getCustomerInfo()
  const entitlement = customerInfo.entitlements.active['premium']
  return entitlement?.isActive ? 'premium' : 'free'
}
```

---

## B2B — Oficinas e Parceiros

### Oficinas Parceiras

Detalhes completos em: `docs/modules/MODULE_SOS.md#programa-de-oficinas-parceiras`

| Tier          | Produto                                                    |
|---------------|------------------------------------------------------------|
| Gratuito      | Cadastro básico no mapa. Sem diferencial visual.           |
| Parceiro Pago | Destaque no SOS, badge verificada, painel de analytics.   |

**Proposta de valor clara:** "Sua oficina aparece para o motociclista exatamente quando ele precisa de ajuda — não num feed genérico."

### Publicidade Ultra-Segmentada (Fase 3)

O banco de dados do Automoto sabe:
- A quilometragem atual de cada pneu do usuário
- Quando a última troca de óleo foi feita
- O modelo e ano da moto (define compatibilidade de peças)
- A rota habitual (define exposição a riscos)

Isso permite publicidade por evento mecânico — o anúncio aparece exatamente quando a necessidade existe:

```
Usuário X atingiu 2.000km desde a última verificação de pneu
→ Loja parceira de pneus exibe anúncio naquele momento
```

Regras:
- Máximo 1 anúncio por sessão no plano free
- Anúncios sempre temáticos (nunca off-topic para motociclismo)
- Usuário premium: zero anúncios

### API de Dados Anonimizados (Fase 3 — pós-LGPD)

Dados agregados e anonimizados para:
- Seguradoras: histórico de manutenção como fator de desconto em apólice
- Pesquisadores: padrões de mobilidade urbana de motociclistas
- Prefeituras: pontos críticos de acidentes e assaltos

**Pré-requisito:** DPO definido, política de privacidade atualizada, opt-in explícito do usuário.

---

## Projeção de receita (conservadora)

| Marco                   | MAU estimado | Receita estimada/mês                     |
|-------------------------|--------------|------------------------------------------|
| MVP lançamento          | 500          | R$ 0 (fase de validação)                 |
| 3 meses pós-lançamento  | 5.000        | R$ 500–1.000 (PDFs + 2 oficinas)         |
| 6 meses                 | 20.000       | R$ 3.000–6.000                           |
| 12 meses                | 80.000       | R$ 15.000–30.000                         |
| 24 meses                | 300.000      | R$ 80.000–150.000                        |

---

## Critérios de avanço para o modelo pago

Não lançar o Plano Premium antes de:
1. **Validar o Dossiê avulso:** pelo menos 50 gerações pagas (prova de que o mercado paga)
2. **Definir o preço certo:** testar R$ 19,90 vs R$ 29,90 no avulso antes de fixar o mensal
3. **Ter retención D30 > 20%:** assinatura não funciona se o usuário não volta

---

## Regras de negócio no código

### Verificação de plano (padrão a seguir)

```typescript
// packages/shared/src/utils/plano.ts

export type Plano = 'free' | 'premium'

export interface LimitesPlano {
  geracoesDossie: number | 'ilimitado'
  historicoMeses: number | 'ilimitado'
  exportacaoDados: boolean
  semPublicidade: boolean
}

export const LIMITES: Record<Plano, LimitesPlano> = {
  free: {
    geracoesDossie: 3, // gratuitas no MVP; depois disso, pay-per-use
    historicoMeses: 6,
    exportacaoDados: false,
    semPublicidade: false,
  },
  premium: {
    geracoesDossie: 'ilimitado',
    historicoMeses: 'ilimitado',
    exportacaoDados: true,
    semPublicidade: true,
  },
}
```

### Paywall — padrão de UX

Nunca bloquear uma feature sem antes mostrar o valor que o upgrade traz.

```tsx
// Padrão: tentar a ação → se bloqueada → mostrar paywall com contexto
// NUNCA: bloquear antes do usuário tentar

// ❌ Errado: esconder o botão "Exportar" do usuário free
// ✅ Certo: mostrar o botão → ao clicar → paywall com "Exportação disponível no Premium"
```

---

## O que NÃO fazer

- **Não cobrar por features de segurança** — Raio Antifurto, alertas da via e SOS são sempre gratuitos. Monetizar segurança é antiético e afasta usuários.
- **Não vender dados individuais** — apenas dados agregados e anonimizados, com opt-in explícito.
- **Não implementar pagamento próprio** para iOS/Android — viola os termos da App Store e Google Play. Usar RevenueCat.
- **Não lançar Premium antes de validar o avulso** — ver critérios de avanço acima.
