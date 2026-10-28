-- ====================================================================
-- TARGETSTICKER: Esquema SQL para la tabla "pedidos" en Supabase
-- Copia y pega este script en el SQL Editor de tu proyecto en Supabase
-- ====================================================================

-- 1. Crear la tabla de pedidos si no existe
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    modelo TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'reservado_7_dias',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Añadir comentarios descriptivos a la tabla y columnas
COMMENT ON TABLE public.pedidos IS 'Registro de pedidos y reservas de tiradas TargetSticker (Fake Door MVP)';
COMMENT ON COLUMN public.pedidos.id IS 'Identificador único del pedido (UUID)';
COMMENT ON COLUMN public.pedidos.email IS 'Correo electrónico del comprador para tracking';
COMMENT ON COLUMN public.pedidos.modelo IS 'Nombre del modelo de pegatina elegido (ej: Cyberpunk Neon)';
COMMENT ON COLUMN public.pedidos.estado IS 'Estado del pedido en hornada (reservado_7_dias)';
COMMENT ON COLUMN public.pedidos.created_at IS 'Fecha y hora de registro de la compra';

-- 3. Habilitar Row Level Security (RLS) para proteger los datos
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- 4. Crear política que permite a los usuarios anónimos (visitantes de la web) insertar nuevos pedidos
DROP POLICY IF EXISTS "Permitir insercion publica de pedidos" ON public.pedidos;
CREATE POLICY "Permitir insercion publica de pedidos" 
ON public.pedidos 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 5. Crear política para que solo administradores o el panel de control puedan leer los pedidos
DROP POLICY IF EXISTS "Permitir lectura solo a administradores" ON public.pedidos;
CREATE POLICY "Permitir lectura solo a administradores" 
ON public.pedidos 
FOR SELECT 
TO service_role
USING (true);

-- 6. Crear índice en email y created_at para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_pedidos_email ON public.pedidos (email);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON public.pedidos (created_at DESC);

