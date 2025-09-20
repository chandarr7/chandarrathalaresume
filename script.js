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

const contactForm = document.getElementById('contact-form');

if (contactForm) {
  const statusEl = contactForm.querySelector('[data-status]');
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const nameInput = contactForm.querySelector('[name="fullName"]');
  const emailInput = contactForm.querySelector('[name="email"]');
  const messageInput = contactForm.querySelector('[name="message"]');

  const setStatus = (message, state) => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('is-error', 'is-success', 'is-pending');
    if (state) {
      statusEl.classList.add(`is-${state}`);
    }
  };

  [nameInput, emailInput, messageInput].forEach((input) => {
    input?.addEventListener('input', () => setStatus('', null));
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const fullName = (formData.get('fullName') || '').toString().trim();
    const email = (formData.get('email') || '').toString().trim();
    const message = (formData.get('message') || '').toString().trim();

    if (!fullName) {
      setStatus('Please share your name so I know who is reaching out.', 'error');
      nameInput?.focus();
      return;
    }

    if (!email) {
      setStatus('Please provide an email address so I can respond.', 'error');
      emailInput?.focus();
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setStatus('Enter a valid email address so I can reach you back.', 'error');
      emailInput?.focus();
      return;
    }

    if (!message) {
      setStatus('Let me know how I can help by adding a quick message.', 'error');
      messageInput?.focus();
      return;
    }

    setStatus('Sending…', 'pending');
    submitButton?.setAttribute('disabled', 'true');
    submitButton?.setAttribute('aria-busy', 'true');

    window.setTimeout(() => {
      contactForm.reset();
      setStatus('Thanks for reaching out! I’ll respond as soon as possible.', 'success');
      submitButton?.removeAttribute('disabled');
      submitButton?.removeAttribute('aria-busy');
    }, 700);
  });
}
