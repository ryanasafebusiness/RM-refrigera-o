-- Add pricing fields to service orders
ALTER TABLE public.service_orders 
  ADD COLUMN IF NOT EXISTS total_value DECIMAL(10, 2) DEFAULT 0;

-- Add pricing fields to order_parts_replaced
ALTER TABLE public.order_parts_replaced 
  ADD COLUMN IF NOT EXISTS part_value DECIMAL(10, 2) DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.service_orders.total_value IS 'Valor total da ordem de serviço';
COMMENT ON COLUMN public.order_parts_replaced.part_value IS 'Valor da peça substituída';

