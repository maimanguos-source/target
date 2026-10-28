import confetti from 'canvas-confetti';
import { PRODUCTS, getProductById } from './products.js';
import { renderPayPalButtons } from './paypal.js';
import { registrarPedido } from './supabase.js';

let activeModel = PRODUCTS[0];
let isProcessing = false;

/**
 * Dispara confeti festivo para la pantalla de confirmación
 */
function fireCelebrationConfetti() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}

/**
 * Inicializa el modal nativo <dialog> y sus eventos
 */
export function initCheckoutModal() {
  const dialog = document.getElementById('checkout-modal');
  if (!dialog) return;

  const closeBtn = document.getElementById('modal-close-btn');
  const checkoutView = document.getElementById('modal-checkout-view');
  const successView = document.getElementById('modal-success-view');
  const emailInput = document.getElementById('checkout-email');
  const modelSelect = document.getElementById('checkout-model-select');
  const modalSelectedImg = document.getElementById('modal-selected-img');
  const modalSelectedName = document.getElementById('modal-selected-name');
  const modalSelectedPrice = document.getElementById('modal-selected-price');
  const simulatePayBtn = document.getElementById('simulate-pay-btn');
  const modalErrorMsg = document.getElementById('modal-error-message');
  const successDoneBtn = document.getElementById('success-done-btn');

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
    if (modalSelectedPrice) modalSelectedPrice.textContent = activeModel.priceFormatted;
    if (modelSelect && modelSelect.value !== activeModel.id) {
      modelSelect.value = activeModel.id;
    }
  }

  function showError(msg) {
    if (!modalErrorMsg) return;
    modalErrorMsg.textContent = msg;
    modalErrorMsg.classList.remove('hidden');
    setTimeout(() => {
      modalErrorMsg.classList.add('hidden');
    }, 5000);
  }

  function getEmail() {
    return emailInput ? emailInput.value.trim() : '';
  }

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function handleOrderSuccess({ payerEmail, model }) {
    if (isProcessing) return;
    isProcessing = true;

    // Mostrar feedback visual de carga en el modal
    const originalBtnText = simulatePayBtn ? simulatePayBtn.innerHTML : '';
    if (simulatePayBtn) {
      simulatePayBtn.disabled = true;
      simulatePayBtn.innerHTML = `
        <span class="inline-flex items-center gap-2">
          <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          Registrando tu reserva...
        </span>
      `;
    }

    try {
      // 1. Guardar en Supabase en la tabla "pedidos"
      const result = await registrarPedido({
        email: payerEmail,
        modelo: model.name,
        estado: 'reservado_7_dias'
      });

      console.log('Resultado del pedido:', result);

      // 2. Transicionar a la vista de confirmación "Fake Door"
      if (checkoutView) checkoutView.classList.add('hidden');
      if (successView) successView.classList.remove('hidden');

      // Actualizar detalles del resumen de éxito
      const successEmail = document.getElementById('success-summary-email');
      const successModel = document.getElementById('success-summary-model');
      const successOrderDate = document.getElementById('success-summary-date');
      const successBatchDate = document.getElementById('success-batch-date');

      if (successEmail) successEmail.textContent = payerEmail;
      if (successModel) successModel.textContent = model.name;
      if (successOrderDate) {
        successOrderDate.textContent = new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
      }

      // Fecha estimada en 7 días
      if (successBatchDate) {
        const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        successBatchDate.textContent = in7Days.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });
      }

      // 3. Disparar confeti festivo
      fireCelebrationConfetti();

    } catch (err) {
      console.error('Error al procesar reserva:', err);
      showError('Ocurrió un error inesperado. Por favor inténtalo de nuevo.');
    } finally {
      isProcessing = false;
      if (simulatePayBtn) {
        simulatePayBtn.disabled = false;
        simulatePayBtn.innerHTML = originalBtnText;
      }
    }
  }

  // Evento botón Simular Pago (Test / Demo)
  if (simulatePayBtn) {
    simulatePayBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = getEmail();
      if (!validateEmail(email)) {
        showError('Por favor introduce un correo electrónico válido para recibir tu número de seguimiento.');
        if (emailInput) emailInput.focus();
        return;
      }

      await handleOrderSuccess({
        payerEmail: email,
        model: activeModel
      });
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

  // Al abrir el modal
  window.openCheckoutModal = function (productId) {
    if (productId) {
      updateSelectedModel(productId);
    }
    // Restablecer vistas
    if (checkoutView) checkoutView.classList.remove('hidden');
    if (successView) successView.classList.add('hidden');
    if (modalErrorMsg) modalErrorMsg.classList.add('hidden');

    dialog.showModal();

    // Autofocus en el input de email
    setTimeout(() => {
      if (emailInput) emailInput.focus();
    }, 50);

    // Renderizar botones de PayPal
    renderPayPalButtons({
      containerId: 'paypal-button-container',
      getModel: () => activeModel,
      getEmail: () => getEmail(),
      onPaymentSuccess: handleOrderSuccess,
      onError: showError
    });
  };
}

