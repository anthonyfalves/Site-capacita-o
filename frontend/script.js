// frontend/script.js

// Helper para query params
function getQuery(name) {
  return new URLSearchParams(window.location.search).get(name);
}

document.addEventListener('DOMContentLoaded', () => {
  // --- INDEX PAGE ---
  const gridThemes = document.getElementById('theme-grid');
  if (gridThemes) {
    fetch('/themes')
      .then(r => r.json())
      .then(themes => {
        themes.forEach(t => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <div class="card-body">
              <img src="assets/covers/${t}.png" 
                   onerror="this.src='assets/covers/default.png'"/>
            </div>
            <div class="card-footer">${t}</div>
          `;
          card.addEventListener('click', () => {
            const url = new URL('theme.html', location.origin);
            url.searchParams.set('theme', t);
            location.href = url;
          });
          gridThemes.append(card);
        });
      });
    return;
  }

  // --- THEME PAGE ---
  const gridVideos = document.getElementById('video-list');
  if (gridVideos) {
    const theme = getQuery('theme') || '';
    document.getElementById('page-title').innerText = theme;
    document.getElementById('theme-title').innerText = theme;

    fetch(`/themes/${encodeURIComponent(theme)}/videos`)
      .then(r => r.json())
      .then(videos => {
        if (!videos.length) {
          gridVideos.innerHTML = '<p class="empty">Em breve!</p>';
          return;
        }
        videos.forEach(v => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <div class="card-body">
              <img src="${v.thumbnailUrl}" 
                   onerror="this.src='assets/covers/default.png'"/>
            </div>
            <div class="card-footer">${v.title}</div>
          `;
          card.addEventListener('click', () => {
            const url = new URL('player.html', location.origin);
            url.searchParams.set('theme', theme);
            url.searchParams.set('file', v.filename);
            url.searchParams.set('title', v.title);
            location.href = url;
          });
          gridVideos.append(card);
        });
      });
    return;
  }

  // --- PLAYER PAGE ---
  const vf = document.querySelector('.video-frame');
  if (!vf) return;

  // Query params
  const theme = getQuery('theme') || '';
  const file  = getQuery('file')  || '';
  const raw   = getQuery('title');
  const title = raw || file.replace(/\.[^/.]+$/, '');

  // Ajusta títulos e botão Home
  document.getElementById('page-title').innerText = title;
  document.getElementById('video-title').innerText = title;
  document.getElementById('home-btn').href =
    `theme.html?theme=${encodeURIComponent(theme)}`;

  // Seleção de elementos do player
  const player  = document.getElementById('player');
  const seekBar = document.getElementById('seek-bar');
  const curTime = document.getElementById('current-time');
  const durTime = document.getElementById('duration');
  const btnRW   = document.getElementById('btn-rewind');
  const btnPL   = document.getElementById('btn-playpause');
  const btnFW   = document.getElementById('btn-forward');
  const btnMT   = document.getElementById('btn-mute');
  const btnFS   = document.getElementById('btn-fullscreen');

  // Fonte de vídeo
  player.src = `/videos/${encodeURIComponent(theme)}/${encodeURIComponent(file)}`;

  // Função para formatar mm:ss
  const pad = n => String(n).padStart(2,'0');
  function formatTime(s) {
    const m   = Math.floor(s/60),
          sec = Math.floor(s%60);
    return `${pad(m)}:${pad(sec)}`;
  }

  // Atualiza duração ao carregar metadata
  player.addEventListener('loadedmetadata', () => {
    durTime.innerText = formatTime(player.duration);
    seekBar.max       = player.duration;
  });

  // Atualiza progress a cada frame
  player.addEventListener('timeupdate', () => {
    seekBar.value     = player.currentTime;
    curTime.innerText = formatTime(player.currentTime);
  });

  // Seek manual
  seekBar.addEventListener('input', () => {
    player.currentTime = seekBar.value;
  });

  // Controles de 10s
  btnRW.addEventListener('click', () => {
    player.currentTime = Math.max(0, player.currentTime - 10);
  });
  btnFW.addEventListener('click', () => {
    player.currentTime = Math.min(player.duration, player.currentTime + 10);
  });

  // Play/Pause toggle
  btnPL.addEventListener('click', () => {
    if (player.paused) {
      player.play();
      btnPL.querySelector('img').src = 'assets/covers/icons/botao-pause.png';
    } else {
      player.pause();
      btnPL.querySelector('img').src = 'assets/covers/icons/botao-play.png';
    }
  });

  // Mute toggle
  btnMT.addEventListener('click', () => {
    player.muted = !player.muted;
  });

  // Fullscreen toggle
  btnFS.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      vf.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

  // ==== AUTO-HIDE CONTROLS EM FULLSCREEN ====
  let hideTimer;
  const showUI = () => {
    vf.classList.remove('hide-ui');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => vf.classList.add('hide-ui'), 2000);
  };

  function onFullScreenChange() {
    const fsElem = document.fullscreenElement || document.webkitFullscreenElement;
    if (fsElem === vf) {
      showUI();
      document.addEventListener('mousemove', showUI);
    } else {
      vf.classList.remove('hide-ui');
      document.removeEventListener('mousemove', showUI);
      clearTimeout(hideTimer);
    }
  }

  document.addEventListener('fullscreenchange', onFullScreenChange);
  document.addEventListener('webkitfullscreenchange', onFullScreenChange);
});

