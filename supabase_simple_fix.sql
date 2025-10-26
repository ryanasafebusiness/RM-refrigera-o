-- SOLUÇÃO SIMPLES PARA CORRIGIR RLS
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Desabilitar RLS temporariamente na tabela order_photos
ALTER TABLE public.order_photos DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Technicians can insert photos for their orders" ON public.order_photos;
DROP POLICY IF EXISTS "Technicians can view photos of their orders" ON public.order_photos;
DROP POLICY IF EXISTS "Technicians can delete photos of their orders" ON public.order_photos;
DROP POLICY IF EXISTS "Authenticated users can insert photos" ON public.order_photos;
DROP POLICY IF EXISTS "Authenticated users can view photos" ON public.order_photos;
DROP POLICY IF EXISTS "Authenticated users can update photos" ON public.order_photos;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON public.order_photos;
DROP POLICY IF EXISTS "Allow all authenticated users to manage photos" ON public.order_photos;

-- 3. Corrigir políticas de storage
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to order-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view order-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete order-photos" ON storage.objects;

-- 4. Criar políticas de storage simples
CREATE POLICY "Allow authenticated uploads to order-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'order-photos' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Allow authenticated access to order-photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'order-photos' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Allow authenticated deletion from order-photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'order-photos' 
    AND auth.uid() IS NOT NULL
  );

-- 5. Verificar se a tabela existe e tem as colunas corretas
-- Se der erro, execute primeiro:
-- ALTER TABLE public.order_photos ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image';
-- ALTER TABLE public.order_photos ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
