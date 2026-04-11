# DECISIONS.md — Registro de Decisões de Arquitetura (ADR)

> Decisões já tomadas. Não reabrir sem motivo forte.
> Formato: contexto → decisão → consequências.

---

## ADR-001: MapLibre + OpenFreeMap em vez de Mapbox

**Status:** Aceito  
**Data:** 2025

**Contexto:**  
O projeto tem orçamento zero no MVP. Mapbox cobra a partir de 50k requests/mês. MapLibre é um fork OSS do Mapbox GL com API idêntica.

**Decisão:**  
Usar `@maplibre/maplibre-react-native` com tiles do OpenFreeMap (gratuito, sem limite).

**Consequências:**  
- ✅ Zero custo no MVP
- ✅ Migração para Mapbox é trocar uma URL de tile — sem reescrita de componentes
- ⚠️ Não funciona no Expo Go — exige Dev Client (EAS Build ou `npx expo run:android`)
- ⚠️ Tiles do OpenFreeMap podem ter latência maior fora dos EUA em horários de pico

---

## ADR-002: Supabase como backend completo (sem Firebase)

**Status:** Aceito  
**Data:** 2025

**Contexto:**  
Precisávamos de: banco relacional com PostGIS (queries geoespaciais), auth, storage, realtime e funções serverless. Firebase não tem SQL nativo nem PostGIS.

**Decisão:**  
Supabase resolve tudo em um produto. Free tier: 500MB PG, 1GB storage, 200 conexões realtime, 500k Edge Function calls/mês.

**Consequências:**  
- ✅ PostGIS nativo para Raio Antifurto e heatmaps
- ✅ Tipos TypeScript gerados automaticamente do schema
- ✅ RLS (Row Level Security) embutido
- ⚠️ Projetos inativos são pausados após 7 dias no free tier — acessar manualmente durante desenvolvimento

---

## ADR-003: Turborepo Monorepo

**Status:** Aceito  
**Data:** 2025

**Contexto:**  
App mobile e Edge Functions compartilham tipos, schemas de validação e utilitários. Sem monorepo, haveria duplicação e divergência de tipos.

**Decisão:**  
Turborepo com workspaces pnpm. `packages/shared` contém tipos e utils compartilhados.

**Consequências:**  
- ✅ Um único `pnpm install` instala tudo
- ✅ Tipos consistentes entre frontend e backend
- ✅ ESLint e TSConfig unificados
- ⚠️ Curva inicial de configuração maior do que um projeto simples

---

## ADR-004: PDF gerado on-device com expo-print

**Status:** Aceito  
**Data:** 2025

**Contexto:**  
Geração de PDF server-side (Puppeteer, WeasyPrint) exige servidor pago. O Dossiê de Procedência é gerado sob demanda por um usuário específico — não há ganho em processar no servidor.

**Decisão:**  
`expo-print` renderiza HTML → PDF no próprio dispositivo do usuário. O arquivo é salvo no Storage do Supabase após geração.

**Consequências:**  
- ✅ Zero custo de servidor
- ✅ Geração offline possível (exceto o upload final)
- ⚠️ Performance depende do dispositivo do usuário (aceitável para uso esporádico)
- ⚠️ Fontes customizadas no PDF precisam ser carregadas via URL (limitação do expo-print)

---

## ADR-005: Open-Meteo para clima (sem OpenWeatherMap)

**Status:** Aceito  
**Data:** 2025

**Contexto:**  
OpenWeatherMap free tier limita 1.000 calls/dia e exige API key. Open-Meteo é completamente gratuito, sem API key, com dados equivalentes ou melhores para previsão horária.

**Decisão:**  
Open-Meteo com endpoint `/v1/forecast` para previsão horária de precipitação.

**Consequências:**  
- ✅ Zero custo, sem limite razoável
- ✅ Sem API key para gerenciar
- ⚠️ Dados podem ser menos precisos em microregiões brasileiras específicas (aceitável para MVP)

---

## ADR-006: Autenticação por email no MVP (SMS na Fase 2)

**Status:** Aceito  
**Data:** 2025

**Contexto:**  
Autenticação por telefone/SMS é mais natural para o público brasileiro de motociclistas. Porém, SMS via Twilio tem custo por mensagem e setup mais complexo.

**Decisão:**  
MVP começa com auth por email (zero custo, zero configuração). Migra para SMS/WhatsApp na Fase 2 quando houver receita para cobrir o custo de SMS.

**Consequências:**  
- ✅ MVP mais rápido de implementar
- ⚠️ Conversão de onboarding menor que com SMS (aceitável para validação inicial)

---

## ADR-007: Raio Antifurto apenas na Fase 3

**Status:** Aceito  
**Data:** 2025

**Contexto:**  
O Raio Antifurto é a feature mais complexa: requer query PostGIS eficiente em escala, Edge Function sem timeout, sistema de moderação com B.O., e cuidado legal (não pode incentivar confronto).

**Decisão:**  
Desenvolvida apenas na Fase 3, depois que a base de usuários e a infraestrutura estiverem validadas.

**Consequências:**  
- ✅ MVP mais simples e entregável mais rápido
- ✅ Tempo para design cuidadoso do sistema de moderação
- ⚠️ Feature de maior impacto social fica para depois — mas é necessário ter usuários suficientes para ela funcionar de qualquer forma

---

## ADR-008: Nenhuma persistência de identidade em reportes comunitários

**Status:** Aceito  
**Data:** 2025

**Contexto:**  
Reportes de assalto, alertas da via e avistamentos de furto são mais confiáveis se o usuário não se preocupa em ser identificado. Mas precisamos de mecanismo anti-abuso.

**Decisão:**  
Armazenar apenas `user_id` internamente (para moderação/banimento), mas nunca expor a identidade do reporter para outros usuários. O `user_id` é hasheado antes de qualquer log público.

**Consequências:**  
- ✅ Maior volume de reportes (sem medo de exposição)
- ✅ Proteção de privacidade (LGPD)
- ⚠️ Mais difícil rastrear padrões de abuso (mitigado pelo hash interno)
