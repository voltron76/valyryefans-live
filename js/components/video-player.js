// ============================================================
// ValyryesFans — Video Player Component
// ============================================================

export function renderVideoPlayer(src, poster = '') {
  const playerId = 'vp-' + Math.random().toString(36).slice(2, 8);

  return `
    <div class="video-player" id="${playerId}">
      <video src="${src}" ${poster ? `poster="${poster}"` : ''} preload="metadata" playsinline></video>
      <div class="video-player__controls">
        <button class="btn btn-icon btn-ghost vp-play" aria-label="Play/Pause" style="color: var(--text-primary);">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><polygon points="5,3 19,12 5,21"/></svg>
        </button>
        <div class="video-player__progress">
          <div class="video-player__progress-fill" style="width: 0%"></div>
        </div>
        <span class="vp-time" style="font-size: var(--text-xs); color: var(--text-muted); white-space: nowrap;">0:00 / 0:00</span>
        <button class="btn btn-icon btn-ghost vp-fullscreen" aria-label="Fullscreen" style="color: var(--text-primary);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

export function initVideoPlayer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const video = container.querySelector('video');
  const playBtn = container.querySelector('.vp-play');
  const progress = container.querySelector('.video-player__progress');
  const progressFill = container.querySelector('.video-player__progress-fill');
  const timeDisplay = container.querySelector('.vp-time');
  const fsBtn = container.querySelector('.vp-fullscreen');

  if (!video) return;

  const playSvg = '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><polygon points="5,3 19,12 5,21"/></svg>';
  const pauseSvg = '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>';

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  playBtn.addEventListener('click', () => {
    if (video.paused) { video.play(); } else { video.pause(); }
  });

  video.addEventListener('play', () => { playBtn.innerHTML = pauseSvg; });
  video.addEventListener('pause', () => { playBtn.innerHTML = playSvg; });

  video.addEventListener('timeupdate', () => {
    const pct = (video.currentTime / video.duration) * 100;
    progressFill.style.width = pct + '%';
    timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration || 0)}`;
  });

  progress.addEventListener('click', (e) => {
    const rect = progress.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * video.duration;
  });

  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      if (container.requestFullscreen) container.requestFullscreen();
    });
  }

  // Click video to toggle play
  video.addEventListener('click', () => {
    if (video.paused) { video.play(); } else { video.pause(); }
  });
}
