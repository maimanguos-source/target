import './style.css';
import { createIcons, ShieldCheck, Sparkles, Droplets, CreditCard, RefreshCw, CheckCircle2, ArrowRight, Zap, ShoppingBag, Lock, Truck, ChevronLeft, ChevronRight, Star, HelpCircle, HeartHandshake } from 'lucide';
import { PRODUCTS, getAllProducts, getFeaturedProducts, getProductById } from './products.js';
import { initCard3D } from './card3d.js';
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
      HeartHandshake
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

function renderProductGrid(products = getFeaturedProducts()) {
  const carousel = document.getElementById('products-grid');
  if (!carousel) return;

  if (!products.length) {
    carousel.innerHTML = '<p class="product-empty">No hay diseños que coincidan con esa búsqueda.</p>';
  } else {
    carousel.innerHTML = products.map((product) => `
      <article data-product-card class="product-slide group rounded-2xl bg-white border border-slate-200 overflow-hidden hover:border-brand-500 hover:shadow-card-hover transition-all flex flex-col">
        <div class="relative aspect-square bg-white overflow-hidden p-3">
          <img
            src="${escapeHtml(product.image)}"
            alt="${escapeHtml(product.name)}"
            class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <span class="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-700 shadow-sm">
            ${escapeHtml(product.category)}
          </span>
          <span class="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 shadow-sm">
            <i data-lucide="truck" class="h-3.5 w-3.5"></i>
            Envío gratis
          </span>
        </div>
        <div class="p-4 flex flex-1 flex-col">
          <div class="flex items-start justify-between gap-3">
            <h3 class="text-sm font-bold leading-snug text-slate-900">${escapeHtml(product.name)}</h3>
          </div>
          <p class="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">${escapeHtml(product.description)}</p>
          <div class="mt-3 flex items-center gap-1 text-xs text-slate-600" aria-label="${product.rating} de 5, ${product.reviewCount} reseñas">
            <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>
            <span class="font-bold">${product.rating.toFixed(1)}</span>
            <span>(${product.reviewCount})</span>
          </div>
          <div class="mt-3 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
            <span class="text-lg font-extrabold text-slate-900">${product.priceFormatted}</span>
            <span class="text-[11px] font-semibold text-emerald-700">Envío incluido</span>
          </div>
          <div class="mt-3 flex flex-wrap gap-1.5">
            ${product.tags.map((tag) => `<span class="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">${escapeHtml(tag)}</span>`).join('')}
          </div>
          <button type="button" data-buy-id="${escapeHtml(product.id)}" class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-xs font-extrabold text-white transition-colors hover:bg-brand-700">
            <i data-lucide="shopping-bag" class="w-4 h-4"></i>
            Elegir diseño
          </button>
        </div>
      </article>
    `).join('');
  }

  const previous = document.getElementById('products-previous');
  const next = document.getElementById('products-next');
  const updateControls = () => {
    if (previous) previous.disabled = carousel.scrollLeft <= 1;
    if (next) next.disabled = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1;
  };

  if (!carousel.dataset.controlsReady) {
    previous?.addEventListener('click', () => carousel.scrollBy({ left: -carousel.clientWidth, behavior: 'smooth' }));
    next?.addEventListener('click', () => carousel.scrollBy({ left: carousel.clientWidth, behavior: 'smooth' }));
    carousel.addEventListener('scroll', updateControls, { passive: true });
    carousel.addEventListener('click', (event) => {
      const button = event.target.closest('[data-buy-id]');
      if (button && window.openCheckoutModal) window.openCheckoutModal(button.dataset.buyId);
    });
    carousel.dataset.controlsReady = 'true';
  }

  carousel.scrollTo({ left: 0 });
  requestAnimationFrame(updateControls);
  initIcons();
}

function initProductSearch() {
  const searchInput = document.getElementById('product-search');
  const searchStatus = document.getElementById('product-search-status');
  if (!searchInput) return;

  const normalize = (value) => value
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  function filterProducts() {
    const query = normalize(searchInput.value.trim());
    const terms = query.split(/\s+/).filter(Boolean);
    const products = query
      ? getAllProducts().filter((product) => {
        const searchableText = normalize([
          product.name,
          product.category,
          product.description,
          ...product.tags
        ].join(' '));
        return terms.every((term) => searchableText.includes(term));
      })
      : getFeaturedProducts();

    renderProductGrid(products);
    if (searchStatus) {
      searchStatus.textContent = query
        ? `${products.length} ${products.length === 1 ? 'modelo encontrado' : 'modelos encontrados'}`
        : `${products.length} destacados · ${getAllProducts().length} modelos disponibles`;
    }
  }

  searchInput.addEventListener('input', filterProducts);
  filterProducts();
}

/**
 * Control del simulador de tarjeta en el Hero
 */
function initHeroSimulator() {
  const previewImg = document.getElementById('hero-card-preview-img');
  const previewName = document.getElementById('hero-card-name');
  const previewSubtitle = document.getElementById('hero-card-subtitle');
  const previewBuyBtn = document.getElementById('hero-preview-buy-btn');
  const selectorContainer = document.getElementById('hero-design-selectors');
  const featuredProducts = getFeaturedProducts();
  if (selectorContainer) {
    selectorContainer.innerHTML = featuredProducts.slice(0, 3).map((product, index) => `
      <button type="button" data-design-id="${escapeHtml(product.id)}" class="hero-design-selector rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${index === 0 ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-brand-600'}">
        ${escapeHtml(product.name)}
      </button>
    `).join('');
  }
  const selectorButtons = document.querySelectorAll('.hero-design-selector');
  let currentHeroDesign = featuredProducts[0] || PRODUCTS[0];

  function setHeroDesign(productId) {
    const product = getProductById(productId);
    currentHeroDesign = product;

    if (previewImg) {
      previewImg.classList.add('opacity-0', 'scale-95');
      setTimeout(() => {
        previewImg.src = product.image;
        previewImg.classList.remove('opacity-0', 'scale-95');
      }, 150);
    }

    if (previewName) previewName.textContent = product.name;
    if (previewSubtitle) previewSubtitle.textContent = product.subtitle;

    selectorButtons.forEach(btn => {
      const btnId = btn.getAttribute('data-design-id');
      if (btnId === productId) {
        btn.classList.add('bg-white', 'text-black', 'border-white', 'shadow-lg');
        btn.classList.remove('bg-white/5', 'text-slate-300', 'border-white/10');
      } else {
        btn.classList.remove('bg-white', 'text-black', 'border-white', 'shadow-lg');
        btn.classList.add('bg-white/5', 'text-slate-300', 'border-white/10');
      }
    });
  }

  selectorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-design-id');
      setHeroDesign(id);
    });
  });

  setHeroDesign(currentHeroDesign.id);

  if (previewBuyBtn) {
    previewBuyBtn.addEventListener('click', () => {
      if (window.openCheckoutModal) {
        window.openCheckoutModal(currentHeroDesign.id);
      }
    });
  }
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
  renderProductGrid();
  initHeroSimulator();
  initCard3D({
    cardElementId: 'hero-3d-card',
    containerElementId: 'hero-card-container',
    glareElementId: 'hero-card-glare'
  });
  initCheckoutModal();
  initMobileMenu();
  initIcons();
  initProductSearch();

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
