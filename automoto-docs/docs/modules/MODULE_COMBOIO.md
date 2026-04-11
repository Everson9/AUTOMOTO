# MODULE_COMBOIO.md — Módulo: Modo Comboio

> Fase do roadmap: **Fase 3**

---

## O que é

Sessões de viagem compartilhadas. Um grupo de motociclistas se vê no mapa em tempo real e recebe alerta se alguém parar repentinamente.

---

## Tabelas envolvidas

- `comboios` — sessões
- `comboio_members` — membros com localização (Realtime habilitado)

---

## Lógica crítica

### Throttle de GPS

Atualizar localização no banco a cada **10 segundos** (não a cada segundo).
Supabase Realtime tem limite de 200 conexões simultâneas no free tier.

```typescript
const INTERVALO_UPDATE_GPS_MS = 10_000

useEffect(() => {
  const interval = setInterval(async () => {
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
    
    await supabase.from('comboio_members').upsert({
      comboio_id: comboioId,
      user_id: userId,
      geom: `SRID=4326;POINT(${location.coords.longitude} ${location.coords.latitude})`,
      velocidade_kmh: Math.round((location.coords.speed ?? 0) * 3.6),
      atualizado_em: new Date().toISOString(),
    })
  }, INTERVALO_UPDATE_GPS_MS)

  return () => clearInterval(interval)
}, [comboioId])
```

### Detecção de parada suspeita

```typescript
// Parada: velocidade < 5km/h por mais de 3 minutos, fora de área urbana densa
const VELOCIDADE_PARADA_KMH = 5
const TEMPO_PARADA_SUSPEITA_MS = 3 * 60 * 1000

function detectarParadaSuspeita(historico: MemberUpdate[]): boolean {
  const recentes = historico.filter(
    (u) => Date.now() - new Date(u.atualizado_em).getTime() < TEMPO_PARADA_SUSPEITA_MS
  )
  return recentes.every((u) => (u.velocidade_kmh ?? 0) < VELOCIDADE_PARADA_KMH)
}
```

### Limite de membros

- MVP: máximo 20 participantes por sessão
- Validar no INSERT via policy ou trigger

---

## Testes de aceitação

- [ ] Criador gera link e compartilha por WhatsApp
- [ ] Participante que abre o link entra na sessão automaticamente
- [ ] Posições de todos os membros aparecem no mapa em ≤15s
- [ ] Alerta de parada suspeita enviado após 3 min de velocidade baixa
- [ ] Saída de membro remove o ícone do mapa dos outros
- [ ] Sessão encerrada pelo criador remove todos os membros
