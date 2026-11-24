'use strict';

/* ══════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════ */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  let mx = -100, my = -100, cx = -100, cy = -100;
  let raf;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  const lerp = (a, b, t) => a + (b - a) * t;

  const tick = () => {
    cx = lerp(cx, mx, 0.18);
    cy = lerp(cy, my, 0.18);
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    raf = requestAnimationFrame(tick);
  };
  tick();

  document.querySelectorAll('a, button, [role="button"]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });

  document.addEventListener('mouseleave', () => cancelAnimationFrame(raf));
  document.addEventListener('mouseenter', () => { raf = requestAnimationFrame(tick); });
})();


/* ══════════════════════════════════
   NAV — solid on scroll + mobile
══════════════════════════════════ */
(function () {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const menu   = document.getElementById('navMenu');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('solid', window.scrollY > 30);
  }, { passive: true });

  const closeMenu = () => {
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  };

  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
})();


/* ══════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════ */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els     = document.querySelectorAll('.fade-up');

  if (reduced) { els.forEach(el => el.classList.add('in')); return; }

  // Stagger children in the same parent
  document.querySelectorAll('.projects-list, .timeline, .skills-wrap, .hero-left, .hero-right').forEach(parent => {
    parent.querySelectorAll('.fade-up').forEach((el, i) => {
      const base = parseFloat(el.style.transitionDelay) || 0;
      el.style.transitionDelay = (base + i * 0.07) + 's';
    });
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  els.forEach(el => obs.observe(el));
})();


/* ══════════════════════════════════
   COPY EMAIL
══════════════════════════════════ */
(function () {
  const btn    = document.getElementById('copyEmail');
  const text   = document.getElementById('emailText');
  const action = document.getElementById('emailAction');
  if (!btn) return;

  const EMAIL = 'vincent.deschamps06@gmail.com';
  let timer;

  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(EMAIL); }
    catch {
      const t = document.createElement('textarea');
      t.value = EMAIL;
      t.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(t); t.select(); document.execCommand('copy');
      document.body.removeChild(t);
    }
    btn.classList.add('done');
    text.textContent   = 'Copied to clipboard!';
    action.innerHTML   = `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 10 8 14 16 6"/></svg> Done`;

    clearTimeout(timer);
    timer = setTimeout(() => {
      btn.classList.remove('done');
      text.textContent = EMAIL;
      action.innerHTML = `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="8" width="10" height="10" rx="1.5"/><path d="M4 12H3a1 1 0 01-1-1V3a1 1 0 011-1h8a1 1 0 011 1v1"/></svg> Copy`;
    }, 2500);
  });
})();


/* ══════════════════════════════════
   SCROLL SPY — active nav link
══════════════════════════════════ */
(function () {
  const links    = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => {
        const active = a.getAttribute('href') === '#' + e.target.id;
        a.style.color = active ? 'var(--white)' : '';
        active ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-35% 0px -60% 0px' });

  sections.forEach(s => obs.observe(s));
})();


/* ══════════════════════════════════
   HERO NAME — subtle glitch on hover
══════════════════════════════════ */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const last = document.querySelector('.hero-last');
  if (!last) return;

  last.addEventListener('mouseenter', () => {
    last.style.transition = 'none';
    last.style.webkitTextStroke = '1px rgba(255,255,255,0.75)';
    setTimeout(() => { last.style.webkitTextStroke = ''; }, 300);
    setTimeout(() => { last.style.transition = ''; }, 350);
  });
})();


/* ══════════════════════════════════
   HERO CANVAS — monochrome topology
══════════════════════════════════ */
(function () {
  const canvas = document.getElementById('netCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, dpr = 1, nodes = [], pulses = [], raf;
  let mouse = { x: -9999, y: -9999 };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const init = () => {
    resize();
    const count = Math.max(24, Math.min(48, Math.floor((W * H) / 14000)));
    nodes = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: i % 6 === 0 ? 2.4 : 1.3,
      hub: i % 6 === 0
    }));
    pulses = [];
  };

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }, { passive: true });
  canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const maxD = 140;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      if (!reduced) {
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
      }

      // edges
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < maxD) {
          const alpha = (1 - d / maxD) * 0.16;
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();

          if (!reduced && a.hub && pulses.length < 6 && Math.random() < 0.002) {
            pulses.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, t: 0 });
          }
        }
      }

      // mouse link
      const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (md < 160) {
        ctx.strokeStyle = `rgba(255,255,255,${(1 - md / 160) * 0.28})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }

      // node
      ctx.fillStyle = a.hub ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.28)';
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // packet pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += 0.025;
      if (p.t >= 1) { pulses.splice(i, 1); continue; }
      const px = p.ax + (p.bx - p.ax) * p.t;
      const py = p.ay + (p.by - p.ay) * p.t;
      ctx.fillStyle = `rgba(255,255,255,${1 - Math.abs(p.t - 0.5) * 1.4})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reduced) raf = requestAnimationFrame(draw);
  };

  let rTimer;
  window.addEventListener('resize', () => {
    clearTimeout(rTimer);
    rTimer = setTimeout(() => { cancelAnimationFrame(raf); init(); draw(); }, 180);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (!reduced) draw();
  });

  init();
  draw();
})();
