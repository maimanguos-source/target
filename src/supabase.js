import { createClient } from '@supabase/supabase-js';

// Variables de entorno cargadas por Vite / Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('TU_SUPABASE_URL') &&
  !supabaseAnonKey.includes('TU_SUPABASE_KEY')
);

// Cliente Supabase instanciado si están disponibles las credenciales
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.info(
    '%c[TargetSticker - Supabase]%c No se han detectado credenciales VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. Los pedidos se guardarán temporalmente en localStorage (Modo Demo/Simulación). Configura las variables en tu panel de Vercel o en tu archivo .env local.',
    'color: #0ea5e9; font-weight: bold;',
    'color: #94a3b8;'
  );
}

/**
 * Guarda un pedido en la tabla "pedidos" de Supabase
 * Estructura de la tabla:
 * - id (UUID generado por defecto)
 * - email (Texto)
 * - modelo (Texto)
 * - estado (Texto: "reservado_7_dias")
 * - created_at (Timestamp con timezone)
 */
export async function registrarPedido({ userId, nombre, apellidos, email, modelo, tags = [], estado = 'interesado_7_dias' }) {
  const payload = {
    user_id: userId,
    nombre: nombre.trim(),
    apellidos: apellidos.trim(),
    email: email.trim().toLowerCase(),
    modelo: modelo.trim(),
    tags,
    estado: estado.trim()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .insert([payload])
        .select();

      if (error) {
        console.error('[Supabase] Error al insertar pedido:', error.message, error);
        return {
          success: false,
          error: error.message,
          fallback: true,
          record: payload
        };
      }

      console.log('[Supabase] Pedido guardado exitosamente en la tabla "pedidos":', data);
      return {
        success: true,
        data: data ? data[0] : payload,
        supabaseConnected: true
      };
    } catch (networkError) {
      console.error('[Supabase] Error de red al conectar con Supabase:', networkError);
      return {
        success: false,
        error: networkError.message,
        fallback: true,
        record: payload
      };
    }
  }

  return { success: false, error: 'Supabase no está configurado.' };
}

export async function registrarPedidos(pedidos) {
  if (!supabase) return { success: false, error: 'Supabase no está configurado.' };

  const payload = pedidos.map(({ userId, nombre, apellidos, email, modelo, tags = [], estado = 'interesado_7_dias' }) => ({
    user_id: userId,
    nombre: nombre.trim(),
    apellidos: apellidos.trim(),
    email: email.trim().toLowerCase(),
    modelo: modelo.trim(),
    tags,
    estado: estado.trim()
  }));
  if (!payload.length) return { success: false, error: 'La cesta está vacía.' };

  try {
    const { data, error } = await supabase.from('pedidos').insert(payload).select();
    if (error) {
      console.error('[Supabase] Error al guardar los pedidos de la cesta:', error.message, error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (networkError) {
    console.error('[Supabase] Error de red al guardar los pedidos de la cesta:', networkError);
    return { success: false, error: networkError.message };
  }
}
