// ============================================================
// ValyryeFans — Settings View
// Full settings page: Account, Appearance, Notifications, Privacy, Danger Zone
// ============================================================

import { getState, showToast } from '../store.js';
import { navigate } from '../router.js';
import { toggleTheme, getTheme } from '../theme.js';

const icons = {
  user: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  mail: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  lock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  palette: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="12" r="1.5" fill="currentColor"/><circle cx="16" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>`,
  bell: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  shield: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  alertTriangle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  sun: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  edit: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.3a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-1.4 0l-3-3a1 1 0 1 1 1.4-1.4L6.6 9.6l5.3-5.3a1 1 0 0 1 1.4 0z" fill="currentColor"/></svg>`,
  trash: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  pause: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
  eye: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  arrowLeft: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
};

// Ensure settings object exists on state
function ensureSettings() {
  const s = getState();
  if (!s.settings) {
    s.settings = {
      emailNotifications: true,
      pushNotifications: false,
      newContentAlerts: true,
      messageNotifications: true,
      showOnlineStatus: true,
      allowDirectMessages: true,
      profileVisibility: true,
    };
  }
  return s.settings;
}

function renderToggle(id, label, checked, description = '') {
  return `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4) 0; border-bottom: 1px solid var(--border);">
      <div style="flex: 1;">
        <div style="font-size: var(--text-sm); font-weight: 500; color: var(--text-primary);">${label}</div>
        ${description ? `<div style="font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-1);">${description}</div>` : ''}
      </div>
      <label style="position: relative; display: inline-block; width: 48px; height: 26px; flex-shrink: 0; margin-left: var(--space-4);">
        <input type="checkbox" id="${id}" ${checked ? 'checked' : ''} style="opacity: 0; width: 0; height: 0; position: absolute;">
        <span class="settings-toggle-slider" style="
          position: absolute; cursor: pointer; inset: 0;
          background: ${checked ? 'var(--accent)' : 'var(--bg-hover)'};
          border: 1px solid ${checked ? 'var(--accent)' : 'var(--border-light)'};
          border-radius: var(--radius-full);
          transition: all var(--transition-base);
        ">
          <span style="
            position: absolute; content: ''; height: 20px; width: 20px;
            left: ${checked ? '24px' : '2px'}; bottom: 2px;
            background: var(--text-primary);
            border-radius: var(--radius-full);
            transition: all var(--transition-base);
          "></span>
        </span>
      </label>
    </div>
  `;
}

export function renderSettings() {
  const state = getState();
  const { isAuthenticated, user } = state;

  if (!isAuthenticated || !user) {
    return {
      html: `
        <div style="min-height: calc(100vh - var(--nav-height)); display: flex; align-items: center; justify-content: center;">
          <div class="paywall-overlay animate-fade-in-up" style="max-width: 440px;">
            <div class="paywall-overlay__icon animate-pulse-glow">${icons.lock}</div>
            <h2 class="paywall-overlay__title font-display">Settings</h2>
            <p class="paywall-overlay__text">Sign in to access your account settings.</p>
            <div style="display: flex; gap: var(--space-3); flex-wrap: wrap; justify-content: center;">
              <button class="btn btn-primary btn-lg" id="settings-login-btn">Sign In</button>
              <button class="btn btn-secondary btn-lg" id="settings-signup-btn">Create Account</button>
            </div>
          </div>
        </div>`,
      afterRender() {
        document.getElementById('settings-login-btn')?.addEventListener('click', () => {
          import('../main.js').then(({ openAuthModal }) => openAuthModal('login'));
        });
        document.getElementById('settings-signup-btn')?.addEventListener('click', () => {
          import('../main.js').then(({ openAuthModal }) => openAuthModal('signup'));
        });
      }
    };
  }

  const settings = ensureSettings();
  const currentTheme = getTheme();

  const html = `
    <div style="min-height: calc(100vh - var(--nav-height)); padding-bottom: var(--space-16);">
      <!-- Header -->
      <div style="max-width: 720px; margin: 0 auto; padding: var(--space-8) var(--space-6);">
        <div style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-8);">
          <a href="#/profile" class="btn btn-ghost btn-icon" style="width: 40px; height: 40px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">
            ${icons.arrowLeft}
          </a>
          <div>
            <h1 class="font-display" style="font-size: var(--text-3xl); font-weight: 600;">Settings</h1>
            <p style="color: var(--text-muted); font-size: var(--text-sm); margin-top: var(--space-1);">Manage your account preferences</p>
          </div>
        </div>

        <!-- ===================== ACCOUNT SECTION ===================== -->
        <div class="card animate-fade-in-up stagger-1" style="border-radius: var(--radius-xl); padding: var(--space-8); margin-bottom: var(--space-6);">
          <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6);">
            <div style="width: 36px; height: 36px; border-radius: var(--radius-md); background: var(--accent-subtle); border: 1px solid var(--border-accent); display: flex; align-items: center; justify-content: center; color: var(--accent-light);">
              ${icons.user}
            </div>
            <h2 class="font-display" style="font-size: var(--text-xl);">Account</h2>
          </div>

          <!-- Display Name -->
          <form id="settings-name-form">
            <div class="form-group">
              <label class="form-label" for="settings-name">Display Name</label>
              <input class="form-input" type="text" id="settings-name" value="${user.name || ''}" placeholder="Your display name">
            </div>
            <button type="submit" class="btn btn-primary btn-sm" style="gap: var(--space-2);">
              ${icons.check} Save Name
            </button>
          </form>

          <div style="border-top: 1px solid var(--border); margin: var(--space-6) 0;"></div>

          <!-- Email (readonly) -->
          <form id="settings-email-form">
            <div class="form-group">
              <label class="form-label" for="settings-email">Email Address</label>
              <div style="position: relative;">
                <input class="form-input" type="email" id="settings-email" value="${user.email || ''}" readonly style="padding-right: var(--space-10); opacity: 0.7;">
                <span id="settings-edit-email-icon" style="position: absolute; right: var(--space-3); top: 50%; transform: translateY(-50%); color: var(--text-muted); cursor: pointer;">
                  ${icons.edit}
                </span>
              </div>
            </div>
          </form>

          <div style="border-top: 1px solid var(--border); margin: var(--space-6) 0;"></div>

          <!-- Change Password -->
          <form id="settings-password-form">
            <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
              ${icons.lock}
              <span style="font-size: var(--text-sm); font-weight: 500; color: var(--text-secondary);">Change Password</span>
            </div>
            <div class="form-group">
              <label class="form-label" for="settings-current-password">Current Password</label>
              <input class="form-input" type="password" id="settings-current-password" placeholder="••••••••">
            </div>
            <div class="form-group">
              <label class="form-label" for="settings-new-password">New Password</label>
              <input class="form-input" type="password" id="settings-new-password" placeholder="••••••••" minlength="6">
            </div>
            <div class="form-group">
              <label class="form-label" for="settings-confirm-password">Confirm New Password</label>
              <input class="form-input" type="password" id="settings-confirm-password" placeholder="••••••••" minlength="6">
            </div>
            <button type="submit" class="btn btn-primary btn-sm" style="gap: var(--space-2);">
              ${icons.lock} Update Password
            </button>
          </form>
        </div>

        <!-- ===================== APPEARANCE SECTION ===================== -->
        <div class="card animate-fade-in-up stagger-2" style="border-radius: var(--radius-xl); padding: var(--space-8); margin-bottom: var(--space-6);">
          <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6);">
            <div style="width: 36px; height: 36px; border-radius: var(--radius-md); background: var(--accent-subtle); border: 1px solid var(--border-accent); display: flex; align-items: center; justify-content: center; color: var(--accent-light);">
              ${icons.palette}
            </div>
            <h2 class="font-display" style="font-size: var(--text-xl);">Appearance</h2>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4) 0;">
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              <span style="color: var(--text-secondary);">${currentTheme === 'dark' ? icons.moon : icons.sun}</span>
              <div>
                <div style="font-size: var(--text-sm); font-weight: 500; color: var(--text-primary);">Theme</div>
                <div style="font-size: var(--text-xs); color: var(--text-muted);" id="settings-theme-label">Currently: ${currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" id="settings-theme-toggle" style="gap: var(--space-2);">
              ${currentTheme === 'dark' ? icons.sun : icons.moon}
              Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        <!-- ===================== NOTIFICATIONS SECTION ===================== -->
        <div class="card animate-fade-in-up stagger-3" style="border-radius: var(--radius-xl); padding: var(--space-8); margin-bottom: var(--space-6);">
          <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
            <div style="width: 36px; height: 36px; border-radius: var(--radius-md); background: var(--accent-subtle); border: 1px solid var(--border-accent); display: flex; align-items: center; justify-content: center; color: var(--accent-light);">
              ${icons.bell}
            </div>
            <h2 class="font-display" style="font-size: var(--text-xl);">Notifications</h2>
          </div>

          ${renderToggle('toggle-email-notifs', 'Email Notifications', settings.emailNotifications, 'Receive updates and announcements via email')}
          ${renderToggle('toggle-push-notifs', 'Push Notifications', settings.pushNotifications, 'Receive push notifications in your browser')}
          ${renderToggle('toggle-content-alerts', 'New Content Alerts', settings.newContentAlerts, 'Get notified when new content is posted')}
          ${renderToggle('toggle-message-notifs', 'Message Notifications', settings.messageNotifications, 'Get notified about new messages')}
        </div>

        <!-- ===================== PRIVACY SECTION ===================== -->
        <div class="card animate-fade-in-up stagger-4" style="border-radius: var(--radius-xl); padding: var(--space-8); margin-bottom: var(--space-6);">
          <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
            <div style="width: 36px; height: 36px; border-radius: var(--radius-md); background: var(--accent-subtle); border: 1px solid var(--border-accent); display: flex; align-items: center; justify-content: center; color: var(--accent-light);">
              ${icons.shield}
            </div>
            <h2 class="font-display" style="font-size: var(--text-xl);">Privacy</h2>
          </div>

          ${renderToggle('toggle-online-status', 'Show Online Status', settings.showOnlineStatus, 'Let others see when you\'re online')}
          ${renderToggle('toggle-direct-messages', 'Allow Direct Messages', settings.allowDirectMessages, 'Allow other users to send you messages')}
          ${renderToggle('toggle-profile-visibility', 'Profile Visibility', settings.profileVisibility, 'Make your profile visible to other users')}
        </div>

        <!-- ===================== DANGER ZONE ===================== -->
        <div class="card animate-fade-in-up stagger-5" style="border-radius: var(--radius-xl); padding: var(--space-8); margin-bottom: var(--space-8); border-color: var(--error); border-width: 1px;">
          <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6);">
            <div style="width: 36px; height: 36px; border-radius: var(--radius-md); background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.3); display: flex; align-items: center; justify-content: center; color: var(--error);">
              ${icons.alertTriangle}
            </div>
            <div>
              <h2 class="font-display" style="font-size: var(--text-xl); color: var(--error);">Danger Zone</h2>
              <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-1);">Irreversible actions — proceed with caution</p>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); border: 1px solid var(--border); border-radius: var(--radius-md); margin-bottom: var(--space-4);">
            <div>
              <div style="font-size: var(--text-sm); font-weight: 500;">Deactivate Account</div>
              <div style="font-size: var(--text-xs); color: var(--text-muted);">Temporarily disable your account. You can reactivate later.</div>
            </div>
            <button class="btn btn-secondary btn-sm" id="settings-deactivate-btn" style="color: var(--warning); border-color: var(--warning); flex-shrink: 0; gap: var(--space-2);">
              ${icons.pause} Deactivate
            </button>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); border: 1px solid rgba(248, 113, 113, 0.3); border-radius: var(--radius-md); background: rgba(248, 113, 113, 0.03);">
            <div>
              <div style="font-size: var(--text-sm); font-weight: 500; color: var(--error);">Delete Account</div>
              <div style="font-size: var(--text-xs); color: var(--text-muted);">Permanently delete your account and all data. This cannot be undone.</div>
            </div>
            <button class="btn btn-sm" id="settings-delete-btn" style="background: var(--error); color: #fff; flex-shrink: 0; gap: var(--space-2);">
              ${icons.trash} Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  return {
    html,
    afterRender() {
      const settings = ensureSettings();

      // ---- Toggle switch wiring ----
      function wireToggle(id, key) {
        const el = document.getElementById(id);
        if (!el) return;
        const slider = el.nextElementSibling;
        const dot = slider?.querySelector('span');

        el.addEventListener('change', () => {
          settings[key] = el.checked;
          // Update slider visual
          if (slider) {
            slider.style.background = el.checked ? 'var(--accent)' : 'var(--bg-hover)';
            slider.style.borderColor = el.checked ? 'var(--accent)' : 'var(--border-light)';
          }
          if (dot) {
            dot.style.left = el.checked ? '24px' : '2px';
          }
          showToast(`${el.checked ? 'Enabled' : 'Disabled'} successfully`, 'success');
        });
      }

      // Notification toggles
      wireToggle('toggle-email-notifs', 'emailNotifications');
      wireToggle('toggle-push-notifs', 'pushNotifications');
      wireToggle('toggle-content-alerts', 'newContentAlerts');
      wireToggle('toggle-message-notifs', 'messageNotifications');

      // Privacy toggles
      wireToggle('toggle-online-status', 'showOnlineStatus');
      wireToggle('toggle-direct-messages', 'allowDirectMessages');
      wireToggle('toggle-profile-visibility', 'profileVisibility');

      // ---- Save display name ----
      document.getElementById('settings-name-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('settings-name');
        const newName = nameInput?.value?.trim();
        if (newName) {
          const s = getState();
          s.user = { ...s.user, name: newName };
          showToast('Display name updated! ✨', 'success');
        } else {
          showToast('Name cannot be empty', 'error');
        }
      });

      // ---- Email edit icon ----
      document.getElementById('settings-edit-email-icon')?.addEventListener('click', () => {
        showToast('Email change requires verification. Feature coming soon.', 'info');
      });

      // ---- Change password ----
      document.getElementById('settings-password-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const current = document.getElementById('settings-current-password')?.value;
        const newPw = document.getElementById('settings-new-password')?.value;
        const confirm = document.getElementById('settings-confirm-password')?.value;

        if (!current || !newPw || !confirm) {
          showToast('Please fill in all password fields', 'error');
          return;
        }
        if (newPw.length < 6) {
          showToast('New password must be at least 6 characters', 'error');
          return;
        }
        if (newPw !== confirm) {
          showToast('New passwords do not match', 'error');
          return;
        }

        // Clear fields
        document.getElementById('settings-current-password').value = '';
        document.getElementById('settings-new-password').value = '';
        document.getElementById('settings-confirm-password').value = '';
        showToast('Password updated successfully! 🔒', 'success');
      });

      // ---- Theme toggle ----
      document.getElementById('settings-theme-toggle')?.addEventListener('click', () => {
        const newTheme = toggleTheme();
        // Re-render the settings page to reflect new theme state
        navigate('/settings');
      });

      // ---- Deactivate account ----
      document.getElementById('settings-deactivate-btn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to deactivate your account? You can reactivate it by signing back in.')) {
          showToast('Account deactivated. You can reactivate anytime.', 'success');
        }
      });

      // ---- Delete account ----
      document.getElementById('settings-delete-btn')?.addEventListener('click', () => {
        const firstConfirm = confirm('⚠️ Are you sure you want to permanently delete your account?\n\nThis action CANNOT be undone. All your data will be lost.');
        if (firstConfirm) {
          const secondConfirm = confirm('This is your FINAL warning.\n\nType "DELETE" in the next prompt or click OK to confirm deletion.');
          if (secondConfirm) {
            const s = getState();
            s.isAuthenticated = false;
            s.user = null;
            s.profile = null;
            s.currentTier = 'free';
            s.activeConversation = null;

            // Re-render navbar
            import('../main.js').then(async () => {
              const navbarEl = document.getElementById('navbar');
              if (navbarEl) {
                const { renderNavbar } = await import('../components/navbar.js');
                navbarEl.innerHTML = renderNavbar();
              }
            });

            showToast('Account deleted. We\'re sorry to see you go. 😔', 'success');
            navigate('/');
          }
        }
      });
    }
  };
}
