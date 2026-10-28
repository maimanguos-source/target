import { initCheckoutModal } from './modal.js';

function initProductSearch() {
  const searchInput = document.getElementById('product-search');
  const searchStatus = document.getElementById('product-search-status');
  const cards = [...document.querySelectorAll('[data-product-card]')];

  if (!searchInput || !cards.length) return;

  const normalize = (value) => value
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  function filterProducts() {
    const query = normalize(searchInput.value.trim());
    const terms = query.split(/\s+/).filter(Boolean);
    let visibleCount = 0;

    cards.forEach((card) => {
      const searchableText = normalize(`${card.textContent} ${card.dataset.productTags || ''}`);
      const matches = terms.every((term) => searchableText.includes(term));
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    if (searchStatus) {
      searchStatus.textContent = query
        ? `${visibleCount} ${visibleCount === 1 ? 'diseño encontrado' : 'diseños encontrados'}`
        : `${cards.length} diseños disponibles`;
    }
  }

  searchInput.addEventListener('input', filterProducts);
  filterProducts();
}

document.addEventListener('DOMContentLoaded', () => {
  initCheckoutModal();
  initProductSearch();
});