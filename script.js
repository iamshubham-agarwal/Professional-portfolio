/* ========================================================================
   Shubham Agarwal — Portfolio
   Vanilla JS + GSAP + Lenis. No build step, CDN-only, GitHub Pages ready.
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- LOADER ---------------- */
  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loaderFill');
  const loaderPct = document.getElementById('loaderPct');
  let pct = 0;
  const loadTimer = setInterval(() => {
    pct += Math.random() * 18;
    if (pct >= 100) {
      pct = 100;
      clearInterval(loadTimer);
      setTimeout(() => loader.classList.add('done'), 250);
    }
    loaderFill.style.width = pct + '%';
    loaderPct.textContent = ' · ' + Math.floor(pct) + '%';
  }, 120);
  // Safety: never trap the user behind the loader
  setTimeout(() => loader.classList.add('done'), 2600);

  /* ---------------- LENIS SMOOTH SCROLL ---------------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.gsap) {
      lenis.on('scroll', () => { if (window.ScrollTrigger) ScrollTrigger.update(); });
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  function smoothScrollTo(target) {
    const el = document.getElementById(target);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.2 });
    else el.scrollIntoView({ behavior: 'smooth' });
  }

  /* ---------------- NAV: rail dots + hero contact link ---------------- */
  document.querySelectorAll('[data-target]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      smoothScrollTo(btn.getAttribute('data-target'));
    });
  });

  const railButtons = document.querySelectorAll('.railnav button');
  const sections = ['hero','snapshot','deck','career','skills','qual','work','contact']
    .map(id => document.getElementById(id)).filter(Boolean);

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = sections.indexOf(entry.target);
        railButtons.forEach(b => b.classList.remove('active'));
        if (railButtons[idx]) railButtons[idx].classList.add('active');
      }
    });
  }, { threshold: 0.45 });
  sections.forEach(s => navObserver.observe(s));

  /* ---------------- SCROLL REVEALS ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i % 6 * 70);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------------- FLOATING WHATSAPP ---------------- */
  const floatWa = document.getElementById('floatingWa');
  const heroEl = document.getElementById('hero');
  const waObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      floatWa.classList.toggle('show', !entry.isIntersecting);
    });
  }, { threshold: 0 });
  if (heroEl) waObserver.observe(heroEl);

  /* ---------------- CAREER MODAL ---------------- */
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');

  document.querySelectorAll('.career-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-detail');
      const source = document.getElementById(id);
      if (!source) return;
      modalBody.innerHTML = source.innerHTML;
      modal.classList.add('open');
    });
  });
  function closeModal(){ modal.classList.remove('open'); }
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* ---------------- ORBIT RING (signature hero element) ----------------
     Pure CSS 3D transforms. Tokens are positioned on a ring in 3D space,
     the whole ring is a single rotateY() driven by autorotation + drag
     momentum (like a flywheel), so depth/scale comes for free from
     perspective — no Three.js required. */
  const tokenData = [
    { label: 'NTPC', sub: 'Finance Dept.' },
    { label: 'SAP FICO', sub: 'Vouchers & Payments' },
    { label: 'MIS', sub: 'Reports & Records' },
    { label: 'Excel', sub: 'Intermediate' },
    { label: 'Finance', sub: 'Cash & Bank' },
    { label: 'AI Tools', sub: 'ChatGPT · Claude · Gemini' },
    { label: 'Prompting', sub: 'AI Operations' },
    { label: 'Newsletter', sub: 'NTPC Q3 2023' },
    { label: 'CCC', sub: 'NIELIT Certified' },
    { label: 'Recognition', sub: 'National Level' },
    { label: 'Resume', sub: 'View CV' },
    { label: 'LinkedIn', sub: 'Connect' },
  ];

  const orbitTokensEl = document.getElementById('orbitTokens');
  const orbitWorldEl = document.getElementById('orbitWorld');
  const orbitStageEl = document.getElementById('orbitStage');
  const RADIUS = 230;
  const count = tokenData.length;

  tokenData.forEach((t, i) => {
    const angle = (360 / count) * i;
    const el = document.createElement('div');
    el.className = 'token';
    el.style.transform = `rotateY(${angle}deg) translateZ(${RADIUS}px)`;
    el.innerHTML = `${t.label}<span>${t.sub}</span>`;
    orbitTokensEl.appendChild(el);
  });

  if (orbitStageEl && orbitWorldEl) {
    let rotY = -18;      // current ring rotation (deg)
    let rotX = 6;         // slight tilt for depth
    let velocity = 0.05;  // idle autorotation speed (deg/frame)
    let dragging = false;
    let lastX = 0, lastY = 0;
    let dragVel = 0;

    function render() {
      orbitWorldEl.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }

    function frame() {
      if (!dragging) {
        // momentum decays back to gentle idle spin
        dragVel *= 0.94;
        rotY += dragVel + velocity;
      }
      render();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    function pointerDown(x, y) {
      dragging = true;
      lastX = x; lastY = y;
      orbitStageEl.style.cursor = 'grabbing';
    }
    function pointerMove(x, y) {
      if (!dragging) return;
      const dx = x - lastX;
      const dy = y - lastY;
      rotY += dx * 0.35;
      rotX = Math.max(-20, Math.min(20, rotX - dy * 0.15));
      dragVel = dx * 0.35;
      lastX = x; lastY = y;
    }
    function pointerUp() {
      dragging = false;
      orbitStageEl.style.cursor = 'grab';
    }

    orbitStageEl.addEventListener('mousedown', (e) => pointerDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => pointerMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', pointerUp);

    orbitStageEl.addEventListener('touchstart', (e) => {
      const t = e.touches[0]; pointerDown(t.clientX, t.clientY);
    }, { passive: true });
    orbitStageEl.addEventListener('touchmove', (e) => {
      const t = e.touches[0]; pointerMove(t.clientX, t.clientY);
    }, { passive: true });
    orbitStageEl.addEventListener('touchend', pointerUp);

    // subtle mouse-parallax tilt when not dragging (desktop only)
    orbitStageEl.addEventListener('mousemove', (e) => {
      if (dragging) return;
      const rect = orbitStageEl.getBoundingClientRect();
      const relY = (e.clientY - rect.top - rect.height / 2) / rect.height;
      rotX = Math.max(-16, Math.min(16, 6 - relY * 14));
    });
  }

  /* ---------------- GSAP ENTRANCE (hero copy) ---------------- */
  if (window.gsap) {
    gsap.from('.hero-copy > *', {
      opacity: 0, y: 24, duration: 0.9, stagger: 0.08, ease: 'power2.out', delay: 0.3
    });
    gsap.from('.orbit-stage', {
      opacity: 0, scale: 0.9, duration: 1, ease: 'power2.out', delay: 0.15
    });
  }

});
