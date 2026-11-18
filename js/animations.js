/**
 * animations.js
 * ─────────────
 * Responsibilities:
 *  1. IntersectionObserver scroll-reveals (.reveal → .visible)
 *  2. Hero petal shower (florals)
 *  3. Scroll-driven letter extraction
 */

(function initAnimations() {
  const { $ } = window.WeddingUtils;
  const invitation = $('#invitation');

  /* ── SCROLL REVEAL ──────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting && !invitation?.inert) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Expose so countdown.js can observe the calendar link after it's shown
  window._revealObserver = revealObserver;

  /* ── LETTER SCROLL EXTRACTION ───────────────────────────── */
  const letterEnvelope = $('#letter-envelope');
  const letterScroll   = $('#letter-scroll');
  const letterPaper    = letterEnvelope?.querySelector('.invitation-letter');
  const letterPocket   = letterEnvelope?.querySelector('.letter-front');
  const letterMotion   = matchMedia('(prefers-reduced-motion: reduce)');
  let letterFrame    = null;
  let letterNearby   = false;

  function renderLetterReveal() {
    letterFrame = null;
    if (!letterEnvelope || !letterScroll || !letterPaper || !letterPocket) return;
    const viewport = document.documentElement.clientHeight;
    const distance = Math.max(viewport * 0.85, letterPaper.offsetHeight + 200);
    const top      = letterScroll.getBoundingClientRect().top;
    const pinTop   = Math.max(16, viewport - letterEnvelope.clientHeight - 24);
    const progress = letterMotion.matches ? 1
                   : (invitation?.inert    ? 0
                   : Math.max(0, Math.min(1, (pinTop - top) / distance)));

    const pocketTop = letterEnvelope.clientHeight - letterPocket.offsetHeight;
    const tucked    = pocketTop - 76;
    const extracted = Math.min(24, pocketTop - letterPaper.offsetHeight - 24);

    letterScroll.style.setProperty('--letter-scroll-distance', `${distance.toFixed(2)}px`);
    letterEnvelope.style.setProperty(
      '--letter-offset',
      `${(tucked + (extracted - tucked) * progress).toFixed(2)}px`
    );
    letterEnvelope.dataset.letterProgress = progress.toFixed(3);
  }

  function scheduleLetterReveal() {
    if (letterFrame === null) letterFrame = requestAnimationFrame(renderLetterReveal);
  }
  window._scheduleLetterReveal = scheduleLetterReveal;

  if (letterScroll) {
    const letterObserver = new IntersectionObserver(entries => {
      letterNearby = entries[0].isIntersecting;
      scheduleLetterReveal();
    }, { rootMargin: '200px 0px' });
    letterObserver.observe(letterScroll);
  }

  addEventListener('scroll', () => { if (letterNearby) scheduleLetterReveal(); }, { passive: true });
  addEventListener('resize', scheduleLetterReveal, { passive: true });
  letterMotion.addEventListener('change', scheduleLetterReveal);
  if (letterPaper) new ResizeObserver(scheduleLetterReveal).observe(letterPaper);
  document.fonts.ready.then(scheduleLetterReveal);
  scheduleLetterReveal();

  /* ── HERO PETAL SHOWER ──────────────────────────────────── */
  (() => {
    const hero   = $('#home');
    if (!hero) return;
    const layer  = hero.querySelector('.hero-florals');
    if (!layer) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let started = false, finished = false, inView = false, cleanupTimer;

    function syncPlayback() {
      layer.classList.toggle('is-running', inView && !document.hidden && !motion.matches);
    }

    function clearPetals() {
      clearTimeout(cleanupTimer);
      layer.replaceChildren();
      layer.classList.remove('is-ready', 'is-running');
    }

    function finishBreeze() {
      if (finished) return;
      finished = true;
      layer.classList.remove('is-ready');
      cleanupTimer = setTimeout(clearPetals, 1100);
    }

    function startBreeze() {
      if (started || finished || motion.matches) return;
      started = true;
      const petals = document.createDocumentFragment();

      for (let index = 0; index < 20; index++) {
        const x        = 8 + ((index * 37) % 112);
        const size     = 9 + ((index * 11) % 13);
        const duration = 7 + (index % 7) * 0.45;
        const delay    = -duration * (((index * 17) % 36) / 36);
        const wind     = -18 - ((index * 7) % 27);
        const tilt     = ((index * 53) % 150) - 75;

        const petal = document.createElement('span');
        petal.className = 'hero-petal';
        petal.style.cssText = [
          `--x:${x}%`,
          `--size:${size}px`,
          `--duration:${duration}s`,
          `--delay:${delay}s`,
          `--wind:${wind}cqw`,
          `--tilt:${tilt}deg`,
          `--flutter:${(duration / 3).toFixed(2)}s`,
        ].join(';');

        // Try real image first; CSS fallback provides color
        const img = document.createElement('img');
        img.src = 'assets/florals/ivory-rose-petal.webp';
        img.alt = '';
        img.width   = 128;
        img.height  = 128;
        img.decoding = 'async';
        img.draggable = false;

        // If image fails (file missing), use a CSS-only petal
        img.addEventListener('error', () => {
          img.style.cssText = `width:100%;height:100%;border-radius:80% 0 80% 10%;background:#d1a2ad;display:block`;
          img.src = '';
        }, { once: true });

        petal.append(img);
        petals.append(petal);
      }

      layer.append(petals);
      layer.classList.add('is-ready');
      syncPlayback();
    }

    hero.addEventListener('animationstart', event => {
      if (event.target.matches('.hero-copy > .hero-prelude')
          && event.animationName === 'hero-text-arrive') {
        startBreeze();
      }
    });
    hero.addEventListener('animationend', event => {
      if (event.target.matches('.scroll-invitation')
          && event.animationName === 'hero-text-opacity') {
        finishBreeze();
      }
    });

    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    }).observe(hero);

    document.addEventListener('visibilitychange', syncPlayback);
    motion.addEventListener('change', () => {
      if (motion.matches) { finished = true; clearPetals(); }
      syncPlayback();
    });
  })();

})();
