/**
 * TargetSticker - Catálogo de Diseños
 * Puedes añadir más diseños simplemente agregando nuevos objetos a este array.
 */
export const PRODUCTS = [
  {
    id: "cyberpunk-neon",
    name: "Cyberpunk Neon",
    tags: ["cyberpunk", "neon", "synthwave", "digital", "cian", "magenta"],
    subtitle: "Estética Synthwave & Circuito Digital",
    tagline: "Líneas de neón cian y magenta sobre horizonte cibernético profundo.",
    price: 5.99,
    currency: "EUR",
    priceFormatted: "5.99€",
    shipping: "Envío gratis incluido",
    badge: "Más Popular",
    badgeColor: "bg-cyan-400 text-black",
    glowColor: "rgba(6, 182, 212, 0.4)",
    image: "/mockups/mockup-cyberpunk.png",
    bgImage: "/designs/cyberpunk-neon.png",
    accentGradient: "from-cyan-500 to-fuchsia-500",
    specs: [
      "Laminado mate antirreflejos",
      "Ventana estándar para chip EMV",
      "100% impermeable y lavable",
      "Adhesivo bubble-free sin residuos"
    ]
  },
  {
    id: "retro-wave",
    name: "Retro Wave",
    tags: ["retro", "80s", "nostalgia", "synthwave", "atardecer", "violeta", "dorado"],
    subtitle: "Atardecer Ochentero & Neon Grid",
    tagline: "El sol retro definitivo de los 80 con tonalidades violeta, dorado y magenta.",
    price: 5.99,
    currency: "EUR",
    priceFormatted: "5.99€",
    shipping: "Envío gratis incluido",
    badge: "Edición Nostalgia",
    badgeColor: "bg-fuchsia-500 text-white",
    glowColor: "rgba(236, 72, 153, 0.4)",
    image: "/mockups/mockup-retro.png",
    bgImage: "/designs/retro-wave.png",
    accentGradient: "from-fuchsia-500 to-amber-500",
    specs: [
      "Acabado táctil suave satinado",
      "Corte láser de precisión micrométrica",
      "Compatible con contactless y cajeros",
      "Protección contra rayaduras de cartera"
    ]
  },
  {
    id: "black-matte-minimal",
    name: "Black Matte Minimal",
    tags: ["black", "matte", "minimal", "negro", "carbon", "elegante", "dorado"],
    subtitle: "Stealth Carbon & Detalle Dorado",
    tagline: "Elegancia pura en negro mate profundo con sutiles acentos geométricos dorados.",
    price: 5.99,
    currency: "EUR",
    priceFormatted: "5.99€",
    badge: "Minimalista",
    badgeColor: "bg-amber-400 text-black",
    glowColor: "rgba(234, 179, 8, 0.3)",
    image: "/mockups/mockup-minimal.png",
    bgImage: "/designs/black-matte-minimal.png",
    accentGradient: "from-amber-400 to-zinc-600",
    specs: [
      "Textura mate anti-huellas",
      "Líneas de oro sutil termoestampadas",
      "Grosor ultra-fino de 80 micras",
      "Retirable en 3 segundos sin pegamento"
    ]
  }
];

export function getAllProducts() {
  return PRODUCTS;
}

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];
}

