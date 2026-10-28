# 💳 TargetSticker — Landing Page E-commerce & Validación Fake Door

Landing page moderna, minimalista y de alto impacto para **TargetSticker** (pegatinas de vinilo personalizadas para tarjetas de crédito y débito), diseñada para validar la demanda real del mercado mediante un flujo **MVP Fake Door** con pasarela PayPal y guardado de pedidos en tiempo real en **Supabase**.

---

## 🚀 Características Principales

1. **Diseño Visual & Estética Urbana (Tailwind CSS)**:
   - Paleta moderna con fondos oscuros profundos (`#0c0e12`), superficies elevadas y toques llamativos tipo *sticker-bomb* y cultura urbana juvenil.
   - **Logotipo de la mascota**: Ilustración simpática estilo retro años 50 en 2D (tarjeta de crédito azul con chip, ojitos, zapatillas y manos enguantadas, sin texto debajo).
   - **Simulador Interactivo 3D en el Hero**: Permite al usuario interactuar con la tarjeta, rotarla en 3D con el cursor o pantalla táctil, ver el reflejo especular (*glare*) y probar los diferentes acabados.
2. **Catálogo Modular & Extensible (`src/products.js`)**:
   - 3 diseños iniciales:
     - ⚡ **Cyberpunk Neon** (5.99€ · Envío gratis)
     - 🌅 **Retro Wave** (5.99€ · Envío gratis)
     - 🖤 **Black Matte Minimal** (5.99€ · Envío gratis)
   - Fácilmente ampliable: solo añade un nuevo objeto al array `PRODUCTS`.
3. **Flujo de Validación Fake Door (MVP)**:
   - Modal limpio y accesible utilizando el elemento nativo `<dialog>` de HTML5 con contención de scroll (`overscroll-behavior: contain`) según estándares modernos de la web.
   - Captura de correo electrónico y selección de modelo.
   - Integración oficial del SDK de botones inteligentes de **PayPal**.
   - Botón de **"⚡ Simular Pago (Test / Demo)"** para pruebas inmediatas sin necesidad de credenciales en local.
   - Pantalla de confirmación con confeti festivo y el mensaje de reserva para la hornada en 7 días.
4. **Persistencia en Supabase**:
   - Al confirmar el pago o la simulación, se registra automáticamente en la tabla `pedidos`.
   - Campos: `id`, `email`, `modelo`, `estado` (`reservado_7_dias`), `created_at`.
   - Mecanismo de resiliencia: copia de seguridad local en `localStorage` si no hay conexión de red.

---

## 🛠️ Tecnologías Utilizadas

- **Vite 6** (Empaquetador ultra-rápido)
- **Tailwind CSS 3** (Estilos modernos utilitarios)
- **@supabase/supabase-js** (Cliente oficial de Supabase)
- **PayPal JS SDK** (Botones oficiales de checkout)
- **Canvas Confetti** (Efectos de celebración visual)
- **Lucide Icons** (Iconografía limpia SVG)

---

## 📋 Configuración en Supabase

1. Crea un proyecto gratuito en [Supabase](https://supabase.com).
2. Ve a la sección **SQL Editor** en el menú lateral.
3. Copia y pega el contenido del archivo [`supabase_schema.sql`](./supabase_schema.sql) y pulsa **Run**.
4. Este script creará automáticamente:
   - La tabla `pedidos` con las columnas requeridas:
     - `id` (UUID)
     - `email` (TEXT)
     - `modelo` (TEXT)
     - `estado` (TEXT con valor por defecto `'reservado_7_dias'`)
     - `created_at` (TIMESTAMP)
   - Las políticas RLS (*Row Level Security*) para permitir que los compradores inserten sus pedidos de forma segura sin exponer los datos de otros clientes.
5. Obtén tus credenciales en **Project Settings > API**:
   - **Project URL**
   - **anon / public key**

---

## 🅿️ Configuración de PayPal

1. Entra en tu panel de [PayPal Developer](https://developer.paypal.com/dashboard/applications).
2. Crea una aplicación en la sección **Apps & Credentials**:
   - Para modo de pruebas: copia tu **Sandbox Client ID**.
   - Para producción (ventas reales): copia tu **Live Client ID**.

---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (basándote en `.env.example`):

```bash
# Supabase
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_ANON_KEY="tu-anon-key-aqui"

# PayPal
VITE_PAYPAL_CLIENT_ID="tu-paypal-client-id"
```

> **Nota para Pruebas**: Si dejas las variables vacías, el proyecto arranca automáticamente en **Modo Demo**, guardando los pedidos en `localStorage` y permitiendo simular pagos al 100%.

---

## 💻 Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo en http://localhost:3000
npm run dev

# 3. Compilar para producción
npm run build

# 4. Probar la compilación de producción localmente
npm run preview
```

---

## 🚀 Despliegue en Vercel

El proyecto está 100% optimizado para Vercel:

### Paso 1: Subir a GitHub / GitLab / Bitbucket
Sube la carpeta del proyecto a tu repositorio favorito.

### Paso 2: Importar en Vercel
1. Entra en tu cuenta de [Vercel](https://vercel.com) y haz clic en **"Add New... > Project"**.
2. Selecciona tu repositorio.
3. Vercel detectará automáticamente que es un proyecto **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Paso 3: Configurar Variables de Entorno en Vercel
En la sección **Environment Variables** antes de desplegar (o en *Settings > Environment Variables*), agrega las 3 variables:

| Nombre de la Variable | Valor | Descripción |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Llave pública anónima de Supabase |
| `VITE_PAYPAL_CLIENT_ID` | `tu-paypal-client-id` | Client ID de PayPal (Live o Sandbox) |

Haz clic en **Deploy** y tu tienda estará en línea en pocos segundos con certificado SSL gratuito y CDN mundial.

---

## 🎨 Cómo Añadir Nuevos Diseños

Para agregar más modelos en el futuro, abre [`src/products.js`](./src/products.js) y añade un nuevo objeto al array `PRODUCTS`:

```javascript
{
  id: "vapor-grid",
  name: "Vapor Grid",
  subtitle: "Gradiente Holográfico",
  tagline: "Efecto prisma iridiscente para tarjetas de última generación.",
  price: 5.99,
  currency: "EUR",
  priceFormatted: "5.99€",
  badge: "Novedad",
  badgeColor: "bg-purple-500 text-white",
  image: "/mockups/nuevo-diseno.png",
  specs: [
    "Vinilo mate 80μm",
    "Ventana de chip EMV",
    "100% impermeable",
    "Cero residuos"
  ]
}
```

El nuevo producto aparecerá automáticamente en el Grid de la tienda, en el selector del modal y en el menú de compra.

