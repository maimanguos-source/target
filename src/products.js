import productData from './product-data.json' with { type: 'json' };

const euroFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR'
});

export const PRODUCTS = productData.map((product) => ({
  ...product,
  priceFormatted: euroFormatter.format(product.price),
  subtitle: product.category,
  tagline: product.description
}));

export function getAllProducts() {
  return PRODUCTS;
}

export function getFeaturedProducts() {
  const topByCategory = new Map();

  PRODUCTS.forEach((product) => {
    const current = topByCategory.get(product.category);
    if (!current || product.rating > current.rating || (
      product.rating === current.rating && product.reviewCount > current.reviewCount
    )) {
      topByCategory.set(product.category, product);
    }
  });

  return [...topByCategory.values()];
}

export function getProductById(id) {
  return PRODUCTS.find((product) => product.id === id) || PRODUCTS[0];
}