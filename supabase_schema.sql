-- ====================================================================
-- TARGETSTICKER: Esquema SQL para la tabla "pedidos" en Supabase
-- Copia y pega este script en el SQL Editor de tu proyecto en Supabase
-- ====================================================================

-- 1. Crear la tabla de pedidos si no existe
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nombre TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    email TEXT NOT NULL,
    modelo TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    estado TEXT NOT NULL DEFAULT 'interesado_7_dias',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pedidos
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS nombre TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS apellidos TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- 2. Añadir comentarios descriptivos a la tabla y columnas
COMMENT ON TABLE public.pedidos IS 'Registro de pedidos y reservas de tiradas TargetSticker (Fake Door MVP)';
COMMENT ON COLUMN public.pedidos.id IS 'Identificador único del pedido (UUID)';
COMMENT ON COLUMN public.pedidos.user_id IS 'Usuario autenticado que registró el interés';
COMMENT ON COLUMN public.pedidos.nombre IS 'Nombre de la persona interesada';
COMMENT ON COLUMN public.pedidos.apellidos IS 'Apellidos de la persona interesada';
COMMENT ON COLUMN public.pedidos.email IS 'Correo electrónico para avisos';
COMMENT ON COLUMN public.pedidos.modelo IS 'Nombre del modelo de pegatina elegido (ej: Cyberpunk Neon)';
COMMENT ON COLUMN public.pedidos.tags IS 'Etiquetas del diseño para búsquedas y filtros';
COMMENT ON COLUMN public.pedidos.estado IS 'Estado del interés (interesado_7_dias)';
COMMENT ON COLUMN public.pedidos.created_at IS 'Fecha y hora de registro del interés';

-- 3. Habilitar Row Level Security (RLS) para proteger los datos
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- 4. Solo una sesión autenticada puede insertar su propio interés
DROP POLICY IF EXISTS "Permitir insercion publica de pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Permitir insercion de pedidos propios" ON public.pedidos;
CREATE POLICY "Permitir insercion de pedidos propios"
ON public.pedidos 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. Cada usuario autenticado solo puede consultar sus propios intereses
DROP POLICY IF EXISTS "Permitir lectura de pedidos propios" ON public.pedidos;
CREATE POLICY "Permitir lectura de pedidos propios"
ON public.pedidos
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 6. El panel de control puede leer todos los pedidos con service_role
DROP POLICY IF EXISTS "Permitir lectura solo a administradores" ON public.pedidos;
CREATE POLICY "Permitir lectura solo a administradores" 
ON public.pedidos 
FOR SELECT 
TO service_role
USING (true);

-- 7. Índices para búsquedas y orden cronológico
CREATE INDEX IF NOT EXISTS idx_pedidos_email ON public.pedidos (email);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON public.pedidos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_user_id ON public.pedidos (user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_tags ON public.pedidos USING GIN (tags);

