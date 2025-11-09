-- Fix RLS policies for service_orders table
-- Drop existing policies
DROP POLICY IF EXISTS "Technicians can view their own orders" ON public.service_orders;
DROP POLICY IF EXISTS "Technicians can create orders" ON public.service_orders;
DROP POLICY IF EXISTS "Technicians can update their own orders" ON public.service_orders;

-- Recreate policies with proper syntax
CREATE POLICY "Technicians can view their own orders"
  ON public.service_orders FOR SELECT
  USING (auth.uid() = technician_id);

CREATE POLICY "Technicians can create orders"
  ON public.service_orders FOR INSERT
  WITH CHECK (auth.uid() = technician_id);

CREATE POLICY "Technicians can update their own orders"
  ON public.service_orders FOR UPDATE
  USING (auth.uid() = technician_id)
  WITH CHECK (auth.uid() = technician_id);

-- Add policy for DELETE operations
CREATE POLICY "Technicians can delete their own orders"
  ON public.service_orders FOR DELETE
  USING (auth.uid() = technician_id);

-- Fix order_parts_used policies
DROP POLICY IF EXISTS "Technicians can manage parts of their orders" ON public.order_parts_used;

CREATE POLICY "Technicians can manage parts of their orders"
  ON public.order_parts_used FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.service_orders
    WHERE service_orders.id = order_parts_used.order_id
    AND service_orders.technician_id = auth.uid()
  ));

-- Ensure all users can view all service orders (for dashboard)
CREATE POLICY "All authenticated users can view all orders"
  ON public.service_orders FOR SELECT
  USING (auth.uid() IS NOT NULL);
