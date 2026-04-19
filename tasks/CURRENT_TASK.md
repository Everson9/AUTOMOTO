# CURRENT_TASK.md — Tarefa Atual

---

## Fase 1.5, Item 6 — Ícones SVG customizados por tipo de alerta

### Objetivo
Substituir os emojis atuais dos alertas no mapa por ícones SVG customizados para cada tipo de alerta.

### Contexto atual
- Os alertas são exibidos com emojis: `🛢️` (óleo), `🏖️` (areia), `🕳️` (buraco), etc.
- Mapa renderiza via `Marker` do MapLibre v11 com `lngLat`
- Componente está em `app/(tabs)/radar.tsx` (linhas 198-224)

### Tipos de alerta
| Tipo | Emoji atual | SVG sugerido |
|------|------------|--------------|
| oleo | 🛢️ | Gota de óleo |
| areia | 🏖️ | Montanha de areia |
| buraco | 🕳️ | Buraco na rua |
| obra | 🚧 | Cone de obra |
| enchente | 🌊 | Ondas de água |
| acidente | 💥 | Carro batido |
| assalto | 🚨 | Sirene/alerta |
| outro | ❓ | Interrogação |

### Arquivos principais
- `app/(tabs)/radar.tsx` — renderização dos markers de alerta
- `src/screens/Mapa/useMapa.ts` — hook que retorna `alertas`
- `src/components/` — criar novo componente `AlertaIcon/`

### Requisitos
1. [ ] Criar SVGs para cada tipo de alerta
2. [ ] Componente `AlertaIcon` com prop `tipo`
3. [ ] Substituir emojis pelos SVGs no mapa
4. [ ] Manter tamanho consistente (~32px)
5. [ ] Cores distintas por tipo para fácil identificação

### Critérios de pronto
- [ ] Cada tipo de alerta tem seu ícone SVG
- [ ] Ícones são visíveis e distintos no mapa
- [ ] Performance mantida

### Status
`pendente` — aguardando início