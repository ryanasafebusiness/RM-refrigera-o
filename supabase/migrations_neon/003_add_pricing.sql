-- Adicionar campos de preço às ordens de serviço
ALTER TABLE public.service_orders 
  ADD COLUMN IF NOT EXISTS labor_cost DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS parts_cost DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS total_cost DECIMAL(10, 2);

-- Comentários
COMMENT ON COLUMN public.service_orders.labor_cost IS 'Custo de mão de obra';
COMMENT ON COLUMN public.service_orders.parts_cost IS 'Custo das peças';
COMMENT ON COLUMN public.service_orders.total_cost IS 'Custo total';

