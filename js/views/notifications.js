// ============================================================
// ValyryesFans — Notifications View
// Notification center with read/unread states
// Generated dynamically from actual content/messages
// ============================================================

import { getState, showToast, markNotificationRead } from '../store.js';
import { navigate } from '../router.js';

const typeIcons = {
  new_post: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  message: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  subscription: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  system: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
};

const typeColors = {
  new_post: 'var(--accent)',
  message: 'var(--success)',
  subscription: 'var(--warning)',
  system: 'var(--text-muted)',
};

const bellIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;

function renderNotificationCard(notif, idx) {
  const icon = typeIcons[notif.type] || typeIcons.system;
  const color = typeColors[notif.type] || typeColors.system;
  const stagger = `stagger-${Math.min(idx + 2, 12)}`;
  const unreadBorder = !notif.read ? `border-left: 3px solid var(--accent);` : `border-left: 3px solid transparent;`;
  const unreadBg = !notif.read ? `background: var(--accent-subtle);` : '';

  return `
    <div class="card animate-fade-in-up ${stagger} notification-card" data-id="${notif.id}" data-link="${notif.link || ''}" style="
      border-radius: var(--radius-md);
      padding: var(--space-5) var(--space-6);
      ${unreadBorder}
      ${unreadBg}
      cursor: pointer;
      transition: all var(--transition-fast);
    " onmouseover="this.style.borderColor='var(--border-light)';this.style.background='var(--bg-hover)'"
       onmouseout="this.style.borderColor=${!notif.read ? "'var(--accent)'" : "'transparent'"};this.style.background=${!notif.read ? "'var(--accent-subtle)'" : "'var(--bg-card)'"}">
      <div style="display: flex; gap: var(--space-4); align-items: flex-start;">
        <!-- Icon -->
        <div style="
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          flex-shrink: 0;
        ">
          ${icon}
        </div>

        <!-- Content -->
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-1);">
            <div style="font-weight: ${notif.read ? '500' : '600'}; font-size: var(--text-sm); color: var(--text-primary);">
              ${notif.title}
            </div>
            ${!notif.read ? `<div style="width: 8px; height: 8px; border-radius: var(--radius-full); background: var(--accent); flex-shrink: 0;"></div>` : ''}
          </div>
          <div style="font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.5; margin-bottom: var(--space-2);">
            ${notif.message}
          </div>
          <div style="font-size: var(--text-xs); color: var(--text-muted);">
            ${notif.time}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderNotifications() {
  const state = getState();

  // Auth check
  if (!state.isAuthenticated) {
    return {
      html: `
        <div class="empty-state" style="min-height: calc(100vh - var(--nav-height));">
          <div class="empty-state__icon">🔔</div>
          <h2 class="empty-state__title font-display">Sign in to view notifications</h2>
          <p class="empty-state__text">Create an account or sign in to receive notifications.</p>
          <button class="btn btn-primary btn-lg" id="notif-auth-btn">Sign In</button>
        </div>
      `,
      afterRender() {
        document.getElementById('notif-auth-btn')?.addEventListener('click', () => {
          import('../main.js').then(({ openAuthModal }) => openAuthModal('login'));
        });
      }
    };
  }

  const notifications = state.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  // Empty state
  if (notifications.length === 0) {
    return {
      html: `
      <div class="section" style="padding-top: var(--space-10);">
        <div class="section__header animate-fade-in-up" style="flex-direction: column; align-items: flex-start; gap: var(--space-2);">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            ${bellIcon}
            <h1 class="section__title font-display">Notifications</h1>
          </div>
        </div>

        <div class="empty-state" style="padding: var(--space-24) var(--space-8);">
          <div class="empty-state__icon">🔕</div>
          <h3 class="empty-state__title font-display">No notifications yet</h3>
          <p class="empty-state__text">When there's activity on your account, you'll see it here.</p>
        </div>
      </div>
      `,
      afterRender() {}
    };
  }

  const html = `
    <div class="section" style="padding-top: var(--space-10); max-width: 700px;">
      <!-- Header -->
      <div class="section__header animate-fade-in-up stagger-1" style="flex-direction: row; align-items: center; justify-content: space-between; margin-bottom: var(--space-6);">
        <div>
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            ${bellIcon}
            <h1 class="section__title font-display">Notifications</h1>
            ${unreadCount > 0 ? `
              <span style="
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 22px;
                height: 22px;
                border-radius: var(--radius-full);
                background: var(--gradient-accent);
                color: var(--btn-primary-text);
                font-size: var(--text-xs);
                font-weight: 700;
                padding: 0 var(--space-2);
              ">${unreadCount}</span>
            ` : ''}
          </div>
        </div>
        ${unreadCount > 0 ? `
          <button class="btn btn-ghost btn-sm" id="mark-all-read-btn" style="color: var(--accent-light); font-size: var(--text-sm);">
            Mark all as read
          </button>
        ` : ''}
      </div>

      <!-- Notification List -->
      <div style="display: flex; flex-direction: column; gap: var(--space-3);" id="notifications-list">
        ${notifications.map((n, i) => renderNotificationCard(n, i)).join('')}
      </div>
    </div>
  `;

  return {
    html,
    afterRender() {
      // Helper: update navbar badges in real-time
      function updateBadges() {
        const s = getState();
        const unread = s.notifications?.filter(n => !n.read).length || 0;

        // Save read notification IDs to localStorage for persistence
        const readIds = s.notifications?.filter(n => n.read).map(n => n.id) || [];
        localStorage.setItem('vf-read-notif-ids', JSON.stringify(readIds));

        // Update desktop navbar badge
        const desktopBadge = document.querySelector('a[href="/notifications"] > span[style*="position: absolute"]');
        if (desktopBadge) {
          if (unread > 0) {
            desktopBadge.textContent = unread;
          } else {
            desktopBadge.remove();
          }
        }

        // Update mobile navbar badge
        const mobileBadge = document.querySelector('.mobile-bottom-nav .mobile-nav-badge');
        if (mobileBadge) {
          if (unread > 0) {
            mobileBadge.textContent = unread;
          } else {
            mobileBadge.remove();
          }
        }

        // Update header count badge
        const headerBadge = document.querySelector('.section__header span[style*="gradient-accent"]');
        if (headerBadge) {
          if (unread > 0) {
            headerBadge.textContent = unread;
          } else {
            headerBadge.remove();
            document.getElementById('mark-all-read-btn')?.remove();
          }
        }
      }

      // Mark all as read
      const markAllBtn = document.getElementById('mark-all-read-btn');
      markAllBtn?.addEventListener('click', () => {
        const s = getState();
        if (s.notifications) {
          s.notifications = s.notifications.map(n => ({ ...n, read: true }));
        }
        // Update all cards visually
        document.querySelectorAll('.notification-card').forEach(card => {
          card.style.borderLeftColor = 'transparent';
          card.style.background = 'var(--bg-card)';
          const dot = card.querySelector('div[style*="width: 8px"]');
          if (dot) dot.remove();
        });
        updateBadges();
        showToast('All notifications marked as read ✓', 'success');
      });

      // Click individual notification — mark as read + update badge + navigate
      document.querySelectorAll('.notification-card').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.dataset.id;
          const link = card.dataset.link;
          
          markNotificationRead(id);
          
          // Navigate to the linked page
          if (link) {
            navigate(link);
          }
        });
      });
    }
  };
}
