import './style.css';
import { createIcons, ShieldCheck, Sparkles, Droplets, CreditCard, RefreshCw, CheckCircle2, ArrowRight, Zap, ShoppingBag, Lock, Truck, ChevronLeft, ChevronRight, Star, HelpCircle, HeartHandshake, LayoutGrid, List, Images, Plus, UserRound, X } from 'lucide';
import { getAllProducts } from './products.js';
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

const PRODUCTS_PER_BATCH = 3;
let filteredProducts = [];
let renderedProductCount = 0;
let catalogView = 'list';
let catalogObserver;

function renderProductGrid() {
  const grid = document.getElementById('products-grid');
  const loadMore = document.getElementById('catalog-load-more');
  const scrollStatus = document.getElementById('catalog-scroll-status');
  if (!grid || !loadMore) return;

  grid.className = `catalog-grid catalog-${catalogView}`;
  const visibleProducts = filteredProducts.slice(0, renderedProductCount);
  grid.innerHTML = visibleProducts.length
    ? visibleProducts.map((product) => `
      <article data-product-card class="product-card group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-brand-300 hover:shadow-card-hover">
        <div class="product-card-image relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 p-3">
          <img
            src="${escapeHtml(product.image)}"
            alt="${escapeHtml(product.name)}"
            class="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <span class="product-category absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full border border-white/80 bg-white/95 px-2.5 py-1 text-[9px] font-bold text-slate-700 shadow-sm">
            ${escapeHtml(product.category)}
          </span>
          <span class="product-shipping absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700 shadow-sm">
            <i data-lucide="truck" class="h-3.5 w-3.5"></i>
            Envío gratis
          </span>
          <button type="button" data-add-to-cart="${escapeHtml(product.id)}" class="product-photo-add" aria-label="Añadir ${escapeHtml(product.name)} a la cesta">
            <i data-lucide="plus" class="h-4 w-4"></i>
          </button>
        </div>
        <div class="product-card-details flex flex-1 flex-col p-4">
          <div class="mb-1 flex items-start justify-between gap-2">
            <h3 class="min-w-0 text-sm font-extrabold leading-snug text-slate-900">${escapeHtml(product.name)}</h3>
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
              <span class="product-total-label block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Precio con envío</span>
            </div>
            <button type="button" data-add-to-cart="${escapeHtml(product.id)}" class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-3.5 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
              <i data-lucide="plus" class="h-4 w-4"></i><span>Añadir</span>
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
  loadMore.hidden = renderedProductCount >= filteredProducts.length;
  loadMore.textContent = `Ver más diseños (${Math.min(PRODUCTS_PER_BATCH, filteredProducts.length - renderedProductCount)})`;
  if (scrollStatus) {
    scrollStatus.textContent = filteredProducts.length
      ? `Mostrando ${visibleProducts.length} de ${filteredProducts.length} diseños · sigue bajando para ver más`
      : '';
  }
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
  const viewButtons = [...document.querySelectorAll('[data-catalog-view]')];
  const products = getAllProducts();
  if (!searchInput || !categorySelect || !tagSelect || !sortSelect) return;

  const normalize = (value) => value
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  [...new Set(products.map((product) => product.category))].forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.append(option);
  });
  [...new Set(products.flatMap((product) => product.tags))].sort((a, b) => a.localeCompare(b, 'es')).forEach((tag) => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    tagSelect.append(option);
  });

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
    if (searchStatus) {
      searchStatus.textContent = `${filteredProducts.length} ${filteredProducts.length === 1 ? 'diseño disponible' : 'diseños disponibles'} de ${products.length}`;
    }
  }

  [searchInput, categorySelect, tagSelect, minPriceInput, maxPriceInput, sortSelect].forEach((control) => {
    control.addEventListener(control === searchInput ? 'input' : 'change', filterProducts);
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
