# SESSION_LOG.md — Histórico de Sessões

## [2026-04-11] — Sessão 1

### O que foi feito
- Criada a estrutura do monorepo Turborepo com apps/ (mobile e api), packages/ (shared, ui, config)
- Criado o app Expo em apps/mobile com as dependências do MapLibre e Expo Dev Client
- Configurado o cliente Supabase com @supabase/supabase-js e AsyncStorage
- Criado o arquivo .env.local com as variáveis do Supabase
- Implementada a tela do mapa com MapLibreGL.MapView exibindo tiles do OpenFreeMap e pin na localização atual
- Criados os arquivos de migração SQL iniciais para setup, usuários e motos

### Decisões tomadas
- Utilizar @react-native-async-storage/async-storage como storage customizado para o Supabase
- Utilizar PointAnnotation para exibir o pin na localização atual no mapa
- Adicionar permissões de localização no app.json para iOS e Android

### Pendências / o que não foi concluído
- Obter a chave ANON_KEY real do Supabase para substituir o placeholder
- Testar o funcionamento completo no dispositivo Android físico

### Próximo passo recomendado
Conectar o dispositivo Android físico e testar o funcionamento do mapa com o pin na localização atual, conectado ao Supabase.