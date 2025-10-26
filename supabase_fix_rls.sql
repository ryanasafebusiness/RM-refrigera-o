-- SQL para executar diretamente no Supabase Dashboard
-- Cole este código no SQL Editor do Supabase

-- 1. Criar função RPC para inserir fotos (contorna RLS)
CREATE OR REPLACE FUNCTION insert_order_photo(
  p_order_id TEXT,
  p_photo_url TEXT,
  p_photo_type TEXT,
  p_media_type TEXT DEFAULT 'image',
  p_duration_seconds INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.order_photos (
    order_id,
    photo_url,
    photo_type,
    media_type,
    duration_seconds
  ) VALUES (
    p_order_id,
    p_photo_url,
    p_photo_type,
    p_media_type,
    p_duration_seconds
  );
END;
$$;

-- 2. Corrigir políticas RLS para order_photos
DROP POLICY IF EXISTS "Technicians can insert photos for their orders" ON public.order_photos;
DROP POLICY IF EXISTS "Technicians can view photos of their orders" ON public.order_photos;
DROP POLICY IF EXISTS "Technicians can delete photos of their orders" ON public.order_photos;
DROP POLICY IF EXISTS "Authenticated users can insert photos" ON public.order_photos;
DROP POLICY IF EXISTS "Authenticated users can view photos" ON public.order_photos;
DROP POLICY IF EXISTS "Authenticated users can update photos" ON public.order_photos;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON public.order_photos;

-- Criar políticas mais permissivas
CREATE POLICY "Allow all authenticated users to manage photos"
  ON public.order_photos FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Corrigir políticas de storage
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON storage.objects;

-- Criar políticas de storage mais permissivas
CREATE POLICY "Allow authenticated users to upload to order-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'order-photos' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Allow authenticated users to view order-photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'order-photos' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Allow authenticated users to delete order-photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'order-photos' 
    AND auth.uid() IS NOT NULL
  );

-- 4. Verificar se RLS está habilitado
ALTER TABLE public.order_photos ENABLE ROW LEVEL SECURITY;
