import { getProductById } from './products.js';
import { addToCart, clearCart, getCart, removeFromCart, updateCartQuantity } from './cart-store.js';
import { registrarPedidos, supabase } from './supabase.js';

const PENDING_AUTH_KEY = 'targetsticker_pending_cart_auth';
const CART_PROFILE_PREFIX = 'targetsticker_profile_';
const euroFormatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

export function initCheckoutModal() {
  const accountDialog = document.getElementById('checkout-modal');
  const cartDialog = document.getElementById('cart-dialog');
  if (!accountDialog || !cartDialog) return;

  const accountForm = document.getElementById('reservation-form');
  const loginForm = document.getElementById('login-form');
  const accountAccess = document.getElementById('account-access');
  const loginTab = document.getElementById('account-login-tab');
  const signupTab = document.getElementById('account-signup-tab');
  const loginEmailInput = document.getElementById('login-email');
  const loginPasswordInput = document.getElementById('login-password');
  const loginSubmit = document.getElementById('login-submit-btn');
  const accountSubmit = document.getElementById('reservation-submit-btn');
  const emailInput = document.getElementById('checkout-email');
  const emailConfirmInput = document.getElementById('checkout-email-confirm');
  const firstNameInput = document.getElementById('checkout-first-name');
  const lastNameInput = document.getElementById('checkout-last-name');
  const passwordInput = document.getElementById('checkout-password');
  const infoMessage = document.getElementById('modal-info-message');
  const errorMessage = document.getElementById('modal-error-message');
  const accountReviewEmail = document.getElementById('account-review-email');
  const signedInView = document.getElementById('account-signed-in');
  const signOutButton = document.getElementById('account-sign-out');
  const accountSignedInEmail = document.getElementById('account-signed-in-email');
  const cartItems = document.getElementById('cart-items');
  const cartEmpty = document.getElementById('cart-empty');
  const cartSuccess = document.getElementById('cart-success');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');
  const cartSubtitle = document.getElementById('cart-subtitle');
  const cartItemsView = document.getElementById('cart-items-view');
  const cartReviewView = document.getElementById('cart-review-view');
  const cartFooter = document.getElementById('cart-footer');
  const cartReviewFooter = document.getElementById('cart-review-footer');
  const cartReviewItems = document.getElementById('cart-review-items');
  const cartReviewTotal = document.getElementById('cart-review-total');
  const cartError = document.getElementById('cart-error');
  const cartFirstName = document.getElementById('cart-first-name');
  const cartLastName = document.getElementById('cart-last-name');
  const cartCheckout = document.getElementById('cart-checkout');
  let currentUser = null;
  let isSubmittingAuth = false;
  let isSubmittingOrder = false;
  let isCompletingSignIn = false;
  let accountStep = 1;
  let maxAccountStep = 1;
  let accountMode = 'login';

  function getPendingAuth() {
    const stored = localStorage.getItem(PENDING_AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  function setAccountMessage(message, type) {
    infoMessage.classList.toggle('hidden', type !== 'info');
    errorMessage.classList.toggle('hidden', type !== 'error');
    if (type === 'info') infoMessage.textContent = message;
    if (type === 'error') errorMessage.textContent = message;
  }

  function setAccountMode(mode) {
    accountMode = mode;
    const signingIn = mode === 'login';
    loginForm.hidden = !signingIn;
    loginForm.classList.toggle('hidden', !signingIn);
    accountForm.hidden = signingIn;
    accountForm.classList.toggle('hidden', signingIn);
    loginTab.setAttribute('aria-selected', String(signingIn));
    signupTab.setAttribute('aria-selected', String(!signingIn));
    loginTab.classList.toggle('bg-brand-600', signingIn);
    loginTab.classList.toggle('text-white', signingIn);
    loginTab.classList.toggle('border', !signingIn);
    loginTab.classList.toggle('border-slate-300', !signingIn);
    loginTab.classList.toggle('text-slate-700', !signingIn);
    signupTab.classList.toggle('bg-brand-600', !signingIn);
    signupTab.classList.toggle('text-white', !signingIn);
    signupTab.classList.toggle('border', signingIn);
    signupTab.classList.toggle('border-slate-300', signingIn);
    signupTab.classList.toggle('text-slate-700', signingIn);
  }

  function setAccountStep(step) {
    accountStep = step;
    infoMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');
    accountDialog.querySelectorAll('[data-checkout-step]').forEach((tab) => {
      const tabStep = Number(tab.dataset.checkoutStep);
      const active = tabStep === step;
      tab.classList.toggle('is-active', active);
      tab.classList.toggle('is-complete', tabStep < step);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.disabled = tabStep > maxAccountStep;
    });
    accountDialog.querySelectorAll('[data-checkout-panel]').forEach((panel) => {
      const active = Number(panel.dataset.checkoutPanel) === step;
      panel.hidden = !active;
      panel.classList.toggle('hidden', !active);
    });
  }

  function showAccountDialog() {
    if (currentUser) {
      signedInView.hidden = false;
      signedInView.classList.remove('hidden');
      accountAccess.hidden = true;
      accountAccess.classList.add('hidden');
      accountSignedInEmail.textContent = currentUser.email || '';
    } else {
      signedInView.hidden = true;
      signedInView.classList.add('hidden');
      accountAccess.hidden = false;
      accountAccess.classList.remove('hidden');
      setAccountMode(accountMode);
      maxAccountStep = 1;
      setAccountStep(1);
    }
    if (!accountDialog.open) accountDialog.showModal();
  }

  function getCartSummary() {
    if (!currentUser) return [];
    return getCart(currentUser.id)
      .map((item) => ({ ...item, product: getProductById(item.productId) }))
      .filter((item) => item.product.id === item.productId);
  }

  function getSummaryTotal(items) {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }

  function updateCartBadge() {
    const count = currentUser
      ? getCart(currentUser.id).reduce((total, item) => total + item.quantity, 0)
      : 0;
    cartCount.textContent = String(count);
    cartCount.classList.toggle('is-empty', count === 0);
    cartCheckout.disabled = count === 0;
  }

  function renderCart() {
    if (!currentUser) {
      cartItems.replaceChildren();
      cartEmpty.classList.remove('hidden');
      cartItems.classList.add('hidden');
      cartTotal.textContent = euroFormatter.format(0);
      cartSubtitle.textContent = 'Inicia sesión para ver tu cesta';
      updateCartBadge();
      return;
    }

    const items = getCartSummary();
    const total = getSummaryTotal(items);
    cartItems.classList.toggle('hidden', items.length === 0);
    cartEmpty.classList.toggle('hidden', items.length !== 0);
    cartSuccess.classList.add('hidden');
    cartTotal.textContent = euroFormatter.format(total);
    cartSubtitle.textContent = `${items.reduce((sum, item) => sum + item.quantity, 0)} ${items.length === 1 ? 'artículo' : 'artículos'} · envío gratis`;
    cartItems.innerHTML = items.map(({ product, quantity }) => `
      <article class="cart-line">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="cart-line-image" />
        <div class="min-w-0 flex-1">
          <h3 class="line-clamp-2 text-sm font-bold text-slate-900">${escapeHtml(product.name)}</h3>
          <p class="mt-1 text-xs font-extrabold text-slate-700">${product.priceFormatted} <span class="font-medium text-emerald-700">· envío gratis</span></p>
          <div class="mt-2 flex items-center gap-2">
            <button type="button" class="cart-quantity-button" data-quantity="${escapeHtml(product.id)}" data-change="-1" aria-label="Quitar una unidad">−</button>
            <span class="min-w-5 text-center text-xs font-bold">${quantity}</span>
            <button type="button" class="cart-quantity-button" data-quantity="${escapeHtml(product.id)}" data-change="1" aria-label="Añadir una unidad">+</button>
            <button type="button" class="ml-auto text-xs font-semibold text-slate-500 underline hover:text-rose-600" data-remove="${escapeHtml(product.id)}">Quitar</button>
          </div>
        </div>
      </article>
    `).join('');
    cartItems.querySelectorAll('[data-quantity]').forEach((button) => {
      button.addEventListener('click', () => {
        const item = getCart(currentUser.id).find((entry) => entry.productId === button.dataset.quantity);
        if (item) updateCartQuantity(currentUser.id, item.productId, item.quantity + Number(button.dataset.change));
        renderCart();
      });
    });
    cartItems.querySelectorAll('[data-remove]').forEach((button) => {
      button.addEventListener('click', () => {
        removeFromCart(currentUser.id, button.dataset.remove);
        renderCart();
      });
    });
    updateCartBadge();
  }

  function renderOrderReview() {
    const items = getCartSummary();
    cartReviewItems.innerHTML = items.map(({ product, quantity }) => `
      <div class="flex items-start justify-between gap-3 text-xs">
        <span class="text-slate-600">${quantity} × ${escapeHtml(product.name)}</span>
        <strong class="shrink-0 text-slate-900">${euroFormatter.format(product.price * quantity)}</strong>
      </div>
    `).join('');
    cartReviewTotal.textContent = euroFormatter.format(getSummaryTotal(items));
    const profile = JSON.parse(localStorage.getItem(`${CART_PROFILE_PREFIX}${encodeURIComponent(currentUser.id)}`) || 'null');
    cartFirstName.value = profile?.firstName || currentUser.user_metadata?.nombre || '';
    cartLastName.value = profile?.lastName || currentUser.user_metadata?.apellidos || '';
    cartError.classList.add('hidden');
    cartItemsView.hidden = true;
    cartItemsView.classList.add('hidden');
    cartFooter.hidden = true;
    cartFooter.classList.add('hidden');
    cartReviewView.hidden = false;
    cartReviewView.classList.remove('hidden');
    cartReviewFooter.hidden = false;
    cartReviewFooter.classList.remove('hidden');
    cartSubtitle.textContent = 'Confirma tu solicitud';
  }

  function showCartDialog() {
    cartSuccess.classList.add('hidden');
    cartItemsView.hidden = false;
    cartItemsView.classList.remove('hidden');
    cartFooter.hidden = false;
    cartFooter.classList.remove('hidden');
    cartReviewView.hidden = true;
    cartReviewView.classList.add('hidden');
    cartReviewFooter.hidden = true;
    cartReviewFooter.classList.add('hidden');
    renderCart();
    if (!cartDialog.open) cartDialog.showModal();
  }

  async function completeSignIn(session) {
    currentUser = session?.user || null;
    updateCartBadge();
    if (!currentUser) return;

    const pending = getPendingAuth();
    if (!pending) {
      if (accountDialog.open) showAccountDialog();
      return;
    }
    if (pending?.email?.toLowerCase() === currentUser.email?.toLowerCase()) {
      if (isCompletingSignIn) return;
      isCompletingSignIn = true;
      try {
        if (pending.firstName || pending.lastName) {
          localStorage.setItem(`${CART_PROFILE_PREFIX}${encodeURIComponent(currentUser.id)}`, JSON.stringify({
            firstName: pending.firstName || currentUser.user_metadata?.nombre || '',
            lastName: pending.lastName || currentUser.user_metadata?.apellidos || ''
          }));
        }
        if (pending.productId) addToCart(currentUser.id, pending.productId);
        localStorage.removeItem(PENDING_AUTH_KEY);
        accountDialog.close();
        showCartDialog();
      } catch (error) {
        console.error('No se pudo restaurar la cesta después del inicio de sesión:', error);
        setAccountMessage(error.message || 'No se pudo recuperar la cesta. Inténtalo de nuevo.', 'error');
        return;
      } finally {
        isCompletingSignIn = false;
      }
    }
  }

  function openAccountForAdd(productId) {
    if (!supabase) {
      showAccountDialog();
      setAccountMessage('El inicio de sesión no está configurado. No se puede guardar tu cesta ahora.', 'error');
      return;
    }

    if (currentUser) {
      try {
        addToCart(currentUser.id, productId);
        showCartDialog();
      } catch (error) {
        showAccountDialog();
        setAccountMessage(error.message, 'error');
      }
      return;
    }

    try {
      localStorage.setItem(PENDING_AUTH_KEY, JSON.stringify({ productId }));
      showAccountDialog();
    } catch (error) {
      showAccountDialog();
      setAccountMessage(error.message || 'No se pudo guardar el diseño. Revisa el almacenamiento del navegador.', 'error');
    }
  }

  document.getElementById('cart-button').addEventListener('click', showCartDialog);
  document.getElementById('account-button').addEventListener('click', showAccountDialog);
  document.getElementById('mobile-account-button').addEventListener('click', () => {
    document.getElementById('mobile-nav').classList.add('hidden');
    showAccountDialog();
  });
  cartDialog.querySelectorAll('[data-close-cart]').forEach((button) => button.addEventListener('click', () => cartDialog.close()));
  document.getElementById('cart-back').addEventListener('click', showCartDialog);
  cartCheckout.addEventListener('click', () => {
    if (!currentUser) {
      cartDialog.close();
      showAccountDialog();
      return;
    }
    const items = getCartSummary();
    if (!items.length) return;
    renderOrderReview();
  });

  document.getElementById('cart-confirm').addEventListener('click', async () => {
    if (!currentUser || isSubmittingOrder) return;
    if (!supabase) {
      cartError.textContent = 'El registro de solicitudes no está disponible ahora. Inténtalo más tarde.';
      cartError.classList.remove('hidden');
      return;
    }
    const nombre = cartFirstName.value.trim();
    const apellidos = cartLastName.value.trim();
    const items = getCartSummary();
    if (!nombre || !apellidos || !items.length) {
      cartError.textContent = 'Añade tu nombre y apellidos y revisa que tu cesta tenga algún diseño.';
      cartError.classList.remove('hidden');
      return;
    }

    isSubmittingOrder = true;
    const confirmButton = document.getElementById('cart-confirm');
    confirmButton.disabled = true;
    confirmButton.textContent = 'Guardando solicitud...';
    try {
      const result = await registrarPedidos(items.map(({ product, quantity }) => ({
        userId: currentUser.id,
        nombre,
        apellidos,
        email: currentUser.email,
        modelo: quantity > 1 ? `${product.name} × ${quantity}` : product.name,
        tags: product.tags,
        estado: 'interesado_7_dias'
      })));
      if (!result.success) throw new Error(result.error || 'No se pudo registrar la solicitud.');
      clearCart(currentUser.id);
      cartReviewView.hidden = true;
      cartReviewView.classList.add('hidden');
      cartReviewFooter.hidden = true;
      cartReviewFooter.classList.add('hidden');
      cartItemsView.hidden = false;
      cartItemsView.classList.remove('hidden');
      cartFooter.hidden = true;
      cartFooter.classList.add('hidden');
      cartSuccess.classList.remove('hidden');
      cartSuccess.classList.add('block');
      cartItems.replaceChildren();
      cartEmpty.classList.add('hidden');
      cartSubtitle.textContent = 'Solicitud registrada · sin cobro hoy';
      updateCartBadge();
    } catch (error) {
      console.error('Error al confirmar la solicitud de la cesta:', error);
      cartError.textContent = error.message || 'No se pudo registrar la solicitud. Inténtalo de nuevo.';
      cartError.classList.remove('hidden');
    } finally {
      isSubmittingOrder = false;
      confirmButton.disabled = false;
      confirmButton.textContent = 'Confirmar solicitud';
    }
  });

  accountForm.querySelectorAll('[data-checkout-step]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const step = Number(tab.dataset.checkoutStep);
      if (step <= maxAccountStep) setAccountStep(step);
    });
  });
  accountForm.querySelectorAll('[data-step-next]').forEach((button) => {
    button.addEventListener('click', () => {
      if (accountStep === 1 && !emailInput.checkValidity()) {
        emailInput.reportValidity();
        return;
      }
      if (accountStep === 2) {
        const email = emailInput.value.trim().toLowerCase();
        const repeatedEmail = emailConfirmInput.value.trim().toLowerCase();
        if (!emailConfirmInput.checkValidity() || email !== repeatedEmail) {
          setAccountMessage('Los correos no coinciden. Escríbelos igual para continuar.', 'error');
          emailConfirmInput.focus();
          return;
        }
      }
      if (accountStep === 3 && (!firstNameInput.value.trim() || !lastNameInput.value.trim() || !passwordInput.value.trim())) {
        setAccountMessage('Escribe tu nombre, apellidos y contraseña para continuar.', 'error');
        return;
      }
      maxAccountStep = Math.max(maxAccountStep, Number(button.dataset.stepNext));
      accountReviewEmail.textContent = emailInput.value.trim();
      setAccountStep(Number(button.dataset.stepNext));
    });
  });
  accountForm.querySelectorAll('[data-step-back]').forEach((button) => {
    button.addEventListener('click', () => setAccountStep(Number(button.dataset.stepBack)));
  });

  accountForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!supabase) {
      setAccountMessage('El inicio de sesión no está configurado ahora. Inténtalo más tarde.', 'error');
      return;
    }
    if (isSubmittingAuth) return;
    const email = emailInput.value.trim().toLowerCase();
    const repeatedEmail = emailConfirmInput.value.trim().toLowerCase();
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const password = passwordInput.value;

    if (!emailInput.checkValidity() || !repeatedEmail || email !== repeatedEmail || !firstName || !lastName || !password) {
      setAccountMessage('Revisa tu correo, nombre, apellidos y contraseña antes de continuar.', 'error');
      return;
    }
    if (password.length < 6) {
      setAccountMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
      passwordInput.focus();
      return;
    }

    isSubmittingAuth = true;
    accountSubmit.disabled = true;
    accountSubmit.textContent = 'Creando cuenta...';
    try {
      const pending = getPendingAuth() || {};
      localStorage.setItem(PENDING_AUTH_KEY, JSON.stringify({ ...pending, firstName, lastName, email }));
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nombre: firstName, apellidos: lastName }
        }
      });
      if (error) throw error;
      if (data?.session) {
        setAccountMessage('Cuenta creada. Ya puedes seguir con tu cesta.', 'info');
      } else {
        loginEmailInput.value = email;
        setAccountMode('login');
        setAccountMessage('Cuenta creada. Si Supabase te pide confirmar el correo, confírmalo y luego inicia sesión con tu contraseña.', 'info');
      }
    } catch (error) {
      console.error('No se pudo crear la cuenta:', error);
      setAccountMessage(error.message || 'No se pudo crear la cuenta. Comprueba los datos e inténtalo de nuevo.', 'error');
    } finally {
      isSubmittingAuth = false;
      accountSubmit.disabled = false;
      accountSubmit.textContent = 'Crear cuenta';
    }
  });

  signOutButton.addEventListener('click', async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAccountMessage(error.message || 'No se pudo cerrar sesión.', 'error');
      return;
    }
    currentUser = null;
    accountDialog.close();
    updateCartBadge();
  });

  accountDialog.querySelector('#modal-close-btn').addEventListener('click', () => accountDialog.close());
  accountDialog.addEventListener('click', (event) => {
    if (event.target === accountDialog) accountDialog.close();
  });
  cartDialog.addEventListener('click', (event) => {
    if (event.target === cartDialog) cartDialog.close();
  });
  window.addToCart = openAccountForAdd;
  window.openCheckoutModal = openAccountForAdd;
  window.openCart = showCartDialog;
  window.addEventListener('targetsticker:cart-updated', (event) => {
    if (event.detail.userId === currentUser?.id) updateCartBadge();
  });

  updateCartBadge();
  loginTab.addEventListener('click', () => setAccountMode('login'));
  signupTab.addEventListener('click', () => setAccountMode('signup'));
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!supabase) {
      setAccountMessage('El inicio de sesión no está configurado ahora. Inténtalo más tarde.', 'error');
      return;
    }

    const email = loginEmailInput.value.trim().toLowerCase();
    const password = loginPasswordInput.value;
    if (!loginEmailInput.checkValidity() || !password) {
      setAccountMessage('Escribe un correo válido y tu contraseña para iniciar sesión.', 'error');
      return;
    }
    if (isSubmittingAuth) return;

    isSubmittingAuth = true;
    loginSubmit.disabled = true;
    loginSubmit.textContent = 'Iniciando sesión...';
    try {
      const pending = getPendingAuth();
      if (pending?.productId) {
        localStorage.setItem(PENDING_AUTH_KEY, JSON.stringify({ ...pending, email }));
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await completeSignIn(data.session);
    } catch (error) {
      console.error('No se pudo iniciar sesión:', error);
      setAccountMessage(error.message || 'No se pudo iniciar sesión. Comprueba el correo y la contraseña.', 'error');
    } finally {
      isSubmittingAuth = false;
      loginSubmit.disabled = false;
      loginSubmit.textContent = 'Iniciar sesión';
    }
  });
  if (supabase) {
    supabase.auth.onAuthStateChange((_event, session) => {
      void completeSignIn(session);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('No se pudo recuperar la sesión:', error);
        return;
      }
      currentUser = data.session?.user || null;
      updateCartBadge();
      if (currentUser && getPendingAuth()) void completeSignIn(data.session);
    });
  }
}
