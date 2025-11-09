-- Fix RLS policy for order_photos to allow direct insertion
DROP POLICY IF EXISTS "Technicians can insert photos for their orders" ON public.order_photos;

CREATE POLICY "Technicians can insert photos"
  ON public.order_photos FOR INSERT
  WITH CHECK (true);

-- Update order_photos table to support videos
ALTER TABLE public.order_photos 
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video'));

ALTER TABLE public.order_photos 
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Rename the table to be more generic (optional, keeping for backward compatibility)
COMMENT ON TABLE public.order_photos IS 'Stores both images and videos for service orders';

-- Update storage bucket to accept videos
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'video/mp4', 'video/quicktime', 'video/webm']
WHERE id = 'order-photos';