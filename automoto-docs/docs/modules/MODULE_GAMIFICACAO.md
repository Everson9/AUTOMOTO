# MODULE_GAMIFICACAO.md — Módulo: Gamificação e Comunidade

> Leia este arquivo quando for trabalhar em pontos, rankings ou badges de usuário.
> Fase do roadmap: **Fase 2 — Retenção e Utilidade Diária**

---

## O que é

Sistema leve de recompensas por contribuição comunitária. O objetivo não é criar um jogo — é aumentar a frequência de abertura do app e a qualidade dos dados colaborativos (alertas, vagas, avistamentos).

O título de maior prestígio é **Guardião da Rua**: dado ao usuário que mais contribuiu na semana em sua região.

---

## Telas

| Tela                  | Rota de navegação         | Fase |
|-----------------------|--------------------------|------|
| `RankingScreen`       | `/comunidade/ranking`    | 2    |
| `MeuPerfilScreen`     | `/comunidade/perfil`     | 2    |
| `BadgesScreen`        | `/comunidade/badges`     | 2    |

---

## Dados e tabelas envolvidas

- `pontos_usuario` — saldo atual e histórico de ganhos
- `badges_usuario` — badges conquistados com data
- `ranking_semanal` — snapshot calculado semanalmente (desnormalizado para performance)

Schema completo: `docs/database/SCHEMA.md`

---

## Lógica de pontos

### Tabela de eventos que geram pontos

| Evento                              | Pontos | Observação                                      |
|-------------------------------------|--------|-------------------------------------------------|
| Reportar alerta da via              | +5     | Somente se não for filtrado como duplicata       |
| Alerta confirmado por outro usuário | +3     | Bônus por qualidade (máx. +15 por alerta)        |
| Reportar vaga de estacionamento     | +8     | Sem duplicata em raio de 50m                     |
| Avistamento de moto roubada         | +10    | Somente se o furto estiver ativo com B.O.        |
| Confirmar alerta de outro usuário   | +2     | Limitado a 10 confirmações por dia               |
| Participar de comboio               | +5     | Por sessão concluída (mín. 30 min)               |
| Cadastrar moto com foto             | +20    | Único, no primeiro cadastro                      |
| Gerar Dossiê de Procedência         | +15    | Por geração (free ou paga)                       |
| Primeira revisão do mês registrada  | +10    | Incentivo à manutenção em dia                    |

### Penalizações

| Evento                              | Penalidade |
|-------------------------------------|------------|
| Alerta marcado como falso           | -10        |
| Alerta expirado sem nenhuma confirmação | -2     |
| Falso alerta de furto (confirmado)  | -50 + suspensão |

---

## Cálculo do ranking semanal

O ranking é calculado todo domingo às 23h59 via Edge Function (`calcular-ranking`).

```typescript
// apps/api/supabase/functions/calcular-ranking/index.ts

// Lógica simplificada do ranking
async function calcularRankingSemanal(supabase: SupabaseClient) {
  const inicioSemana = getInicioSemana() // domingo 00:00

  // Somar pontos ganhos na semana atual por usuário e região
  const { data: pontuacoes } = await supabase
    .from('pontos_usuario')
    .select('user_id, pontos, regiao_geom')
    .gte('ganho_em', inicioSemana)

  // Agrupar por região (geohash nível 5 ≈ 5km²)
  const porRegiao = agruparPorRegiao(pontuacoes)

  // Salvar snapshot em ranking_semanal (truncar anterior)
  await supabase.from('ranking_semanal').upsert(
    porRegiao.map((entry) => ({
      user_id: entry.userId,
      semana: inicioSemana,
      regiao_geohash: entry.geohash,
      pontos_semana: entry.total,
      posicao: entry.posicao,
    }))
  )

  // Conceder badge "Guardião da Rua" ao #1 de cada região
  await concederBadgeGuardiao(supabase, porRegiao)
}
```

### Ranking por região, não global

O ranking é local — o usuário disputa apenas com motociclistas da sua região (geohash nível 5, ~5km²). Isso torna a competição viável para qualquer usuário, não só os de cidades grandes.

```typescript
// Ao exibir o ranking, buscar a região do usuário atual
async function buscarRankingLocal(userId: string) {
  const localizacaoAtual = await getLocalizacaoAtual()
  const geohash = encodeGeohash(localizacaoAtual.lat, localizacaoAtual.lng, 5)

  const { data } = await supabase
    .from('ranking_semanal')
    .select('posicao, pontos_semana, users(nome, foto_url)')
    .eq('semana', getInicioSemana())
    .eq('regiao_geohash', geohash)
    .order('posicao', { ascending: true })
    .limit(20)

  return data
}
```

---

## Sistema de badges

### Badges disponíveis no MVP

| Badge              | Critério                                          | Tipo       |
|--------------------|---------------------------------------------------|------------|
| 🛡️ Guardião da Rua | #1 no ranking semanal da região                   | Semanal    |
| 🔍 Olho Vivo       | 10 alertas reportados sem penalização             | Permanente |
| 🏁 Maratonista     | Participou de 5 comboios                          | Permanente |
| 🔧 Mecânico Rigoroso| 6 manutenções registradas em sequência sem atraso | Permanente |
| 🆘 Anjo da Guarda  | 3 avistamentos de motos roubadas confirmados      | Permanente |
| ⭐ Fundador        | Cadastrou-se nos primeiros 1.000 usuários         | Permanente |

### Concessão de badge

```typescript
async function concederBadge(userId: string, badgeSlug: string) {
  // Idempotente — upsert ignora se já tiver
  await supabase.from('badges_usuario').upsert(
    { user_id: userId, badge_slug: badgeSlug, conquistado_em: new Date().toISOString() },
    { onConflict: 'user_id,badge_slug', ignoreDuplicates: true }
  )
}
```

Badges são verificados de forma assíncrona via trigger de banco ou Edge Function — nunca bloqueiam a ação do usuário.

---

## UX e componentes

### Princípios de UX da gamificação

- **Não interromper o fluxo principal** — pontos aparecem como toast discreto após a ação, nunca como modal bloqueante
- **Feedback imediato** — usuário vê os pontos sendo somados em ≤ 1 segundo após o reporte
- **Não viciar** — o app não deve enviar push de "você está perdendo pontos". Gamificação é positiva apenas.

### `PontosToast`

Aparece após qualquer ação que gera pontos. Deve desaparecer sozinho em 2 segundos.

```tsx
export interface PontosToastProps {
  pontos: number  // ex: +5
  motivo: string  // ex: "Alerta reportado!"
}
```

### `RankingCard`

Exibe a posição atual do usuário e os top 3 da região.

```tsx
export interface RankingCardProps {
  posicaoAtual: number
  totalParticipantes: number
  topTres: { nome: string; fotoUrl?: string; pontos: number }[]
}
```

### `BadgeGrid`

Grade de badges. Badges não conquistados aparecem em escala de cinza com cadeado.

```tsx
export interface BadgeGridProps {
  badges: { slug: string; conquistado: boolean; conquistadoEm?: string }[]
}
```

---

## Checklist de implementação

- [ ] Tabelas `pontos_usuario`, `badges_usuario`, `ranking_semanal` com RLS
- [ ] Trigger de banco para somar pontos ao inserir em `alertas_via`, `avistamentos`, etc.
- [ ] Edge Function `calcular-ranking` com cron domingo 23h59
- [ ] Edge Function `verificar-badges` chamada após cada evento relevante
- [ ] `PontosToast` no fluxo de reporte de alerta (testar não bloquear mapa)
- [ ] `RankingScreen` com atualização semanal
- [ ] `BadgesScreen` com estado conquistado/bloqueado
- [ ] Push de notificação SOMENTE quando o usuário conquista Guardião da Rua (positivo, não ansioso)

---

## Decisões

- **Sem loja de recompensas no MVP** — pontos são prestígio, não moeda
- **Ranking semanal, não cumulativo** — todo usuário começa zerado na segunda-feira, dando chance a novatos
- **Região por geohash** — não expor a localização exata do usuário no ranking público
- **Sem leaderboard global** — evitar que poucos usuários de grandes centros dominem e desmotivem o resto
