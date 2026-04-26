# CURRENT_TASK.md — Tarefa Atual

---

**Tarefa atual:** Finalizar HERE Maps — corrigir linha da rota no mapa
**Módulo:** Radar
**Fase:** Fase 1.5 — Polimento e UX, item 9

## Critério de pronto
- [x] HERE API integrada no serviço de mapa (hereService.ts)
- [x] Incidentes HERE renderizados no mapa (IncidenteMarker)
- [ ] Navegação com rota funcional (polyline pendente)
- [ ] Testado em Android físico

## Contexto necessário
- `docs/modules/MODULE_RADAR.md` — ver seção "Estratégia de dados — modelo híbrido"
- `EXPO_PUBLIC_HERE_API_KEY` configurada em `.env.local`
- `apps/mobile/src/services/hereService.ts`
- `apps/mobile/app/(tabs)/radar.tsx`

## Pendências abertas
1. **Linha azul da rota não aparece no mapa** — GeoJSONSource/Layer configurado, polyline não renderiza
2. **Incidentes HERE retornam 404** — endpoint pode estar com formato errado
3. **Stack.Screen name="garagem"** — warning no _layout.tsx (deve ser removido)

## Possíveis causas da polyline
- GeoJSONSource não está recebendo as coordenadas corretamente
- Coordenadas no formato errado (espera `[lng, lat]`)
- LineLayer configurado incorretamente
- Ordem de renderização (z-index)

## Arquivos criados
- `src/services/hereService.ts` — Funções de API (incidentes, geocoding, routing)
- `src/hooks/useHereTraffic.ts` — Hook para buscar incidentes
- `src/hooks/useNavegacao.ts` — Hook para navegação com rota
- `src/components/IncidenteMarker/index.tsx` — Marcador de incidentes HERE
- `src/components/BuscaDestino/index.tsx` — Input de busca de endereço
- `src/components/CardNavegacao/index.tsx` — Card com info da rota

## Arquivos modificados
- `app/(tabs)/radar.tsx` — Integração de incidentes e navegação

---

## Histórico de tarefas concluídas

| Data | Tarefa | Arquivos principais |
|------|--------|---------------------|
| 26/04/26 | HERE Maps integration (incidentes + navegação) | hereService.ts, useHereTraffic.ts, useNavegacao.ts |
| 26/04/20 | HERE Maps integration (incidentes + navegação) | hereService.ts, useHereTraffic.ts, useNavegacao.ts |
| 26/04/18 | Home contextual + tab bar 3 tabs | HomeScreen, useHome.ts |
| 26/04/18 | Editar moto + upload de foto | EditarMotoScreen, storageService.ts |
| 26/04/18 | Cadastro de moto na Garagem + múltiplas motos | CadastrarMotoGaragemScreen, useGaragem.ts |
| 26/04/19 | Logo Automoto integrada (Login, Cadastro, Home) | assets/images/logo.png |
| 26/04/19 | Ícone da moto no mapa (PNG top-view) | MotoMarker |
| 26/04/19 | AlertaMarker com MaterialCommunityIcons | AlertaMarker, SheetDetalheAlerta |
| 26/04/19 | Confirmar/negar alertas + proteção duplicata | useDetalheAlerta.ts, verificar_alerta_duplicado RPC |
| 26/04/19 | Notificações push de proximidade (foreground) | notificationService.ts, useNotificacoesAlerta.ts |
| 26/04/19 | Onboarding tutorial (5 slides deslizantes) | OnboardingScreen, app/_layout.tsx |

## Status
`em progresso` — polyline da rota não renderiza
