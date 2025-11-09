-- Fix DELETE policy for service_orders
-- Allow all authenticated users to delete orders for now
-- This is a more permissive policy for easier testing

DROP POLICY IF EXISTS "Technicians can delete their own orders" ON public.service_orders;

-- Create a more permissive delete policy
CREATE POLICY "Authenticated users can delete orders"
  ON public.service_orders FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Alternative: Only the technician who created the order can delete it
-- Uncomment this if you want more restrictive deletion
-- CREATE POLICY "Technicians can delete their own orders"
--   ON public.service_orders FOR DELETE
--   USING (auth.uid() = technician_id);
