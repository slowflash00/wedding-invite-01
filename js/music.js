/**
 * music.js — Background Music Toggle
 * Starts after user gesture; handles missing audio gracefully.
 */

(function initMusic(config) {
  if (!config.features.backgroundMusic) return;

  const { $ } = window.WeddingUtils;
  const audio  = $('#background-music');
  const toggle = $('#music-toggle');
  if (!audio || !toggle) return;

  if (config.media && config.media.backgroundMusic) {
    audio.src = config.media.backgroundMusic;
  }
  audio.volume = 0.55;

  function syncToggle() {
    const playing = !audio.paused && !audio.ended;
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
    const label = toggle.querySelector('.music-label');
    if (label) label.textContent = playing ? 'MUSIC ON' : 'MUSIC OFF';
  }

  function startMusic() {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        syncToggle();
      }).catch(err => {
        console.warn('Background music playback blocked or pending:', err);
        syncToggle();
      });
    }
  }

  // Expose for main.js to call during opening gesture
  window._startMusic = startMusic;

  audio.addEventListener('play',   syncToggle);
  audio.addEventListener('pause',  syncToggle);
  audio.addEventListener('error',  syncToggle);
  audio.addEventListener('ended',  syncToggle);

  let userInteractedWithToggle = false;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    userInteractedWithToggle = true;
    if (audio.paused) {
      startMusic();
    } else {
      audio.pause();
    }
  });

  // Secondary interaction fallback in case initial gesture was before audio buffered
  const gestureFallback = () => {
    if (!userInteractedWithToggle && audio.paused && document.documentElement.dataset.invitationState === 'open') {
      startMusic();
    }
    document.removeEventListener('click', gestureFallback);
    document.removeEventListener('touchend', gestureFallback);
  };
  document.addEventListener('click', gestureFallback);
  document.addEventListener('touchend', gestureFallback);

})(weddingConfig);
