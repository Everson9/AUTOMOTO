-- Migration: RPCs para alertas via
-- Data: 2026-04-19

-- RPC para verificar se existe alerta duplicado do mesmo tipo em um raio
CREATE OR REPLACE FUNCTION verificar_alerta_duplicado(
  p_tipo TEXT,
  p_lat FLOAT8,
  p_lng FLOAT8,
  p_raio_metros FLOAT8 DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  tipo TEXT,
  confirmacoes INTEGER,
  negacoes INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.tipo::TEXT,
    COALESCE(a.confirmacoes, 0) as confirmacoes,
    COALESCE(a.negacoes, 0) as negacoes
  FROM alertas_via a
  WHERE
    a.tipo = p_tipo::tipo_alerta
    AND a.ativo = TRUE
    AND a.expira_em > NOW()
    AND ST_DWithin(
      a.geom::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_raio_metros
    )
  LIMIT 1;
END;
$$;

-- RPC para incrementar confirmações de um alerta
CREATE OR REPLACE FUNCTION incrementar_confirmacoes(alerta_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE alertas_via
  SET confirmacoes = COALESCE(confirmacoes, 0) + 1
  WHERE id = alerta_id;
END;
$$;

-- RPC para incrementar negações de um alerta
CREATE OR REPLACE FUNCTION incrementar_negacoes(alerta_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE alertas_via
  SET negacoes = COALESCE(negacoes, 0) + 1
  WHERE id = alerta_id;
END;
$$;

-- Adicionar coluna negacoes se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'alertas_via' AND column_name = 'negacoes'
  ) THEN
    ALTER TABLE alertas_via ADD COLUMN negacoes INTEGER DEFAULT 0;
  END IF;
END $$;

-- Adicionar coluna ativo se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'alertas_via' AND column_name = 'ativo'
  ) THEN
    ALTER TABLE alertas_via ADD COLUMN ativo BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Index para consultas de proximidade
CREATE INDEX IF NOT EXISTS idx_alertas_via_geom ON alertas_via USING GIST (geom);