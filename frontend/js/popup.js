console.log('popup.js carregado!');
(function() {
  const overlay = document.getElementById('popup-overlay');
  const closeBtn = document.getElementById('popup-close');

  function showPopup() {
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function hidePopup() {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  window.addEventListener('load', showPopup);
  window.addEventListener('keydown', e => {
    if (e.key === 'F5') showPopup();
  });
  closeBtn.addEventListener('click', hidePopup);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) e.stopPropagation();
  });
})();
