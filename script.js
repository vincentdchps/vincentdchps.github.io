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
   HERO CANVAS — animated wireframe planet
══════════════════════════════════ */
(function () {
  const canvas = document.getElementById('netCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, dpr = 1, nodes = [], pulses = [], raf;
  let mouse = { x: -9999, y: -9999 };
  let rotation = 0;
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = 96;
  noiseCanvas.height = 96;
  const noiseCtx = noiseCanvas.getContext('2d');
  const noiseData = noiseCtx.createImageData(noiseCanvas.width, noiseCanvas.height);
  for (let i = 0; i < noiseData.data.length; i += 4) {
    const grain = 120 + Math.random() * 110;
    noiseData.data[i] = grain;
    noiseData.data[i + 1] = grain;
    noiseData.data[i + 2] = grain;
    noiseData.data[i + 3] = 24;
  }
  noiseCtx.putImageData(noiseData, 0, 0);
  const noisePattern = ctx.createPattern(noiseCanvas, 'repeat');

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
    const count = Math.max(30, Math.min(64, Math.floor((W * H) / 11000)));
    nodes = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: i % 6 === 0 ? 2.6 : 1.6,
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

  const drawPlanet = () => {
    const compact = window.matchMedia('(max-width: 900px)').matches;
    const radius = compact ? Math.min(W * 0.98, H * 0.64) : Math.min(W * 0.56, H * 0.84);
    if (radius < 1) return;

    const cx = compact ? W * 0.92 : W * 1.035;
    const cy = compact ? H * 1.0 : H * 1.05;
    const rotationOffset = (compact ? -0.18 : 0.42) + rotation;
    const tilt = 0.78;
    const project = (latitude, longitude) => {
      const lat = latitude * Math.PI / 180;
      const lon = longitude * Math.PI / 180 + rotationOffset;
      const baseY = Math.sin(lat);
      const baseZ = Math.cos(lat) * Math.cos(lon);
      const y = baseY * Math.cos(tilt) - baseZ * Math.sin(tilt);
      const depth = baseY * Math.sin(tilt) + baseZ * Math.cos(tilt);
      return {
        x: cx + radius * Math.cos(lat) * Math.sin(lon),
        y: cy - radius * y,
        depth
      };
    };

    const violetGlow = ctx.createRadialGradient(
      cx - radius * 0.34, cy - radius * 0.28, radius * 0.14,
      cx, cy, radius * 1.3
    );
    violetGlow.addColorStop(0, 'rgba(124,82,230,0.08)');
    violetGlow.addColorStop(0.7, 'rgba(124,82,230,0.12)');
    violetGlow.addColorStop(0.9, 'rgba(124,82,230,0.24)');
    violetGlow.addColorStop(1, 'rgba(124,82,230,0)');
    ctx.fillStyle = violetGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    const atmosphere = ctx.createRadialGradient(cx, cy, radius * 0.84, cx, cy, radius * 1.14);
    atmosphere.addColorStop(0, 'rgba(95,160,187,0)');
    atmosphere.addColorStop(0.65, 'rgba(95,160,187,0.12)');
    atmosphere.addColorStop(0.88, 'rgba(171,202,215,0.32)');
    atmosphere.addColorStop(1, 'rgba(106,155,185,0)');
    ctx.fillStyle = atmosphere;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.14, 0, Math.PI * 2);
    ctx.fill();

    const ocean = ctx.createRadialGradient(
      cx - radius * 0.34, cy - radius * 0.4, radius * 0.03,
      cx, cy, radius * 1.02
    );
    ocean.addColorStop(0, '#4b6269');
    ocean.addColorStop(0.28, '#253b43');
    ocean.addColorStop(0.68, '#0c1a20');
    ocean.addColorStop(1, '#010304');
    ctx.save();
    ctx.shadowColor = 'rgba(90,156,182,0.22)';
    ctx.shadowBlur = radius * 0.06;
    ctx.fillStyle = ocean;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.clip();

    if (noisePattern) {
      ctx.globalAlpha = 0.09;
      ctx.fillStyle = noisePattern;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      ctx.globalAlpha = 1;
    }

    const gridStroke = Math.max(0.8, radius * 0.002);
    ctx.lineWidth = gridStroke;
    for (let latitude = -75; latitude <= 75; latitude += 15) {
      const alpha = 0.26 + (1 - Math.abs(latitude) / 90) * 0.3;
      ctx.strokeStyle = `rgba(166,205,217,${alpha})`;
      ctx.beginPath();
      let drawing = false;
      for (let step = 0; step <= 96; step++) {
        const longitude = -180 + step * 360 / 96;
        const point = project(latitude, longitude);
        if (point.depth <= 0.015) {
          drawing = false;
          continue;
        }
        if (drawing) ctx.lineTo(point.x, point.y);
        else ctx.moveTo(point.x, point.y);
        drawing = true;
      }
      ctx.stroke();
    }

    const meridianCount = 24;
    const latitudes = [];
    for (let latitude = -75; latitude <= 75; latitude += 15) latitudes.push(latitude);
    for (let index = 0; index < meridianCount; index++) {
      const longitude = -180 + index * 360 / meridianCount;
      const center = project(0, longitude);
      ctx.strokeStyle = `rgba(180,215,224,${0.25 + Math.max(0, center.depth) * 0.34})`;
      ctx.beginPath();
      let drawing = false;
      for (let step = 0; step <= 80; step++) {
        const latitude = -90 + step * 180 / 80;
        const point = project(latitude, longitude);
        if (point.depth <= 0.015) {
          drawing = false;
          continue;
        }
        if (drawing) ctx.lineTo(point.x, point.y);
        else ctx.moveTo(point.x, point.y);
        drawing = true;
      }
      ctx.stroke();
    }

    ctx.lineWidth = Math.max(0.6, radius * 0.0012);
    ctx.strokeStyle = 'rgba(188,220,229,0.2)';
    for (let row = 0; row < latitudes.length - 1; row++) {
      for (let column = 0; column < meridianCount; column++) {
        const nextColumn = (column + 1) % meridianCount;
        const diagonal = (row + column) % 2 === 0;
        const a = project(latitudes[row], -180 + (diagonal ? column : nextColumn) * 360 / meridianCount);
        const b = project(latitudes[row + 1], -180 + (diagonal ? nextColumn : column) * 360 / meridianCount);
        if (a.depth <= 0.18 || b.depth <= 0.18) continue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (let row = 0; row < latitudes.length; row++) {
      const latitude = latitudes[row];
      for (let index = 0; index < meridianCount; index++) {
        const longitude = -180 + index * 360 / meridianCount;
        const point = project(latitude, longitude);
        if (point.depth <= 0.12) continue;
        const hub = (row * 7 + index * 11) % 17 === 0;
        if (hub) {
          ctx.fillStyle = `rgba(175,219,232,${point.depth * 0.2})`;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(222,237,240,${0.4 + point.depth * 0.5})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, hub ? 2.2 : 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const terminator = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
    terminator.addColorStop(0, 'rgba(0,0,0,0.06)');
    terminator.addColorStop(0.56, 'rgba(0,0,0,0.02)');
    terminator.addColorStop(1, 'rgba(0,0,0,0.74)');
    ctx.fillStyle = terminator;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(197,226,235,0.62)';
    ctx.lineWidth = Math.max(0.8, radius * 0.0018);
    ctx.beginPath();
    ctx.arc(cx, cy, radius - ctx.lineWidth / 2, -Math.PI * 0.86, -Math.PI * 0.1);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(151,104,255,0.8)';
    ctx.shadowColor = 'rgba(124,58,237,0.95)';
    ctx.shadowBlur = radius * 0.1;
    ctx.lineWidth = Math.max(2.2, radius * 0.005);
    ctx.beginPath();
    ctx.arc(cx, cy, radius + ctx.lineWidth * 1.3, -Math.PI * 0.86, -Math.PI * 0.1);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(155,191,204,0.24)';
    ctx.lineWidth = Math.max(0.7, radius * 0.0012);
    ctx.beginPath();
    ctx.arc(cx, cy, radius - ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.stroke();
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const maxD = 175;

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
          const alpha = (1 - d / maxD) * 0.3;
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 0.8;
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
        ctx.strokeStyle = `rgba(255,255,255,${(1 - md / 160) * 0.38})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }

      // node
      ctx.fillStyle = a.hub ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.42)';
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

    drawPlanet();
    if (!reduced) rotation += 0.0007;
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
