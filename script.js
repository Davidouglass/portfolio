(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* EDIT ME: tools shown in the ticker (from your CV) */
  const TOOLS = ['HTML5', 'CSS3', 'JavaScript', 'React.js', 'Node.js', 'Tailwind CSS', 'Python', 'Flutter', 'WordPress', 'Git & GitHub', 'Docker', 'Linux', 'Wazuh', 'Splunk', 'Snort', 'Photoshop', 'Illustrator', 'InDesign'];

  /* Preloader, then hero reveal */
  const loader = $('#loader'), count = $('#count');
  const start = () => { document.body.classList.add('ready'); loader.classList.add('done'); setTimeout(() => loader.remove(), 1000); };
  if (reduce) start();
  else {
    const t0 = performance.now(), dur = 1300;
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      count.textContent = String(Math.round(p * 100)).padStart(3, '0');
      p < 1 ? requestAnimationFrame(tick) : setTimeout(start, 200);
    })(t0);
  }

  /* Nav: scrolled state, mobile menu, active section */
  const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const setMenu = open => { menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : ''; };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));
  const links = $$('#menu a:not(.pill)');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ===== Premium layer (each block is independent) ===== */
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* Headings: split into words for staggered reveal */
  $$('.head h2').forEach(h => {
    const txt = h.textContent.trim(); h.setAttribute('aria-label', txt); h.classList.add('split');
    h.innerHTML = txt.split(' ').map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(' ');
  });

  /* Scroll progress */
  const bar = $('#progress');
  const prog = () => { const m = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${m > 0 ? scrollY / m : 0})`; };
  addEventListener('scroll', prog, { passive: true }); prog();

  /* Light up each section's top edge once */
  const lit = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lit'); lit.unobserve(e.target); } }), { threshold: .05 });
  $$('.sec').forEach(s => lit.observe(s));

  /* Nav: sliding active indicator, staggered mobile links */
  const ind = $('#ind');
  $$('#menu a').forEach((a, i) => a.style.setProperty('--i', i));
  const moveInd = () => {
    const a = $('#menu a.active');
    if (!a || getComputedStyle(ind).display === 'none') return;
    ind.style.setProperty('--x', a.offsetLeft + 'px'); ind.style.setProperty('--w', a.offsetWidth + 'px'); ind.style.opacity = 1;
  };
  new MutationObserver(moveInd).observe(menu, { attributes: true, subtree: true, attributeFilter: ['class'] });
  addEventListener('resize', moveInd); document.fonts && document.fonts.ready.then(moveInd);

  /* Ticker: Web Animations API, pauses on hover and via a visible control, speeds up with scroll */
  const track = $('#track'), tbtn = $('#tickerToggle');
  const group = TOOLS.map(t => `<span class="tool">${t}</span>`).join('');
  track.innerHTML = group + group + group + group;
  if (reduce) tbtn.hidden = true;
  else {
    const anim = track.animate([{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(-50%,0,0)' }], { duration: 50000, iterations: Infinity });
    let user = false, over = false, rate = 1, busy = false, ly = scrollY;
    const sync = () => (user || over) ? anim.pause() : anim.play();
    track.parentElement.addEventListener('pointerenter', () => { over = true; sync(); });
    track.parentElement.addEventListener('pointerleave', () => { over = false; sync(); });
    tbtn.addEventListener('click', () => { user = !user; tbtn.setAttribute('aria-pressed', user); tbtn.textContent = user ? 'Play ticker' : 'Pause ticker'; sync(); });
    const decay = () => { rate = 1 + (rate - 1) * .94; anim.playbackRate = rate; rate > 1.02 ? requestAnimationFrame(decay) : (anim.playbackRate = 1, busy = false); };
    addEventListener('scroll', () => {
      rate = Math.min(1 + Math.abs(scrollY - ly) / 6, 8); ly = scrollY; anim.playbackRate = rate;
      if (!busy) { busy = true; requestAnimationFrame(decay); }
    }, { passive: true });
  }

  /* Pointer-driven effects: desktop with a fine pointer only */
  if (fine && !reduce) {
    const spot = $('#spot');
    addEventListener('pointermove', e => { spot.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`; spot.style.opacity = 1; }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => spot.style.opacity = 0);

    $$('.btn,.pill').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        b.style.setProperty('--bx', x + 'px'); b.style.setProperty('--by', y + 'px');
        b.style.transform = `translate3d(${(x - r.width / 2) * .22}px,${(y - r.height / 2) * .35}px,0)`;
      });
      b.addEventListener('pointerleave', () => b.style.transform = '');
    });

    $$('.stage .media').forEach(m => {
      m.addEventListener('pointermove', e => {
        const r = m.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        m.style.setProperty('--mx', (px + .5) * 100 + '%'); m.style.setProperty('--my', (py + .5) * 100 + '%');
        m.style.transform = `perspective(900px) rotateX(${-py * 7}deg) rotateY(${px * 9}deg) scale(1.015)`;
      });
      m.addEventListener('pointerleave', () => m.style.transform = '');
    });

    const pl = $('.portrait-lg');
    pl.addEventListener('pointermove', e => {
      const r = pl.getBoundingClientRect();
      pl.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5) * -14 + 'px'); pl.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5) * -14 + 'px');
    });
    pl.addEventListener('pointerleave', () => { pl.style.setProperty('--px', '0px'); pl.style.setProperty('--py', '0px'); });
  }

  /* ===== v3 modules ===== */

  /* Theme: dark by default, remembered in localStorage */
  const root = document.documentElement, themeBtn = $('#theme');
  const setTheme = (t, save) => {
    root.dataset.theme = t;
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    themeBtn.setAttribute('aria-pressed', t === 'light');
    $('meta[name=theme-color]').setAttribute('content', t === 'dark' ? '#0a0a0a' : '#f4efe6');
    if (save) { try { localStorage.setItem('theme', t); } catch (e) {} }
  };
  setTheme(root.dataset.theme === 'light' ? 'light' : 'dark');
  themeBtn.addEventListener('click', () => {
    root.classList.add('theming'); setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
    setTimeout(() => root.classList.remove('theming'), 700);
  });

  /* Word-by-word highlight tied to scroll position */
  const scrubs = $$('[data-scrub]').map(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="sw">${w}</span>`).join(' ');
    return { el, w: $$('.sw', el), n: -1 };
  });
  const scrubUpdate = () => {
    const vh = innerHeight;
    scrubs.forEach(s => {
      const r = s.el.getBoundingClientRect();
      const p = reduce ? 1 : Math.min(Math.max((vh * .8 - r.top) / (r.height + vh * .3), 0), 1);
      const n = Math.round(p * s.w.length);
      if (n !== s.n) { s.w.forEach((w, i) => w.classList.toggle('on', i < n)); s.n = n; }
    });
  };
  let scrubTick = false;
  const scrubReq = () => { if (!scrubTick) { scrubTick = true; requestAnimationFrame(() => { scrubTick = false; scrubUpdate(); }); } };
  addEventListener('scroll', scrubReq, { passive: true }); addEventListener('resize', scrubReq); scrubUpdate();

  /* Project stages: CSS pins them (desktop), JS only feeds two scroll variables */
  const stages = $$('.stage'), stagesBox = $('#stages');
  if (stages.length && !reduce) {
    const wide = matchMedia('(min-width:901px)'); let tick = false;
    const clamp01 = v => Math.min(Math.max(v, 0), 1);
    const update = () => {
      tick = false; if (!wide.matches) return;
      const vh = innerHeight;
      stages.forEach((s, i) => {
        const next = stages[i + 1];
        s.style.setProperty('--t', next ? clamp01(1 - next.getBoundingClientRect().top / vh).toFixed(3) : 0);
        s.style.setProperty('--p', clamp01(1 - s.getBoundingClientRect().top / vh).toFixed(3));
      });
    };
    const req = () => { if (!tick) { tick = true; requestAnimationFrame(update); } };
    new IntersectionObserver(es => {
      if (es[0].isIntersecting) { addEventListener('scroll', req, { passive: true }); req(); }
      else removeEventListener('scroll', req);
    }, { rootMargin: '100px' }).observe(stagesBox);
  }

  /* CV: a normal <a download> everywhere. Claude's hosted preview has no file hosting, so there it saves through the viewer's downloads capability. */
  $$('a[data-cv]').forEach(a => a.addEventListener('click', async e => {
    if (!window.CV_B64 || !window.claude) return;
    e.preventDefault();
    try {
      const dl = await claude.use('downloads');
      if (!dl) return say('Download is available in the exported site.');
      const bin = atob(window.CV_B64), u = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      await dl.save({ filename: 'Obasi_David_Douglass_CV.pdf', data: new Blob([u], { type: 'application/pdf' }) });
    } catch (err) { if (!err || err.code !== 'declined') say('Download unavailable in this preview.'); }
  }));

  /* Copy email with feedback */
  const copy = $('#copy');
  copy.addEventListener('click', async () => {
    let ok = true;
    try { await navigator.clipboard.writeText(TO); }
    catch { const t = document.createElement('textarea'); t.value = TO; document.body.append(t); t.select(); try { ok = document.execCommand('copy'); } catch { ok = false; } t.remove(); }
    if (!ok) return say('Copy failed. Select the address and copy it manually.');
    copy.textContent = 'Copied'; say('Email address copied'); setTimeout(() => copy.textContent = 'Copy email', 2000);
  });

  /* Scroll reveal */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.reveal,.split').forEach(el => io.observe(el));

  /* Toast + placeholder project links */
  const toast = $('#toast'); let tt;
  const say = msg => { toast.textContent = msg; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 2600); };
  $$('a[href="#"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); say('Project link not added yet. Edit href in index.html.'); }));

  /* Contact form: validates, then opens the visitor's email app (no backend) */
  const form = $('#form'), status = $('#status'), TO = 'daviddouglass.ob@gmail.com';
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form); let ok = true;
    $$('input,textarea', form).forEach(i => { const bad = !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value)); i.classList.toggle('bad', bad); ok = ok && !bad; });
    if (!ok) { status.textContent = 'Fill in every field with a valid email address.'; return; }
    const body = `${f.get('message')}\n\nFrom: ${f.get('name')} (${f.get('email')})`;
    location.href = `mailto:${TO}?subject=${encodeURIComponent(f.get('subject'))}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Your email app should open with the message ready. Press send there to deliver it.';
  });
  $('#year').textContent = new Date().getFullYear();
})();
