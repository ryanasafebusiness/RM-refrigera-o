-- Migração adaptada para Neon (sem Supabase Auth)
-- Esta versão cria as tabelas sem dependências do Supabase

-- Criar extensão para UUID (já vem no Neon, mas garantimos)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de usuários própria (substitui auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Criar tabela de perfis de técnicos
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Criar tabela de ordens de serviço
CREATE TABLE IF NOT EXISTS public.service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_number SERIAL UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Andamento', 'Concluída', 'Cancelada')),
  start_datetime TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completion_datetime TIMESTAMP WITH TIME ZONE,
  technician_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  client_name TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  service_description TEXT,
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Criar tabela de fotos/vídeos das ordens
CREATE TABLE IF NOT EXISTS public.order_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('problem', 'solution')),
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  duration_seconds INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Criar tabela de peças utilizadas
CREATE TABLE IF NOT EXISTS public.order_parts_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Criar tabela de peças substituídas
CREATE TABLE IF NOT EXISTS public.order_parts_replaced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
  old_part TEXT NOT NULL,
  new_part TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS public.order_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
  signature_data TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Criar trigger para atualizar updated_at em service_orders
DROP TRIGGER IF EXISTS update_service_orders_updated_at ON public.service_orders;
CREATE TRIGGER update_service_orders_updated_at
  BEFORE UPDATE ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Criar trigger para atualizar updated_at em users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Comentários nas tabelas
COMMENT ON TABLE public.users IS 'Usuários do sistema (substitui auth.users do Supabase)';
COMMENT ON TABLE public.profiles IS 'Perfis dos técnicos';
COMMENT ON TABLE public.service_orders IS 'Ordens de serviço';
COMMENT ON TABLE public.order_photos IS 'Fotos e vídeos das ordens de serviço';
COMMENT ON TABLE public.order_parts_used IS 'Peças utilizadas nas ordens';
COMMENT ON TABLE public.order_parts_replaced IS 'Peças substituídas nas ordens';
COMMENT ON TABLE public.order_signatures IS 'Assinaturas digitais dos clientes';

