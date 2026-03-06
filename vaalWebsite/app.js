// app.js - robust fragment loader + delegation for contact fragment controls
(function () {
  const routes = {
    '': { fragment: 'pages/home.html', css: 'components/home.css' },
    '#home': { fragment: 'pages/home.html', css: 'components/home.css' },
    '#packages': { fragment: 'pages/packages.html', css: 'components/packages.css' },
    '#template': { fragment: 'pages/template.html', css: 'components/template.css' },
    '#contact': { fragment: 'pages/contact.html', css: 'components/contact.css' },
    '#about': { fragment: 'pages/about.html', css: 'components/about.css' }
  };

  const contentEl = document.getElementById('app-content');
  const pageCss = document.getElementById('page-css');

  // expose loadRoute so other code (delegated handlers) can call it
  async function fetchText(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return await res.text();
  }

  // load external script and force execution even if previously added
  function loadExternalScript(src) {
    return new Promise((resolve, reject) => {
      try {
        const script = document.createElement('script');
        // append cache-buster to force execution on revisit
        const cb = `_cb=${Date.now()}`;
        script.src = src + (src.includes('?') ? '&' + cb : '?' + cb);
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load script ' + src));
        document.body.appendChild(script);
      } catch (err) {
        reject(err);
      }
    });
  }

  function runInlineScript(code) {
    try {
      (0, eval)(code);
    } catch (err) {
      console.error('Inline fragment script error', err);
    }
  }

  // global loader used by hash routing and by delegated handlers
  async function loadRoute(hash) {
    const route = routes[hash] || routes[''];
    try {
      const html = await fetchText(route.fragment);

      if (pageCss && route.css) pageCss.href = route.css;

      if (!contentEl) throw new Error('#app-content not found');
      contentEl.innerHTML = html;

      // parse injected HTML and execute script tags found inside fragment
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const scripts = Array.from(tmp.querySelectorAll('script'));

      // load external scripts sequentially to preserve order
      for (const s of scripts) {
        if (s.src) {
          // use the original src (relative) so server resolves correctly
          await loadExternalScript(s.src);
        }
      }

      // execute inline scripts in order
      for (const s of scripts) {
        if (!s.src && s.textContent && s.textContent.trim()) {
          await new Promise((res) => {
            setTimeout(() => {
              runInlineScript(s.textContent);
              res();
            }, 0);
          });
        }
      }

      // accessibility: focus heading inside injected fragment
      const firstHeading = contentEl.querySelector('h1, h2, [role="main"] h1, [role="main"] h2');
      if (firstHeading && typeof firstHeading.focus === 'function') {
        firstHeading.tabIndex = -1;
        firstHeading.focus();
      }
    } catch (err) {
      console.error(err);
      if (contentEl) contentEl.innerHTML = `<div style="padding:2rem;">Unable to load page. Check console for details.</div>`;
    }
  }

  // expose to window so other modules or inline scripts can call it
  window.loadRoute = loadRoute;

  // Navigation wiring
  function initNav() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) {
        e.preventDefault();
        if (location.hash !== href) location.hash = href;
        else loadRoute(href);
        // Auto-close mobile nav when a hash link is clicked
        try {
          const navBarEl = document.querySelector('.navBar');
          const hamburgerEl = document.querySelector('.hamburger');
          if (navBarEl && navBarEl.classList.contains('open')) {
            navBarEl.classList.remove('open');
            if (hamburgerEl) hamburgerEl.setAttribute('aria-expanded', 'false');
          }
        } catch (err) {
          // fail silently if DOM not ready
        }
      }
    });

    const navBar = document.querySelector('.navBar');
    const hamburger = document.querySelector('.hamburger');
    if (hamburger && navBar) {
      hamburger.addEventListener('click', () => {
        navBar.classList.toggle('open');
        const expanded = navBar.classList.contains('open');
        hamburger.setAttribute('aria-expanded', String(expanded));
      });
    }
  }

  // Delegated handlers: ensures contact fragment controls always work
  function initDelegation() {
    // handle Back to Templates and Cancel buttons from contact fragment
    document.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('#back-to-grid, #contact-cancel, #custom-back');
      if (!btn) return;
      e.preventDefault();
      // navigate to templates
      if (location.hash !== '#template') {
        location.hash = '#template';
      } else {
        // already on hash — reload the fragment to rebuild UI
        loadRoute('#template');
      }
    });

    // delegated submit handling for contact form (prevent page navigation on dynamic injection)
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (!form || form.id !== 'contact-form') return;
      e.preventDefault();

      // simple validation
      const name = (form.querySelector('#contact-name') || {}).value || '';
      const email = (form.querySelector('#contact-email') || {}).value || '';
      if (!name.trim() || !email.trim()) {
        alert('Please provide your name and email.');
        return;
      }

      // placeholder action: replace with real fetch() POST to your API when ready
      alert(`Thanks, ${name}! Your message has been noted. We will reply within one business day.`);
      form.reset();
      // return user to templates
      location.hash = '#template';
    });
  }

  // router events
  window.addEventListener('hashchange', () => loadRoute(location.hash));
  window.addEventListener('DOMContentLoaded', () => {
    initNav();
    initDelegation();
    loadRoute(location.hash);
  });
})();
