-- ==============================================================================
-- QUINETSHOP // MODIFICADOR Y MIGRACIÓN SQL INTEGRAL PARA SUPABASE
-- Ejecuta este script completo en tu Supabase SQL Editor para habilitar todas
-- las nuevas funcionalidades: límites de uso de stock, referencias de pago,
-- plataformas y planes personalizados, sincronización contable y tiempo real.
-- ==============================================================================

-- 1. TABLA: products (Inventario de Productos y Servicios)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS platform text,
ADD COLUMN IF NOT EXISTS plans jsonb,
ADD COLUMN IF NOT EXISTS real_cost numeric,
ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS discount_pct integer;

COMMENT ON COLUMN public.products.platform IS 'Etiqueta de compatibilidad o plataforma (ej: PC, Android, Xbox, Smart TV)';
COMMENT ON COLUMN public.products.plans IS 'Arreglo JSON de duraciones y precios personalizados para la suscripción';

-- 2. TABLA: orders (Gestión de Pedidos)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'pagomovil',
ADD COLUMN IF NOT EXISTS payment_reference text,
ADD COLUMN IF NOT EXISTS comprobante_url text;

COMMENT ON COLUMN public.orders.payment_reference IS 'Últimos 4 dígitos o código de referencia de la transacción / Pago Móvil';
COMMENT ON COLUMN public.orders.comprobante_url IS 'URL pública del comprobante de pago subido al bucket';

-- 3. TABLA: sales_control (Control de Ventas y Contabilidad)
ALTER TABLE public.sales_control 
ADD COLUMN IF NOT EXISTS payment_reference text,
ADD COLUMN IF NOT EXISTS cost_bs numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_bs numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS exchange_rate numeric DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_bs numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS profit_usd numeric DEFAULT 0;

COMMENT ON COLUMN public.sales_control.payment_reference IS 'Referencia de la transacción para conciliación bancaria';
COMMENT ON COLUMN public.sales_control.total_bs IS 'Monto total neto en Bolívares';
COMMENT ON COLUMN public.sales_control.profit_usd IS 'Ganancia líquida calculada en USD';

-- 4. TABLA: service_accounts (Stock Automatizado de Cuentas Digitales)
ALTER TABLE public.service_accounts 
ADD COLUMN IF NOT EXISTS max_uses integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_uses integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS needs_profile boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_name text,
ADD COLUMN IF NOT EXISTS pin text,
ADD COLUMN IF NOT EXISTS assigned_order_number text,
ADD COLUMN IF NOT EXISTS assigned_user_id text,
ADD COLUMN IF NOT EXISTS assigned_user_email text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

COMMENT ON COLUMN public.service_accounts.max_uses IS 'Capacidad máxima de usos o pantallas simultáneas';
COMMENT ON COLUMN public.service_accounts.current_uses IS 'Cantidad actual de clientes que tienen asignada la cuenta';

-- Asegurar que cuentas existentes tengan max_uses al menos en 1
UPDATE public.service_accounts 
SET max_uses = 1 
WHERE max_uses IS NULL OR max_uses < 1;

UPDATE public.service_accounts 
SET current_uses = 0 
WHERE current_uses IS NULL;

-- 5. TABLA: discounts (Códigos Promocionales)
ALTER TABLE public.discounts 
ADD COLUMN IF NOT EXISTS usage_limit integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS used_users jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 6. HABILITAR TIEMPO REAL (SUPABASE REALTIME)
-- Permite que pedidos, contabilidad, stock y chats se actualicen instantáneamente sin refrescar
DO $$
BEGIN
    -- Añadir tablas a la publicación de realtime si aún no están incluidas
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.sales_control;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.service_accounts;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.discounts;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

-- 7. REPLICA IDENTITY FULL (Para recibir payloads completos en cambios y borrados de Realtime)
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.sales_control REPLICA IDENTITY FULL;
ALTER TABLE public.service_accounts REPLICA IDENTITY FULL;
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.clients REPLICA IDENTITY FULL;
ALTER TABLE public.discounts REPLICA IDENTITY FULL;
ALTER TABLE public.chats REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- 8. STORAGE BUCKET POLICIES (Verificar acceso público para productos y comprobantes)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('comprobantes', 'comprobantes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de almacenamiento seguras para inserción y lectura
DO $$
BEGIN
    -- Comprobantes: cualquier usuario autenticado o anónimo puede subir su comprobante
    BEGIN
        CREATE POLICY "Allow uploads to comprobantes"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'comprobantes');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        CREATE POLICY "Allow public read comprobantes"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'comprobantes');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    -- Products: lectura pública
    BEGIN
        CREATE POLICY "Allow public read products"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'products');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        CREATE POLICY "Allow authenticated insert products"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'products');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;
