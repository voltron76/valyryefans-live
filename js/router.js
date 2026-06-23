// ============================================================
// ValyryesFans — HTML5 History API Clean URL Router
// ============================================================

const routes = {};
let currentCleanup = null;

import { renderFooter } from './components/footer.js';

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path) {
  window.history.pushState(null, '', path);
  handleRouteChange();
}

export function getCurrentRoute() {
  let path = window.location.pathname;
  // Normalize index.html or empty path to /
  if (path === '/index.html' || !path) {
    path = '/';
  }
  return path + window.location.search;
}

function matchRoute(pathWithQuery) {
  const [path, queryString] = pathWithQuery.split('?');
  const queryParams = {};
  if (queryString) {
    const urlParams = new URLSearchParams(queryString);
    for (const [key, value] of urlParams) {
      queryParams[key] = value;
    }
  }

  // Exact match first
  if (routes[path]) return { handler: routes[path], params: queryParams };

  // Parameterized routes (e.g., /content/:id)
  for (const [pattern, handler] of Object.entries(routes)) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) continue;

    const params = { ...queryParams };
    let match = true;

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }

    if (match) return { handler, params };
  }

  return null;
}

async function handleRouteChange() {
  const currentPath = getCurrentRoute();
  const mainContent = document.getElementById('main-content');

  if (!mainContent) return;

  // Run cleanup for previous route
  if (currentCleanup && typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  const matched = matchRoute(currentPath);

  if (matched) {
    // Page transition
    mainContent.classList.add('page-transition-enter');
    mainContent.classList.remove('page-transition-active');

    const result = await matched.handler(matched.params);

    if (typeof result === 'string') {
      mainContent.innerHTML = result + renderFooter();
      // Update with default SEO
      import('./seo.js').then(({ updateSEO }) => updateSEO());
    } else if (result && typeof result === 'object') {
      if (result.html) mainContent.innerHTML = result.html + renderFooter();
      if (result.cleanup) currentCleanup = result.cleanup;
      if (result.afterRender) {
        requestAnimationFrame(() => result.afterRender());
      }
      
      // Update SEO if the view returned custom metadata
      if (result.seo) {
        import('./seo.js').then(({ updateSEO }) => updateSEO(result.seo));
      } else {
        // Fallback to defaults
        import('./seo.js').then(({ updateSEO }) => updateSEO());
      }
    }

    // Track page view in web analytics
    import('./store.js').then(({ trackEvent }) => {
      if (typeof trackEvent === 'function') {
        trackEvent('page_view');
      }
    });

    // Trigger transition
    requestAnimationFrame(() => {
      mainContent.classList.remove('page-transition-enter');
      mainContent.classList.add('page-transition-active');
    });

    // Update active nav link
    updateActiveNav(currentPath);

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
        <a href="/" class="btn btn-secondary mt-8">Go Home</a>
      </div>
    `;
    import('./seo.js').then(({ updateSEO }) => updateSEO({
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist on ValyryesFans.'
    }));
  }

  // Dispatch custom routechange event for other components (e.g. mobile bottom nav updates)
  window.dispatchEvent(new CustomEvent('routechange', { detail: { path: currentPath } }));
}

function updateActiveNav(currentPathWithQuery) {
  const [currentPath] = currentPathWithQuery.split('?');
  document.querySelectorAll('.nav-link').forEach(link => {
    let href = link.getAttribute('href');
    if (href) {
      // Normalize: strip leading '#' if present
      if (href.startsWith('#/')) href = href.slice(1);
      const isActive = currentPath === href ||
                      (href !== '/' && currentPath.startsWith(href));
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
  window.addEventListener('popstate', handleRouteChange);

  // Intercept all link clicks for internal paths
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    
    const href = anchor.getAttribute('href');
    if (!href) return;
    
    // Ignore external links, mailto, tel, same-page hashes, or custom targets
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (anchor.target && anchor.target !== '_self') return;
    
    // Safety Net: If it's a hash-based link like "#/gallery", redirect to clean path "/gallery"
    if (href.startsWith('#/')) {
      e.preventDefault();
      const cleanPath = href.slice(1);
      navigate(cleanPath);
      return;
    }
    
    if (href.startsWith('#')) return; // Same-page anchor

    // Intercept internal paths
    e.preventDefault();
    navigate(href);
  });

  // Automatically migrate legacy hash-based URLs (e.g. #/gallery) to clean path-based URLs
  if (window.location.hash && window.location.hash.startsWith('#/')) {
    const cleanPath = window.location.hash.slice(1);
    window.history.replaceState(null, '', cleanPath);
  }

  // Handle initial load routing
  handleRouteChange();
}
