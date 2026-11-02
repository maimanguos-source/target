import './style.css';
import { createIcons, ShieldCheck, Sparkles, Droplets, CreditCard, RefreshCw, CheckCircle2, ArrowRight, Zap, ShoppingBag, Lock, Truck, ChevronLeft, ChevronRight, Star, HelpCircle, HeartHandshake, LayoutGrid, List, Images, Plus, UserRound, X } from 'lucide';
import { getAllProducts, getProductById } from './products.js';
import { initCheckoutModal } from './modal.js';

// Inicializar Lucide Icons
function initIcons() {
  createIcons({
    icons: {
      ShieldCheck,
      Sparkles,
      Droplets,
      CreditCard,
      RefreshCw,
      CheckCircle2,
      ArrowRight,
      Zap,
      ShoppingBag,
      Lock,
      Truck,
      ChevronLeft,
      ChevronRight,
      Star,
      HelpCircle,
      HeartHandshake,
      LayoutGrid,
      List,
      Images,
      Plus,
      UserRound,
      X
    }
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

const PRODUCTS_PER_BATCH = 12;
let filteredProducts = [];
let renderedProductCount = 0;
let catalogView = 'grid';
let catalogObserver;
let productDetailDialog;

function openProductDetail(productId) {
  const product = getProductById(productId);
  if (!productDetailDialog || !product) return;

  productDetailDialog.querySelector('#product-detail-image').src = product.image;
  productDetailDialog.querySelector('#product-detail-image').alt = product.name;
  productDetailDialog.querySelector('#product-detail-category').textContent = product.category;
  productDetailDialog.querySelector('#product-detail-name').textContent = product.name;
  productDetailDialog.querySelector('#product-detail-price').textContent = product.priceFormatted;
  productDetailDialog.querySelector('#product-detail-description').textContent = product.description;
  productDetailDialog.querySelector('#product-detail-rating').textContent =
    `${product.rating.toFixed(1)} · ${product.reviewCount} valoraciones`;
  productDetailDialog.querySelector('#product-detail-tags').innerHTML = product.tags
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join('');
  productDetailDialog.querySelector('#product-detail-add').dataset.addToCart = product.id;

  if (!productDetailDialog.open) productDetailDialog.showModal();
  initIcons();
}

function renderProductGrid() {
  const grid = document.getElementById('products-grid');
  const loadMore = document.getElementById('catalog-load-more');
  const scrollStatus = document.getElementById('catalog-scroll-status');
  if (!grid || !loadMore) return;

  grid.className = `catalog-grid catalog-${catalogView === 'grid' ? 'grid-view' : catalogView}`;
  const visibleProducts = filteredProducts.slice(0, renderedProductCount);
  grid.innerHTML = visibleProducts.length
    ? visibleProducts.map((product) => `
      <article data-product-card class="product-card group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-brand-300 hover:shadow-card-hover">
        <div class="product-card-image relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
          <button type="button" data-product-open="${escapeHtml(product.id)}" class="product-image-trigger" aria-label="Ver ${escapeHtml(product.name)}">
            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" />
          </button>
          <span class="product-category absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-[10px] font-bold text-slate-700 shadow-sm">
            ${escapeHtml(product.category.replace(/^Pegatinas\s+/i, ''))}
          </span>
          <button type="button" data-add-to-cart="${escapeHtml(product.id)}" class="product-photo-add" aria-label="Añadir ${escapeHtml(product.name)} a la cesta">
            <i data-lucide="plus" class="h-4 w-4"></i>
          </button>
        </div>
        <div class="product-card-details flex flex-1 flex-col p-4">
          <div class="mb-2 flex items-start justify-between gap-2">
            <h3 class="min-w-0 text-sm font-extrabold leading-snug text-slate-900">
              <button type="button" data-product-open="${escapeHtml(product.id)}" class="product-name-button text-left">${escapeHtml(product.name)}</button>
            </h3>
            <span class="product-price shrink-0 text-base font-black text-slate-900">${product.priceFormatted}</span>
          </div>
          <p class="product-description mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">${escapeHtml(product.description)}</p>
          <div class="product-rating mt-2 flex items-center gap-1.5 text-xs text-slate-600" aria-label="${product.rating} de 5, ${product.reviewCount} reseñas">
            <i data-lucide="star" class="h-4 w-4 fill-amber-400 text-amber-400"></i>
            <span class="font-bold">${product.rating.toFixed(1)}</span>
            <span>(${product.reviewCount} valoraciones)</span>
          </div>
          <div class="product-tags mt-3 flex flex-wrap gap-1.5">
            ${product.tags.map((tag) => `<span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">${escapeHtml(tag)}</span>`).join('')}
          </div>
          <div class="product-buy-row mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
            <div>
              <span class="product-total-label block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Envío gratis</span>
            </div>
            <button type="button" data-add-to-cart="${escapeHtml(product.id)}" class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-3.5 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
              <i data-lucide="plus" class="h-4 w-4"></i><span>Añadir a la cesta</span>
            </button>
          </div>
        </div>
      </article>
    `).join('')
    : '<p class="catalog-empty rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No encontramos diseños con esos filtros. Prueba a cambiarlos.</p>';

  grid.querySelectorAll('[data-add-to-cart]').forEach((button) => {
    button.addEventListener('click', () => {
      if (window.addToCart) window.addToCart(button.dataset.addToCart);
    });
  });
  grid.querySelectorAll('[data-product-open]').forEach((button) => {
    button.addEventListener('click', () => openProductDetail(button.dataset.productOpen));
  });
  loadMore.hidden = renderedProductCount >= filteredProducts.length;
  loadMore.textContent = `Ver más diseños (${Math.min(PRODUCTS_PER_BATCH, filteredProducts.length - renderedProductCount)})`;
  if (scrollStatus) {
    scrollStatus.textContent = filteredProducts.length
    ? `Mostrando ${visibleProducts.length} de ${filteredProducts.length} diseños`
    : '';
  }
  const resultCount = document.getElementById('catalog-result-count');
  if (resultCount) resultCount.textContent = `${filteredProducts.length} ${filteredProducts.length === 1 ? 'diseño' : 'diseños'}`;
  loadMore.onclick = () => {
    catalogObserver?.disconnect();
    renderedProductCount = Math.min(renderedProductCount + PRODUCTS_PER_BATCH, filteredProducts.length);
    renderProductGrid();
  };
  catalogObserver?.disconnect();
  if (!loadMore.hidden && 'IntersectionObserver' in window) {
    catalogObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      catalogObserver.disconnect();
      renderedProductCount = Math.min(renderedProductCount + PRODUCTS_PER_BATCH, filteredProducts.length);
      renderProductGrid();
    }, { rootMargin: '320px 0px' });
    catalogObserver.observe(loadMore);
  }
  initIcons();
}

function initProductCatalog() {
  const searchInput = document.getElementById('product-search');
  const searchStatus = document.getElementById('product-search-status');
  const categorySelect = document.getElementById('catalog-category');
  const tagSelect = document.getElementById('catalog-tag');
  const minPriceInput = document.getElementById('catalog-min-price');
  const maxPriceInput = document.getElementById('catalog-max-price');
  const sortSelect = document.getElementById('catalog-sort');
  const resetButton = document.getElementById('catalog-reset');
  const categoryTabs = document.getElementById('catalog-categories');
  const viewButtons = [...document.querySelectorAll('[data-catalog-view]')];
  const products = getAllProducts();
  if (!searchInput || !categorySelect || !tagSelect || !sortSelect) return;

  const normalize = (value) => value
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const categoryCounts = new Map();
  products.forEach(({ category }) => categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1));
  [...categoryCounts.keys()].forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.append(option);
  });
  if (categoryTabs) {
    categoryTabs.innerHTML = `
      <button type="button" class="category-tab is-selected" data-category-filter="" aria-pressed="true">
        <span>Todos</span><span class="category-tab-count">${products.length}</span>
      </button>
      ${[...categoryCounts].map(([category, count]) => `
        <button type="button" class="category-tab" data-category-filter="${escapeHtml(category)}" aria-pressed="false" title="${escapeHtml(category)}">
          <span>${escapeHtml(category.replace(/^Pegatinas\s+/i, '').replace(/\s+para Tarjetas(?: de Crédito)?$/i, ''))}</span>
          <span class="category-tab-count">${count}</span>
        </button>
      `).join('')}
    `;
  }
  [...new Set(products.flatMap((product) => product.tags))].sort((a, b) => a.localeCompare(b, 'es')).forEach((tag) => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    tagSelect.append(option);
  });
  const totalBadge = document.getElementById('product-total-badge');
  if (totalBadge) totalBadge.textContent = `${products.length} diseños · ${categoryCounts.size} colecciones`;

  function filterProducts() {
    const query = normalize(searchInput.value.trim());
    const terms = query.split(/\s+/).filter(Boolean);
    const minPrice = minPriceInput.value === '' ? -Infinity : Number(minPriceInput.value);
    const maxPrice = maxPriceInput.value === '' ? Infinity : Number(maxPriceInput.value);
    filteredProducts = products.filter((product) => {
      const searchableText = normalize([product.name, product.category, product.description, ...product.tags].join(' '));
      return terms.every((term) => searchableText.includes(term))
        && (!categorySelect.value || product.category === categorySelect.value)
        && (!tagSelect.value || product.tags.includes(tagSelect.value))
        && product.price >= minPrice
        && product.price <= maxPrice;
    });

    switch (sortSelect.value) {
      case 'price-asc':
        filteredProducts.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name, 'es'));
        break;
      case 'price-desc':
        filteredProducts.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name, 'es'));
        break;
      case 'rating':
        filteredProducts.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      case 'name':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name, 'es'));
        break;
    }

    renderedProductCount = Math.min(PRODUCTS_PER_BATCH, filteredProducts.length);
    renderProductGrid();
    categoryTabs?.querySelectorAll('[data-category-filter]').forEach((button) => {
      const selected = button.dataset.categoryFilter === categorySelect.value;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    if (searchStatus) {
      searchStatus.textContent = `${filteredProducts.length} ${filteredProducts.length === 1 ? 'diseño disponible' : 'diseños disponibles'} de ${products.length}`;
    }
  }

  [searchInput, categorySelect, tagSelect, minPriceInput, maxPriceInput, sortSelect].forEach((control) => {
    control.addEventListener(control === searchInput ? 'input' : 'change', filterProducts);
  });
  categoryTabs?.querySelectorAll('[data-category-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      categorySelect.value = button.dataset.categoryFilter;
      filterProducts();
    });
  });
  resetButton?.addEventListener('click', () => {
    searchInput.value = '';
    categorySelect.value = '';
    tagSelect.value = '';
    minPriceInput.value = '';
    maxPriceInput.value = '';
    sortSelect.value = 'catalog';
    filterProducts();
  });
  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      catalogView = button.dataset.catalogView;
      viewButtons.forEach((viewButton) => {
        const selected = viewButton === button;
        viewButton.setAttribute('aria-pressed', String(selected));
        viewButton.classList.toggle('is-selected', selected);
      });
      renderProductGrid();
    });
  });
  filterProducts();
}

function initProductDetails() {
  productDetailDialog = document.getElementById('product-dialog');
  if (!productDetailDialog) return;

  productDetailDialog.querySelector('#product-detail-add').addEventListener('click', (event) => {
    const { addToCart } = event.currentTarget.dataset;
    productDetailDialog.close();
    if (addToCart && window.addToCart) window.addToCart(addToCart);
  });
  productDetailDialog.querySelectorAll('[data-close-product]').forEach((button) => {
    button.addEventListener('click', () => productDetailDialog.close());
  });
  productDetailDialog.addEventListener('click', (event) => {
    if (event.target === productDetailDialog) productDetailDialog.close();
  });
}

/**
 * Menú Móvil
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (!menuBtn || !mobileNav) return;

  menuBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('hidden');
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.add('hidden');
    });
  });
}

// Inicialización general al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  initCheckoutModal();
  initMobileMenu();
  initIcons();
  initProductDetails();
  initProductCatalog();

  // Scroll suave para enlaces del navbar
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
