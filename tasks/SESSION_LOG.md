# SESSION_LOG.md — Log de Sessões

---

## 2026-04-18 — Home Contextual

### Resumo
Criação da Home contextual como nova tela inicial do app, substituindo o mapa.

### Mudanças na navegação
- Tab bar expandida de 2 para 3 tabs: Home, Radar, Garagem
- `app/(tabs)/index.tsx` agora aponta para HomeScreen
- `app/(tabs)/radar.tsx` criado a partir do antigo index.tsx (mapa)

### Novos arquivos criados
- `src/components/AtalhoCard/index.tsx` — botão de atalho reutilizável
- `src/screens/Home/useHome.ts` — hook de dados da Home
- `src/screens/Home/HomeScreen.tsx` — tela Home contextual
- `app/(tabs)/index.tsx` — wrapper para HomeScreen

### Arquivos modificados
- `src/services/climaService.ts` — adicionada função `buscarClimaAtual()` com mapeamento de códigos WMO para descrições e emojis
- `app/(tabs)/_layout.tsx` — atualizado de 2 para 3 tabs
- `apps/mobile/src/screens/Login/index.tsx` — logo integrada (240x240)
- `apps/mobile/src/screens/Cadastro/index.tsx` — logo integrada (240x240)

### Features implementadas na Home
1. **Header**: logo 48x48 + saudação por horário + botão perfil com iniciais do usuário
2. **Card da moto ativa**: foto/ilustração SVG por tipo + modelo + placa + KM editável inline + badge "Em dia"
3. **Card de clima**: temperatura atual + condição meteorológica (Open-Meteo API)
4. **Alertas recentes**: lista horizontal dos 5 alertas mais próximos (até 5km)
5. **Grade de atalhos**: 6 botões em 2 colunas (2 funcionais, 4 "Em breve")
6. **Dica do dia**: array de 15 dicas, sorteada aleatoriamente a cada abertura

### Botões "Em breve"
- Iniciar Viagem → Alert "Em breve"
- Abastecimento → Alert "Em breve"
- Localizar Moto → Alert "Em breve"
- Manutenção → Alert "Em breve"

### Bug fix
- Corrigido cálculo das iniciais do usuário no ícone de perfil — agora usa `user_metadata.nome` corretamente e extrai até 2 caracteres maiúsculos

### Critérios de pronto atendidos
- [x] Tab bar com 3 tabs (Home, Radar, Garagem)
- [x] Home abre como tela inicial após login
- [x] Saudação com nome do usuário e horário
- [x] Card da moto ativa com KM editável
- [x] Card de clima com dados reais
- [x] Alertas recentes na região
- [x] Grade de atalhos funcionais
- [x] Dica do dia aleatória
- [x] Logo no header da Home