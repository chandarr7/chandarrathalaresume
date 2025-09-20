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
