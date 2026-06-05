// ============================================================
// ValyryeFans — Navbar Component (with Profile Dropdown)
// ============================================================

import { getState } from '../store.js';
import { toggleTheme, getTheme } from '../theme.js';

const SUN_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
const MOON_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

// Sidebar menu icons (18x18)
const menuIcons = {
  profile: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  subscriptions: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
  media: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  bookmarks: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  messages: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  notifications: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  payments: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  creator: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  support: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  help: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  leaderboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 6 9 6 9zm12 0h1.5a2.5 2.5 0 0 0 0-5C17 4 18 9 18 9zm-9 11l1.5-9h3L15 20"/><path d="M12 4a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>`,
  referrals: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  terms: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  privacy: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  language: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  darkMode: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  logout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
};

function renderDropdownMenu() {
  const isDark = getTheme() === 'dark';
  return `
    <div class="nav-dropdown-overlay" id="nav-dropdown-overlay"></div>
    <div class="nav-dropdown" id="nav-dropdown">
      <div class="nav-dropdown__section">
        <a href="#/profile" class="nav-dropdown__item" data-close-dropdown>${menuIcons.profile}<span>Profile</span></a>
        <a href="#/subscribe" class="nav-dropdown__item" data-close-dropdown>${menuIcons.subscriptions}<span>Subscriptions</span></a>
        <a href="#/purchases" class="nav-dropdown__item" data-close-dropdown>${menuIcons.media}<span>Media Collection</span></a>
        <a href="#/bookmarks" class="nav-dropdown__item" data-close-dropdown>${menuIcons.bookmarks}<span>Bookmarks</span></a>
        <a href="#/messages" class="nav-dropdown__item" data-close-dropdown>${menuIcons.messages}<span>Messages</span></a>
        <a href="#/notifications" class="nav-dropdown__item" data-close-dropdown>${menuIcons.notifications}<span>Notifications</span></a>
        <a href="#/settings?tab=billing" class="nav-dropdown__item" data-close-dropdown>${menuIcons.payments}<span>Payments</span></a>
      </div>
      <div class="nav-dropdown__divider"></div>
      <div class="nav-dropdown__section">
        <a href="#/become-creator" class="nav-dropdown__item" data-close-dropdown>${menuIcons.creator}<span>Become A Creator</span></a>
        <a href="#/support" class="nav-dropdown__item" data-close-dropdown>${menuIcons.support}<span>Contact Support</span></a>
        <a href="#/help" class="nav-dropdown__item" data-close-dropdown>${menuIcons.help}<span>Help Center</span></a>
        <a href="#/leaderboard" class="nav-dropdown__item" data-close-dropdown>${menuIcons.leaderboard}<span>Leaderboard</span></a>
        <a href="#/referrals" class="nav-dropdown__item" data-close-dropdown>${menuIcons.referrals}<span>Referrals</span></a>
      </div>
      <div class="nav-dropdown__divider"></div>
      <div class="nav-dropdown__section">
        <a href="#/terms" class="nav-dropdown__item" data-close-dropdown>${menuIcons.terms}<span>Terms of Service</span></a>
        <a href="#/privacy" class="nav-dropdown__item" data-close-dropdown>${menuIcons.privacy}<span>Privacy Policy</span></a>
      </div>
      <div class="nav-dropdown__divider"></div>
      <div class="nav-dropdown__section">
        <a href="#/settings" class="nav-dropdown__item" data-close-dropdown>${menuIcons.settings}<span>Settings</span></a>
        <div class="nav-dropdown__item" id="dropdown-language" data-close-dropdown>${menuIcons.language}<span>Language</span></div>
        <div class="nav-dropdown__item" id="dropdown-theme-toggle">
          ${menuIcons.darkMode}
          <span>Dark Mode</span>
          <label class="toggle-switch" style="margin-left:auto;">
            <input type="checkbox" id="dropdown-theme-check" ${isDark ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
      <div class="nav-dropdown__divider"></div>
      <div class="nav-dropdown__section">
        <div class="nav-dropdown__item nav-dropdown__item--danger" id="dropdown-logout">
          ${menuIcons.logout}<span>Log Out</span>
        </div>
      </div>
    </div>
  `;
}

export function renderNavbar() {
  const s = getState();
  const isAuth = s.isAuthenticated;
  const user = s.user;

  return `
    <a class="nav-logo" href="#/">
      <span class="logo-icon">V</span>
      <span>Valyrye<span style="color: var(--accent)">Fans</span></span>
    </a>

    <div class="nav-links" id="nav-links">
      <a href="#/" class="nav-link active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Home
      </a>
      <a href="#/gallery" class="nav-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        Gallery
      </a>
      <a href="#/messages" class="nav-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
        Messages
      </a>
      <a href="#/subscribe" class="nav-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 16h14v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z"/></svg>
        Subscribe
      </a>
    </div>

    <div class="nav-actions">
      <button class="theme-toggle" id="theme-toggle-btn" aria-label="Toggle theme" title="Toggle theme">
        ${getTheme() === 'dark' ? SUN_ICON : MOON_ICON}
      </button>
      ${isAuth ? `
        <div style="position:relative;">
          <button class="nav-avatar" id="nav-avatar-btn" title="${user?.name || 'Profile'}" aria-label="Open profile menu">
            <div style="width:100%;height:100%;background:var(--gradient-accent);display:flex;align-items:center;justify-content:center;color:var(--btn-primary-text);font-weight:700;font-size:14px;">
              ${(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          </button>
          ${renderDropdownMenu()}
        </div>
      ` : `
        <button class="btn btn-secondary btn-sm" id="nav-auth-btn">Sign In</button>
      `}
    </div>

    <button class="nav-menu-toggle" id="nav-menu-toggle" aria-label="Toggle menu" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>
  `;
}

export function afterNavRender() {
  // Theme toggle in navbar
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const newTheme = toggleTheme();
      btn.innerHTML = newTheme === 'dark' ? SUN_ICON : MOON_ICON;
      // Sync dropdown theme checkbox if open
      const check = document.getElementById('dropdown-theme-check');
      if (check) check.checked = newTheme === 'dark';
    });
  }

  // Avatar dropdown toggle
  const avatarBtn = document.getElementById('nav-avatar-btn');
  const dropdown = document.getElementById('nav-dropdown');
  const overlay = document.getElementById('nav-dropdown-overlay');

  if (avatarBtn && dropdown) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      if (isOpen) {
        closeDropdown();
      } else {
        dropdown.classList.add('open');
        overlay?.classList.add('open');
      }
    });

    // Close on overlay click
    overlay?.addEventListener('click', closeDropdown);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown.classList.contains('open')) {
        closeDropdown();
      }
    });

    // Close on menu item click
    dropdown.querySelectorAll('[data-close-dropdown]').forEach(item => {
      item.addEventListener('click', closeDropdown);
    });

    // Theme toggle in dropdown
    const themeCheck = document.getElementById('dropdown-theme-check');
    const themeRow = document.getElementById('dropdown-theme-toggle');
    if (themeCheck) {
      themeRow?.addEventListener('click', (e) => {
        if (e.target === themeCheck) return;
        themeCheck.checked = !themeCheck.checked;
        const newTheme = toggleTheme();
        if (btn) btn.innerHTML = newTheme === 'dark' ? SUN_ICON : MOON_ICON;
      });
      themeCheck.addEventListener('change', () => {
        const newTheme = toggleTheme();
        if (btn) btn.innerHTML = newTheme === 'dark' ? SUN_ICON : MOON_ICON;
      });
    }

    // Language Selection Modal
    const langBtn = document.getElementById('dropdown-language');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        closeDropdown();
        // Create simple modal overlay
        const modalHtml = `
          <div class="paywall-overlay active" id="lang-modal" style="position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.85); height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
            <div class="card-glass" style="max-width: 400px; width: 90%; text-align: center; position: relative;">
              <button class="paywall-overlay__close" id="close-lang-modal" style="position:absolute; top:var(--space-4); right:var(--space-4); background:none; border:none; color:var(--text-muted); cursor:pointer;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div style="font-size: 32px; margin-bottom: var(--space-4);">🌐</div>
              <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-2);">Select Language</h2>
              <p style="color: var(--text-secondary); margin-bottom: var(--space-6);">Choose your preferred language for ValyryeFans.</p>
              
              <div style="display:flex; flex-direction:column; gap:var(--space-2);">
                <button class="btn btn-secondary w-full" style="justify-content:center; border: 1px solid var(--accent);">English (US)</button>
                <button class="btn btn-ghost w-full" style="justify-content:center; color: var(--text-muted);" onclick="this.innerText='Coming soon...'">Español</button>
                <button class="btn btn-ghost w-full" style="justify-content:center; color: var(--text-muted);" onclick="this.innerText='Coming soon...'">Français</button>
                <button class="btn btn-ghost w-full" style="justify-content:center; color: var(--text-muted);" onclick="this.innerText='Coming soon...'">日本語</button>
              </div>
            </div>
          </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById('lang-modal');
        const closeBtn = document.getElementById('close-lang-modal');
        
        const removeModal = () => {
          modal.style.opacity = '0';
          setTimeout(() => modal.remove(), 300);
        };
        
        closeBtn.addEventListener('click', removeModal);
        modal.addEventListener('click', (e) => {
          if (e.target === modal) removeModal();
        });
      });
    }

    // Logout
    const logoutBtn = document.getElementById('dropdown-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        closeDropdown();
        
        try {
          const { supabase } = await import('../supabase.js');
          await supabase.auth.signOut();
        } catch(e) {}

        const s = getState();
        s.isAuthenticated = false;
        s.user = null;
        s.profile = null;
        s.currentTier = 'free';
        // Re-render navbar
        const navbarEl = document.getElementById('navbar');
        if (navbarEl) {
          navbarEl.innerHTML = renderNavbar();
          afterNavRender();
        }
        import('../store.js').then(({ showToast }) => {
          showToast('Signed out successfully', 'success');
        });
        import('../router.js').then(({ navigate }) => navigate('/'));
      });
    }
  }

  function closeDropdown() {
    dropdown?.classList.remove('open');
    overlay?.classList.remove('open');
  }
}
