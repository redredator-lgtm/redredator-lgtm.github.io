(() => {
  'use strict';
  const links = document.querySelectorAll('[data-artigo-modal]');
  if (!links.length || typeof HTMLDialogElement === 'undefined') return;

  const dialog = document.createElement('dialog');
  dialog.className = 'artigo-dialogo';
  dialog.setAttribute('aria-label', 'Estudo: IA é ferramenta. Toda e qualquer direção é humana.');
  dialog.innerHTML = '<div class="artigo-dialogo-barra"><a class="artigo-pagina-link">Abrir em página própria ↗</a><button class="artigo-dialogo-fechar" type="button" aria-label="Fechar artigo">Fechar ×</button></div><div class="artigo-dialogo-conteudo"></div>';
  document.body.appendChild(dialog);
  const content = dialog.querySelector('.artigo-dialogo-conteudo');
  const closeButton = dialog.querySelector('.artigo-dialogo-fechar');
  const pageLink = dialog.querySelector('.artigo-pagina-link');
  const cache = new Map();
  let opener;
  let previousOverflow;
  let requestId = 0;

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    requestId++;
    document.body.style.overflow = previousOverflow;
    content.replaceChildren();
    opener?.focus({ preventScroll: true });
  });
  content.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = content.querySelector('#' + CSS.escape(link.getAttribute('href').slice(1)));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ block: 'start', behavior: 'instant' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  links.forEach(link => link.addEventListener('click', async event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) { location.href = link.href; return; }
    const currentRequest = ++requestId;
    opener = link;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    pageLink.href = url.href;
    content.innerHTML = '<p class="artigo-dialogo-mensagem" role="status">Carregando o estudo…</p>';
    dialog.showModal();
    dialog.scrollTop = 0;
    closeButton.focus();
    try {
      let article = cache.get(url.href);
      if (!article) {
        const response = await fetch(url.href);
        if (!response.ok) throw new Error('Artigo indisponível');
        const parsed = new DOMParser().parseFromString(await response.text(), 'text/html');
        article = parsed.querySelector('[data-artigo]');
        if (!article) throw new Error('Conteúdo do artigo não encontrado');
        cache.set(url.href, article);
      }
      if (!dialog.open || requestId !== currentRequest) return;
      content.replaceChildren(document.importNode(article, true));
      window.iniciarMidiasArtigo?.(content);
      dialog.scrollTop = 0;
    } catch (error) {
      if (!dialog.open || requestId !== currentRequest) return;
      content.innerHTML = '<p class="artigo-dialogo-mensagem">Não foi possível carregar o estudo aqui. Use “Abrir em página própria” acima para continuar a leitura.</p>';
    }
  }));
})();
