-- supabase/migrations/20260417193000_create_assaltos_heatmap_rpc.sql
-- Create RPC function to fetch assault alerts for heatmap with extracted coordinates

CREATE OR REPLACE FUNCTION public.assaltos_para_heatmap()
RETURNS TABLE (
  id          UUID,
  lat         DOUBLE PRECISION,
  lng         DOUBLE PRECISION,
  created_at  TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT
    a.id,
    extensions.ST_Y(a.geom) AS lat,
    extensions.ST_X(a.geom) AS lng,
    a.created_at
  FROM public.alertas_via a
  WHERE
    a.tipo = 'assalto'
    AND a.ativo = TRUE
    AND a.expira_em > NOW()
  ORDER BY a.created_at DESC;
$$;