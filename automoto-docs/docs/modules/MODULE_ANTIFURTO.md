# MODULE_ANTIFURTO.md — Módulo: Raio Antifurto

> Fase do roadmap: **Fase 3** — não implementar antes da Fase 2 estar completa.
> É a feature mais complexa do projeto. Leia este arquivo inteiro antes de começar.

---

## O que é

Rede de vigilância passiva que transforma todos os usuários ativos em sensores anônimos para localizar motos roubadas. O dono aciona o alerta, outros usuários que avistarem a moto reportam a localização anonimamente.

---

## Princípio inegociável

> **NÃO PERSIGA. APENAS REPORTE.**
> Esta frase deve aparecer na UI em pelo menos 3 momentos distintos do fluxo.
> O app não é uma ferramenta de confronto — é de rastreamento passivo.

---

## Tabelas envolvidas

- `furtos` — ocorrências ativas
- `avistamentos` — reportes de localização
- `push_tokens` — para disparar alertas em massa
- RPC: `usuarios_proximos_para_alerta(lat, lng, raio_metros)`

---

## Fluxo completo

### Lado do dono (ativação)

```
1. Garagem → botão oculto "Moto Roubada" (em submenu para evitar acidente)
2. Formulário: placa (autopreenchida), cor, última localização (GPS atual ou manual), horário
3. Upload de foto da moto (obrigatório para ativar completamente)
4. Sistema cria registro com status = 'pendente_bo'
5. App mostra aviso: "Você tem 24h para enviar o B.O. — o alerta fica em modo reduzido até lá"
6. Upload do B.O.: foto da Delegacia Online ou delegacia física
7. Sistema valida e muda status para 'ativo'
8. Edge Function dispara push para usuários no raio
```

### Lado do avistador (reporte)

```
1. Recebe notificação silenciosa (sem som, badge discreto)
2. Notificação mostra: foto da moto, placa, cor
3. Botão na notificação: "Avistei" (sem abrir o app)
4. Sistema captura GPS automático + timestamp
5. Avistamento registrado anonimamente (user_hash, não user_id)
6. Dono recebe update no mapa
```

### Lado do dono (acompanhamento)

```
1. Mapa mostra pins dos avistamentos com timestamps
2. Linha conectando os pontos sugere rota de fuga
3. Botão "Compartilhar com autoridades" → gera link público por 24h
4. Botão "Moto recuperada" → encerra o alerta
```

---

## Edge Function: disparar alertas

```typescript
// apps/api/supabase/functions/disparar-alerta-furto/index.ts

serve(async (req) => {
  const { furtoId } = await req.json()

  // 1. Buscar dados do furto
  const { data: furto } = await supabase
    .from('furtos').select('*, motos(*)').eq('id', furtoId).single()

  if (furto.status !== 'ativo') {
    return new Response('Furto não está ativo', { status: 400 })
  }

  // 2. Buscar tokens de usuários no raio (PostGIS)
  const { data: tokens } = await supabase.rpc('usuarios_proximos_para_alerta', {
    lat: furto.geom_ultima_loc.y,
    lng: furto.geom_ultima_loc.x,
    raio_metros: 12000,
  })

  if (!tokens?.length) return new Response('Sem usuários no raio', { status: 200 })

  // 3. Disparar push em lotes de 100 (limite da Expo Push API)
  const lotes = chunk(tokens.map(t => t.token), 100)

  for (const lote of lotes) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lote.map(to => ({
        to,
        title: '🚨 Moto roubada próxima',
        body: `${furto.motos.modelo} ${furto.motos.cor} — placa ${furto.motos.placa}`,
        data: { tipo: 'furto', furtoId, foto: furto.motos.foto_url },
        sound: null,  // silencioso
        badge: 1,
      }))),
    })
  }

  return new Response(JSON.stringify({ enviados: tokens.length }), { status: 200 })
})
```

---

## Sistema de moderação

| Violação                        | Consequência automática                      |
|---------------------------------|----------------------------------------------|
| B.O. não enviado em 24h         | Status → `expirado`, alerta desativado       |
| 1º falso alerta identificado    | Suspensão da feature por 30 dias             |
| 2º falso alerta                 | Suspensão por 90 dias + revisão manual       |
| 3º falso alerta                 | Banimento permanente da feature              |
| >5 avistamentos impossíveis     | Alerta entra em `revisao_manual`             |

---

## Testes de aceitação (Fase 3)

- [ ] Alerta criado com status `pendente_bo` sem B.O.
- [ ] Push enviado para usuários no raio quando status muda para `ativo`
- [ ] Avistamento registra coordenada sem expor identidade
- [ ] Alerta expira automaticamente após 24h sem B.O.
- [ ] Link público de compartilhamento expira em 24h
- [ ] Frase anti-confronto aparece em 3 pontos do fluxo
