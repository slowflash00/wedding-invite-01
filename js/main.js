/**
 * main.js — Invitation Lifecycle Coordinator
 * Initialises the envelope opening and wires up all post-open behaviour.
 */

(function initMain(config) {
  const { $ } = window.WeddingUtils;

  const opening    = $('#opening');
  const invitation = $('#invitation');
  const musicToggle = $('#music-toggle');

  if (!opening || !invitation) return;

  // Block scroll on the main content until the envelope is opened
  invitation.inert = true;
  document.body.classList.add('invitation-closed');
  if (musicToggle) musicToggle.hidden = true;

  /* ── Envelope Opening ───────────────────────────────────── */
  new window.InvitationOpening(
    opening,

    /* onFinish — called when animation completes */
    () => {
      invitation.inert = false;
      document.body.classList.remove('invitation-closed');
      document.body.classList.add('invitation-open');
      document.documentElement.dataset.invitationState = 'open';

      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta) {
        themeMeta.content = window.innerWidth <= 760 ? config.theme.paper : config.theme.primary;
      }

      // Scroll to top cleanly
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      // Reveal music toggle
      if (musicToggle) musicToggle.hidden = false;

      // Start letter reveal scroll tracking
      window._scheduleLetterReveal?.();

      // Set focus to couple names for screen reader users
      const namesEl = $('#couple-names');
      if (namesEl) {
        namesEl.setAttribute('tabindex', '-1');
        namesEl.focus({ preventScroll: true });
      }

      // Re-attach all reveal observers now that inert is removed
      document.querySelectorAll('.reveal').forEach(el => {
        window._revealObserver?.unobserve(el);
        window._revealObserver?.observe(el);
      });
    },

    /* onStart — called during the tap gesture (allows audio autoplay) */
    () => {
      window._startMusic?.();
    }
  );

  /* ── WhatsApp Share ─────────────────────────────────────── */
  if (config.features.whatsappShare) {
    const shareBtn = $('#whatsapp-share');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const { groom, bride, hashtag } = config.couple;
        const { displayDates, displayLocation } = config.wedding;
        const url     = config.seo.siteUrl;
        const message = `You're invited! 🎊\n${groom} & ${bride} are getting married!\n📅 ${displayDates}\n📍 ${displayLocation}\n\nOpen your invitation: ${url}\n\n${hashtag}`;
        window.open(window.WeddingUtils.whatsappShareURL(message), '_blank', 'noopener');
      });
    }
  }

})(weddingConfig);
