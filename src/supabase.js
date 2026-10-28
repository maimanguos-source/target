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
export async function registrarPedido({ email, modelo, estado = 'reservado_7_dias' }) {
  const payload = {
    email: email.trim().toLowerCase(),
    modelo: modelo.trim(),
    estado: estado.trim()
  };

  // 1. Siempre guardamos una copia de seguridad en localStorage por resiliencia
  try {
    const backupKey = 'targetsticker_pedidos_backup';
    const existing = JSON.parse(localStorage.getItem(backupKey) || '[]');
    existing.push({
      ...payload,
      id: crypto.randomUUID ? crypto.randomUUID() : 'local-' + Date.now(),
      created_at: new Date().toISOString()
    });
    localStorage.setItem(backupKey, JSON.stringify(existing));
  } catch (err) {
    console.warn('No se pudo guardar copia local en localStorage', err);
  }

  // 2. Si Supabase está conectado, insertamos en la base de datos
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

  // Si Supabase no está configurado, retorno con éxito simulado
  return {
    success: true,
    data: {
      id: 'demo-' + Math.random().toString(36).substring(2, 9),
      ...payload,
      created_at: new Date().toISOString()
    },
    demoMode: true
  };
}

