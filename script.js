/* =========================================
   TUBES BACKGROUND (hero)
   ========================================= */
(async function initTubes() {
  const canvas = document.getElementById('tubes-canvas');
  if (!canvas) return;

  try {
    const module = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
    const TubesCursor = module.default;

    const app = TubesCursor(canvas, {
      tubes: {
        colors: ['#a78bfa', '#22d3ee', '#4b7cf7'],
        lights: {
          intensity: 200,
          colors: ['#a78bfa', '#22d3ee', '#4b7cf7', '#f967fb']
        }
      }
    });

    const hero = document.getElementById('hero');
    if (hero && app) {
      hero.addEventListener('click', () => {
        const rand = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
        app.tubes.setColors([rand(), rand(), rand()]);
        app.tubes.setLightsColors([rand(), rand(), rand(), rand()]);
      });
    }
  } catch (err) {
    console.warn('Tubes background failed to load:', err);
  }
})();

/* =========================================
   CLOCK
   ========================================= */
function updateClock() {
  const now = new Date();
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();

  const hourDeg   = (h * 30) + (m * 0.5);
  const minuteDeg = m * 6;
  const secondDeg = s * 6;

  const hh = document.getElementById('hour-hand');
  const mh = document.getElementById('minute-hand');
  const sh = document.getElementById('second-hand');
  if (hh) hh.style.transform = `rotate(${hourDeg}deg)`;
  if (mh) mh.style.transform = `rotate(${minuteDeg}deg)`;
  if (sh) sh.style.transform = `rotate(${secondDeg}deg)`;
}
updateClock();
setInterval(updateClock, 1000);

/* =========================================
   LOCAL TIME DISPLAY
   ========================================= */
function updateLocalTime() {
  const el = document.getElementById('local-time');
  if (!el) return;
  const now = new Date();
  const brt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const hh = String(brt.getHours()).padStart(2, '0');
  const mm = String(brt.getMinutes()).padStart(2, '0');
  el.textContent = `${hh}:${mm}`;
}
updateLocalTime();
setInterval(updateLocalTime, 60000);

/* =========================================
   NAVBAR — scroll behavior
   ========================================= */
const navbar = document.getElementById('navbar');
const heroSection = document.querySelector('.hero');

function updateNavbar() {
  const heroBottom = heroSection ? heroSection.offsetHeight : 600;
  if (window.scrollY > heroBottom - 100) {
    navbar.classList.add('dark');
  } else {
    navbar.classList.remove('dark');
  }
}
window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

/* active nav link on scroll */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === id);
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => sectionObserver.observe(s));

/* =========================================
   PARTICLES GENERATOR
   ========================================= */
function spawnParticles(containerId, count = 40) {
  const container = document.getElementById(containerId);
  if (!container) return;
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.className = 'particle';
    const size = Math.random() * 2.5 + 0.5;
    dot.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      opacity: ${Math.random() * 0.6 + 0.1};
      animation-duration: ${Math.random() * 20 + 15}s;
      animation-delay: ${Math.random() * -20}s;
    `;
    container.appendChild(dot);
  }
}

spawnParticles('particles-about', 50);
spawnParticles('particles-projects', 80);
spawnParticles('particles-skills', 40);
spawnParticles('particles-contact', 50);
spawnParticles('particles-footer', 30);


/* =========================================
   ROLLING COUNTER — GitHub commits
   ========================================= */
function buildRollingCounter(container, numDigits) {
  container.innerHTML = '';
  const SIZE = 64;
  const cols = [];
  for (let i = 0; i < numDigits; i++) {
    const wrap = document.createElement('div');
    wrap.style.cssText = `
      position:relative; width:${SIZE * 0.62}px; height:${SIZE}px;
      overflow:hidden; display:inline-block;
    `;
    const inner = document.createElement('div');
    inner.style.cssText = `
      position:absolute; top:0; left:0;
      display:flex; flex-direction:column;
      transition:transform 0.7s cubic-bezier(0.25,1,0.5,1);
      will-change:transform;
    `;
    for (let n = 0; n <= 9; n++) {
      const span = document.createElement('span');
      span.textContent = n;
      span.style.cssText = `
        display:flex; align-items:center; justify-content:center;
        width:${SIZE * 0.62}px; height:${SIZE}px;
        font-variant-numeric:tabular-nums;
      `;
      inner.appendChild(span);
    }
    // fade top/bottom
    const fadeTop = document.createElement('div');
    fadeTop.style.cssText = `
      pointer-events:none; position:absolute; top:0; left:0; right:0;
      height:30%; background:linear-gradient(to bottom,#0f1c2e,transparent); z-index:2;
    `;
    const fadeBot = document.createElement('div');
    fadeBot.style.cssText = `
      pointer-events:none; position:absolute; bottom:0; left:0; right:0;
      height:30%; background:linear-gradient(to top,#0f1c2e,transparent); z-index:2;
    `;
    wrap.appendChild(inner);
    wrap.appendChild(fadeTop);
    wrap.appendChild(fadeBot);
    container.appendChild(wrap);
    cols.push(inner);
  }
  return cols;
}

function setCounterValue(cols, value) {
  const str = value.toString().padStart(cols.length, '0');
  str.split('').forEach((ch, i) => {
    const d = parseInt(ch, 10);
    if (!isNaN(d) && cols[i]) {
      cols[i].style.transform = `translateY(-${d * 10}%)`;
    }
  });
}

async function initCommitCounter() {
  const container = document.getElementById('commit-counter');
  if (!container) return;

  const cols = buildRollingCounter(container, 4);

  try {
    const res = await fetch('stats.json');
    const data = await res.json();
    const total = data.commits;

    if (total && total > 0) {
      const str = total.toString();
      const finalCols = str.length !== cols.length
        ? buildRollingCounter(container, str.length)
        : cols;
      setTimeout(() => setCounterValue(finalCols, total), 400);
    }
  } catch (err) {
    console.warn('stats.json indisponível:', err);
  }
}

initCommitCounter();

/* =========================================
   GITHUB CONTRIBUTION GRID
   ========================================= */
function buildGithubGrid() {
  const grid = document.getElementById('github-grid');
  if (!grid) return;

  const totalCells = 52 * 7;
  const levels = [null, 'l1', 'l2', 'l3', 'l4'];

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'gh-cell';

    const rand = Math.random();
    let level = null;
    if (rand > 0.55) level = levels[1];
    if (rand > 0.72) level = levels[2];
    if (rand > 0.85) level = levels[3];
    if (rand > 0.93) level = levels[4];

    if (i > 300) {
      const boost = Math.random();
      if (boost > 0.35) level = levels[1];
      if (boost > 0.55) level = levels[2];
      if (boost > 0.72) level = levels[3];
      if (boost > 0.86) level = levels[4];
    }

    if (level) cell.classList.add(level);
    grid.appendChild(cell);
  }
}
buildGithubGrid();

/* =========================================
   SCROLL FADE-IN ANIMATIONS
   ========================================= */
const fadeEls = document.querySelectorAll(
  '.profile-card, .bio-card, .philosophy-block, .global-block, ' +
  '.project-item, .automation-block, .github-block, ' +
  '.skill-category, .contact-container, .footer-content'
);

fadeEls.forEach(el => el.classList.add('fade-in'));

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

fadeEls.forEach(el => fadeObserver.observe(el));

/* =========================================
   FLOW TABS
   ========================================= */
document.querySelectorAll('.flow-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.flow-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

/* =========================================
   CONTACT FORM
   ========================================= */
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-submit');
  btn.textContent = 'Mensagem enviada! ✓';
  btn.style.background = '#4ade80';
  btn.style.color = '#052e16';
  setTimeout(() => {
    btn.innerHTML = 'Enviar mensagem <span class="send-icon">✈</span>';
    btn.style.background = '';
    btn.style.color = '';
  }, 3000);
}

/* =========================================
   HERO PARALLAX on mousemove
   ========================================= */
const heroTitleEl = document.querySelector('.hero-title');
document.querySelector('.hero')?.addEventListener('mousemove', (e) => {
  if (!heroTitleEl) return;
  const { innerWidth: W, innerHeight: H } = window;
  const dx = (e.clientX / W - 0.5) * 12;
  const dy = (e.clientY / H - 0.5) * 8;
  heroTitleEl.style.transform = `translate(${dx}px, ${dy}px)`;
});
document.querySelector('.hero')?.addEventListener('mouseleave', () => {
  if (heroTitleEl) heroTitleEl.style.transform = '';
});

/* =========================================
   SMOOTH SCROLL for nav links
   ========================================= */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
