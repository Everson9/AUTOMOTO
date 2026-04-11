-- supabase/migrations/20260101000002_create_users.sql

-- A tabela 'users' já é criada automaticamente pelo Auth do Supabase
-- Esta migração cria trigger para lidar com novos usuários autenticados

-- Função para criação automática de perfil de usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil quando um novo usuário se autenticar
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar tabela de perfis para complementar informações do usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  nome TEXT,
  telefone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índice para busca por email
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Habilitar RLS para a tabela de perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios dados
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Política para permitir que usuários atualizem apenas seu próprio perfil
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger para updated_at automático na tabela de perfis
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();