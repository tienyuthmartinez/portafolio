// Evita el parpadeo de tema y marca que hay JavaScript activo
(function () {
  var r = document.documentElement;
  r.classList.add('js');
  try {
    var t = localStorage.getItem('ar-theme');
    if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    r.setAttribute('data-theme', t);
  } catch (e) {}
})();
