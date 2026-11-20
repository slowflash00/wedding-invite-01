/**
 * preview-guard.js — Sample Protection Layer
 * 
 * Features:
 * 1. Full-screen sparse diagonal watermark + centered subtle SAMPLE in closed Shadow DOM
 * 2. In-pixel canvas watermark on all <img> elements (center diagonal stamp + corner stamp)
 * 3. Pseudo-element watermark overlays on CSS background images
 * 4. Context menu (right-click & long-press) prevention
 * 5. Text selection and image dragging prevention
 * 6. Keyboard shortcuts blocking (F12, DevTools, View Source, Save, Print, Copy, Cut, Select All, PrintScreen)
 * 7. Temporary black cover on blocked actions and DevTools detection
 * 8. Expiry date check and robots noindex/nofollow injection
 * 9. Anti-tamper monitoring and recovery (3-strike page lock)
 * 
 * TO REMOVE:
 * Delete this file (js/preview-guard.js) and the one <script> tag in index.html.
 */

(function () {
  'use strict';

  /* ── 0. CONFIGURATION & FINE-TUNING CONTROLS ──────────────────── */
  const CONFIG = {
    expiresAt: '2026-12-05T23:59:59+05:30',
    contactWhatsApp: '[NUMBER WITH COUNTRY CODE]',
    watermarkText: 'SAMPLE - ShubhInvite',
    blackoutOnBlur: false,
    detectDevToolsDesktop: true,

    /* ── Watermark Appearance Controls (adjust to fine-tune) ──── */
    watermarkSpacing: 520,           // Width spacing between watermark texts (~3-4 on phone, ~6-8 on desktop)
    watermarkSpacingHeight: 320,     // Height spacing between watermark texts
    watermarkOpacity: 0.08,          // Full-screen overlay text opacity (0.07 to 0.09)
    watermarkFontSize: 13,           // Font size for sparse watermark pattern text
    watermarkRotation: -30,          // Diagonal angle in degrees (-30deg)
    centerSampleOpacity: 0.055,      // Large centered "SAMPLE" opacity (0.05 to 0.06)
    imageWatermarkOpacity: 0.18,     // In-pixel image watermark opacity (0.15 to 0.20)
    bgWatermarkOpacity: 0.08         // CSS background images overlay opacity
  };

  /* ── 1. ROBOTS & EXPOSURE PREVENTION ─────────────────────────── */
  try {
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      if (document.head) {
        document.head.appendChild(robots);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          document.head && document.head.appendChild(robots);
        });
      }
    }
    robots.content = 'noindex, nofollow';
  } catch (_) {}

  /* ── 2. WHATSAPP URL BUILDER ──────────────────────────────────── */
  function getWhatsAppUrl(customMessage) {
    const rawNum = CONFIG.contactWhatsApp || '';
    const cleanNum = rawNum.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      customMessage || 'Hi ShubhInvite! I would like to get my wedding invitation website.'
    );
    if (cleanNum && cleanNum.length >= 10) {
      return 'https://wa.me/' + cleanNum + '?text=' + msg;
    }
    return 'https://api.whatsapp.com/send?text=' + msg;
  }

  /* ── 3. SPARSE INLINE SVG WATERMARK PATTERN ─────────────────────── */
  const tileW = (typeof CONFIG.watermarkSpacing === 'object' && CONFIG.watermarkSpacing.width)
    ? CONFIG.watermarkSpacing.width
    : (Number(CONFIG.watermarkSpacing) || 520);
  const tileH = (typeof CONFIG.watermarkSpacing === 'object' && CONFIG.watermarkSpacing.height)
    ? CONFIG.watermarkSpacing.height
    : (Number(CONFIG.watermarkSpacingHeight) || Math.round(tileW * 0.62) || 320);

  function createSparseWatermarkSvg(text, opacity, fontSize, rot, w, h) {
    const width = w || 520;
    const height = h || 320;
    const size = fontSize || 13;
    const angle = (typeof rot === 'number') ? rot : -30;
    const op = (typeof opacity === 'number') ? opacity : 0.08;

    const escapedText = (text || 'SAMPLE - ShubhInvite')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // High contrast dual-layer: subtle dark stroke + crisp white fill
    const strokeOp = Math.min(1, (op * 0.95).toFixed(3));
    const fillOp = Math.min(1, (op * 1.25).toFixed(3));

    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">' +
      '<style>' +
        '.wt { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: ' + size + 'px; font-weight: 700; letter-spacing: 2px; }' +
      '</style>' +
      '<g transform="rotate(' + angle + ' ' + (width / 2) + ' ' + (height / 2) + ')">' +
        '<text x="' + (width / 2) + '" y="' + (height / 2) + '" class="wt" text-anchor="middle" dominant-baseline="central" ' +
          'fill="#ffffff" fill-opacity="' + fillOp + '" stroke="#000000" stroke-width="2" stroke-opacity="' + strokeOp + '" paint-order="stroke fill">' +
          escapedText +
        '</text>' +
      '</g>' +
    '</svg>';

    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  const watermarkSvgDataUri = createSparseWatermarkSvg(
    CONFIG.watermarkText,
    CONFIG.watermarkOpacity,
    CONFIG.watermarkFontSize,
    CONFIG.watermarkRotation,
    tileW,
    tileH
  );

  /* ── 4. INJECT GLOBAL PROTECTIVE STYLES ───────────────────────── */
  const STYLE_ID = 'shubh-sample-guard-styles';
  function injectProtectiveStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    const bgOpacity = (typeof CONFIG.bgWatermarkOpacity === 'number') ? CONFIG.bgWatermarkOpacity : 0.08;

    style.textContent = `
      /* Disable text selection and dragging globally */
      *:not(input):not(textarea):not([contenteditable="true"]) {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      img {
        -webkit-user-drag: none !important;
        user-drag: none !important;
        -webkit-touch-callout: none !important;
      }
      /* Hide images until watermarked to prevent flash of raw image */
      img:not(.pg-img-ready) {
        opacity: 0 !important;
      }
      img.pg-img-ready {
        opacity: 1 !important;
        transition: opacity 0.2s ease-in !important;
      }
      /* Prevent printing */
      @media print {
        html, body {
          display: none !important;
          visibility: hidden !important;
        }
      }
      /* Subtle watermark overlay on CSS background containers */
      .hero-bg::after,
      .hero-section::after,
      .opening-backdrop::after,
      .envelope-base::after,
      .venue-art::after,
      .venue-section::after,
      .date-reveal-section::after,
      .paper-card::after,
      .letter-pocket-front::after,
      .letter-pocket-back::after,
      .letter-flap-lace::after {
        content: "" !important;
        position: absolute !important;
        inset: 0 !important;
        background-image: url("${watermarkSvgDataUri}") !important;
        background-repeat: repeat !important;
        background-size: ${tileW}px ${tileH}px !important;
        pointer-events: none !important;
        z-index: 2 !important;
        opacity: ${bgOpacity} !important;
      }
    `;
    const target = document.head || document.documentElement;
    if (target) {
      target.appendChild(style);
    }
  }
  injectProtectiveStyles();

  /* ── 5. FULL-SCREEN SAMPLE WATERMARK & BLACK COVER (SHADOW DOM) ── */
  const HOST_ID = 'shubh-sample-guard-host';
  let hostEl = null;
  let shadowRoot = null;
  let coverEl = null;
  let coverMsgEl = null;
  let coverWaBtn = null;
  let coverTimer = null;
  let isCoverPersistent = false;
  let tamperCount = 0;
  let isPageLockedOut = false;

  function createHostAndShadow() {
    if (isPageLockedOut) return;

    hostEl = document.createElement('div');
    hostEl.id = HOST_ID;
    hostEl.style.cssText = [
      'all: initial !important',
      'position: fixed !important',
      'inset: 0 !important',
      'width: 100vw !important',
      'height: 100vh !important',
      'z-index: 2147483647 !important',
      'pointer-events: none !important',
      'display: block !important',
      'visibility: visible !important',
      'opacity: 1 !important',
      'margin: 0 !important',
      'padding: 0 !important'
    ].join('; ');

    shadowRoot = hostEl.attachShadow({ mode: 'closed' });

    const centerOpacity = (typeof CONFIG.centerSampleOpacity === 'number') ? CONFIG.centerSampleOpacity : 0.055;

    // Inner shadow HTML & styles
    const shadowContainer = document.createElement('div');
    shadowContainer.className = 'pg-root';
    shadowContainer.innerHTML = `
      <style>
        :host {
          all: initial;
        }
        .pg-root {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        /* Sparse diagonal watermark pattern */
        .pg-pattern {
          position: absolute;
          inset: -120px;
          background-image: url("${watermarkSvgDataUri}");
          background-repeat: repeat;
          background-size: ${tileW}px ${tileH}px;
          opacity: 1;
          pointer-events: none;
        }
        /* Single large centered SAMPLE watermark (subtle, 0.05-0.06) */
        .pg-center-sample {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-25deg);
          font-size: min(18vw, 130px);
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #000000;
          opacity: ${centerOpacity};
          text-shadow: 0 0 6px #ffffff, 0 0 12px #ffffff;
          user-select: none;
          white-space: nowrap;
          pointer-events: none;
        }
        /* Discrete persistent footer line */
        .pg-footer {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          letter-spacing: 0.8px;
          color: #4a282c;
          background: rgba(255, 248, 240, 0.92);
          border: 1px solid rgba(108, 46, 49, 0.25);
          padding: 4px 14px;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
          pointer-events: auto;
          user-select: none;
          white-space: nowrap;
          max-width: 92vw;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        /* Black cover for blocked shortcuts and tamper state */
        .pg-cover {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background: #000000;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2147483647;
          pointer-events: auto;
          padding: 24px;
          box-sizing: border-box;
          opacity: 1;
          transition: opacity 0.2s ease;
        }
        .pg-cover[hidden] {
          display: none !important;
        }
        .pg-card {
          background: #141414;
          border: 1px solid #2a2a2a;
          border-radius: 18px;
          padding: 38px 28px;
          max-width: 440px;
          width: 100%;
          text-align: center;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85);
          box-sizing: border-box;
        }
        .pg-badge {
          display: inline-block;
          background: #6c2e31;
          color: #fce8d5;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          padding: 4px 14px;
          border-radius: 20px;
          margin-bottom: 18px;
          text-transform: uppercase;
        }
        .pg-title {
          margin: 0 0 12px;
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.3;
        }
        .pg-msg {
          margin: 0 0 24px;
          font-size: 15px;
          line-height: 1.55;
          color: #b5b5b5;
        }
        .pg-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #25D366;
          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          padding: 13px 26px;
          border-radius: 30px;
          box-shadow: 0 4px 14px rgba(37, 211, 102, 0.4);
          transition: transform 0.15s, background 0.15s;
          cursor: pointer;
        }
        .pg-btn:hover {
          background: #20bd5a;
          transform: scale(1.02);
        }
        .pg-hint {
          margin: 20px 0 0;
          font-size: 12px;
          color: #666666;
        }
      </style>
      <div class="pg-pattern"></div>
      <div class="pg-center-sample">SAMPLE</div>
      <div class="pg-footer">Sample by ShubhInvite. Copying or redistributing this design is not permitted.</div>
      <div class="pg-cover" id="pg-cover" hidden>
        <div class="pg-card">
          <div class="pg-badge">SAMPLE PREVIEW</div>
          <h2 class="pg-title">This is a sample preview.</h2>
          <p class="pg-msg" id="pg-msg">Contact us on WhatsApp to get your own invite.</p>
          <a class="pg-btn" id="pg-wa" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.044-2.18-.574-1.898-.787-3.119-2.73-3.214-2.857-.095-.128-.772-1.026-.772-1.956 0-.93.488-1.385.662-1.574.173-.189.377-.236.503-.236.126 0 .252.002.362.007.116.006.271-.044.423.322.158.38.536 1.309.584 1.405.047.095.079.207.016.333-.064.127-.096.206-.189.317-.095.11-.198.247-.283.332-.095.095-.194.198-.083.388.111.19.493.813 1.059 1.317.728.647 1.341.848 1.531.943.19.095.301.079.412-.047.111-.127.476-.554.602-.744.127-.19.254-.158.428-.095.175.063 1.11.523 1.301.618.19.095.317.143.364.222.048.079.048.459-.096.864z"/>
            </svg>
            <span>Contact on WhatsApp</span>
          </a>
          <p class="pg-hint" id="pg-hint">Tap anywhere to close</p>
        </div>
      </div>
    `;

    shadowRoot.appendChild(shadowContainer);

    coverEl = shadowContainer.querySelector('#pg-cover');
    coverMsgEl = shadowContainer.querySelector('#pg-msg');
    coverWaBtn = shadowContainer.querySelector('#pg-wa');
    coverWaBtn.href = getWhatsAppUrl();

    // Clicking anywhere on temporary cover closes it
    coverEl.addEventListener('click', (e) => {
      if (e.target && (e.target === coverWaBtn || coverWaBtn.contains(e.target))) {
        return; // allow WhatsApp link click
      }
      if (!isCoverPersistent) {
        hideCover();
      }
    });

    if (document.body) {
      document.body.appendChild(hostEl);
    }
  }

  function showBlackCover(message, persistent) {
    if (isPageLockedOut) return;
    if (!coverEl) createHostAndShadow();
    if (!coverEl) return;

    if (message && coverMsgEl) {
      coverMsgEl.textContent = message;
    }
    if (coverWaBtn) {
      coverWaBtn.href = getWhatsAppUrl(message);
    }

    isCoverPersistent = !!persistent;
    const hintEl = shadowRoot ? shadowRoot.querySelector('#pg-hint') : null;
    if (hintEl) {
      hintEl.style.display = isCoverPersistent ? 'none' : 'block';
    }

    coverEl.removeAttribute('hidden');

    if (!isCoverPersistent) {
      clearTimeout(coverTimer);
      coverTimer = setTimeout(hideCover, 3000);
    }
  }

  function hideCover() {
    if (isCoverPersistent || isPageLockedOut) return;
    clearTimeout(coverTimer);
    if (coverEl) {
      coverEl.setAttribute('hidden', '');
    }
  }

  function hidePersistentCover() {
    if (isPageLockedOut) return;
    isCoverPersistent = false;
    hideCover();
  }

  /* ── 6. TAMPER DETECTION & RECOVERY (3 STRIKES) ───────────────── */
  function triggerFullLockout(message) {
    isPageLockedOut = true;
    isCoverPersistent = true;
    showBlackCover(
      message || 'This sample needs its watermark to display. Contact us on WhatsApp to get your invite.',
      true
    );
  }

  function verifyWatermarkIntegrity() {
    if (isPageLockedOut) return;

    // Check style tag
    if (!document.getElementById(STYLE_ID)) {
      tamperCount++;
      injectProtectiveStyles();
    }

    // Check host element presence & styling
    const existingHost = document.getElementById(HOST_ID);
    let tampered = false;

    if (!existingHost || existingHost !== hostEl || !existingHost.parentElement) {
      tampered = true;
    } else {
      const s = existingHost.style;
      if (
        s.display === 'none' ||
        s.visibility === 'hidden' ||
        s.opacity === '0' ||
        parseInt(s.zIndex || '0', 10) < 2147483647
      ) {
        tampered = true;
      }
    }

    if (tampered) {
      tamperCount++;
      if (tamperCount >= 3) {
        triggerFullLockout('This sample needs its watermark to display. Contact us on WhatsApp to get your invite.');
        return;
      }
      // Re-create & re-attach
      if (hostEl && hostEl.parentElement) {
        try { hostEl.remove(); } catch (_) {}
      }
      createHostAndShadow();
    }
  }

  // Monitor DOM modifications
  function startTamperObserver() {
    if (!document.body) return;
    const observer = new MutationObserver(() => {
      verifyWatermarkIntegrity();
    });
    observer.observe(document.body, { childList: true });

    // Periodic heartbeat check every 2 seconds
    setInterval(verifyWatermarkIntegrity, 2000);
  }

  /* ── 7. EXPIRY CHECK ──────────────────────────────────────────── */
  function checkExpiry() {
    try {
      const exp = new Date(CONFIG.expiresAt).getTime();
      if (!isNaN(exp) && Date.now() > exp) {
        triggerFullLockout('This sample has expired. Contact us on WhatsApp to get your invite.');
        return true;
      }
    } catch (_) {}
    return false;
  }

  /* ── 8. IN-PIXEL CANVAS WATERMARK ON EVERY <img> ───────────────── */
  const originalSrcWeakMap = new WeakMap();
  const watermarkedBlobMap = new Map();
  const generatedBlobUrls = new Set();

  function stampCanvasWatermark(ctx, w, h) {
    const opacity = (typeof CONFIG.imageWatermarkOpacity === 'number') ? CONFIG.imageWatermarkOpacity : 0.18;
    const rotDeg = (typeof CONFIG.watermarkRotation === 'number') ? CONFIG.watermarkRotation : -30;
    const rot = (rotDeg * Math.PI) / 180;

    const strokeOp = Math.min(1, (opacity * 0.9).toFixed(3));
    const fillOp = Math.min(1, (opacity * 1.15).toFixed(3));

    // 1. One medium-sized diagonal "SAMPLE" stamped across the center
    ctx.save();
    const centerText = 'SAMPLE';
    const centerFontSize = Math.max(18, Math.round(Math.min(w, h) / 7.2));
    ctx.font = '900 ' + centerFontSize + 'px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.translate(w / 2, h / 2);
    ctx.rotate(rot);

    // Subtle dark stroke + bright fill for readability on both light and dark photos
    ctx.strokeStyle = 'rgba(0, 0, 0, ' + strokeOp + ')';
    ctx.lineWidth = Math.max(2, Math.round(centerFontSize / 9));
    ctx.strokeText(centerText, 0, 0);

    ctx.fillStyle = 'rgba(255, 255, 255, ' + fillOp + ')';
    ctx.fillText(centerText, 0, 0);
    ctx.restore();

    // 2. Small "SAMPLE" in the bottom-right corner
    ctx.save();
    const cornerText = 'SAMPLE';
    const cornerFontSize = Math.max(11, Math.round(centerFontSize * 0.35));
    ctx.font = '800 ' + cornerFontSize + 'px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';

    const pad = Math.max(10, Math.round(Math.min(w, h) * 0.04));
    ctx.translate(w - pad, h - pad);
    ctx.rotate(rot);

    ctx.strokeStyle = 'rgba(0, 0, 0, ' + strokeOp + ')';
    ctx.lineWidth = Math.max(1.5, Math.round(cornerFontSize / 8));
    ctx.strokeText(cornerText, 0, 0);

    ctx.fillStyle = 'rgba(255, 255, 255, ' + fillOp + ')';
    ctx.fillText(cornerText, 0, 0);
    ctx.restore();
  }

  function processImage(img) {
    if (!img || !(img instanceof HTMLImageElement)) return;

    const currentSrc = img.currentSrc || img.getAttribute('src') || img.src;
    if (!currentSrc) return;

    // Already a watermarked blob we produced
    if (generatedBlobUrls.has(currentSrc) || currentSrc.startsWith('blob:')) {
      img.classList.add('pg-img-ready');
      return;
    }

    // Store original source strictly in WeakMap (no DOM or data-attribute)
    originalSrcWeakMap.set(img, currentSrc);

    // If already generated for this source path, reuse blob instantly
    if (watermarkedBlobMap.has(currentSrc)) {
      const cachedBlobUrl = watermarkedBlobMap.get(currentSrc);
      img.src = cachedBlobUrl;
      img.classList.add('pg-img-ready');
      return;
    }

    // Hide image during canvas processing to prevent raw flicker
    img.classList.remove('pg-img-ready');

    const offImg = new Image();
    offImg.crossOrigin = 'anonymous';

    offImg.onload = function () {
      try {
        let w = offImg.naturalWidth || offImg.width || 400;
        let h = offImg.naturalHeight || offImg.height || 400;

        // Cap longest side at 800px
        const maxDim = 800;
        if (w > maxDim || h > maxDim) {
          if (w >= h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(offImg, 0, 0, w, h);

        stampCanvasWatermark(ctx, w, h);

        const onBlobReady = function (blob) {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            generatedBlobUrls.add(blobUrl);
            watermarkedBlobMap.set(currentSrc, blobUrl);
            img.src = blobUrl;
          }
          img.classList.add('pg-img-ready');
        };

        if (canvas.toBlob) {
          canvas.toBlob(onBlobReady, 'image/webp', 0.88);
        } else {
          img.classList.add('pg-img-ready');
        }
      } catch (_) {
        // Fallback (e.g. tainted canvas on file:// protocol)
        img.classList.add('pg-img-ready');
      }
    };

    offImg.onerror = function () {
      img.classList.add('pg-img-ready');
    };

    offImg.src = currentSrc;
  }

  function observeImages() {
    if (!document.body) return;

    // Process all existing <img>
    document.querySelectorAll('img').forEach(processImage);

    // Preload gallery full photos into watermarked cache so lightbox opens instantly
    document.querySelectorAll('.gallery-photo[data-full]').forEach(btn => {
      const fullUrl = btn.getAttribute('data-full');
      if (fullUrl && !watermarkedBlobMap.has(fullUrl)) {
        const dummyImg = new Image();
        dummyImg.src = fullUrl;
        processImage(dummyImg);
      }
    });

    // Observe newly added images or src mutations (e.g. lightbox changes)
    const imgObserver = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          m.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
              if (node.tagName === 'IMG') {
                processImage(node);
              } else if (node.querySelectorAll) {
                node.querySelectorAll('img').forEach(processImage);
              }
            }
          });
        } else if (m.type === 'attributes' && m.attributeName === 'src') {
          if (m.target && m.target.tagName === 'IMG') {
            const s = m.target.src;
            if (!generatedBlobUrls.has(s) && !s.startsWith('blob:')) {
              processImage(m.target);
            }
          }
        }
      }
    });

    imgObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src']
    });
  }

  /* ── 9. KEYBOARD SHORTCUTS & INTERCEPTION ─────────────────────── */
  function isBlockedShortcut(e) {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const isAlt = e.altKey;
    const key = (e.key || '').toLowerCase();
    const code = e.code || '';

    // F12
    if (key === 'f12' || code === 'F12') return true;

    // Ctrl+Shift+I, J, C, K
    if (isCtrlOrCmd && isShift && ['i', 'j', 'c', 'k'].includes(key)) return true;

    // Ctrl+Alt+I or Mac Cmd+Option+I, J, C
    if (isCtrlOrCmd && isAlt && ['i', 'j', 'c'].includes(key)) return true;

    // Ctrl/Cmd+U (view source)
    if (isCtrlOrCmd && !isShift && !isAlt && key === 'u') return true;

    // Ctrl/Cmd+S, Ctrl/Cmd+Shift+S (save)
    if (isCtrlOrCmd && key === 's') return true;

    // Ctrl/Cmd+P (print)
    if (isCtrlOrCmd && key === 'p') return true;

    // Ctrl/Cmd+A, C, X (select all, copy, cut) - allow only inside text inputs
    if (isCtrlOrCmd && ['a', 'c', 'x'].includes(key)) {
      const targetTag = (e.target && e.target.tagName ? e.target.tagName : '').toUpperCase();
      const isInput = targetTag === 'INPUT' || targetTag === 'TEXTAREA' || (e.target && e.target.isContentEditable);
      if (!isInput) return true;
    }

    return false;
  }

  window.addEventListener('keydown', (e) => {
    if (isBlockedShortcut(e)) {
      e.preventDefault();
      e.stopPropagation();
      showBlackCover('This is a sample preview. Contact us on WhatsApp to get your own invite.');
      return false;
    }
  }, true); // Capture phase

  // PrintScreen clipboard clear
  window.addEventListener('keyup', (e) => {
    const key = (e.key || '').toLowerCase();
    const code = e.code || '';
    if (key === 'printscreen' || code === 'PrintScreen') {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('');
        }
      } catch (_) {}
      showBlackCover('This is a sample preview. Contact us on WhatsApp to get your own invite.');
    }
  }, true);

  // Right-click and touch long-press (contextmenu)
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showBlackCover('This is a sample preview. Contact us on WhatsApp to get your own invite.');
    return false;
  }, true);

  // Disable dragging of images
  window.addEventListener('dragstart', (e) => {
    if (e.target && e.target.tagName === 'IMG') {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  /* ── 10. HEURISTICS: DEVTOOLS DETECTION & BLUR ────────────────── */
  if (CONFIG.detectDevToolsDesktop) {
    const isDesktopPointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (isDesktopPointer) {
      let devToolsOpen = false;
      const checkDevTools = () => {
        const threshold = 200;
        const diffW = window.outerWidth - window.innerWidth;
        const diffH = window.outerHeight - window.innerHeight;
        const isOpen = diffW > threshold || diffH > threshold;
        if (isOpen) {
          devToolsOpen = true;
          showBlackCover(
            'Developer tools detected. This is a sample preview. Contact us on WhatsApp to get your own invite.',
            true
          );
        } else if (devToolsOpen) {
          devToolsOpen = false;
          hidePersistentCover();
        }
      };
      window.addEventListener('resize', checkDevTools);
      setInterval(checkDevTools, 1500);
    }
  }

  if (CONFIG.blackoutOnBlur) {
    let isBlurred = false;
    const onBlur = () => {
      isBlurred = true;
      showBlackCover('Preview paused while inactive. Click or return to resume.', true);
    };
    const onFocus = () => {
      if (isBlurred) {
        isBlurred = false;
        hidePersistentCover();
      }
    };
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        onBlur();
      } else {
        onFocus();
      }
    });
  }

  /* ── 11. INITIALIZATION ───────────────────────────────────────── */
  function initializeGuard() {
    if (checkExpiry()) return;
    createHostAndShadow();
    startTamperObserver();
    observeImages();
  }

  if (document.body) {
    initializeGuard();
  } else {
    // If <head> script runs before <body> is parsed
    const bodyWaitObserver = new MutationObserver(() => {
      if (document.body) {
        bodyWaitObserver.disconnect();
        initializeGuard();
      }
    });
    bodyWaitObserver.observe(document.documentElement, { childList: true });
    document.addEventListener('DOMContentLoaded', initializeGuard, { once: true });
  }

})();
