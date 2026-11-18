/**
 * countdown.js
 * ─────────────
 * Responsibilities:
 *  1. Scratch-to-reveal date cards (Canvas API)
 *  2. Live countdown timer
 *  3. Celebration petal burst on all-revealed
 *  4. .ics calendar generation
 */

(function initCountdown(config) {
  const { $, $$, pad2, generateICS } = window.WeddingUtils;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── SCRATCH CARDS ─────────────────────────────────────── */
  const scratchCards = [];
  let dateRevealed  = false;

  function finishCard(card) {
    card.complete = true;
    card.canvas.parentElement.classList.add('complete');
    if (scratchCards.every(c => c.complete)) showRevealedDate();
  }

  function showRevealedDate() {
    if (dateRevealed) return;
    dateRevealed = true;

    const calendarLink = $('#calendar-link');
    if (calendarLink) {
      calendarLink.hidden = false;
      window._revealObserver?.observe(calendarLink);
    }

    const revealBtn = $('#reveal-date');
    if (revealBtn) {
      revealBtn.textContent = 'Two days of love, laughter & blessings ♡';
      revealBtn.disabled = true;
    }

    celebrationPetals();
  }

  function drawScratch(card) {
    if (card.complete) return;
    const { canvas } = card;
    const rect = canvas.getBoundingClientRect();
    const dpr  = Math.min(devicePixelRatio || 1, 2);
    canvas.width  = Math.round(rect.width  * dpr);
    canvas.height = Math.round(rect.height * dpr);
    card.width = rect.width;
    card.height = rect.height;
    card.dpr = dpr;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    card.ctx = ctx;
    ctx.scale(dpr, dpr);

    // Burgundy scratch foil gradient
    const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    grad.addColorStop(0,    '#814044');
    grad.addColorStop(0.5,  '#6c2e31');
    grad.addColorStop(1,    '#9a5d58');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Deterministic fine flecks evoke a pearly scratch foil
    for (let i = 0; i < 380; i++) {
      const x = ((i * 71 + 17) % 997) / 997 * rect.width;
      const y = ((i * 43 +  7) % 991) / 991 * rect.height;
      ctx.fillStyle = i % 2 ? '#ffffff21' : '#d7b77930';
      ctx.fillRect(x, y, 1, 1);
    }

    // Border and hint text
    ctx.strokeStyle = '#eff3f440';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 6, rect.width - 12, rect.height - 12);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f7f8f4d9';
    ctx.font = '23px Georgia';
    ctx.fillText('✧', rect.width / 2, rect.height / 2 - 5);

    ctx.fillStyle = '#f8faf7b8';
    ctx.font = '7px Arial';
    ctx.fillText(['A DAY', 'A MONTH', 'A FOREVER'][card.index], rect.width / 2, rect.height - 22);

    card.visited = new Set();
  }

  function setupScratchEvents(card) {
    const { canvas } = card;

    function scratch(e) {
      if (!card.active || card.complete) return;
      const bounds = canvas.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      const ctx = card.ctx;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth  = 29;
      ctx.lineCap    = 'round';
      ctx.lineJoin   = 'round';
      ctx.beginPath();
      ctx.moveTo(card.previous?.x ?? x, card.previous?.y ?? y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
      card.previous = { x, y };

      // Sample every 64th alpha pixel for performance
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let erased = 0, samples = 0;
      for (let i = 3; i < pixels.length; i += 64) {
        samples++;
        if (pixels[i] < 80) erased++;
      }
      if (erased / samples > 0.38) finishCard(card);
    }

    canvas.addEventListener('pointerdown', e => {
      if (card.complete) return;
      e.preventDefault();
      card.active  = true;
      card.previous = null;
      canvas.classList.add('scratching');
      canvas.setPointerCapture(e.pointerId);
      scratch(e);
    });
    canvas.addEventListener('pointermove', scratch);

    const stop = () => {
      card.active  = false;
      card.previous = null;
      canvas.classList.remove('scratching');
    };
    canvas.addEventListener('pointerup',     stop);
    canvas.addEventListener('pointercancel', stop);

    canvas.style.touchAction = 'none';
    drawScratch(card);
  }

  // Initialise all scratch canvases
  $$('[data-scratch]').forEach(canvas => {
    const card = {
      canvas,
      index: Number(canvas.dataset.scratch),
      complete: false,
      active: false,
      visited: new Set(),
      ctx: null, previous: null,
      width: 0, height: 0, dpr: 1,
    };
    scratchCards.push(card);
    setupScratchEvents(card);
  });

  // Tap to reveal all
  const revealBtn = $('#reveal-date');
  if (revealBtn) {
    revealBtn.addEventListener('click', () => {
      scratchCards.forEach(finishCard);
    });
  }

  // Redraw on resize
  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => scratchCards.forEach(drawScratch), 200);
  });

  /* ── CELEBRATION PETALS ────────────────────────────────── */
  function celebrationPetals() {
    if (reducedMotion) return;
    const holder = $('#petals');
    if (!holder) return;
    for (let i = 0; i < 26; i++) {
      const petal = document.createElement('i');
      petal.className = 'petal';
      const color = ['#814044', '#d7b779', '#e7c4c5'][i % 3];
      petal.style.cssText = [
        `left:${(i * 37) % 100}%`,
        `animation-delay:${(i % 8) * 0.16}s`,
        `--drift:${(i % 2 ? 1 : -1) * (30 + i * 4)}px`,
        `--spin:${180 + i * 39}deg`,
        `background:${color}`,
      ].join(';');
      holder.append(petal);
      setTimeout(() => petal.remove(), 6500);
    }
  }

  /* ── COUNTDOWN ─────────────────────────────────────────── */
  const countdownTarget = new Date(config.wedding.countdownTarget).getTime();

  function updateCountdown() {
    const remaining = Math.max(0, Math.floor((countdownTarget - Date.now()) / 1000));
    const days    = Math.floor(remaining / 86400);
    const hours   = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;

    const set = (attr, val) => {
      const el = $(`[data-count="${attr}"]`);
      if (el) el.textContent = pad2(val);
    };
    set('days',    days);
    set('hours',   hours);
    set('minutes', minutes);
    set('seconds', seconds);

    if (Date.now() >= countdownTarget) {
      const label = $('.countdown > p');
      if (label) label.textContent = config.wedding.postWeddingMessage;
    }
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ── GOOGLE CALENDAR REDIRECT ──────────────────────────── */
  function buildGoogleCalendarUrl() {
    const title = `${config.couple.groom} & ${config.couple.bride} — Wedding Celebrations`;
    const toGCalDate = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    };

    const start = new Date(config.wedding.startDate);
    const end   = new Date(config.wedding.endDate);
    const dates = `${toGCalDate(start)}/${toGCalDate(end)}`;

    let details = `Join us to celebrate the wedding of ${config.couple.groom} & ${config.couple.bride}!\n\n` +
      `SCHEDULE OF CELEBRATIONS:\n`;

    config.events.forEach(day => {
      details += `\n• ${day.eyebrow} (${day.displayDate} ${day.month}):\n`;
      day.functions.forEach(fn => {
        details += `   ${fn.time} — ${fn.name}: ${fn.desc}\n`;
      });
    });

    details += `\nVenue: ${config.venue.name}\nAll times in Indian Standard Time (IST)\n${config.couple.hashtag}`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: dates,
      details: details,
      location: config.venue.name,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  const calendarLink = $('#calendar-link');
  if (calendarLink && config.features.calendarDownload) {
    calendarLink.href = buildGoogleCalendarUrl();
    calendarLink.target = '_blank';
    calendarLink.rel = 'noopener noreferrer';
  }

})(weddingConfig);
