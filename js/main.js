(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;

  /* ---------- Tema claro / oscuro ---------- */
  const themeBtn = $('#themeBtn');
  const setTheme = (t) => {
    root.setAttribute('data-theme', t);
    themeBtn.setAttribute('aria-pressed', String(t === 'dark'));
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
  };
  setTheme(root.getAttribute('data-theme') || 'light');
  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('ar-theme', next); } catch (e) {}
  });

  /* ---------- Menú móvil ---------- */
  const nav = $('#nav'), menuBtn = $('#menuBtn');
  const closeMenu = () => {
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menú');
  };
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('.nav-links a').forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => { if (!nav.contains(e.target)) closeMenu(); });

  /* ---------- Nombre animado letra por letra ---------- */
  const nameEl = $('.name-inner');
  let li = 0;
  nameEl.innerHTML = nameEl.textContent.trim().split(' ').map(w =>
    `<span class="word" aria-hidden="true">${[...w].map(ch => `<span class="ch" style="--i:${li++}">${ch}</span>`).join('')}</span>`
  ).join('');

  /* ---------- Texto que se escribe solo ---------- */
  const typedEl = $('#typed');
  const phrases = ['sitios web veloces', 'interfaces claras', 'animaciones con sentido', 'ideas con código'];
  if (!reduce) {
    let p = 0, c = phrases[0].length, del = true;
    const tick = () => {
      const full = phrases[p];
      c += del ? -1 : 1;
      typedEl.textContent = full.slice(0, c);
      let d = del ? 35 : 75;
      if (!del && c === full.length) { del = true; d = 1700; }
      else if (del && c === 0) { del = false; p = (p + 1) % phrases.length; d = 380; }
      setTimeout(tick, d);
    };
    setTimeout(tick, 2600);
  }

  /* ---------- Parallax del héroe ---------- */
  const stage = $('#stage'), hero = $('#inicio');
  if (stage && finePointer && !reduce) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const loop = () => {
      cx += (tx - cx) * .08; cy += (ty - cy) * .08;
      stage.style.setProperty('--mx', cx.toFixed(3));
      stage.style.setProperty('--my', cy.toFixed(3));
      raf = (Math.abs(tx - cx) > .002 || Math.abs(ty - cy) > .002) ? requestAnimationFrame(loop) : null;
    };
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - .5) * 2;
      ty = ((e.clientY - r.top) / r.height - .5) * 2;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  }

  /* ---------- Contadores y anillos ---------- */
  const countUp = (el, to, dur = 1500) => {
    if (reduce) { el.textContent = to; return; }
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  $$('.stat').forEach(s => s.addEventListener('revealed', () => countUp($('[data-num]', s), +s.dataset.count)));
  const C = 2 * Math.PI * 52;
  $$('.ring').forEach(r => {
    const m = $('.meter', r);
    m.style.strokeDasharray = C;
    m.style.strokeDashoffset = C;
    r.addEventListener('revealed', () => {
      requestAnimationFrame(() => { m.style.strokeDashoffset = C * (1 - r.dataset.value / 100); });
      countUp($('b', r), +r.dataset.value);
    });
  });

  /* ---------- Marquesinas infinitas ---------- */
  $$('.marquee-track').forEach(t => {
    Array.from(t.children).forEach(k => { const c = k.cloneNode(true); c.setAttribute('aria-hidden', 'true'); t.appendChild(c); });
  });

  /* ---------- Proyectos ---------- */
  let uid = 0;
  const svgOpen = '<svg viewBox="0 0 400 260" aria-hidden="true" focusable="false">';
  const art = {
    dashboard(bg) {
      const bars = [50, 82, 64, 112, 92, 134];
      return `${svgOpen}<rect width="400" height="260" fill="${bg}"/><circle cx="360" cy="20" r="80" fill="#fff" opacity=".12"/>
      <rect x="34" y="32" width="332" height="200" rx="16" fill="#fff"/><rect x="44" y="42" width="46" height="180" rx="10" fill="#EFEAFF"/>
      <circle cx="67" cy="64" r="8" fill="#6C4DFF"/><circle cx="67" cy="92" r="6" fill="#FF5C88"/><circle cx="67" cy="116" r="6" fill="#FFC93C"/><circle cx="67" cy="140" r="6" fill="#25C9A0"/>
      <rect x="104" y="46" width="76" height="30" rx="9" fill="#EFEAFF"/><rect x="190" y="46" width="76" height="30" rx="9" fill="#FFE3EA"/><rect x="276" y="46" width="76" height="30" rx="9" fill="#DDF8EF"/>
      ${bars.map((h, i) => `<rect class="bar" style="--i:${i}" x="${108 + i * 40}" y="${214 - h}" width="26" height="${h}" rx="7" fill="${i % 2 ? '#FF5C88' : '#6C4DFF'}"/>`).join('')}
      <path d="M112 160C150 130 170 170 210 120S300 110 346 90" fill="none" stroke="#1A1740" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 7"/></svg>`;
    },
    mobile(bg) {
      return `${svgOpen}<rect width="400" height="260" fill="${bg}"/><circle cx="60" cy="230" r="90" fill="#fff" opacity=".16"/>
      <rect x="52" y="60" width="76" height="46" rx="12" fill="#fff" opacity=".95"/><rect x="62" y="72" width="34" height="7" rx="3.5" fill="#1A1740" opacity=".6"/><rect x="62" y="88" width="52" height="7" rx="3.5" fill="#FF5C88"/>
      <rect x="276" y="150" width="76" height="46" rx="12" fill="#fff" opacity=".95"/><rect x="286" y="162" width="34" height="7" rx="3.5" fill="#1A1740" opacity=".6"/><rect x="286" y="178" width="52" height="7" rx="3.5" fill="#25C9A0"/>
      <rect x="138" y="20" width="124" height="230" rx="26" fill="#1A1740"/><rect x="146" y="30" width="108" height="210" rx="19" fill="#fff"/>
      <rect x="157" y="44" width="48" height="8" rx="4" fill="#1A1740"/><rect x="157" y="58" width="30" height="6" rx="3" fill="#9A96BE"/>
      <circle cx="200" cy="112" r="30" fill="none" stroke="#EFEAFF" stroke-width="12"/>
      <circle class="donut" cx="200" cy="112" r="30" fill="none" stroke="#6C4DFF" stroke-width="12" stroke-linecap="round" stroke-dasharray="120 189"/>
      <rect x="157" y="158" width="86" height="24" rx="9" fill="#FFE3EA"/><circle cx="170" cy="170" r="5" fill="#FF5C88"/><rect x="181" y="167" width="40" height="6" rx="3" fill="#1A1740" opacity=".55"/>
      <rect x="157" y="188" width="86" height="24" rx="9" fill="#DDF8EF"/><circle cx="170" cy="200" r="5" fill="#25C9A0"/><rect x="181" y="197" width="32" height="6" rx="3" fill="#1A1740" opacity=".55"/></svg>`;
    },
    shop(bg) {
      const cols = ['#FFE3EA', '#EFEAFF', '#FFF2CC'], dots = ['#FF5C88', '#6C4DFF', '#FFC93C'];
      return `${svgOpen}<rect width="400" height="260" fill="${bg}"/><circle cx="350" cy="250" r="90" fill="#fff" opacity=".18"/>
      <rect x="30" y="26" width="340" height="208" rx="16" fill="#fff"/><rect x="44" y="38" width="312" height="22" rx="11" fill="#E4F8F2"/><circle cx="58" cy="49" r="5" fill="#25C9A0"/>
      ${cols.map((c, i) => `<g class="bar" style="--i:${i}"><rect x="${44 + i * 106}" y="72" width="94" height="96" rx="12" fill="${c}"/><circle cx="${91 + i * 106}" cy="118" r="22" fill="${dots[i]}"/>
      <rect x="${44 + i * 106}" y="176" width="64" height="7" rx="3.5" fill="#1A1740" opacity=".55"/><rect x="${44 + i * 106}" y="190" width="38" height="7" rx="3.5" fill="#1A1740" opacity=".3"/><rect x="${44 + i * 106}" y="206" width="46" height="16" rx="8" fill="#1A1740"/></g>`).join('')}</svg>`;
    },
    system(bg) {
      return `${svgOpen}<rect width="400" height="260" fill="${bg}"/><circle cx="40" cy="30" r="70" fill="#fff" opacity=".25"/>
      <rect x="36" y="28" width="328" height="206" rx="18" fill="#fff"/>
      <text x="58" y="112" font-size="70" font-weight="800" fill="#1A1740" style="font-family:'Bricolage Grotesque',sans-serif;letter-spacing:-3px">Aa</text>
      ${['#6C4DFF', '#FF5C88', '#25C9A0', '#FFC93C'].map((c, i) => `<circle class="bar" style="--i:${i}" cx="${200 + i * 40}" cy="66" r="15" fill="${c}"/>`).join('')}
      <rect x="58" y="136" width="96" height="36" rx="18" fill="#6C4DFF"/><rect x="166" y="136" width="96" height="36" rx="18" fill="none" stroke="#1A1740" stroke-width="2.5"/><rect x="274" y="136" width="70" height="36" rx="9" fill="#FF5C88"/>
      <rect x="58" y="192" width="46" height="24" rx="12" fill="#25C9A0"/><circle cx="92" cy="204" r="9" fill="#fff"/><rect x="120" y="192" width="150" height="24" rx="7" fill="none" stroke="#C9C5E8" stroke-width="2.5"/></svg>`;
    },
    travel() {
      const id = 'gt' + (uid++);
      return `${svgOpen}<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9DB6"/><stop offset="1" stop-color="#6C4DFF"/></linearGradient></defs>
      <rect width="400" height="260" fill="url(#${id})"/><circle cx="296" cy="104" r="40" fill="#FFC93C"/>
      <path d="M0 214L92 112 152 172 214 90 304 202 342 162 400 214V260H0Z" fill="#2A2470"/><path d="M0 238L70 178 130 218 200 162 282 232 340 198 400 238V260H0Z" fill="#1A1740"/>
      <rect x="60" y="28" width="210" height="36" rx="18" fill="#fff"/><circle cx="82" cy="46" r="7" fill="none" stroke="#1A1740" stroke-width="3"/><rect x="98" y="42" width="100" height="8" rx="4" fill="#C9C5E8"/><rect x="214" y="36" width="44" height="20" rx="10" fill="#FF5C88"/>
      <path class="bar" style="--i:2" d="M214 112c0-9 7-16 16-16s16 7 16 16c0 12-16 28-16 28s-16-16-16-28Z" fill="#fff"/><circle cx="230" cy="112" r="6" fill="#FF5C88"/></svg>`;
    },
    wellness() {
      return `${svgOpen}<rect width="400" height="260" fill="#2A2470"/>
      <circle class="breathe" style="--i:0" cx="200" cy="116" r="92" fill="#25C9A0" opacity=".14"/><circle class="breathe" style="--i:1" cx="200" cy="116" r="68" fill="#25C9A0" opacity=".24"/>
      <circle class="breathe" style="--i:2" cx="200" cy="116" r="44" fill="#25C9A0" opacity=".42"/><circle cx="200" cy="116" r="22" fill="#25C9A0"/>
      <text x="200" y="238" text-anchor="middle" font-size="16" font-weight="600" fill="#fff" style="font-family:'Instrument Sans',sans-serif">Inhala, 4 segundos</text></svg>`;
    }
  };
  const catLabel = { web: 'Web', app: 'App', diseno: 'Diseño' };
  const projects = [
    { id: 'atlas', title: 'Atlas', kind: 'Panel de analítica', cat: 'web', type: 'dashboard', bg: '#6C4DFF', year: '2025', role: 'Diseño y front-end',
      short: 'Un panel que convierte datos de ventas en decisiones rápidas para equipos comerciales.',
      desc: 'Atlas reúne en una sola pantalla los indicadores que un equipo comercial revisa cada mañana. Diseñé gráficos legibles, filtros que responden al instante y un modo oscuro pensado para jornadas largas.',
      result: 'El equipo redujo de 40 a 10 minutos su revisión diaria.', stack: ['React', 'D3', 'WCAG AA'] },
    { id: 'nube', title: 'Nube', kind: 'App de finanzas personales', cat: 'app', type: 'mobile', bg: '#FF5C88', year: '2025', role: 'Diseño de producto y prototipo',
      short: 'Una app para entender en qué se va el dinero, con resúmenes visuales y metas de ahorro.',
      desc: 'Nube transforma los gastos del mes en un resumen sencillo y amable. Probé el prototipo con 12 personas y simplifiqué el flujo de registro de gastos hasta dejarlo en dos toques.',
      result: 'El 82 % de las personas probadoras completó su primer registro sin ayuda.', stack: ['React Native', 'Figma', 'Pruebas de uso'] },
    { id: 'mercado-vivo', title: 'Mercado Vivo', kind: 'Tienda en línea', cat: 'web', type: 'shop', bg: '#25C9A0', year: '2024', role: 'Front-end y rendimiento',
      short: 'Tienda para productores locales con catálogo rápido y pago en pocos pasos.',
      desc: 'Una tienda pensada para conexiones lentas: imágenes optimizadas, catálogo con carga progresiva y un proceso de compra de tres pasos. Trabajé junto a las y los productores para ordenar el catálogo.',
      result: 'La tasa de compra completada subió un 31 %.', stack: ['Next.js', 'Pagos en línea', 'SEO técnico'] },
    { id: 'prisma', title: 'Prisma', kind: 'Sistema de diseño', cat: 'diseno', type: 'system', bg: '#FFC93C', year: '2024', role: 'Diseño y documentación',
      short: 'Componentes, colores y reglas compartidas para que seis equipos construyan con el mismo lenguaje.',
      desc: 'Prisma define colores, tipografía, espaciados y más de 40 componentes documentados. Cada componente nace en Figma y se publica con su versión en código y sus pautas de accesibilidad.',
      result: 'Seis equipos lo adoptaron en menos de tres meses.', stack: ['Figma', 'Tokens de diseño', 'Storybook'] },
    { id: 'brujula', title: 'Brújula', kind: 'Sitio de viajes', cat: 'web', type: 'travel', bg: '#6C4DFF', year: '2023', role: 'Diseño, front-end y animación',
      short: 'Un sitio para planear rutas, con mapas interactivos y transiciones que invitan a explorar.',
      desc: 'Brújula permite armar un itinerario arrastrando lugares sobre un mapa. Cuidé cada transición para que el movimiento explique qué cambió, sin distraer.',
      result: 'Las personas usuarias pasan el doble de tiempo planeando sus rutas.', stack: ['JavaScript', 'Mapas', 'Animación web'] },
    { id: 'pulso', title: 'Pulso', kind: 'App de respiración', cat: 'app', type: 'wellness', bg: '#2A2470', year: '2023', role: 'Diseño de interacción',
      short: 'Ejercicios de respiración guiados por un círculo que se expande y se contrae a tu ritmo.',
      desc: 'Pulso guía pausas de uno a cinco minutos con una animación suave y vibración ligera. El diseño es deliberadamente sobrio: pocas opciones, mucho espacio y movimiento lento.',
      result: 'Valoración promedio de 4,8 sobre 5 en la fase de pruebas.', stack: ['Motion design', 'Prototipo', 'Accesibilidad'] }
  ];
  const grid = $('#grid');
  grid.innerHTML = projects.map((p, i) => `
    <div class="card-wrap reveal" data-cat="${p.cat}" style="--d:${(i % 3) * 90}ms">
      <article class="card" data-id="${p.id}">
        <div class="card-art">${art[p.type](p.bg)}<span class="card-glare"></span></div>
        <div class="card-body">
          <div class="card-top"><h3>${p.title}</h3><span class="pill">${catLabel[p.cat]}</span></div>
          <p class="card-kind">${p.kind}</p>
          <p class="card-desc">${p.short}</p>
          <ul class="tags">${p.stack.map(s => `<li>${s}</li>`).join('')}</ul>
          <button class="link-btn" type="button" data-open="${p.id}" aria-label="Ver detalles de ${p.title}">Ver detalles</button>
        </div>
      </article>
    </div>`).join('');

  // Filtros
  $$('.filter').forEach(btn => btn.addEventListener('click', () => {
    $$('.filter').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    const f = btn.dataset.filter;
    $$('.card-wrap').forEach(w => {
      const show = f === 'all' || w.dataset.cat === f;
      const card = $('.card', w);
      if (show) {
        w.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('is-out')));
      } else {
        card.classList.add('is-out');
        setTimeout(() => { if (card.classList.contains('is-out')) w.hidden = true; }, reduce ? 0 : 300);
      }
    });
  }));

  // Inclinación 3D en las tarjetas
  if (finePointer && !reduce) {
    $$('.card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateX(${((.5 - y) * 7).toFixed(2)}deg) rotateY(${((x - .5) * 9).toFixed(2)}deg) translateY(-6px)`;
        card.style.setProperty('--gx', (x * 100) + '%');
        card.style.setProperty('--gy', (y * 100) + '%');
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  // Ventana de detalles
  const dlg = $('#modal');
  const openProject = (id) => {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    $('#mArt').innerHTML = art[p.type](p.bg);
    $('#mCat').textContent = catLabel[p.cat];
    $('#mTitle').textContent = p.title + ': ' + p.kind.toLowerCase();
    $('#mDesc').textContent = p.desc;
    $('#mFacts').innerHTML = `<div><dt>Mi rol</dt><dd>${p.role}</dd></div><div><dt>Año</dt><dd>${p.year}</dd></div><div><dt>Resultado</dt><dd>${p.result}</dd></div>`;
    $('#mTags').innerHTML = p.stack.map(s => `<li>${s}</li>`).join('');
    if (typeof dlg.showModal === 'function') { dlg.showModal(); document.body.style.overflow = 'hidden'; }
  };
  grid.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (card) openProject(card.dataset.id);
  });
  const closeDlg = () => { dlg.close(); };
  $('#mClose').addEventListener('click', closeDlg);
  dlg.addEventListener('click', e => { if (e.target === dlg) closeDlg(); });
  dlg.addEventListener('close', () => { document.body.style.overflow = ''; });

  /* ---------- Aparición al hacer scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      en.target.dispatchEvent(new CustomEvent('revealed'));
      io.unobserve(en.target);
    });
  }, { threshold: .16, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Enlace activo en el menú ---------- */
  const links = $$('.nav-links a');
  const so = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(l => {
        const on = l.getAttribute('href') === '#' + en.target.id;
        l.classList.toggle('active', on);
        if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(l => { const s = $(l.getAttribute('href')); if (s) so.observe(s); });

  /* ---------- Scroll: barra de progreso y línea de tiempo ---------- */
  const bar = $('#progress'), tl = $('#timeline');
  let ticking = false;
  const update = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
    nav.classList.toggle('scrolled', scrollY > 20);
    if (tl) {
      const r = tl.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * .62 - r.top) / r.height));
      tl.style.setProperty('--tl', p.toFixed(3));
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();

  /* ---------- Botones magnéticos y cursor ---------- */
  if (finePointer && !reduce) {
    $$('[data-magnetic]').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * .22).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * .32).toFixed(1)}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
    const ring = document.createElement('div');
    ring.className = 'cursor';
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);
    let x = 0, y = 0, rx = 0, ry = 0, seen = false;
    addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      if (!seen) { seen = true; rx = x; ry = y; ring.classList.add('on'); }
    });
    const loop = () => {
      rx += (x - rx) * .2; ry += (y - ry) * .2;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('pointerover', e => {
      ring.classList.toggle('hot', !!(e.target.closest && e.target.closest('a,button,input,textarea,.card,.ch')));
    });
  }

  /* ---------- Copiar correo ---------- */
  const copyBtn = $('#copyBtn');
  copyBtn.addEventListener('click', async () => {
    const email = $('#emailText').textContent.trim();
    const done = () => {
      copyBtn.textContent = 'Copiado';
      setTimeout(() => { copyBtn.textContent = 'Copiar correo'; }, 2000);
    };
    try { await navigator.clipboard.writeText(email); done(); }
    catch (e) {
      const ta = document.createElement('textarea');
      ta.value = email; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      ta.remove(); done();
    }
  });

  /* ---------- Formulario de contacto ---------- */
  const form = $('#form'), status = $('#formStatus');
  const rules = {
    name: v => v.trim().length >= 2 || 'Escribe tu nombre.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Escribe un correo válido, por ejemplo nombre@dominio.com.',
    message: v => v.trim().length >= 10 || 'Cuéntame un poco más (mínimo 10 caracteres).'
  };
  const check = (input) => {
    const res = rules[input.name](input.value);
    const err = $('#' + input.id + '-err');
    err.textContent = res === true ? '' : res;
    input.setAttribute('aria-invalid', res === true ? 'false' : 'true');
    return res === true;
  };
  $$('input,textarea', form).forEach(i => {
    i.addEventListener('blur', () => { if (i.value) check(i); });
    i.addEventListener('input', () => { if (i.getAttribute('aria-invalid') === 'true') check(i); });
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    status.className = 'form-status';
    const fields = $$('input,textarea', form);
    const results = fields.map(check);
    const firstBad = fields[results.indexOf(false)];
    if (firstBad) { firstBad.focus(); status.textContent = 'Revisa los campos marcados e inténtalo de nuevo.'; return; }
    const to = $('#emailText').textContent.trim();
    const subject = encodeURIComponent('Hola Alex, te escribe ' + $('#f-name').value.trim());
    const body = encodeURIComponent($('#f-message').value.trim() + '\n\n' + $('#f-name').value.trim() + '\n' + $('#f-email').value.trim());
    $('#sendLabel').textContent = 'Mensaje preparado';
    status.classList.add('ok');
    status.textContent = 'Listo. Se abrió tu aplicación de correo con el mensaje preparado. Si no ocurrió nada, copia mi correo y escríbeme directamente.';
    try { location.href = `mailto:${to}?subject=${subject}&body=${body}`; } catch (err) {}
    setTimeout(() => { $('#sendLabel').textContent = 'Enviar mensaje'; }, 3500);
  });

  $('#year').textContent = new Date().getFullYear();
})();
