// ============================================================
// ValyryeFans — App Entry Point
// ============================================================

import './theme.js';
import { registerRoute, initRouter, navigate } from './router.js';
import { getState, initStore } from './store.js';
import { renderNavbar, afterNavRender, renderMobileNav } from './components/navbar.js';
import { renderHome } from './views/home.js';
import { renderGallery } from './views/gallery.js';
import { renderContentDetail } from './views/content-detail.js';
import { renderMessages } from './views/messages.js';
import { renderSubscribe } from './views/subscribe.js';
import { renderProfile } from './views/profile.js';
import { renderCheckout } from './views/checkout.js';
import { renderWelcomeGold } from './views/welcome-gold.js';
import { renderBookmarks } from './views/bookmarks.js';
import { renderNotifications } from './views/notifications.js';
import { renderSettings } from './views/settings.js';
import { renderTerms, renderPrivacy, renderHelpCenter, renderSupport, renderLeaderboard, renderReferrals, renderBecomeCreator } from './views/static-pages.js';
import { renderAdmin } from './views/admin.js';
import { renderAdminLogin } from './views/admin-login.js';
import { renderPurchases } from './views/purchases.js';

// ---- Global Auth State Tracking ----
let initialized = false;
let currentUserId = null;

// ---- Initialize App ----
async function initApp() {
  await initStore(); // Fetch live data from Supabase

  const state = getState();
  currentUserId = state.isAuthenticated ? state.user.id : null;

  // Render navbar
  const navbarEl = document.getElementById('navbar');
  if (navbarEl) {
    navbarEl.innerHTML = renderNavbar();
    initNavbarEvents();
    afterNavRender();
  }

  // Render mobile bottom nav
  let mobileNav = document.getElementById('mobile-bottom-nav');
  if (!mobileNav) {
    mobileNav = document.createElement('div');
    mobileNav.id = 'mobile-nav-container';
    document.getElementById('app').appendChild(mobileNav);
  }
  mobileNav.innerHTML = renderMobileNav();

  // Update mobile nav on route changes
  window.addEventListener('hashchange', () => {
    const mc = document.getElementById('mobile-nav-container');
    if (mc) mc.innerHTML = renderMobileNav();
  });

  // Register routes
  registerRoute('/', renderHome);
  registerRoute('/gallery', renderGallery);
  registerRoute('/content/:id', renderContentDetail);
  registerRoute('/messages', renderMessages);
  registerRoute('/subscribe', renderSubscribe);
  registerRoute('/profile', renderProfile);
  registerRoute('/checkout', renderCheckout);
  registerRoute('/welcome-gold', renderWelcomeGold);
  registerRoute('/bookmarks', renderBookmarks);
  registerRoute('/notifications', renderNotifications);
  registerRoute('/settings', renderSettings);
  registerRoute('/purchases', renderPurchases);
  registerRoute('/terms', renderTerms);
  registerRoute('/privacy', renderPrivacy);
  registerRoute('/help', renderHelpCenter);
  registerRoute('/support', renderSupport);
  registerRoute('/leaderboard', renderLeaderboard);
  registerRoute('/referrals', renderReferrals);
  registerRoute('/become-creator', renderBecomeCreator);
  registerRoute('/admin', renderAdmin);
  registerRoute('/admin-login', renderAdminLogin);

  // Start router
  initRouter();

  // Navbar scroll effect
  initScrollEffect();

  // Global anti-download protection
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO' || e.target.closest('.protect-media')) {
      e.preventDefault();
    }
  });

  // Subscribe to auth state changes for auto-refresh
  const { supabase } = await import('./supabase.js');
  supabase.auth.onAuthStateChange((event, session) => {
    const newUserId = session?.user?.id || null;
    if (initialized && newUserId !== currentUserId) {
      currentUserId = newUserId;
      localStorage.removeItem('vf-state');
      window.location.reload();
    }
  });

  // Subscribe to store notifications & messages for dynamic navbar/mobile badge updates
  import('./store.js').then(({ subscribe }) => {
    subscribe(['notifications', 'messages'], () => {
      const navbarEl = document.getElementById('navbar');
      if (navbarEl) {
        navbarEl.innerHTML = renderNavbar();
        initNavbarEvents();
        afterNavRender();
      }
      const mobileNav = document.getElementById('mobile-nav-container');
      if (mobileNav) {
        mobileNav.innerHTML = renderMobileNav();
      }
    });
  });

  // Set up periodic store polling every 10 seconds
  setInterval(async () => {
    try {
      await initStore();
    } catch (e) {
      console.error('Periodic store sync failed:', e);
    }
  }, 10000);

  initialized = true;
}

// ---- Navbar Events ----
function initNavbarEvents() {
  // Mobile menu toggle
  const menuToggle = document.getElementById('nav-menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      const isOpen = navLinks.classList.contains('mobile-open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when nav link clicked
    navLinks.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav-link')) {
        navLinks.classList.remove('mobile-open');
      }
    });
  }

  // Auth button
  const authBtn = document.getElementById('nav-auth-btn');
  if (authBtn) {
    authBtn.addEventListener('click', () => {
      openAuthModal();
    });
  }

  // Logo click
  const logo = document.querySelector('.nav-logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      navigate('/');
    });
    logo.style.cursor = 'pointer';
  }
}

// ---- Auth Modal ----
export function openAuthModal(mode = 'login') {
  const s = getState();
  s.ui.authMode = mode;
  s.ui.authModalOpen = true;

  const overlay = document.getElementById('auth-modal');
  if (!overlay) return;

  overlay.classList.add('active');
  overlay.innerHTML = `
    <div class="modal">
      <button class="modal__close" id="auth-close" aria-label="Close">✕</button>
      <div class="modal__title font-display">${mode === 'login' ? 'Welcome Back' : 'Join ValyryeFans'}</div>
      <p class="modal__subtitle">${mode === 'login' ? 'Sign in to access your subscription' : 'Create an account to subscribe and unlock exclusive content'}</p>

      <form id="auth-form">
        ${mode === 'signup' ? `
          <div class="form-group">
            <label class="form-label" for="auth-name">Display Name</label>
            <input class="form-input" type="text" id="auth-name" placeholder="Your name" required>
          </div>
        ` : ''}

        <div class="form-group">
          <label class="form-label" for="auth-email">Email</label>
          <input class="form-input" type="email" id="auth-email" placeholder="you@example.com" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="auth-password">Password</label>
          <input class="form-input" type="password" id="auth-password" placeholder="••••••••" required minlength="6">
        </div>

        <button type="submit" class="btn btn-primary btn-lg w-full mt-4">
          ${mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div class="form-divider">or</div>

      <button class="btn btn-secondary w-full" id="auth-google-btn" style="gap: var(--space-3);">
        <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
        Continue with Google
      </button>

      <p class="text-center mt-4" style="font-size: var(--text-sm); color: var(--text-muted);">
        ${mode === 'login'
          ? `Don't have an account? <a href="#" id="auth-switch" style="color: var(--accent-light);">Sign up</a>`
          : `Already have an account? <a href="#" id="auth-switch" style="color: var(--accent-light);">Sign in</a>`
        }
      </p>
    </div>
  `;

  // Close button
  document.getElementById('auth-close').addEventListener('click', closeAuthModal);

  // Overlay click to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAuthModal();
  });

  // Switch auth mode
  const switchLink = document.getElementById('auth-switch');
  if (switchLink) {
    switchLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeAuthModal();
      openAuthModal(mode === 'login' ? 'signup' : 'login');
    });
  }

  // Form submit (demo mode — just simulates login)
  const form = document.getElementById('auth-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleRealAuth(mode);
  });
}


async function handleRealAuth(mode) {
  const email = document.getElementById('auth-email')?.value;
  const password = document.getElementById('auth-password')?.value;
  const name = document.getElementById('auth-name')?.value || email?.split('@')[0];

  const btn = document.querySelector('#auth-form button');
  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Please wait...';
  }

  try {
    const { supabase } = await import('./supabase.js');
    const { initStore, showToast } = await import('./store.js');

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      if (error) throw error;
      
      if (data.session === null) {
        showToast('Registration successful! Please check your email to confirm.', 'success');
        closeAuthModal();
        return;
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
    }

    // Refresh global state from DB
    await initStore();
    showToast('Successfully logged in!', 'success');
    closeAuthModal();

    // Re-render navbar
    const navbarEl = document.getElementById('navbar');
    if (navbarEl) {
      navbarEl.innerHTML = renderNavbar();
      initNavbarEvents();
      afterNavRender();
    }
  } catch (err) {
    import('./store.js').then(({ showToast }) => showToast(err.message, 'error'));
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = mode === 'login' ? 'Sign In' : 'Create Account';
    }
  }
}

function closeAuthModal() {
  const overlay = document.getElementById('auth-modal');
  if (overlay) {
    overlay.classList.remove('active');
    getState().ui.authModalOpen = false;
  }
}

// ---- Navbar Scroll Effect ----
function initScrollEffect() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ---- Lightbox ----
export function openLightbox(content) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  lightbox.classList.add('active');
  lightbox.innerHTML = `
    <button class="lightbox__close" id="lightbox-close">✕</button>
    <div class="lightbox__content">
      ${content.type === 'video'
        ? `<video src="${content.src}" controls autoplay></video>`
        : `<img src="${content.src}" alt="${content.title || ''}">`
      }
    </div>
    ${content.title ? `
      <div class="lightbox__info">
        <div class="lightbox__title">${content.title}</div>
        ${content.date ? `<div class="lightbox__date">${content.date}</div>` : ''}
      </div>
    ` : ''}
  `;

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // ESC to close
  const escHandler = (e) => {
    if (e.key === 'Escape') { closeLightbox(); document.removeEventListener('keydown', escHandler); }
  };
  document.addEventListener('keydown', escHandler);
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) lightbox.classList.remove('active');
}

// ---- Boot ----
document.addEventListener('DOMContentLoaded', initApp);
