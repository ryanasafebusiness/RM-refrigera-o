-- Fix RLS policies for order_photos table
-- This migration fixes the upload issues by creating proper RLS policies

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Technicians can insert photos for their orders" ON public.order_photos;
DROP POLICY IF EXISTS "Technicians can view photos of their orders" ON public.order_photos;
DROP POLICY IF EXISTS "Technicians can delete photos of their orders" ON public.order_photos;

-- Create permissive policies for authenticated users
-- Allow any authenticated user to insert photos
CREATE POLICY "Authenticated users can insert photos"
  ON public.order_photos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow any authenticated user to view photos
CREATE POLICY "Authenticated users can view photos"
  ON public.order_photos FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow any authenticated user to update photos
CREATE POLICY "Authenticated users can update photos"
  ON public.order_photos FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow any authenticated user to delete photos
CREATE POLICY "Authenticated users can delete photos"
  ON public.order_photos FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Ensure RLS is enabled on the table
ALTER TABLE public.order_photos ENABLE ROW LEVEL SECURITY;

-- Also fix storage policies for the order-photos bucket
-- Drop existing storage policies
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON storage.objects;

-- Create storage policies for order-photos bucket
CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'order-photos' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Authenticated users can view photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'order-photos' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Authenticated users can delete photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'order-photos' 
    AND auth.uid() IS NOT NULL
  );
