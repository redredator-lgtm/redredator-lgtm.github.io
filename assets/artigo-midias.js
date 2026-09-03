(() => {
  'use strict';
  function iniciarMidiasArtigo(root) {
    root.querySelectorAll('[data-artigo-animacao]').forEach(figure => {
      if (figure.dataset.pronta) return;
      figure.dataset.pronta = 'true';
      const area = figure.querySelector('.artigo-animacao-area');
      const image = area.querySelector('img');
      const fallback = area.querySelector('.artigo-animacao-parada');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'artigo-animacao-controle';
      let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const render = () => {
        image.hidden = !playing;
        fallback.hidden = playing;
        button.textContent = playing ? 'Ocultar animação' : 'Ver partida animada';
        button.setAttribute('aria-expanded', String(playing));
      };
      button.addEventListener('click', () => { playing = !playing; render(); });
      figure.insertBefore(button, area);
      render();
    });
  }
  window.iniciarMidiasArtigo = iniciarMidiasArtigo;
  iniciarMidiasArtigo(document);
})();
