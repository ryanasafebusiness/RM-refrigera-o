-- Create profiles table for technician data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create service orders table
CREATE TABLE public.service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_number SERIAL UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Andamento', 'Concluída', 'Cancelada')),
  start_datetime TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completion_datetime TIMESTAMP WITH TIME ZONE,
  technician_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  client_name TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  service_description TEXT,
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

-- Service orders policies
CREATE POLICY "Technicians can view their own orders"
  ON public.service_orders FOR SELECT
  USING (auth.uid() = technician_id);

CREATE POLICY "Technicians can create orders"
  ON public.service_orders FOR INSERT
  WITH CHECK (auth.uid() = technician_id);

CREATE POLICY "Technicians can update their own orders"
  ON public.service_orders FOR UPDATE
  USING (auth.uid() = technician_id);

-- Create order photos table
CREATE TABLE public.order_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('problem', 'solution')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.order_photos ENABLE ROW LEVEL SECURITY;

-- Order photos policies
CREATE POLICY "Technicians can view photos of their orders"
  ON public.order_photos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.service_orders
    WHERE service_orders.id = order_photos.order_id
    AND service_orders.technician_id = auth.uid()
  ));

CREATE POLICY "Technicians can insert photos for their orders"
  ON public.order_photos FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.service_orders
    WHERE service_orders.id = order_photos.order_id
    AND service_orders.technician_id = auth.uid()
  ));

CREATE POLICY "Technicians can delete photos of their orders"
  ON public.order_photos FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.service_orders
    WHERE service_orders.id = order_photos.order_id
    AND service_orders.technician_id = auth.uid()
  ));

-- Create order parts used table
CREATE TABLE public.order_parts_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.order_parts_used ENABLE ROW LEVEL SECURITY;

-- Order parts used policies
CREATE POLICY "Technicians can manage parts of their orders"
  ON public.order_parts_used FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.service_orders
    WHERE service_orders.id = order_parts_used.order_id
    AND service_orders.technician_id = auth.uid()
  ));

-- Create order parts replaced table
CREATE TABLE public.order_parts_replaced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
  old_part TEXT NOT NULL,
  new_part TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.order_parts_replaced ENABLE ROW LEVEL SECURITY;

-- Order parts replaced policies
CREATE POLICY "Technicians can manage replaced parts of their orders"
  ON public.order_parts_replaced FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.service_orders
    WHERE service_orders.id = order_parts_replaced.order_id
    AND service_orders.technician_id = auth.uid()
  ));

-- Create order signatures table
CREATE TABLE public.order_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
  signature_data TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.order_signatures ENABLE ROW LEVEL SECURITY;

-- Order signatures policies
CREATE POLICY "Technicians can manage signatures of their orders"
  ON public.order_signatures FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.service_orders
    WHERE service_orders.id = order_signatures.order_id
    AND service_orders.technician_id = auth.uid()
  ));

-- Create storage bucket for order photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-photos', 'order-photos', true);

-- Storage policies for order photos
CREATE POLICY "Technicians can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'order-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'order-photos');

CREATE POLICY "Technicians can delete their photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'order-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'Técnico'));
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for service_orders updated_at
CREATE TRIGGER update_service_orders_updated_at
  BEFORE UPDATE ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();