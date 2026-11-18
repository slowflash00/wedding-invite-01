/**
 * gallery.js — Photo Gallery & Fullscreen Lightbox
 * Supports multiple photos, keyboard navigation, swipe on mobile.
 */

(function initGallery(config) {
  if (!config.features.gallery) return;

  const { $ } = window.WeddingUtils;
  const dialog       = $('#gallery-lightbox');
  const lightboxImg  = $('#lightbox-image');
  const captionEl    = $('#lightbox-caption');
  const positionEl   = $('#lightbox-position');
  const closeBtn     = $('#lightbox-close');
  const prevBtn      = document.querySelector('.lightbox-prev');
  const nextBtn      = document.querySelector('.lightbox-next');

  if (!dialog || !lightboxImg) return;

  let photos   = [];   // { el, full, alt, caption }
  let current  = 0;

  // Collect all gallery photo buttons
  document.querySelectorAll('.gallery-photo').forEach((btn, idx) => {
    photos.push({
      el:      btn,
      full:    btn.dataset.full,
      alt:     btn.querySelector('img')?.alt ?? '',
      caption: btn.closest('figure')?.querySelector('figcaption p')?.textContent ?? '',
    });

    btn.addEventListener('click', () => openLightbox(idx));
  });

  function openLightbox(index) {
    current = index;
    showPhoto(current);
    dialog.showModal();
    document.body.classList.add('gallery-viewing');
    closeBtn?.focus();
  }

  function closeLightbox() {
    dialog.close();
  }

  function showPhoto(index) {
    const photo = photos[index];
    if (!photo) return;
    lightboxImg.src = photo.full;
    lightboxImg.alt = photo.alt;
    if (captionEl)  captionEl.textContent  = photo.caption;
    if (positionEl) positionEl.textContent = photo.caption;
    updateNavButtons();
  }

  function updateNavButtons() {
    if (prevBtn) prevBtn.disabled = (current === 0);
    if (nextBtn) nextBtn.disabled = (current === photos.length - 1);
  }

  function prev() {
    if (current > 0) { current--; showPhoto(current); }
  }
  function next() {
    if (current < photos.length - 1) { current++; showPhoto(current); }
  }

  // Button events
  closeBtn?.addEventListener('click', closeLightbox);
  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);

  // Keyboard navigation inside dialog
  dialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  });

  // Click backdrop to close
  dialog.addEventListener('click', e => {
    if (e.target === dialog) closeLightbox();
  });

  // On close — restore focus
  dialog.addEventListener('close', () => {
    document.body.classList.remove('gallery-viewing');
    photos[current]?.el.focus({ preventScroll: true });
  });

  /* ── Swipe support ──────────────────────────────────────── */
  let touchStartX = null;
  lightboxImg?.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  lightboxImg?.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) next(); else prev();
  }, { passive: true });

})(weddingConfig);
