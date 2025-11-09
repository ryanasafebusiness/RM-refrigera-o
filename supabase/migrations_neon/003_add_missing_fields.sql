-- Adicionar campos faltantes nas tabelas

-- Adicionar campos em clients se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'city') THEN
        ALTER TABLE public.clients ADD COLUMN city TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'state') THEN
        ALTER TABLE public.clients ADD COLUMN state TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'zip_code') THEN
        ALTER TABLE public.clients ADD COLUMN zip_code TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'notes') THEN
        ALTER TABLE public.clients ADD COLUMN notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'created_by') THEN
        ALTER TABLE public.clients ADD COLUMN created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Adicionar part_value em order_parts_replaced se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'order_parts_replaced' AND column_name = 'part_value') THEN
        ALTER TABLE public.order_parts_replaced ADD COLUMN part_value NUMERIC(10, 2);
    END IF;
END $$;

-- Adicionar total_value em service_orders se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'service_orders' AND column_name = 'total_value') THEN
        ALTER TABLE public.service_orders ADD COLUMN total_value NUMERIC(10, 2) DEFAULT 0;
    END IF;
END $$;

COMMENT ON COLUMN public.clients.city IS 'Cidade do cliente';
COMMENT ON COLUMN public.clients.state IS 'Estado do cliente';
COMMENT ON COLUMN public.clients.zip_code IS 'CEP do cliente';
COMMENT ON COLUMN public.clients.notes IS 'Observações sobre o cliente';
COMMENT ON COLUMN public.clients.created_by IS 'ID do usuário que criou o cliente';
COMMENT ON COLUMN public.order_parts_replaced.part_value IS 'Valor da peça substituída';
COMMENT ON COLUMN public.service_orders.total_value IS 'Valor total da ordem de serviço';

