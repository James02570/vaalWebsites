/* ============================================================
   VAAL WEBSITES — app.js
   SPA router: loads page HTML + CSS on hash change
   ============================================================ */

const routes = {
  '#home':     { page: 'pages/home.html',     css: 'styles/home.css' },
  '#about':    { page: 'pages/about.html',    css: 'styles/about.css' },
  '#partners': { page: 'pages/partners.html', css: 'styles/partners.css' },
  '#products': { page: 'pages/products.html', css: 'styles/products.css' },
};

const app        = document.getElementById('app');
const pageCSS    = document.getElementById('page-css');
const spinner    = document.getElementById('loadingSpinner');

/* ---------- PAGE LOADER ---------- */

async function loadPage() {
  const hash  = window.location.hash || '#home';
  const route = routes[hash];

  // Show loading state
  if (spinner) spinner.style.display = 'flex';
  app.style.opacity = '0';

  if (!route) {
    app.innerHTML = `
      <div class="error-page">
        <h1>404 – Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="#home" class="btn-primary">Go Home</a>
      </div>`;
    app.style.opacity = '1';
    if (spinner) spinner.style.display = 'none';
    return;
  }

  try {
    const response = await fetch(route.page);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();

    app.innerHTML = html;
    pageCSS.href  = route.css;
    window.scrollTo(0, 0);

    // Run page-specific init after injecting HTML
    runPageScripts(hash);

  } catch (err) {
    console.error('Page load failed:', err);
    app.innerHTML = `
      <div class="error-page">
        <h1>Something went wrong</h1>
        <p>Could not load this page. Please try again.</p>
        <a href="#home" class="btn-primary">Go Home</a>
      </div>`;
  } finally {
    app.style.opacity = '1';
    if (spinner) spinner.style.display = 'none';
    updateActiveNav(hash);
  }
}

/* ---------- PAGE-SPECIFIC SCRIPTS ---------- */

function runPageScripts(hash) {
  switch (hash) {
    case '#home':     initHome();     break;
    case '#products': initProducts(); break;
    case '#partners': initPartners(); break;
  }
}

/* ---------- HOME PAGE ---------- */

function initHome() {
  initSlider('.tech-row', 2200);
}

function initPartners() {
  const btn = document.getElementById('partnerLoginBtn');
  if (btn) btn.addEventListener('click', openLogin);
}

function initSlider(selector, intervalTime) {
  const container = document.querySelector(selector);
  if (!container) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (!isMobile) return;

  let autoSlide;
  const step = () => container.clientWidth * 0.9;

  function startAutoSlide() {
    autoSlide = setInterval(() => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 5) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: step(), behavior: 'smooth' });
      }
    }, intervalTime);
  }

  function stopAutoSlide() { clearInterval(autoSlide); }

  startAutoSlide();

  container.addEventListener('mouseenter', stopAutoSlide);
  container.addEventListener('mouseleave', startAutoSlide);
  container.addEventListener('touchstart', stopAutoSlide, { passive: true });
  container.addEventListener('touchend', startAutoSlide, { passive: true });

  // Drag to scroll
  let isDown = false, startX, scrollLeft;
  container.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    stopAutoSlide();
  });
  container.addEventListener('mouseleave', () => { isDown = false; startAutoSlide(); });
  container.addEventListener('mouseup', () => { isDown = false; startAutoSlide(); });
  container.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    container.scrollLeft = scrollLeft - (e.pageX - container.offsetLeft - startX) * 1.5;
  });
}

/* ---------- PRODUCTS PAGE ---------- */

function initProducts() {
  const toggle = document.getElementById('billingToggle');
  if (!toggle) return;

  toggle.addEventListener('change', () => {
    const isAnnual = toggle.checked;
    document.querySelectorAll('[data-month]').forEach(card => {
      const priceEl = card.querySelector('.price');
      if (!priceEl) return;
      const val = isAnnual ? card.dataset.year : card.dataset.month;
      const span = priceEl.querySelector('span');
      priceEl.childNodes[0].textContent = `R${Number(val).toLocaleString()} `;
      if (span) span.textContent = isAnnual ? '/yr' : '/mo';
    });
  });
}

/* ---------- GENERIC FORM SUBMIT ---------- */

function initFormSubmit(formId, endpoint) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(form));

    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    try {
      // Replace with your real API call
      await new Promise(r => setTimeout(r, 800)); // simulated delay
      showToast('Your request has been sent! We\'ll be in touch soon.', 'success');
      form.reset();
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Submit Request'; }
    }
  });
}

function initForms(formId, endpoint) {
  initFormSubmit(formId, endpoint);
}

/* ---------- TOAST NOTIFICATION ---------- */

function showToast(message, type = 'success') {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('toast-visible'), 10);
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

/* ---------- ACTIVE NAV ---------- */

function updateActiveNav(hash) {
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === hash);
  });
}

/* ---------- LOGIN MODAL ---------- */

function openLogin()  { document.getElementById('loginOverlay').classList.add('active'); }
function closeLogin() { document.getElementById('loginOverlay').classList.remove('active'); }

document.addEventListener('DOMContentLoaded', () => {
  // Footer year
  const yr = document.getElementById('footerYear');
  if (yr) yr.textContent = new Date().getFullYear();

  // Login button
  document.getElementById('loginBtn')?.addEventListener('click', e => {
    e.preventDefault();
    openLogin();
  });

  // Close button
  document.getElementById('closeLoginBtn')?.addEventListener('click', closeLogin);

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  navToggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });

  // Close mobile nav on link click
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
});

// Close modal on ESC or outside click
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLogin(); });
document.addEventListener('click', e => { if (e.target.id === 'loginOverlay') closeLogin(); });

// Router
window.addEventListener('hashchange', loadPage);
window.addEventListener('DOMContentLoaded', loadPage);
