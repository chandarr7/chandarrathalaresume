const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const carousels = document.querySelectorAll('[data-carousel]');

carousels.forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const prevBtn = carousel.querySelector('[data-action="prev"]');
  const nextBtn = carousel.querySelector('[data-action="next"]');

  if (!track) return;

  const getScrollAmount = () => {
    const card = track.querySelector('.poster-card');
    if (!card) return 300;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '16');
    return card.getBoundingClientRect().width + gap;
  };

  const scrollBy = (direction) => {
    const amount = getScrollAmount();
    track.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  prevBtn?.addEventListener('click', () => scrollBy(-1));
  nextBtn?.addEventListener('click', () => scrollBy(1));

  const toggleControls = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    const currentScroll = track.scrollLeft;
    if (prevBtn) {
      prevBtn.disabled = currentScroll <= 0;
      prevBtn.classList.toggle('is-disabled', prevBtn.disabled);
    }
    if (nextBtn) {
      nextBtn.disabled = currentScroll >= maxScroll - 1;
      nextBtn.classList.toggle('is-disabled', nextBtn.disabled);
    }
  };

  track.addEventListener('scroll', toggleControls, { passive: true });
  window.addEventListener('resize', toggleControls);
  toggleControls();
});

const chatModal = document.querySelector('[data-chat-modal]');
const chatOverlay = document.querySelector('[data-chat-overlay]');
const chatOpeners = document.querySelectorAll('[data-chat-open]');
const chatCloseBtn = document.querySelector('[data-chat-close]');

if (chatModal && chatOverlay) {
  const focusableSelector =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  let lastFocusedElement = null;
  const transitionDuration = 300;

  const openChat = () => {
    if (chatModal.classList.contains('is-visible')) return;

    lastFocusedElement = document.activeElement;
    chatModal.hidden = false;
    chatOverlay.hidden = false;
    chatModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-chat-open');

    requestAnimationFrame(() => {
      chatModal.classList.add('is-visible');
      chatOverlay.classList.add('is-visible');
      const focusTarget =
        chatModal.querySelector('[data-autofocus]') || chatModal.querySelector(focusableSelector);
      focusTarget?.focus({ preventScroll: true });
    });
  };

  const closeChat = () => {
    if (!chatModal.classList.contains('is-visible')) return;

    chatModal.classList.remove('is-visible');
    chatOverlay.classList.remove('is-visible');
    chatModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-chat-open');

    window.setTimeout(() => {
      chatModal.hidden = true;
      chatOverlay.hidden = true;
      if (lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus({ preventScroll: true });
      }
      lastFocusedElement = null;
    }, transitionDuration);
  };

  chatOpeners.forEach((opener) => opener.addEventListener('click', openChat));
  chatCloseBtn?.addEventListener('click', closeChat);
  chatOverlay.addEventListener('click', closeChat);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && chatModal.classList.contains('is-visible')) {
      closeChat();
    }
  });

  chatModal.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || !chatModal.classList.contains('is-visible')) {
      return;
    }

    const focusable = Array.from(chatModal.querySelectorAll(focusableSelector)).filter(
      (element) => !element.hasAttribute('disabled') && element.getAttribute('tabindex') !== '-1'
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  });
}
