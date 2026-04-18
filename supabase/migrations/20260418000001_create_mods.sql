-- supabase/migrations/20260418000001_create_mods.sql
--
-- Cria a tabela mods para customizações da moto.
-- Each user can only access their own mods via RLS.

-- CreateTable
CREATE TABLE IF NOT EXISTS public.mods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  moto_id UUID NOT NULL REFERENCES public.motos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  data_instalacao DATE,
  valor_investido NUMERIC(10, 2),
  categoria TEXT NOT NULL DEFAULT 'acessorio',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT categoria_check CHECK (categoria IN ('estetico', 'performance', 'seguranca', 'conforto', 'acessorio'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mods_user_id ON public.mods(user_id);
CREATE INDEX IF NOT EXISTS idx_mods_moto_id ON public.mods(moto_id);
CREATE INDEX IF NOT EXISTS idx_mods_created_at ON public.mods(created_at DESC);

-- Enable RLS
ALTER TABLE public.mods ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own mods

-- SELECT policy
CREATE POLICY "Users can view own mods"
  ON public.mods
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "Users can insert own mods"
  ON public.mods
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "Users can update own mods"
  ON public.mods
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY "Users can delete own mods"
  ON public.mods
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mods_updated_at
  BEFORE UPDATE ON public.mods
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Comment
COMMENT ON TABLE public.mods IS 'Customizações/modificações da moto do usuário';
COMMENT ON COLUMN public.mods.categoria IS 'Categoria: estetico, performance, seguranca, conforto, acessorio';