// Click-to-zoom for content images. No dependencies.
(function () {
  function close() {
    var o = document.getElementById('img-zoom-overlay');
    if (o) o.remove();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  function open(src, alt) {
    close();
    var o = document.createElement('div');
    o.id = 'img-zoom-overlay';
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-label', alt || 'Zoomed image');
    var img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    o.appendChild(img);
    o.addEventListener('click', close);
    document.body.appendChild(o);
    document.addEventListener('keydown', onKey);
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!(t instanceof HTMLImageElement)) return;
    if (!t.closest('.sl-markdown-content')) return;
    if (t.closest('a')) return;
    e.preventDefault();
    open(t.currentSrc || t.src, t.alt);
  });
})();
