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

const chatModal = document.querySelector('[data-chat-modal]');

if (chatModal) {
  const chatDialog = chatModal.querySelector('[data-chat-dialog]');
  const chatOpenButton = chatModal.querySelector('[data-chat-open]');
  const chatCloseButton = chatModal.querySelector('[data-chat-close]');
  const chatForm = chatModal.querySelector('[data-chat-form]');
  const chatInput = chatForm?.querySelector('[data-chat-input]');
  const chatThread = chatModal.querySelector('[data-chat-thread]');
  const typingIndicator = chatModal.querySelector('[data-typing]');
  const focusableSelectors =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  let isTrapActive = false;
  let previouslyFocusedElement = null;
  let replyTimeoutId = null;
  let replyIndex = 0;

  const cannedReplies = [
    "Thanks for the note! I'll send over more details shortly.",
    'Appreciate you reaching out—let me line up a quick follow-up for us.',
    'Sounds great! I will drop you a message with examples we can explore together.'
  ];

  const getCannedReply = () => {
    const reply = cannedReplies[replyIndex % cannedReplies.length];
    replyIndex += 1;
    return reply;
  };

  const isElementVisible = (element) => {
    if (!element) return false;
    return element.getClientRects().length > 0;
  };

  const trapFocus = (event) => {
    if (!isTrapActive || !chatDialog) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeChat();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = Array.from(chatDialog.querySelectorAll(focusableSelectors)).filter((element) =>
      isElementVisible(element)
    );

    if (focusable.length === 0) return;

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];
    const isShiftPressed = event.shiftKey;
    const activeElement = document.activeElement;

    if (!isShiftPressed && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    } else if (isShiftPressed && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  };

  const scrollThreadToBottom = () => {
    if (!chatThread) return;
    chatThread.scrollTo({ top: chatThread.scrollHeight, behavior: 'smooth' });
  };

  const appendMessage = (sender, text) => {
    if (!chatThread) return;
    const message = document.createElement('div');
    message.className = `chat-message from-${sender}`;
    message.setAttribute('data-message-sender', sender);

    const bubble = document.createElement('p');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;

    message.appendChild(bubble);
    chatThread.appendChild(message);
    scrollThreadToBottom();
  };

  const toggleTyping = (isTyping) => {
    if (!typingIndicator) return;
    typingIndicator.hidden = !isTyping;
    typingIndicator.setAttribute('aria-hidden', String(!isTyping));
    scrollThreadToBottom();
  };

  const openChat = () => {
    if (!chatDialog) return;
    chatModal.classList.add('is-open');
    chatDialog.setAttribute('aria-hidden', 'false');
    chatOpenButton?.setAttribute('aria-expanded', 'true');
    previouslyFocusedElement = document.activeElement;
    isTrapActive = true;
    document.addEventListener('keydown', trapFocus);
    window.requestAnimationFrame(() => {
      chatInput?.focus();
      scrollThreadToBottom();
    });
  };

  const closeChat = () => {
    if (!chatDialog) return;
    chatModal.classList.remove('is-open');
    chatDialog.setAttribute('aria-hidden', 'true');
    chatOpenButton?.setAttribute('aria-expanded', 'false');
    isTrapActive = false;
    document.removeEventListener('keydown', trapFocus);
    if (replyTimeoutId) {
      window.clearTimeout(replyTimeoutId);
      replyTimeoutId = null;
    }
    toggleTyping(false);
    previouslyFocusedElement?.focus();
  };

  chatOpenButton?.addEventListener('click', () => {
    if (chatModal.classList.contains('is-open')) {
      closeChat();
    } else {
      openChat();
    }
  });

  chatCloseButton?.addEventListener('click', () => {
    closeChat();
  });

  chatForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = (chatInput?.value || '').toString().trim();
    if (!message) {
      chatInput?.focus();
      return;
    }

    appendMessage('user', message);
    chatForm.reset();
    chatInput?.focus();

    toggleTyping(true);

    if (replyTimeoutId) {
      window.clearTimeout(replyTimeoutId);
    }

    replyTimeoutId = window.setTimeout(() => {
      toggleTyping(false);
      appendMessage('chandar', getCannedReply());
    }, 900);
  });
}
