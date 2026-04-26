-- supabase/migrations/20260101000003_create_motos.sql

-- 1. Criar tabela
CREATE TABLE IF NOT EXISTS public.motos (
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

-- 2. Índices
CREATE INDEX idx_motos_user_id ON public.motos(user_id);

-- 3. RLS (Row Level Security) — SEMPRE habilitar
ALTER TABLE public.motos ENABLE ROW LEVEL SECURITY;

-- 4. Políticas
CREATE POLICY "usuarios veem apenas suas motos"
  ON public.motos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "usuarios criam suas motos"
  ON public.motos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usuarios atualizam suas motos"
  ON public.motos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usuarios deletam suas motos"
  ON public.motos FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Trigger para updated_at automático
CREATE TRIGGER set_motos_updated_at
  BEFORE UPDATE ON public.motos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();