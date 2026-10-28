/**
 * Controlador para la simulación interactiva 3D de la tarjeta en el Hero
 * Maneja el efecto de perspectiva, brillo especular (glare) y cambio de skins.
 */
export function initCard3D({ cardElementId, containerElementId, glareElementId }) {
  const card = document.getElementById(cardElementId);
  const container = document.getElementById(containerElementId);
  const glare = document.getElementById(glareElementId);

  if (!card || !container) return;

  let bounds = container.getBoundingClientRect();

  function updateBounds() {
    bounds = container.getBoundingClientRect();
  }

  window.addEventListener('resize', updateBounds);
  window.addEventListener('scroll', updateBounds, { passive: true });

  function handlePointerMove(e) {
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;

    const percentX = mouseX / bounds.width;
    const percentY = mouseY / bounds.height;

    // Calcular rotaciones máximas (ej: +- 15 grados)
    const rotateY = (percentX - 0.5) * 26;
    const rotateX = (0.5 - percentY) * 26;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

    if (glare) {
      glare.style.setProperty('--mouse-x', `${(percentX * 100).toFixed(1)}%`);
      glare.style.setProperty('--mouse-y', `${(percentY * 100).toFixed(1)}%`);
      glare.style.setProperty('--glare-opacity', '0.45');
    }
  }

  function handlePointerLeave() {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    if (glare) {
      glare.style.setProperty('--glare-opacity', '0');
    }
  }

  container.addEventListener('pointerenter', () => {
    updateBounds();
  });
  container.addEventListener('pointermove', handlePointerMove);
  container.addEventListener('pointerleave', handlePointerLeave);

  // Soporte para inclinación por giroscopio móvil si está disponible
  if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma !== null && e.beta !== null) {
        const tiltX = Math.min(Math.max(e.beta - 45, -20), 20);
        const tiltY = Math.min(Math.max(e.gamma, -20), 20);
        card.style.transform = `perspective(1000px) rotateX(${(-tiltX * 0.4).toFixed(2)}deg) rotateY(${(tiltY * 0.4).toFixed(2)}deg)`;
      }
    }, { passive: true });
  }
}

