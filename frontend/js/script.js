// Helper para query params
function getQuery(name) {
  return new URLSearchParams(window.location.search).get(name);
}

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('theme-grid');
  if (grid) {
    // Página de temas
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
            location.href = `theme.html?theme=${t}`;
          });
          grid.append(card);
        });
      });
    return;
  }

  // Página de admin
  const form = document.getElementById('upload-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(form);
      fetch('/upload', { method: 'POST', body: data })
        .then(r => r.json())
        .then(j => alert('Arquivo enviado: ' + j.file.filename))
        .catch(err => alert('Erro: ' + err.message));
    });
    return;
  }

  // As demais páginas (player.html e theme.html) têm seus scripts inline
});
