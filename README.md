# TargetSticker — Registro de interés para pegatinas

Catálogo de pegatinas de vinilo para tarjetas. Las personas interesadas se registran con nombre, apellidos, correo y contraseña; se repite el correo para evitar errores y reciben el aviso de que compartiremos novedades en 7 días.

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
3. **Registro de interés**:
   - El modal `<dialog>` permite iniciar sesión o crear una cuenta con correo y contraseña.
   - Supabase Auth crea y recuerda las cuentas; el nombre y los apellidos se guardan en los metadatos del usuario.
   - La solicitud solo se registra después de iniciar sesión.
   - No se procesa ningún pago en esta fase.
   - La pantalla de confirmación informa del aviso previsto en 7 días.
   - El buscador del catálogo filtra por texto y por etiquetas configuradas en cada diseño.
4. **Persistencia en Supabase**:
   - Se guarda cada interés confirmado en `pedidos`, asociado a `user_id`; la sesión persistente se gestiona con Supabase Auth.
   - Campos: nombre, apellidos, correo, modelo, estado y etiquetas.
   - RLS permite insertar y consultar únicamente los registros del usuario autenticado.

---

## 🛠️ Tecnologías Utilizadas

- **Vite 6** (Empaquetador ultra-rápido)
- **Tailwind CSS 3** (Estilos modernos utilitarios)
- **@supabase/supabase-js** (Cliente oficial de Supabase)
- **Lucide Icons** (Iconografía limpia SVG)

---

## 📋 Configuración en Supabase

1. Crea un proyecto gratuito en [Supabase](https://supabase.com).
2. Ve a la sección **SQL Editor** en el menú lateral.
3. Copia y pega el contenido del archivo [`supabase_schema.sql`](./supabase_schema.sql) y pulsa **Run**.
4. En **Authentication > URL Configuration**, configura el **Site URL** y añade a **Redirect URLs** los orígenes permitidos, por ejemplo `http://localhost:3000/**` y el dominio de producción de Vercel. Las personas pueden crear una cuenta e iniciar sesión con correo y contraseña.
5. Obtén la **Project URL** y la **publishable key** desde **Project Settings > API**. La clave secreta no se debe usar en el navegador. Copia `.env.example` a `.env.local` para el desarrollo local; en Vercel configura las mismas dos variables.

---

## ⚙️ Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase: la publishable key es apta para el cliente junto con RLS
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_ANON_KEY="tu-publishable-key"
```

No pongas `SUPABASE_SECRET_KEY`, `service_role` ni ninguna clave secreta en variables `VITE_`: Vite las expone al navegador. Solo usa la clave publishable/anon. Si Supabase no está configurado, el formulario no permite iniciar sesión ni registrar solicitudes.

---

## 💻 Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo (Vite muestra la URL disponible)
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
En *Settings > Environment Variables*, agrega las dos variables públicas:

| Nombre de la Variable | Valor | Descripción |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | `tu-publishable-key` | Clave publicable de Supabase; RLS protege los datos |

Añade también el dominio de Vercel a las **Redirect URLs** de Supabase Auth y ejecuta `supabase_schema.sql` en SQL Editor para activar las columnas y políticas autenticadas. Después, despliega el proyecto.

---

## 🎨 Cómo Añadir Nuevos Diseños

Para agregar más modelos en el futuro, abre [`src/products.js`](./src/products.js) y añade un nuevo objeto al array `PRODUCTS`:

```javascript
{
  id: "vapor-grid",
  name: "Vapor Grid",
   tags: ["vaporwave", "neon", "retro"],
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
