// ============================================================
// ValyryesFans — Hash-Based SPA Router
// ============================================================

const routes = {};
let currentCleanup = null;

import { renderFooter } from './components/footer.js';

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path) {
  window.location.hash = '#' + path;
}

export function getCurrentRoute() {
  const hash = window.location.hash.slice(1) || '/';
  return hash;
}

function matchRoute(hashWithQuery) {
  const [hash, queryString] = hashWithQuery.split('?');
  const queryParams = {};
  if (queryString) {
    const urlParams = new URLSearchParams(queryString);
    for (const [key, value] of urlParams) {
      queryParams[key] = value;
    }
  }

  // Exact match first
  if (routes[hash]) return { handler: routes[hash], params: queryParams };

  // Parameterized routes (e.g., /content/:id)
  for (const [pattern, handler] of Object.entries(routes)) {
    const patternParts = pattern.split('/');
    const hashParts = hash.split('/');

    if (patternParts.length !== hashParts.length) continue;

    const params = { ...queryParams };
    let match = true;

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = hashParts[i];
      } else if (patternParts[i] !== hashParts[i]) {
        match = false;
        break;
      }
    }

    if (match) return { handler, params };
  }

  return null;
}

async function handleRouteChange() {
  const hash = getCurrentRoute();
  const mainContent = document.getElementById('main-content');

  if (!mainContent) return;

  // Run cleanup for previous route
  if (currentCleanup && typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  const matched = matchRoute(hash);

  if (matched) {
    // Page transition
    mainContent.classList.add('page-transition-enter');
    mainContent.classList.remove('page-transition-active');

    const result = await matched.handler(matched.params);

    if (typeof result === 'string') {
      mainContent.innerHTML = result + renderFooter();
    } else if (result && typeof result === 'object') {
      if (result.html) mainContent.innerHTML = result.html + renderFooter();
      if (result.cleanup) currentCleanup = result.cleanup;
      if (result.afterRender) {
        requestAnimationFrame(() => result.afterRender());
      }
    }

    // Trigger transition
    requestAnimationFrame(() => {
      mainContent.classList.remove('page-transition-enter');
      mainContent.classList.add('page-transition-active');
    });

    // Update active nav link
    updateActiveNav(hash);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Trigger scroll reveal animations
    initScrollReveal();
  } else {
    // 404 fallback
    mainContent.innerHTML = `
      <div class="empty-state" style="min-height: calc(100vh - var(--nav-height))">
        <div class="empty-state__icon">🔍</div>
        <h2 class="empty-state__title">Page not found</h2>
        <p class="empty-state__text">The page you're looking for doesn't exist.</p>
        <a href="#/" class="btn btn-secondary mt-8">Go Home</a>
      </div>
    `;
  }
}

function updateActiveNav(currentHashWithQuery) {
  const [currentHash] = currentHashWithQuery.split('?');
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      const linkPath = href.replace('#', '');
      const isActive = currentHash === linkPath ||
                      (linkPath !== '/' && currentHash.startsWith(linkPath));
      link.classList.toggle('active', isActive);
    }
  });
}

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    observer.observe(el);
  });
}

export function initRouter() {
  window.addEventListener('hashchange', handleRouteChange);

  // Handle initial load
  if (!window.location.hash) {
    window.location.hash = '#/';
  } else {
    handleRouteChange();
  }
}
