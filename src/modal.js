import { PRODUCTS, getProductById } from './products.js';
import { registrarPedido, supabase } from './supabase.js';

const PENDING_ORDER_KEY = 'targetsticker_pending_order';

export function initCheckoutModal() {
  const dialog = document.getElementById('checkout-modal');
  if (!dialog) return;

  const closeBtn = document.getElementById('modal-close-btn');
  const checkoutView = document.getElementById('modal-checkout-view');
  const successView = document.getElementById('modal-success-view');
  const emailInput = document.getElementById('checkout-email');
  const firstNameInput = document.getElementById('checkout-first-name');
  const lastNameInput = document.getElementById('checkout-last-name');
  const reservationForm = document.getElementById('reservation-form');
  const submitBtn = document.getElementById('reservation-submit-btn');
  const modelSelect = document.getElementById('checkout-model-select');
  const modalSelectedImg = document.getElementById('modal-selected-img');
  const modalSelectedName = document.getElementById('modal-selected-name');
  const modalSelectedPrice = document.getElementById('modal-selected-price');
  const reviewName = document.getElementById('checkout-review-name');
  const reviewPrice = document.getElementById('checkout-review-price');
  const modalErrorMsg = document.getElementById('modal-error-message');
  const modalInfoMsg = document.getElementById('modal-info-message');
  const successDoneBtn = document.getElementById('success-done-btn');
  const stepTabs = [...dialog.querySelectorAll('[data-checkout-step]')];
  const stepPanels = [...dialog.querySelectorAll('[data-checkout-panel]')];
  let activeModel = PRODUCTS[0];
  let currentSession = null;
  let isProcessing = false;
  let currentStep = 1;
  let maxVisitedStep = 1;

  // Popular el selector de modelos
  if (modelSelect) {
    modelSelect.innerHTML = PRODUCTS.map(p => `
      <option value="${p.id}">${p.name} - ${p.priceFormatted}</option>
    `).join('');

    modelSelect.addEventListener('change', (e) => {
      updateSelectedModel(e.target.value);
    });
  }

  function updateSelectedModel(productId) {
    activeModel = getProductById(productId);
    if (modalSelectedImg) modalSelectedImg.src = activeModel.image;
    if (modalSelectedName) modalSelectedName.textContent = activeModel.name;
    if (modalSelectedPrice) modalSelectedPrice.textContent = `${activeModel.priceFormatted} · Envío gratis`;
    if (reviewName) reviewName.textContent = activeModel.name;
    if (reviewPrice) reviewPrice.textContent = activeModel.priceFormatted;
    if (modelSelect && modelSelect.value !== activeModel.id) {
      modelSelect.value = activeModel.id;
    }
  }

  function updateCheckoutStep(step) {
    currentStep = step;
    if (modalErrorMsg) modalErrorMsg.classList.add('hidden');
    if (modalInfoMsg) modalInfoMsg.classList.add('hidden');
    stepTabs.forEach((tab) => {
      const tabStep = Number(tab.dataset.checkoutStep);
      const isActive = tabStep === step;
      tab.classList.toggle('is-active', isActive);
      tab.classList.toggle('is-complete', tabStep < step);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      tab.disabled = tabStep > maxVisitedStep;
    });
    stepPanels.forEach((panel) => {
      const isActive = Number(panel.dataset.checkoutPanel) === step;
      panel.hidden = !isActive;
      panel.classList.toggle('hidden', !isActive);
    });
  }

  function showError(msg) {
    if (!modalErrorMsg) return;
    modalErrorMsg.textContent = msg;
    modalErrorMsg.classList.remove('hidden');
    if (modalInfoMsg) modalInfoMsg.classList.add('hidden');
  }

  function showInfo(msg) {
    if (!modalInfoMsg) return;
    modalInfoMsg.textContent = msg;
    modalInfoMsg.classList.remove('hidden');
    if (modalErrorMsg) modalErrorMsg.classList.add('hidden');
  }

  function getPendingOrder() {
    try {
      return JSON.parse(localStorage.getItem(PENDING_ORDER_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function showConfirmation(pending) {
    const model = getProductById(pending.productId);
    if (checkoutView) checkoutView.classList.add('hidden');
    if (successView) successView.classList.remove('hidden');
    if (!dialog.open) dialog.showModal();

    const successEmail = document.getElementById('success-summary-email');
    const successModel = document.getElementById('success-summary-model');
    const successOrderDate = document.getElementById('success-summary-date');
    const successBatchDate = document.getElementById('success-batch-date');
    if (successEmail) successEmail.textContent = pending.email;
    if (successModel) successModel.textContent = model.name;
    if (successOrderDate) {
      successOrderDate.textContent = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    }
    if (successBatchDate) {
      const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      successBatchDate.textContent = in7Days.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  }

  async function processPendingOrder(user) {
    const pending = getPendingOrder();
    if (!supabase || !user || !pending || isProcessing) return;
    if (user.email?.toLowerCase() !== pending.email.toLowerCase()) {
      showError('Inicia sesión con el mismo correo al que enviamos el enlace.');
      return;
    }

    isProcessing = true;
    if (submitBtn) submitBtn.disabled = true;
    try {
      const result = await registrarPedido({
        userId: user.id,
        nombre: pending.firstName,
        apellidos: pending.lastName,
        email: user.email,
        modelo: getProductById(pending.productId).name,
        tags: getProductById(pending.productId).tags,
        estado: 'interesado_7_dias'
      });

      if (!result.success) throw new Error(result.error || 'No se pudo guardar la solicitud.');
      localStorage.removeItem(PENDING_ORDER_KEY);
      showConfirmation(pending);
    } catch (err) {
      console.error('Error al registrar interés:', err);
      showError('No se pudo guardar tu solicitud. Inténtalo de nuevo en unos minutos.');
    } finally {
      isProcessing = false;
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function setSessionUser(user) {
    currentSession = user ? { user } : null;
    if (!emailInput || !user) return;
    emailInput.value = user.email || '';
    emailInput.readOnly = true;
    if (submitBtn) submitBtn.textContent = 'Confirmar mi interés';
  }

  stepTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const step = Number(tab.dataset.checkoutStep);
      if (step <= maxVisitedStep) updateCheckoutStep(step);
    });
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const availableTabs = stepTabs.filter((stepTab) => Number(stepTab.dataset.checkoutStep) <= maxVisitedStep);
      const currentIndex = availableTabs.indexOf(tab);
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextTab = availableTabs[(currentIndex + direction + availableTabs.length) % availableTabs.length];
      updateCheckoutStep(Number(nextTab.dataset.checkoutStep));
      nextTab.focus();
    });
  });

  dialog.querySelectorAll('[data-step-next]').forEach((button) => {
    button.addEventListener('click', () => {
      if (currentStep === 2) {
        const missingName = [firstNameInput, lastNameInput].find((input) => !input.value.trim());
        if (missingName) {
          showError('Escribe tu nombre y apellidos para continuar.');
          missingName.focus();
          return;
        }
      }

      const nextStep = Number(button.dataset.stepNext);
      maxVisitedStep = Math.max(maxVisitedStep, nextStep);
      if (modalErrorMsg) modalErrorMsg.classList.add('hidden');
      updateCheckoutStep(nextStep);
      if (nextStep === 2) firstNameInput?.focus();
      if (nextStep === 3) emailInput?.focus();
    });
  });

  dialog.querySelectorAll('[data-step-back]').forEach((button) => {
    button.addEventListener('click', () => updateCheckoutStep(Number(button.dataset.stepBack)));
  });

  if (reservationForm) {
    reservationForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const missingName = [firstNameInput, lastNameInput].find((input) => !input.value.trim());
      if (missingName) {
        updateCheckoutStep(2);
        showError('Escribe tu nombre y apellidos para continuar.');
        missingName.focus();
        return;
      }

      if (!emailInput.checkValidity()) {
        updateCheckoutStep(3);
        showError('Introduce un correo electrónico válido para continuar.');
        emailInput.focus();
        emailInput.reportValidity();
        return;
      }

      if (!supabase) {
        showError('El registro no está disponible ahora. Inténtalo más tarde.');
        return;
      }

      const firstName = firstNameInput.value.trim();
      const lastName = lastNameInput.value.trim();
      const email = emailInput.value.trim().toLowerCase();
      if (!firstName || !lastName || !email) {
        showError('Completa tu nombre, apellidos y correo electrónico.');
        return;
      }

      if (currentSession?.user.email?.toLowerCase() !== email && currentSession) {
        showError('El correo debe coincidir con la sesión iniciada.');
        return;
      }

      const pending = {
        firstName,
        lastName,
        email,
        productId: activeModel.id
      };

      try {
        localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(pending));
      } catch {
        showError('No se pudo guardar temporalmente la solicitud. Revisa la configuración del navegador.');
        return;
      }

      if (currentSession?.user) {
        await processPendingOrder(currentSession.user);
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando enlace...';
      }
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
            data: { nombre: firstName, apellidos: lastName },
            emailRedirectTo: `${window.location.origin}${window.location.pathname}`
          }
        });
        if (error) throw error;
        showInfo('Te hemos enviado un enlace. Ábrelo en este mismo navegador para confirmar tu registro y guardar la solicitud.');
      } catch (err) {
        localStorage.removeItem(PENDING_ORDER_KEY);
        showError(err.message || 'No se pudo enviar el enlace. Comprueba el correo e inténtalo de nuevo.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = currentSession?.user ? 'Confirmar mi interés' : 'Enviarme el enlace seguro';
        }
      }
    });
  }

  // Cerrar modal
  if (closeBtn) {
    closeBtn.addEventListener('click', () => dialog.close());
  }

  if (successDoneBtn) {
    successDoneBtn.addEventListener('click', () => dialog.close());
  }

  // Light dismiss conforme a la guía de Modern Web Guidance para <dialog>
  // Detecta clics en el backdrop calculando las coordenadas del bounding rect
  const isOutside = (e, d) => {
    const r = d.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };

  let pressedOutside = false;
  dialog.addEventListener('pointerdown', (e) => {
    pressedOutside = isOutside(e, dialog);
  });
  dialog.addEventListener('pointerup', (e) => {
    if (pressedOutside && isOutside(e, dialog)) {
      dialog.close();
    }
  });

  window.openCheckoutModal = function (productId) {
    if (productId) {
      updateSelectedModel(productId);
    }
    if (checkoutView) checkoutView.classList.remove('hidden');
    if (successView) successView.classList.add('hidden');
    if (modalErrorMsg) modalErrorMsg.classList.add('hidden');
    if (modalInfoMsg) modalInfoMsg.classList.add('hidden');

    currentStep = 1;
    maxVisitedStep = 1;
    updateCheckoutStep(1);
    dialog.showModal();
    setTimeout(() => modelSelect?.focus(), 50);

    if (currentSession?.user) {
      setSessionUser(currentSession.user);
    } else {
      if (emailInput) emailInput.readOnly = false;
      if (submitBtn) submitBtn.textContent = 'Enviarme el enlace seguro';
    }
  };

  if (supabase) {
    supabase.auth.onAuthStateChange((_event, session) => {
      currentSession = session;
      if (session?.user) {
        setSessionUser(session.user);
        setTimeout(() => processPendingOrder(session.user), 0);
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) return;
      currentSession = data.session;
      if (data.session?.user) {
        setSessionUser(data.session.user);
        void processPendingOrder(data.session.user);
      }
    });
  }
}
