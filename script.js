/**
 * Vincent Deschamps — Portfolio
 * Pure JS: no frameworks, no external deps
 */

'use strict';

/* ═══════════════════════════════════
   NAV — scroll state + mobile toggle
═══════════════════════════════════ */
(function initNav() {
  const nav        = document.getElementById('nav');
  const toggle     = document.getElementById('navToggle');
  const links      = document.getElementById('navLinks');
  const navLinkEls = links.querySelectorAll('a');

  // Scroll: add .scrolled class after 40px
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const closeMenu = () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  const openMenu = () => {
    links.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  };

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  navLinkEls.forEach(a => a.addEventListener('click', closeMenu));

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
})();


/* ═══════════════════════════════════
   SCROLL REVEAL — IntersectionObserver
═══════════════════════════════════ */
(function initReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


/* ═══════════════════════════════════
   COUNTER ANIMATION — stat numbers
═══════════════════════════════════ */
(function initCounters() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = prefersReduced ? 0 : 900;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('.stat-number[data-target]').forEach(el => observer.observe(el));
})();


/* ═══════════════════════════════════
   COPY EMAIL — clipboard
═══════════════════════════════════ */
(function initCopyEmail() {
  const btn   = document.getElementById('copyEmail');
  const label = document.getElementById('emailLabel');
  if (!btn) return;

  const EMAIL = 'vincent.deschamps06@gmail.com';
  let timer;

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // Fallback: execCommand
      const ta = document.createElement('textarea');
      ta.value = EMAIL;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    btn.classList.add('copied');
    label.textContent = 'Adresse copiée !';

    clearTimeout(timer);
    timer = setTimeout(() => {
      btn.classList.remove('copied');
      label.textContent = EMAIL;
    }, 2200);
  });
})();


/* ═══════════════════════════════════
   HERO CANVAS — particle network
   Subtle, calm — not "Matrix green"
═══════════════════════════════════ */
(function initCanvas() {
  const canvas  = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx     = canvas.getContext('2d');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Config
  const CFG = {
    particleCount : 68,
    maxDist       : 150,
    speed         : 0.35,
    radius        : 1.6,
    colorNode     : 'rgba(99,130,255,',
    colorLine     : 'rgba(99,130,255,',
  };

  let W, H, particles, animId;

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };

  const makeParticle = () => ({
    x  : Math.random() * W,
    y  : Math.random() * H,
    vx : (Math.random() - 0.5) * CFG.speed,
    vy : (Math.random() - 0.5) * CFG.speed,
    r  : CFG.radius + Math.random() * 0.8,
    a  : 0.3 + Math.random() * 0.5,
  });

  const init = () => {
    resize();
    particles = Array.from({ length: CFG.particleCount }, makeParticle);
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);

    // Update & draw nodes
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = CFG.colorNode + p.a + ')';
      ctx.fill();
    }

    // Draw edges
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CFG.maxDist) {
          const alpha = (1 - dist / CFG.maxDist) * 0.22;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = CFG.colorLine + alpha + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  };

  // Handle resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(animId);
      init();
      draw();
    }, 200);
  }, { passive: true });

  // Pause when tab is hidden (perf)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      draw();
    }
  });

  init();
  draw();
})();


/* ═══════════════════════════════════
   ACTIVE NAV LINK — scroll spy
═══════════════════════════════════ */
(function initScrollSpy() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(a => {
            const active = a.getAttribute('href') === '#' + id;
            a.style.color = active ? 'var(--text)' : '';
            if (active) a.setAttribute('aria-current', 'page');
            else a.removeAttribute('aria-current');
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(s => observer.observe(s));
})();
