const configuredBaseUrl = (window.VAAL_API_BASE_URL || '').trim().replace(/\/$/, '');
const API_BASE_URL = configuredBaseUrl || 'http://api.vaalwebsites.co.za';

const routes = {
  '#home': { page: 'pages/home/home.html', css: 'pages/home/home.css' },
  '#about': { page: 'pages/about/about.html', css: 'pages/about/about.css' },
  '#products': { page: 'pages/products/products.html', css: 'pages/products/products.css' },
  '#dashboard': { page: 'pages/dashboard/dashboard.html', css: 'pages/dashboard/dashboard.css' },
};

const protectedRoutes = new Set(['#dashboard']);
const LOGIN_RETURN_KEY = 'vaal_login_return';
let pendingLoginReturn = null;
let currentUserProfile = null;

const app = document.getElementById('app');
const pageCSS = document.getElementById('page-css');
const spinner = document.getElementById('loadingSpinner');
const loginBtn = document.getElementById('loginBtn');

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${path}`);
  }

  return response;
}

async function refreshCurrentUser() {
  try {
    const response = await apiFetch('/auth/user');
    currentUserProfile = await response.json();
  } catch (err) {
    console.error('Could not load current user:', err);
    currentUserProfile = null;
  }

  updateAuthButtons(currentUserProfile);
  return currentUserProfile;
}

function saveLoginReturn(hash) {
  try {
    localStorage.setItem(LOGIN_RETURN_KEY, hash);
  } catch (_) {}
}

function consumeLoginReturn() {
  try {
    const hash = localStorage.getItem(LOGIN_RETURN_KEY);
    localStorage.removeItem(LOGIN_RETURN_KEY);
    return hash && routes[hash] ? hash : null;
  } catch (_) {
    return null;
  }
}

async function loadPage() {
  const hash = window.location.hash || '#home';
  const route = routes[hash];

  if (spinner) spinner.style.display = 'flex';
  if (app) app.style.opacity = '0';

  if (!route) {
    renderErrorPage('404 - Page Not Found', "The page you're looking for doesn't exist.");
    updateActiveNav(hash);
    return;
  }

  try {
    if (protectedRoutes.has(hash)) {
      const user = currentUserProfile || await refreshCurrentUser();
      if (!user) {
        pendingLoginReturn = hash;
        showToast('Please sign in to continue.', 'error');
        window.location.hash = '#home';
        openLogin();
        return;
      }
    }

    const response = await fetch(route.page);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    if (app) {
      app.innerHTML = await response.text();
    }
    if (pageCSS) pageCSS.href = route.css;
    window.scrollTo(0, 0);

    await runPageScripts(hash);
  } catch (err) {
    console.error('Page load failed:', err);
    renderErrorPage('Something went wrong', 'Could not load this page. Please try again.');
  } finally {
    if (app) app.style.opacity = '1';
    if (spinner) spinner.style.display = 'none';
    updateActiveNav(hash);
  }
}

async function runPageScripts(hash) {
  switch (hash) {
    case '#home':
      initHome();
      break;
    case '#products':
      initProducts();
      break;
    case '#dashboard':
      await initDashboard();
      break;
  }
}

function initHome() {
  initSlider('.tech-row', 2200);
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

  function stopAutoSlide() {
    clearInterval(autoSlide);
  }

  startAutoSlide();

  container.addEventListener('mouseenter', stopAutoSlide);
  container.addEventListener('mouseleave', startAutoSlide);
  container.addEventListener('touchstart', stopAutoSlide, { passive: true });
  container.addEventListener('touchend', startAutoSlide, { passive: true });

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  container.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    stopAutoSlide();
  });
  container.addEventListener('mouseleave', () => {
    isDown = false;
    startAutoSlide();
  });
  container.addEventListener('mouseup', () => {
    isDown = false;
    startAutoSlide();
  });
  container.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    container.scrollLeft = scrollLeft - (e.pageX - container.offsetLeft - startX) * 1.5;
  });
}

function initProducts() {
  const toggle = document.getElementById('billingToggle');
  if (!toggle) return;

  toggle.addEventListener('change', () => {
    const isAnnual = toggle.checked;
    document.querySelectorAll('[data-month]').forEach(card => {
      const priceEl = card.querySelector('.price');
      if (!priceEl) return;

      const val = isAnnual ? card.dataset.year : card.dataset.month;
      priceEl.innerHTML = `R${Number(val).toLocaleString()} <span>${isAnnual ? '/yr' : '/mo'}</span>`;
    });
  });
}

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

function updateActiveNav(hash) {
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === hash);
  });
}

function openLogin() {
  document.getElementById('loginOverlay')?.classList.add('active');
}

function closeLogin() {
  document.getElementById('loginOverlay')?.classList.remove('active');
}

function updateAuthButtons(user) {
  if (!loginBtn) return;

  loginBtn.textContent = user ? 'Dashboard' : 'Login';
  loginBtn.classList.toggle('is-dashboard', Boolean(user));
  loginBtn.setAttribute('aria-label', user ? 'Open dashboard' : 'Login');
}

function loginWithGoogle() {
  const returnTo = pendingLoginReturn || window.location.hash || '#home';
  saveLoginReturn(returnTo);
  pendingLoginReturn = null;
  window.location.href = `${API_BASE_URL}/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
}

function formatDate(value) {
  if (!value) return 'Today';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Today';

  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

async function initDashboard() {
  const user = currentUserProfile;
  if (!user) {
    window.location.hash = '#home';
    return;
  }

  const plan = user.plan || 'Starter';
  const dashName = document.getElementById('dashName');
  const detailName = document.getElementById('detailName');
  const detailEmail = document.getElementById('detailEmail');
  const dashPlan = document.getElementById('dashPlan');
  const detailPlan = document.getElementById('detailPlan');
  const dashProvider = document.getElementById('dashProvider');
  const detailProvider = document.getElementById('detailProvider');
  const dashJoined = document.getElementById('dashJoined');
  const avatar = document.getElementById('dashAvatar');
  const activity = document.getElementById('dashActivity');
  const logoutBtn = document.getElementById('dashLogoutBtn');

  if (dashName) dashName.textContent = user.name || 'Customer';
  if (detailName) detailName.textContent = user.name || 'Customer';
  if (detailEmail) detailEmail.textContent = user.email || '';
  if (dashPlan) dashPlan.textContent = plan;
  if (detailPlan) detailPlan.textContent = plan;
  if (dashProvider) dashProvider.textContent = 'Google';
  if (detailProvider) detailProvider.textContent = 'Google';
  if (dashJoined) dashJoined.textContent = formatDate(user.joined || user.createdAt);

  if (avatar && user.photo) {
    avatar.textContent = '';
    avatar.style.backgroundImage = `url("${user.photo}")`;
    avatar.style.backgroundSize = 'cover';
    avatar.style.backgroundPosition = 'center';
  }

  if (activity) {
    activity.innerHTML = `
      <li>Signed in with Google</li>
      <li>Account profile synced to Cloud SQL</li>
    `;
  }

  logoutBtn?.addEventListener('click', async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
      currentUserProfile = null;
      updateAuthButtons(null);
      window.location.hash = '#home';
      showToast('Signed out');
    } catch (err) {
      console.error('Logout failed:', err);
      showToast('Could not sign out. Please try again.', 'error');
    }
  }, { once: true });
}

function renderErrorPage(title, message) {
  if (!app) return;
  if (pageCSS) pageCSS.removeAttribute('href');

  app.innerHTML = `
    <div class="error-page">
      <h1>${title}</h1>
      <p>${message}</p>
      <a href="#home" class="btn-primary">Go Home</a>
    </div>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const yr = document.getElementById('footerYear');
  if (yr) yr.textContent = new Date().getFullYear();

  loginBtn?.addEventListener('click', e => {
    e.preventDefault();
    if (currentUserProfile) {
      window.location.hash = '#dashboard';
      return;
    }

    pendingLoginReturn = window.location.hash || '#home';
    openLogin();
  });

  document.getElementById('loginGoogleBtn')?.addEventListener('click', loginWithGoogle);
  document.getElementById('closeLoginBtn')?.addEventListener('click', closeLogin);

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle?.addEventListener('click', () => {
    if (!navLinks) return;
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => navLinks?.classList.remove('open'));
  });

  await refreshCurrentUser();

  if (currentUserProfile) {
    const savedReturn = consumeLoginReturn();
    if (savedReturn && savedReturn !== window.location.hash) {
      window.location.hash = savedReturn;
      return;
    }
  } else {
    consumeLoginReturn();
  }

  await loadPage();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLogin();
});

document.addEventListener('click', e => {
  if (e.target.id === 'loginOverlay') closeLogin();
});

window.addEventListener('hashchange', loadPage);
