# MODULE_SOS.md — Módulo: Rede SOS e Oficinas Validadas

> Leia este arquivo quando for trabalhar em qualquer feature de SOS ou Oficinas.
> Fase do roadmap: **Fase 2 — Retenção e Utilidade Diária**

---

## O que é

Botão de pânico acessível da tela principal com menos de 2 toques. Ao acionar, exibe imediatamente os recursos de apoio mais próximos: guincho parceiro, oficinas validadas pela comunidade e atalho para contato de emergência pessoal.

É também o primeiro canal de monetização B2B do app — oficinas pagam mensalidade para aparecer em destaque nos resultados SOS.

---

## Telas

| Tela                        | Rota de navegação              | Fase |
|-----------------------------|-------------------------------|------|
| `SOSScreen`                 | `/sos`                        | 2    |
| `OficinasMapScreen`         | `/sos/oficinas`               | 2    |
| `OficinaDetailScreen`       | `/sos/oficinas/:id`           | 2    |
| `ContatoEmergenciaScreen`   | `/sos/contato-emergencia`     | 2    |
| `GuinchoDetailScreen`       | `/sos/guincho/:id`            | 2    |

---

## Dados e tabelas envolvidas

- `oficinas` — cadastro de oficinas (free e parceiras)
- `guinchos` — cadastro de guinchos parceiros
- `contatos_emergencia` — contatos pessoais do usuário (máx. 3)
- `acionamentos_sos` — log de cada acionamento (analytics para parceiros)

Schema completo: `docs/database/SCHEMA.md`

---

## Lógica de negócio crítica

### Ordenação dos resultados SOS

Ao acionar o SOS, o backend executa uma query PostGIS ordenada por:

1. **Parceiras verificadas** (`parceira = true AND verificada = true`) — topo absoluto
2. **Distância** (ST_Distance) — dentro de cada tier
3. **Avaliação média** — desempate

```typescript
// Chamar via RPC para aproveitar índice espacial
async function buscarOficinasProximas(lat: number, lng: number) {
  const { data, error } = await supabase.rpc('oficinas_proximas_sos', {
    lat,
    lng,
    raio_metros: 10000, // 10km
  })
  if (error) throw new Error(error.message)
  return data
}
```

```sql
-- Função RPC correspondente em: docs/database/SCHEMA.md#funções-rpc
-- Retorna: id, nome, distancia_metros, parceira, verificada, avaliacao_media,
--          especialidades, telefone, horario_hoje, foto_url
```

### Lógica de verificação de oficina

Uma oficina recebe o badge `verificada = true` por um destes critérios:

```
Critério A: visita presencial da equipe Automoto (flag manual)
Critério B: volume mínimo de avaliações positivas
  - mínimo 10 avaliações
  - média >= 4.0 estrelas
  - nenhuma avaliação de 1 estrela nos últimos 30 dias
```

A verificação é reavaliada semanalmente via Edge Function (`verificar-oficinas`). Critério B pode ser perdido se a avaliação cair abaixo do mínimo.

```typescript
// apps/api/supabase/functions/verificar-oficinas/index.ts
// Roda via cron job — checar docs/architecture/SUPABASE_GUIDE.md#cron-jobs
async function reavaliarVerificacoes(supabase: SupabaseClient) {
  const { data: candidatas } = await supabase
    .from('oficinas')
    .select('id, avaliacao_media, total_avaliacoes, verificada')
    .gte('total_avaliacoes', 10)

  for (const oficina of candidatas ?? []) {
    const novoStatus = oficina.avaliacao_media >= 4.0 && oficina.total_avaliacoes >= 10
    if (oficina.verificada !== novoStatus) {
      await supabase
        .from('oficinas')
        .update({ verificada: novoStatus, verificada_em: new Date().toISOString() })
        .eq('id', oficina.id)
    }
  }
}
```

### Registro de acionamento SOS (analytics para parceiros)

Cada vez que o SOS é acionado E o usuário toca em uma oficina, registrar:

```typescript
async function registrarAcionamento(oficina_id: string, user_id: string) {
  await supabase.from('acionamentos_sos').insert({
    oficina_id,
    user_id,
    acionado_em: new Date().toISOString(),
    // Não salvar geolocalização do usuário neste log
  })
}
```

Este log alimenta o **painel do parceiro**: a oficina vê quantas vezes apareceu nos resultados e quantas vezes o usuário tocou nela.

### Compartilhar localização com contato de emergência

```typescript
// Gera um link temporário (24h) com a localização atual
async function compartilharLocalizacaoSOS(userId: string, lat: number, lng: number) {
  const token = crypto.randomUUID()
  const expiracao = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  await supabase.from('sos_tokens').insert({
    user_id: userId,
    token,
    lat,
    lng,
    expira_em: expiracao,
  })

  // Link que abre num mapa público (não exige login)
  return `https://automoto.app/sos/${token}`
}
```

---

## Fluxo de acionamento SOS — passo a passo

```
1. Usuário pressiona botão SOS (≤ 2 toques da tela principal)
2. App solicita localização GPS atual (alta precisão)
3. Exibir loading ≤ 2 segundos (chamar RPC oficinas_proximas_sos)
4. Exibir resultados em lista/mapa:
   ├── Guinchos parceiros (máx. 3 mais próximos)
   └── Oficinas (até 10km, ordenadas por tier + distância)
5. Ao tocar numa oficina → registrar acionamento → abrir telefone nativo
6. Botão "Compartilhar localização" → gerar link temporário → abrir compartilhamento nativo
```

---

## Programa de Oficinas Parceiras — regras

| Tier          | Custo       | Benefícios                                                      |
|---------------|-------------|------------------------------------------------------------------|
| Gratuito      | R$ 0        | Aparece no mapa. Sem badge. Posição por avaliação + distância.  |
| Parceiro Pago | Mensalidade | Badge "Verificada pelo Automoto". Posição prioritária no SOS. Painel de analytics. |

- Parceiro pago sem verificação (critério A ou B) recebe badge "Parceira" mas não "Verificada"
- A mensalidade não compra a verificação — apenas o destaque na lista
- Inadimplência por 30 dias remove o destaque e mantém o cadastro gratuito

---

## Componentes principais

### `SOSButton`
Botão de pânico acessível da home. Deve ser visível sempre (não esconder atrás de scroll).

```tsx
// packages/ui/src/components/SOSButton/index.tsx
export interface SOSButtonProps {
  onPress: () => void
  /** Tamanho extra para facilitar toque com luva */
  size?: 'default' | 'large'
}
```

### `OficinaCard`
Card de resultado — exibe badge de parceira/verificada de forma clara.

```tsx
export interface OficinaCardProps {
  oficina: Oficina
  distanciaMetros: number
  onPress: () => void
  onLigar: () => void // abre discador nativo
}
```

### `SOSMapView`
Mapa centrado na localização atual com pins de oficinas e guinchos.
Reutiliza padrões de `docs/architecture/MAPLIBRE_GUIDE.md`.

---

## Checklist de implementação

- [ ] Tabelas `oficinas`, `guinchos`, `contatos_emergencia`, `acionamentos_sos`, `sos_tokens` criadas com RLS
- [ ] RPC `oficinas_proximas_sos` com índice espacial GIST
- [ ] Edge Function `verificar-oficinas` com cron semanal
- [ ] Botão SOS acessível na home em ≤ 2 toques
- [ ] Deep link para número de telefone (`tel:`)
- [ ] Compartilhamento de localização com link temporário (24h)
- [ ] Painel do parceiro: contagem de acionamentos e avaliações (Fase 2+)
- [ ] Analytics: log de acionamentos sem expor dados do usuário

---

## Restrições e decisões

- **Não rastrear geolocalização do usuário no log de acionamento** — apenas registrar que houve contato com a oficina
- **O link de localização SOS expira em 24h** e não pode ser renovado (segurança)
- **Máximo 3 contatos de emergência pessoais** por usuário
- **Raio de busca fixo em 10km** no MVP — não expor configuração ao usuário ainda
