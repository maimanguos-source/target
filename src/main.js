import './style.css';
import { createIcons, ShieldCheck, Sparkles, Droplets, CreditCard, RefreshCw, CheckCircle2, ArrowRight, Zap, ShoppingBag, Lock, Truck, ChevronRight, HelpCircle, HeartHandshake } from 'lucide';
import { PRODUCTS, getAllProducts, getProductById } from './products.js';
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
      ChevronRight,
      HelpCircle,
      HeartHandshake
    }
  });
}

/**
 * Renderiza el grid de productos dinámicamente desde products.js
 */
function renderProductGrid() {
  const gridContainer = document.getElementById('products-grid');
  if (!gridContainer) return;

  const products = getAllProducts();

  gridContainer.innerHTML = products.map((product) => `
    <article class="group relative rounded-3xl bg-background-surface/80 border border-white/10 overflow-hidden hover:border-brand-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-primary/10 flex flex-col">
      <!-- Badge flotante -->
      <div class="absolute top-4 left-4 z-10 flex gap-2">
        <span class="sticker-badge ${product.badgeColor}">
          ${product.badge}
        </span>
      </div>

      <!-- Preview de la pegatina con efecto zoom al hover -->
      <div class="relative w-full aspect-[16/11] bg-gradient-to-br from-slate-900 via-slate-950 to-black overflow-hidden flex items-center justify-center p-6 border-b border-white/5">
        <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <img 
          src="${product.image}" 
          alt="Pegatina para tarjeta modelo ${product.name}" 
          class="w-full max-w-[340px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] group-hover:scale-105 group-hover:-rotate-1 transition-transform duration-500 object-contain"
          loading="lazy"
        />

        <!-- Tag de grosor -->
        <div class="absolute bottom-3 right-4 text-[11px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
          80μm Ultra-slim
        </div>
      </div>

      <!-- Contenido del Producto -->
      <div class="p-6 md:p-8 flex-1 flex flex-col justify-between">
        <div>
          <div class="flex items-baseline justify-between mb-2">
            <h3 class="text-xl md:text-2xl font-bold font-display text-white group-hover:text-brand-primary transition-colors">
              ${product.name}
            </h3>
            <div class="text-right">
              <span class="text-2xl font-extrabold text-white">${product.priceFormatted}</span>
            </div>
          </div>
          
          <p class="text-sm text-slate-400 font-medium mb-4">
            ${product.subtitle}
          </p>

          <p class="text-xs text-slate-300 leading-relaxed mb-6">
            ${product.tagline}
          </p>

          <!-- Ventajas técnicas en lista -->
          <ul class="space-y-2 mb-6 border-t border-white/5 pt-4">
            ${product.specs.map(spec => `
              <li class="flex items-center gap-2 text-xs text-slate-300">
                <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0"></i>
                <span>${spec}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div>
          <!-- Garantía de envío gratis -->
          <div class="flex items-center justify-between text-xs text-slate-400 mb-4 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
            <span class="flex items-center gap-1.5 text-emerald-400 font-medium">
              <i data-lucide="truck" class="w-3.5 h-3.5"></i>
              ${product.shipping}
            </span>
            <span class="text-slate-400">Stock Limitado</span>
          </div>

          <!-- Botón de Compra -->
          <button 
            type="button" 
            data-buy-id="${product.id}"
            class="buy-now-btn w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-primary to-cyan-500 hover:from-cyan-400 hover:to-brand-primary text-black font-extrabold text-sm md:text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <i data-lucide="shopping-bag" class="w-4 h-4"></i>
            <span>Comprar ahora — ${product.priceFormatted}</span>
          </button>
        </div>
      </div>
    </article>
  `).join('');

  // Asociar evento a todos los botones "Comprar ahora"
  document.querySelectorAll('.buy-now-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = btn.getAttribute('data-buy-id');
      if (window.openCheckoutModal) {
        window.openCheckoutModal(productId);
      }
    });
  });
}

/**
 * Control del simulador de tarjeta en el Hero
 */
function initHeroSimulator() {
  const previewImg = document.getElementById('hero-card-preview-img');
  const previewName = document.getElementById('hero-card-name');
  const previewSubtitle = document.getElementById('hero-card-subtitle');
  const previewBuyBtn = document.getElementById('hero-preview-buy-btn');
  const selectorButtons = document.querySelectorAll('.hero-design-selector');

  let currentHeroDesign = PRODUCTS[0];

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

