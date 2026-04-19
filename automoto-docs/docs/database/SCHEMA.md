# SCHEMA.md — Schema do Banco de Dados

> Supabase · PostgreSQL 15 · PostGIS 3.x
> Para rodar migrações: `supabase db push`
> Para gerar tipos TS: `supabase gen types typescript --local > packages/shared/src/types/supabase.generated.ts`

---

## Setup inicial (rodar uma vez)

```sql
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Função utilitária para updated_at automático
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Tabelas

### `public.motos`

```sql
CREATE TABLE public.motos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  placa       VARCHAR(8) NOT NULL,
  modelo      VARCHAR(100) NOT NULL,
  marca       VARCHAR(100),
  ano         SMALLINT NOT NULL CHECK (ano >= 1970 AND ano <= EXTRACT(YEAR FROM NOW()) + 1),
  cor         VARCHAR(50),
  km_atual    INTEGER NOT NULL DEFAULT 0 CHECK (km_atual >= 0),
  foto_url    TEXT,
  ativa       BOOLEAN DEFAULT TRUE,   -- moto selecionada no momento
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, placa)
);

CREATE INDEX idx_motos_user_id ON public.motos(user_id);
ALTER TABLE public.motos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios veem apenas suas motos"
  ON public.motos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "usuarios criam suas motos"
  ON public.motos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "usuarios atualizam suas motos"
  ON public.motos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "usuarios deletam suas motos"
  ON public.motos FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER set_motos_updated_at
  BEFORE UPDATE ON public.motos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

---

### `public.manutencoes`

```sql
CREATE TABLE public.manutencoes (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  moto_id         UUID NOT NULL REFERENCES public.motos(id) ON DELETE CASCADE,
  tipo            VARCHAR(100) NOT NULL,   -- 'troca_oleo', 'corrente', 'pneu', etc.
  descricao       TEXT,
  km_no_momento   INTEGER NOT NULL,
  data_realizada  DATE NOT NULL,
  valor_pago      DECIMAL(10,2),
  oficina_nome    VARCHAR(200),
  foto_recibo_url TEXT,
  proxima_km      INTEGER,    -- km previsto para a próxima
  proximo_em      DATE,       -- data prevista para a próxima
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_manutencoes_moto_id ON public.manutencoes(moto_id);
CREATE INDEX idx_manutencoes_tipo ON public.manutencoes(tipo);
ALTER TABLE public.manutencoes ENABLE ROW LEVEL SECURITY;

-- Política via join com motos (usuário acessa só manutenções das suas motos)
CREATE POLICY "usuarios veem manutencoes de suas motos"
  ON public.manutencoes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.motos
      WHERE id = moto_id AND user_id = auth.uid()
    )
  );
-- Repetir para INSERT, UPDATE, DELETE com mesma lógica
```

---

### `public.mods`

```sql
CREATE TABLE public.mods (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  moto_id          UUID NOT NULL REFERENCES public.motos(id) ON DELETE CASCADE,
  nome             VARCHAR(200) NOT NULL,
  categoria        VARCHAR(50) NOT NULL
                   CHECK (categoria IN ('estetico','performance','seguranca','conforto','acessorio')),
  descricao        TEXT,
  data_instalacao  DATE,
  valor_investido  DECIMAL(10,2),
  instalador_nome  VARCHAR(200),
  instalador_contato VARCHAR(100),
  foto_antes_url   TEXT,
  foto_depois_url  TEXT,
  nota_pessoal     SMALLINT CHECK (nota_pessoal BETWEEN 1 AND 5),
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_mods_moto_id ON public.mods(moto_id);
ALTER TABLE public.mods ENABLE ROW LEVEL SECURITY;
-- Políticas: mesma lógica de join via motos
```

---

### `public.abastecimentos`

```sql
CREATE TABLE public.abastecimentos (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  moto_id       UUID NOT NULL REFERENCES public.motos(id) ON DELETE CASCADE,
  data          DATE NOT NULL,
  litros        DECIMAL(6,2) NOT NULL CHECK (litros > 0),
  valor_total   DECIMAL(8,2) NOT NULL CHECK (valor_total > 0),
  km_no_momento INTEGER NOT NULL,
  posto_nome    VARCHAR(200),
  posto_geom    GEOMETRY(POINT, 4326),   -- localização do posto
  km_por_litro  DECIMAL(6,2) GENERATED ALWAYS AS (
    -- calculado a partir do delta com abastecimento anterior (ver função RPC)
    NULL
  ) STORED,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_abastecimentos_moto_id ON public.abastecimentos(moto_id);
CREATE INDEX idx_abastecimentos_data ON public.abastecimentos(data);
ALTER TABLE public.abastecimentos ENABLE ROW LEVEL SECURITY;
```

---

### `public.alertas_via`

```sql
CREATE TYPE tipo_alerta_via AS ENUM (
  'oleo', 'areia', 'buraco', 'obra', 'enchente', 'acidente', 'outro'
);

CREATE TABLE public.alertas_via (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo            tipo_alerta_via NOT NULL,
  geom            GEOMETRY(POINT, 4326) NOT NULL,
  criado_por      UUID NOT NULL REFERENCES auth.users(id),
  descricao       TEXT,
  confirmacoes    SMALLINT DEFAULT 1,
  negacoes        SMALLINT DEFAULT 0,
  expira_em       TIMESTAMPTZ NOT NULL,
  ativo           BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índice espacial (obrigatório para performance de queries geoespaciais)
CREATE INDEX idx_alertas_via_geom ON public.alertas_via USING GIST(geom);
CREATE INDEX idx_alertas_via_ativo_expira ON public.alertas_via(ativo, expira_em);
ALTER TABLE public.alertas_via ENABLE ROW LEVEL SECURITY;

-- Alertas são públicos para leitura (todos usuários autenticados veem)
CREATE POLICY "usuarios autenticados veem alertas ativos"
  ON public.alertas_via FOR SELECT
  TO authenticated
  USING (ativo = TRUE AND expira_em > NOW());

CREATE POLICY "usuarios autenticados criam alertas"
  ON public.alertas_via FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = criado_por);
```

---

### `public.vagas`

```sql
CREATE TYPE tipo_vaga AS ENUM ('publica', 'privada', 'bolsao', 'parceiro');

CREATE TABLE public.vagas (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  geom                    GEOMETRY(POINT, 4326) NOT NULL,
  nome                    VARCHAR(200),
  tipo                    tipo_vaga NOT NULL,
  preco_hora              DECIMAL(6,2),
  coberta                 BOOLEAN DEFAULT FALSE,
  avaliacao_capacete      SMALLINT CHECK (avaliacao_capacete BETWEEN 1 AND 5),
  flag_extorsao           BOOLEAN DEFAULT FALSE,
  total_avaliacoes        INTEGER DEFAULT 0,
  media_avaliacao         DECIMAL(3,2),
  criado_por              UUID REFERENCES auth.users(id),
  verificada              BOOLEAN DEFAULT FALSE,
  foto_url                TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_vagas_geom ON public.vagas USING GIST(geom);
ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vagas sao publicas para leitura"
  ON public.vagas FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "usuarios criam vagas"
  ON public.vagas FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = criado_por);
```

---

### `public.furtos`

```sql
CREATE TYPE status_furto AS ENUM (
  'pendente_bo',     -- aguardando envio do B.O.
  'ativo',           -- B.O. enviado, alerta ativo
  'resolvido',       -- moto recuperada
  'expirado',        -- B.O. não enviado em 24h
  'falso_alerta'     -- identificado como falso
);

CREATE TABLE public.furtos (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES auth.users(id),
  moto_id             UUID NOT NULL REFERENCES public.motos(id),
  geom_ultima_loc     GEOMETRY(POINT, 4326),  -- última localização conhecida
  horario_ocorrencia  TIMESTAMPTZ,
  status              status_furto DEFAULT 'pendente_bo',
  bo_url              TEXT,                   -- foto do B.O. no Storage
  bo_enviado_em       TIMESTAMPTZ,
  total_avistamentos  INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_furtos_user_id ON public.furtos(user_id);
CREATE INDEX idx_furtos_status ON public.furtos(status);
CREATE INDEX idx_furtos_geom ON public.furtos USING GIST(geom_ultima_loc);
ALTER TABLE public.furtos ENABLE ROW LEVEL SECURITY;

-- Dono vê seus próprios furtos
CREATE POLICY "dono ve seus furtos"
  ON public.furtos FOR SELECT
  USING (auth.uid() = user_id);

-- Edge Function (service_role) acessa para disparar alertas
```

---

### `public.avistamentos`

```sql
CREATE TABLE public.avistamentos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  furto_id    UUID NOT NULL REFERENCES public.furtos(id) ON DELETE CASCADE,
  geom        GEOMETRY(POINT, 4326) NOT NULL,
  -- user_id não armazenado publicamente (privacidade do avistador)
  user_hash   TEXT NOT NULL,  -- hash do user_id para moderação interna
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_avistamentos_furto_id ON public.avistamentos(furto_id);
CREATE INDEX idx_avistamentos_geom ON public.avistamentos USING GIST(geom);
ALTER TABLE public.avistamentos ENABLE ROW LEVEL SECURITY;

-- Avistamentos visíveis apenas para o dono do furto (via furto_id)
CREATE POLICY "dono do furto ve avistamentos"
  ON public.avistamentos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.furtos
      WHERE id = furto_id AND user_id = auth.uid()
    )
  );
```

---

### `public.comboios`

```sql
CREATE TABLE public.comboios (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  criador_id  UUID NOT NULL REFERENCES auth.users(id),
  nome        VARCHAR(100) NOT NULL,
  destino     TEXT,
  ativo       BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.comboio_members (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comboio_id    UUID NOT NULL REFERENCES public.comboios(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id),
  nome_exibido  VARCHAR(100),
  geom          GEOMETRY(POINT, 4326),
  velocidade_kmh SMALLINT,
  ativo         BOOLEAN DEFAULT TRUE,
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comboio_id, user_id)
);

CREATE INDEX idx_comboio_members_comboio ON public.comboio_members(comboio_id);
-- Habilitar Realtime nesta tabela no dashboard do Supabase
ALTER TABLE public.comboio_members ENABLE ROW LEVEL SECURITY;

-- Membros de um comboio se veem mutuamente
CREATE POLICY "membros do comboio se veem"
  ON public.comboio_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.comboio_members cm
      WHERE cm.comboio_id = comboio_id AND cm.user_id = auth.uid()
    )
  );
```

---

### `public.push_tokens`

```sql
CREATE TABLE public.push_tokens (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  token       TEXT NOT NULL,
  plataforma  VARCHAR(10) CHECK (plataforma IN ('ios', 'android')),
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios gerenciam seu token"
  ON public.push_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## Funções RPC

### `alertas_proximos` — busca alertas num raio

```sql
CREATE OR REPLACE FUNCTION public.alertas_proximos(
  lat          DOUBLE PRECISION,
  lng          DOUBLE PRECISION,
  raio_metros  INTEGER DEFAULT 5000
)
RETURNS TABLE (
  id           UUID,
  tipo         tipo_alerta_via,
  lat          DOUBLE PRECISION,
  lng          DOUBLE PRECISION,
  confirmacoes SMALLINT,
  expira_em    TIMESTAMPTZ,
  distancia_m  DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    a.id,
    a.tipo,
    ST_Y(a.geom::geometry) AS lat,
    ST_X(a.geom::geometry) AS lng,
    a.confirmacoes,
    a.expira_em,
    ST_Distance(
      a.geom::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) AS distancia_m
  FROM public.alertas_via a
  WHERE
    a.ativo = TRUE
    AND a.expira_em > NOW()
    AND ST_DWithin(
      a.geom::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      raio_metros
    )
  ORDER BY distancia_m ASC;
$$;
```

### `usuarios_proximos_para_alerta` — usado pelo Raio Antifurto (Fase 3)

```sql
-- Retorna push_tokens de usuários ativos num raio
CREATE OR REPLACE FUNCTION public.usuarios_proximos_para_alerta(
  lat          DOUBLE PRECISION,
  lng          DOUBLE PRECISION,
  raio_metros  INTEGER DEFAULT 12000
)
RETURNS TABLE (token TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT pt.token
  FROM public.push_tokens pt
  JOIN public.comboio_members cm ON cm.user_id = pt.user_id
  WHERE
    cm.ativo = TRUE
    AND cm.atualizado_em > NOW() - INTERVAL '30 minutes'
    AND ST_DWithin(
      cm.geom::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      raio_metros
    );
$$;
```

### `ativar_moto` — define a moto ativa do usuário

```sql
-- Ativa uma moto específica e desativa as demais do mesmo usuário
-- Usado quando o usuário tem múltiplas motos e quer trocar a ativa
CREATE OR REPLACE FUNCTION public.ativar_moto(p_moto_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verifica se a moto pertence ao usuário autenticado
  IF NOT EXISTS (
    SELECT 1 FROM public.motos
    WHERE id = p_moto_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Moto não encontrada ou não pertence ao usuário';
  END IF;

  -- Desativa todas as motos do usuário
  UPDATE public.motos
  SET ativa = FALSE
  WHERE user_id = auth.uid();

  -- Ativa a moto especificada
  UPDATE public.motos
  SET ativa = TRUE
  WHERE id = p_moto_id;
END;
$$;
```

**Uso no cliente:**
```typescript
const { error } = await supabase.rpc('ativar_moto', { p_moto_id: motoId });
```

---

## Índices críticos para performance

```sql
-- Todos os índices espaciais (GIST) já estão nas tabelas acima.
-- Índices adicionais para queries frequentes:

-- Alertas ativos não expirados (query mais comum do Radar da Rua)
CREATE INDEX idx_alertas_ativos
  ON public.alertas_via(ativo, expira_em)
  WHERE ativo = TRUE;

-- Moto ativa do usuário (query de onboarding e home screen)
CREATE INDEX idx_moto_ativa
  ON public.motos(user_id, ativa)
  WHERE ativa = TRUE;

-- Última manutenção por tipo (query do dashboard de saúde)
CREATE INDEX idx_manutencoes_moto_tipo
  ON public.manutencoes(moto_id, tipo, data_realizada DESC);
```
