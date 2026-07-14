/* ============================================================
   0. LOADER
   ============================================================ */
(function loaderSequence(){
  const fill = document.getElementById('loaderFill');
  const pct  = document.getElementById('loaderPct');
  const loader = document.getElementById('loader');
  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 18;
    if (p >= 100) p = 100;
    fill.style.width = p + '%';
    pct.textContent = Math.floor(p) + '%';
    if (p >= 100){
      clearInterval(iv);
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        startEntrance();
      }, 250);
    }
  }, 120);
})();

/* ============================================================
   1. LENIS SMOOTH SCROLL
   ============================================================ */
let lenis;
try {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true, smoothTouch: false });
  function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
} catch(e){ /* Lenis unavailable — native scroll still works */ }

/* ============================================================
   2. CURSOR GLOW
   ============================================================ */
const cursorGlow = document.getElementById('cursorGlow');
window.addEventListener('mousemove', (e) => {
  if (!cursorGlow) return;
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top = e.clientY + 'px';
});

/* ============================================================
   3. THREE.JS — HERO PARTICLE FIELD
   ============================================================ */
let heroScene, heroCamera, heroRenderer, particles, mouseX = 0, mouseY = 0;

function initHeroCanvas(){
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  heroScene = new THREE.Scene();
  heroCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  heroCamera.position.z = 60;

  heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  heroRenderer.setSize(window.innerWidth, window.innerHeight);

  // particle field — represents energy / grid nodes (nod to power-plant finance operations)
  const count = window.innerWidth < 700 ? 700 : 1600;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);

  for (let i = 0; i < count; i++){
    positions[i*3]     = (Math.random() - 0.5) * 220;
    positions[i*3 + 1] = (Math.random() - 0.5) * 140;
    positions[i*3 + 2] = (Math.random() - 0.5) * 160;
    scales[i] = Math.random();
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

  const material = new THREE.PointsMaterial({
    color: 0xc9a84c,
    size: 1.15,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true
  });

  particles = new THREE.Points(geometry, material);
  heroScene.add(particles);

  // a few larger "node" spheres with soft glow to suggest a data/grid network
  const nodeGeo = new THREE.SphereGeometry(0.6, 12, 12);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0xe9cd7c, transparent: true, opacity: 0.5 });
  for (let i = 0; i < 14; i++){
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.set((Math.random()-0.5)*100, (Math.random()-0.5)*60, (Math.random()-0.5)*80);
    heroScene.add(node);
  }

  window.addEventListener('resize', onHeroResize);
  window.addEventListener('mousemove', onHeroMouseMove);

  animateHero();
}

function onHeroResize(){
  if (!heroRenderer) return;
  heroCamera.aspect = window.innerWidth / window.innerHeight;
  heroCamera.updateProjectionMatrix();
  heroRenderer.setSize(window.innerWidth, window.innerHeight);
}

function onHeroMouseMove(e){
  mouseX = (e.clientX / window.innerWidth - 0.5);
  mouseY = (e.clientY / window.innerHeight - 0.5);
}

let heroClock = 0;
function animateHero(){
  requestAnimationFrame(animateHero);
  if (!heroRenderer) return;
  heroClock += 0.0022;

  if (particles){
    particles.rotation.y = heroClock;
    particles.rotation.x = Math.sin(heroClock * 0.5) * 0.08;
  }

  // gentle camera drift + mouse parallax (Apple-style subtlety, not scroll-jacking)
  heroCamera.position.x += (mouseX * 10 - heroCamera.position.x) * 0.02;
  heroCamera.position.y += (-mouseY * 8 - heroCamera.position.y) * 0.02;
  heroCamera.lookAt(0, 0, 0);

  heroRenderer.render(heroScene, heroCamera);
}

/* ============================================================
   4. GSAP SCROLLTRIGGER — SECTION REVEALS
   ============================================================ */
function initScrollAnimations(){
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // generic upward reveals
  gsap.utils.toArray('.reveal-up').forEach((el) => {
    gsap.fromTo(el, { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  // timeline cards — staggered slide-in
  gsap.utils.toArray('.reveal-tl').forEach((el, i) => {
    gsap.fromTo(el, { x: -30, opacity: 0 }, {
      x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });

  // timeline progress line fill
  const track = document.querySelector('.timeline');
  const progress = document.getElementById('timelineProgress');
  if (track && progress){
    gsap.to(progress, {
      height: '100%', ease: 'none',
      scrollTrigger: { trigger: track, start: 'top 70%', end: 'bottom 60%', scrub: 0.6 }
    });
  }

  // dashboard bar fills
  document.querySelectorAll('.dash-bar-fill').forEach((bar) => {
    ScrollTrigger.create({
      trigger: bar, start: 'top 90%',
      onEnter: () => bar.classList.add('in-view')
    });
  });

  // animated counters
  document.querySelectorAll('.dash-value[data-count]').forEach((el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const isDecimal = String(target).includes('.');
    ScrollTrigger.create({
      trigger: el, start: 'top 90%',
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 1.6, ease: 'power2.out',
          onUpdate: () => { el.textContent = isDecimal ? obj.val.toFixed(1) : Math.floor(obj.val); }
        });
      }
    });
  });

  // hero text lines
  gsap.fromTo('.hero-name .line', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: 'power3.out', delay: 0.2 });
  gsap.utils.toArray('.reveal-line').forEach((el, i) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.8, delay: 0.6 + i * 0.08, ease: 'power2.out' });
    gsap.set(el, { y: 14 });
  });
}

/* ============================================================
   5. SKILL GALAXY — ORBIT + MOUSE PARALLAX
   ============================================================ */
function initGalaxy(){
  const galaxy = document.getElementById('galaxy');
  if (!galaxy) return;
  const orbs = Array.from(galaxy.querySelectorAll('.skill-orb'));
  if (window.innerWidth <= 640) return; // static stacked layout on mobile (handled in CSS)

  const radiusX = galaxy.clientWidth * 0.34;
  const radiusY = 110;
  const angleStep = (Math.PI * 2) / orbs.length;
  let galaxyMouseX = 0, galaxyMouseY = 0;

  orbs.forEach((orb, i) => {
    orb.dataset.angle = angleStep * i;
  });

  galaxy.addEventListener('mousemove', (e) => {
    const rect = galaxy.getBoundingClientRect();
    galaxyMouseX = (e.clientX - rect.left - rect.width / 2) / rect.width;
    galaxyMouseY = (e.clientY - rect.top - rect.height / 2) / rect.height;
  });

  let t = 0;
  function orbit(){
    requestAnimationFrame(orbit);
    t += 0.0035;
    orbs.forEach((orb) => {
      const depth = parseFloat(orb.dataset.depth) || 1;
      const angle = parseFloat(orb.dataset.angle) + t * depth * 0.4;
      const x = Math.cos(angle) * radiusX * depth * 0.55 + galaxyMouseX * 24 * depth;
      const y = Math.sin(angle) * radiusY * depth * 0.55 + galaxyMouseY * 18 * depth;
      orb.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    });
  }
  orbit();
}

/* ============================================================
   6. FLOATING WHATSAPP VISIBILITY
   ============================================================ */
function initFloatingWA(){
  const waBtn = document.getElementById('floating-wa');
  if (!waBtn) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) waBtn.classList.add('visible');
    else waBtn.classList.remove('visible');
  });
}

/* ============================================================
   7. ENTRANCE SEQUENCE
   ============================================================ */
function startEntrance(){
  initHeroCanvas();
  initScrollAnimations();
  initGalaxy();
  initFloatingWA();
  if (window.ScrollTrigger) ScrollTrigger.refresh();
}

document.body.style.overflow = 'hidden'; // locked until loader completes
