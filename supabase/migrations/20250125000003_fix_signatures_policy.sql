-- Fix RLS policy for order_signatures
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Technicians can manage signatures of their orders" ON public.order_signatures;

-- Create more permissive policy for signatures
-- Allow any authenticated user to insert/update signatures
CREATE POLICY "Authenticated users can manage signatures"
  ON public.order_signatures FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
