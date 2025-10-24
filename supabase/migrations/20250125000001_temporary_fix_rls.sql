-- Temporary fix: Allow all authenticated users to insert service orders
-- This is a temporary solution to test the functionality

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Technicians can create orders" ON public.service_orders;

-- Create a more permissive policy for testing
CREATE POLICY "Authenticated users can create orders"
  ON public.service_orders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Also allow viewing all orders for dashboard
DROP POLICY IF EXISTS "Technicians can view their own orders" ON public.service_orders;

CREATE POLICY "Authenticated users can view all orders"
  ON public.service_orders FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow updates for all authenticated users
DROP POLICY IF EXISTS "Technicians can update their own orders" ON public.service_orders;

CREATE POLICY "Authenticated users can update orders"
  ON public.service_orders FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
