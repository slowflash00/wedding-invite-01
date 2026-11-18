/**
 * opening.js — InvitationOpening class
 * Adapated from the reference implementation.
 * Handles the full envelope-opening Web Animations API sequence.
 */
class InvitationOpening {
  constructor(root, onFinish, onStart = () => {}) {
    this.root       = root;
    this.onFinish   = onFinish;
    this.onStart    = onStart;
    this.state      = 'idle';
    this.animations = [];
    this.button     = root.querySelector('#open-invitation');
    this.status     = root.querySelector('.opening-status');
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

    // Any click anywhere triggers opening
    this.handleOpen = (event) => {
      if (event && event.target && event.target.closest && event.target.closest('#music-toggle, dialog')) return;
      this.start();
    };
    document.addEventListener('click', this.handleOpen);
    if (this.button) this.button.addEventListener('click', this.handleOpen);

    // Keyboard: ESC skips; Enter/Space on the overlay starts
    root.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.state === 'playing') this.finish();
      if (event.target === root && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        this.start();
      }
    });

    // Reduced-motion preference changed mid-animation
    this.reducedMotion.addEventListener('change', event => {
      if (event.matches && this.state === 'playing') this.finish();
    });

    // Pause/resume when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (this.state !== 'playing') return;
      for (const animation of this.animations) {
        if (document.hidden) animation.pause();
        else animation.play();
      }
    });

    // Focus the dialog so keyboard users can interact immediately
    root.tabIndex = -1;
    requestAnimationFrame(() => root.focus({ preventScroll: true }));
  }

  start() {
    if (this.state !== 'idle') return;
    this.state = 'playing';

    // Call onStart during the gesture — allows audio on mobile
    this.onStart();

    if (this.reducedMotion.matches) { this.finish(); return; }

    if (this.button) this.button.disabled = true;
    this.root.classList.add('playing');
    this.status.textContent = 'The wax seal lifts with the embossed flap. The paper unfolds to reveal the wedding courtyard.';

    const duration = 5600;
    const smooth   = 'cubic-bezier(.4,0,.2,1)';

    const animate = (selector, frames) => {
      const el = this.root.querySelector(selector);
      if (!el) return { finished: Promise.resolve() };
      const anim = el.animate(frames, { duration, fill: 'both', easing: 'linear' });
      this.animations.push(anim);
      return anim;
    };

    // Seal glint
    animate('.seal-face', [
      { filter: 'brightness(1)',                                               offset: 0   },
      { filter: 'brightness(1.3) drop-shadow(0 0 10px #e3c18b80)',            offset: 0.1 },
      { filter: 'brightness(1)',                                               offset: 0.2 },
      { filter: 'brightness(1)',                                               offset: 1   },
    ]);

    // Upper flap lifts back
    animate('.envelope-upper', [
      { transform: 'rotateX(0deg)',    opacity: 1, offset: 0    },
      { transform: 'rotateX(0deg)',    opacity: 1, offset: 0.13, easing: smooth },
      { transform: 'rotateX(105deg)',  opacity: 1, offset: 0.65 },
      { transform: 'rotateX(115deg)',  opacity: 0, offset: 0.8  },
      { transform: 'rotateX(115deg)',  opacity: 0, offset: 1    },
    ]);

    // Left fold opens
    animate('.envelope-left', [
      { transform: 'rotateY(0deg)',    opacity: 1, offset: 0    },
      { transform: 'rotateY(0deg)',    opacity: 1, offset: 0.48, easing: smooth },
      { transform: 'rotateY(-105deg)', opacity: 1, offset: 0.94 },
      { transform: 'rotateY(-110deg)', opacity: 0, offset: 1    },
    ]);

    // Right fold opens
    animate('.envelope-right', [
      { transform: 'rotateY(0deg)',    opacity: 1, offset: 0    },
      { transform: 'rotateY(0deg)',    opacity: 1, offset: 0.51, easing: smooth },
      { transform: 'rotateY(105deg)',  opacity: 1, offset: 0.97 },
      { transform: 'rotateY(110deg)',  opacity: 0, offset: 1    },
    ]);

    // Bottom fold opens
    animate('.envelope-bottom', [
      { transform: 'rotateX(0deg)',    opacity: 1, offset: 0    },
      { transform: 'rotateX(0deg)',    opacity: 1, offset: 0.55, easing: smooth },
      { transform: 'rotateX(-105deg)', opacity: 1, offset: 0.97 },
      { transform: 'rotateX(-110deg)', opacity: 0, offset: 1    },
    ]);

    // Background destination de-zooms
    const destination = animate('.opening-destination', [
      { transform: 'scale(1.055)', offset: 0   },
      { transform: 'scale(1.055)', offset: 0.4, easing: smooth },
      { transform: 'scale(1)',     offset: 1   },
    ]);

    destination.finished.then(() => this.finish()).catch(() => {});
  }

  finish() {
    if (this.state === 'finished') return;
    this.state = 'finished';
    document.removeEventListener('click', this.handleOpen);
    if (this.button) this.button.removeEventListener('click', this.handleOpen);
    this.root.classList.add('finished');
    this.root.setAttribute('aria-hidden', 'true');
    this.root.inert = true;
    for (const animation of this.animations) animation.finish();
    this.onFinish();
  }

  reset() {
    for (const animation of this.animations) animation.cancel();
    this.animations = [];
    this.state = 'idle';
    document.addEventListener('click', this.handleOpen);
    this.root.classList.remove('finished', 'playing');
    this.root.removeAttribute('aria-hidden');
    this.root.inert = false;
    if (this.button) this.button.disabled = false;
    this.status.textContent = '';
    document.documentElement.dataset.invitationState = 'closed';
    document.querySelector('meta[name="theme-color"]').content = '#6c2e31';
    this.root.focus({ preventScroll: true });
  }
}

window.InvitationOpening = InvitationOpening;
