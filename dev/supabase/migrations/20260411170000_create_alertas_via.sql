-- supabase/migrations/20260411170000_create_alertas_via.sql

-- Garantir que o PostGIS está acessível
SET search_path TO public, extensions;

-- Create enum type for alert types
CREATE TYPE tipo_alerta_via AS ENUM (
  'oleo', 'areia', 'buraco', 'obra', 'enchente', 'acidente', 'outro'
);

-- Create the alertas_via table
CREATE TABLE IF NOT EXISTS public.alertas_via (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo            tipo_alerta_via NOT NULL,
  geom            extensions.geometry(POINT, 4326) NOT NULL,
  criado_por      UUID NOT NULL REFERENCES auth.users(id),
  descricao       TEXT,
  confirmacoes    SMALLINT DEFAULT 1,
  negacoes        SMALLINT DEFAULT 0,
  expira_em       TIMESTAMPTZ NOT NULL,
  ativo           BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX idx_alertas_via_geom ON public.alertas_via USING GIST(geom);
CREATE INDEX idx_alertas_via_ativo_expira ON public.alertas_via(ativo, expira_em);

-- Enable Row Level Security
ALTER TABLE public.alertas_via ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "usuarios_autenticados_veem_alertas_ativos"
  ON public.alertas_via FOR SELECT
  TO authenticated
  USING (ativo = TRUE AND expira_em > NOW());

CREATE POLICY "usuarios_autenticados_criam_alertas"
  ON public.alertas_via FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = criado_por);

-- Create the RPC function for nearby alerts
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
SET search_path = public, extensions
AS $$
  SELECT
    a.id,
    a.tipo,
    extensions.ST_Y(a.geom) AS lat,
    extensions.ST_X(a.geom) AS lng,
    a.confirmacoes,
    a.expira_em,
    extensions.ST_Distance(
      a.geom::extensions.geography,
      extensions.ST_SetSRID(extensions.ST_MakePoint(lng, lat), 4326)::extensions.geography
    ) AS distancia_m
  FROM public.alertas_via a
  WHERE
    a.ativo = TRUE
    AND a.expira_em > NOW()
    AND extensions.ST_DWithin(
      a.geom::extensions.geography,
      extensions.ST_SetSRID(extensions.ST_MakePoint(lng, lat), 4326)::extensions.geography,
      raio_metros
    )
  ORDER BY distancia_m ASC;
$$;

-- Create critical index for active non-expired alerts
CREATE INDEX idx_alertas_ativos
  ON public.alertas_via(ativo, expira_em)
  WHERE ativo = TRUE;