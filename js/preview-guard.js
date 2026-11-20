/**
 * js/preview-guard.js — ShubhInvite Preview Protection System
 * ──────────────────────────────────────────────────────────────
 * Provides non-intrusive preview protection for client sample demonstrations:
 *  1. Closed Shadow DOM watermark overlay (pointer-events: none)
 *  2. Tamper resistance via MutationObserver & periodic integrity checks
 *  3. Light client-side deterrents (contextmenu, drag, select, key shortcuts)
 *  4. Expiry enforcement (preview.expiresAt)
 *
 * NOTE: This file is ONLY bundled in the preview build (`node build.js preview`).
 * The final paid build (`node build.js final`) completely omits this file,
 * its scripts, and all watermarks.
 */

(function initPreviewGuard() {
  const config = window.weddingConfig;
  if (!config || !config.preview || config.preview.enabled !== true) {
    return;
  }

  const preview = config.preview;
  const whatsappNumber = (preview.contactWhatsApp || '919876543210').replace(/\D/g, '');
  let isLockedOut = false;
  let tamperCount = 0;
  let isSelfMutating = false;
  let hostEl = null;
  let heartbeatTimer = null;
  let bodyObserver = null;

  /* ── 1. EXPIRY CHECK ─────────────────────────────────────────────────── */
  function checkExpiry() {
    if (!preview.expiresAt) return false;
    const expiryDate = new Date(preview.expiresAt);
    if (!isNaN(expiryDate.getTime()) && Date.now() > expiryDate.getTime()) {
      showLockout('This preview has expired. Contact us on WhatsApp to get your invite.');
      return true;
    }
    return false;
  }

  /* ── 2. FULLSCREEN LOCKOUT SCREEN ────────────────────────────────────── */
  function showLockout(message) {
    isLockedOut = true;
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (bodyObserver) bodyObserver.disconnect();

    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      'Hi ShubhInvite, I was viewing the wedding invitation preview: ' + message
    )}`;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.background = '#6c2e31';

    document.body.innerHTML = `
      <div style="
        min-height: 100vh;
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 24px;
        box-sizing: border-box;
        text-align: center;
        background: #6c2e31 radial-gradient(circle at center, rgba(160, 56, 62, 0.45) 0%, rgba(50, 18, 22, 0.95) 100%);
        color: #fcf5ec;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Cormorant Garamond', serif;
      ">
        <div style="
          max-width: 480px;
          background: rgba(255, 249, 239, 0.06);
          border: 1px solid rgba(227, 193, 139, 0.35);
          border-radius: 16px;
          padding: 44px 28px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
          backdrop-filter: blur(8px);
        ">
          <div style="font-size: 38px; color: #e3c18b; margin-bottom: 16px;" aria-hidden="true">✧</div>
          <h1 style="
            font-size: 26px;
            font-weight: 600;
            margin: 0 0 16px;
            letter-spacing: 1px;
            color: #fff9ef;
          ">ShubhInvite Preview</h1>
          <p style="
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 32px;
            color: rgba(252, 245, 236, 0.85);
          ">${message}</p>
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="
            display: inline-block;
            background: #e3c18b;
            color: #4a191d;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 30px;
            box-shadow: 0 4px 18px rgba(0,0,0,0.25);
            transition: transform 0.2s, background 0.2s;
          ">Connect on WhatsApp</a>
        </div>
      </div>
    `;
  }

  /* ── 3. WATERMARK OVERLAY (CLOSED SHADOW DOM) ────────────────────────── */
  const svgPattern = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="180" viewBox="0 0 280 180"><defs><style>.t{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;}</style></defs><g transform="rotate(-30 140 90)"><text x="140" y="90" text-anchor="middle" class="t" fill="rgba(35,15,20,0.14)" stroke="rgba(255,255,255,0.24)" stroke-width="0.8">SAMPLE · ShubhInvite</text><text x="0" y="0" text-anchor="middle" class="t" fill="rgba(35,15,20,0.14)" stroke="rgba(255,255,255,0.24)" stroke-width="0.8">SAMPLE · ShubhInvite</text><text x="280" y="180" text-anchor="middle" class="t" fill="rgba(35,15,20,0.14)" stroke="rgba(255,255,255,0.24)" stroke-width="0.8">SAMPLE · ShubhInvite</text></g></svg>`;
  const svgDataUri = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgPattern);

  function createWatermarkHost() {
    const host = document.createElement('div');
    host.id = '__shubh_preview_overlay';
    host.setAttribute('aria-hidden', 'true');

    // Closed shadow DOM prevents exterior script tampering and CSS leak
    const shadow = host.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block !important;
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        z-index: 2147483647 !important;
        pointer-events: none !important;
        overflow: hidden !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        transform: none !important;
        opacity: 1 !important;
        visibility: visible !important;
        filter: none !important;
      }
      .tiled-layer {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        background-image: url('${svgDataUri}');
        background-repeat: repeat;
        background-position: center;
        pointer-events: none;
      }
      .center-badge {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-30deg);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: min(18vw, 110px);
        font-weight: 900;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        color: rgba(35, 15, 20, 0.09);
        -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.18);
        text-shadow: 0 0 14px rgba(255, 255, 255, 0.12);
        pointer-events: none;
        white-space: nowrap;
        user-select: none;
      }
    `;

    const tiled = document.createElement('div');
    tiled.className = 'tiled-layer';
    tiled.setAttribute('aria-hidden', 'true');

    const center = document.createElement('div');
    center.className = 'center-badge';
    center.setAttribute('aria-hidden', 'true');
    center.textContent = 'SAMPLE';

    shadow.appendChild(style);
    shadow.appendChild(tiled);
    shadow.appendChild(center);

    return host;
  }

  function mountWatermark() {
    if (isLockedOut) return;
    isSelfMutating = true;
    if (hostEl && hostEl.parentNode) {
      hostEl.parentNode.removeChild(hostEl);
    }
    hostEl = createWatermarkHost();
    document.body.appendChild(hostEl);
    isSelfMutating = false;
  }

  /* ── 4. TAMPER RESISTANCE & INTEGRITY MONITOR ────────────────────────── */
  function handleTamper() {
    if (isLockedOut) return;
    tamperCount++;
    if (tamperCount >= 3) {
      showLockout('This sample preview needs its watermark to display. Contact us on WhatsApp to get your invite.');
      return;
    }
    mountWatermark();
  }

  function verifyIntegrity() {
    if (isLockedOut) return;
    if (!hostEl || !hostEl.isConnected || !document.body.contains(hostEl)) {
      handleTamper();
      return;
    }
    const cs = window.getComputedStyle(hostEl);
    const isHidden = cs.display === 'none' ||
                     cs.visibility === 'hidden' ||
                     parseFloat(cs.opacity || '1') < 0.5 ||
                     hostEl.offsetWidth < 50 ||
                     hostEl.offsetHeight < 50;
    if (isHidden) {
      handleTamper();
    }
  }

  function setupMutationObserver() {
    bodyObserver = new MutationObserver(() => {
      if (isSelfMutating || isLockedOut) return;
      if (!hostEl || !hostEl.isConnected || !document.body.contains(hostEl)) {
        handleTamper();
      }
    });

    bodyObserver.observe(document.body, {
      childList: true,
      subtree: false,
    });
  }

  /* ── 5. LIGHT DETERRENTS (COSMETIC ONLY) ──────────────────────────────── */
  function injectDeterrents() {
    // Inject deterrent CSS (no text-select, no touch-callout on images)
    const style = document.createElement('style');
    style.id = 'shubh-preview-deterrent-css';
    style.textContent = `
      body, body *:not(input):not(textarea):not(select) {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      img {
        -webkit-touch-callout: none !important;
        -webkit-user-drag: none !important;
      }
      .shubh-preview-footer-line {
        text-align: center;
        padding: 16px 20px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 11px;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        color: rgba(108, 46, 49, 0.75);
        background: rgba(245, 234, 221, 0.9);
        border-top: 1px dashed rgba(108, 46, 49, 0.25);
        position: relative;
        z-index: 10;
        pointer-events: auto;
      }
    `;
    document.head.appendChild(style);

    // Disable context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    }, { capture: true });

    // Disable image & asset dragging
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
    }, { capture: true });

    // Keyboard shortcut deterrents (cosmetic, kept simple)
    document.addEventListener('keydown', (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Ctrl/Cmd + U, S
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
      // Ctrl/Cmd + Shift + I, J, C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key)) {
        e.preventDefault();
        return false;
      }
    }, { capture: true });

    // Footer notice line
    const footerNotice = document.createElement('div');
    footerNotice.className = 'shubh-preview-footer-line';
    footerNotice.textContent = 'Sample preview by ShubhInvite. Copying or redistributing this design is not permitted.';
    const invitation = document.getElementById('invitation') || document.body;
    invitation.appendChild(footerNotice);
  }

  /* ── 6. INITIALIZATION ────────────────────────────────────────────────── */
  function start() {
    if (checkExpiry()) return;

    injectDeterrents();
    mountWatermark();
    setupMutationObserver();

    // Heartbeat check every 2 seconds
    heartbeatTimer = setInterval(verifyIntegrity, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
