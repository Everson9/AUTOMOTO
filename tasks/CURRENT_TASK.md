# CURRENT_TASK.md — Tarefa Atual

---

## Fase 1.5, Item 7 — Notificações push básicas (alertas de proximidade)

### Objetivo
Implementar notificações push que alertam o usuário quando ele se aproxima de um alerta registrado por outro motociclista.

### Contexto atual
- Alertas já são exibidos no mapa via `AlertaMarker`
- Usuário pode reportar alertas via `SheetAlerta`
- Localização do usuário obtida via `expo-location`
- Supabase já configurado com tabela `alertas_via`

### Requisitos funcionais
1. Notificar quando usuário se aproxima de um alerta ativo (raio configurável, ex: 200m)
2. Notificação inclui tipo do alerta e distância
3. Usuário pode desativar notificações de alertas nas configurações
4. Notificação abre o app no mapa centrado no alerta

### Stack sugerida
- **Expo Notifications** — API de notificações locais
- **TaskManager** — background task para monitorar localização
- ** expo-location** — já instalado

### Arquivos a criar/modificar
- `src/hooks/useNotificacoesAlerta.ts` — Hook para gerenciar notificações
- `src/services/notificationService.ts` — Serviço de notificações locais
- `app/(tabs)/radar.tsx` — Integração do hook de notificações
- `src/screens/Configuracoes/ConfiguracoesScreen.tsx` — Toggle de notificações

### Fluxo de background
1. App registra background task para monitorar localização
2. Quando localização muda, verificar se há alertas próximos
3. Se houver alerta novo (não notificado antes), disparar notificação local
4. Usuário toca na notificação → app abre no alerta

### Desafios técnicos
- Background location task no Android/iOS
- Permissão de notificação
- Persistir alertas já notificados (AsyncStorage)
- Balancear frequência de verificação (bateria vs. utilidade)

### Critérios de pronto
- [ ] Usuário recebe notificação ao se aproximar de alerta
- [ ] Notificação mostra tipo e distância
- [ ] Toque na notificação abre o app
- [ ] Toggle para desativar notificações
- [ ] Performance adequada (não drena bateria)

### Status
`pendente` — aguardando início