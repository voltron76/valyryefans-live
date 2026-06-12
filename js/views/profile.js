// ============================================================
// ValyryesFans — Profile View (Single Column, no sidebar)
// Menu items are now in the navbar dropdown overlay
// ============================================================

import { getState, showToast, uploadProfilePicture } from '../store.js';
import { navigate } from '../router.js';
import { getTheme } from '../theme.js';

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

const icons = {
  user: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  mail: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  edit: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  crown: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 17l3-12 5 7 2-10 2 10 5-7 3 12z"/><path d="M2 17h20"/></svg>`,
  zap: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  heart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  star: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.3a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-1.4 0l-3-3a1 1 0 1 1 1.4-1.4L6.6 9.6l5.3-5.3a1 1 0 0 1 1.4 0z" fill="currentColor"/></svg>`,
  camera: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  heartFill: `<svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  play: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
};

const verifiedBadgeSvg = '<span class="verified-badge"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span>';

const tierConfig = {
  free: { label: 'Free', color: 'var(--text-muted)', icon: icons.zap, gradient: 'var(--gradient-subtle)' },
  gold: { label: 'Gold', color: 'var(--gold)', icon: icons.crown, gradient: 'var(--gradient-gold)' },
};

export function renderProfile() {
  const state = getState();

  if (!state.isAuthenticated) {
    return {
      html: `
        <div style="min-height: calc(100vh - var(--nav-height)); display: flex; align-items: center; justify-content: center;">
          <div class="paywall-overlay animate-fade-in-up">
            <div class="paywall-overlay__icon animate-pulse-glow">${icons.user}</div>
            <h2 class="paywall-overlay__title font-display">Sign In Required</h2>
            <p class="paywall-overlay__text">Create an account or sign in to view your profile.</p>
            <button class="btn btn-primary btn-lg" id="profile-auth-btn">${icons.star} Sign In</button>
          </div>
        </div>`,
      afterRender() {
        document.getElementById('profile-auth-btn')?.addEventListener('click', () => {
          import('../main.js').then(({ openAuthModal }) => openAuthModal('login'));
        });
      }
    };
  }

  const user = state.user || {};
  const tier = state.currentTier || 'free';
  const tc = tierConfig[tier] || tierConfig.free;
  const initials = (user.name || user.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const memberSince = user.joined || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const avatarUrl = user.avatarUrl;

  // Get liked posts (using likedByUser from the store, NOT bookmarks)
  const likedPosts = state.content.filter(c => c.likedByUser && c.category !== 'story');
  const likedCount = likedPosts.length;

  // Build liked posts grid
  const likedPostsGridHtml = likedPosts.length > 0 ? likedPosts.map(post => {
    const thumb = post.thumbnail || (post.media && post.media[0]) || '';
    const isVideo = post.type === 'video';
    return `
      <div class="profile-liked-item" data-content-id="${post.id}" style="
        position: relative; aspect-ratio: 1; border-radius: var(--radius-lg); overflow: hidden;
        cursor: pointer; background: var(--bg-card); border: 1px solid var(--border);
        transition: transform 0.2s, box-shadow 0.2s;
      ">
        ${thumb ? `<img src="${escapeHtml(thumb)}" alt="${escapeHtml(post.title)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">` : `
          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--bg-hover);color:var(--text-muted);font-size:var(--text-2xl);">
            ${isVideo ? icons.play : icons.heartFill}
          </div>
        `}
        <div style="
          position:absolute;inset:0;background:linear-gradient(transparent 50%,rgba(0,0,0,0.7));
          display:flex;flex-direction:column;justify-content:flex-end;padding:var(--space-2);
          opacity:0;transition:opacity 0.2s;
        " class="profile-liked-overlay">
          <div style="display:flex;align-items:center;gap:var(--space-2);color:#fff;font-size:var(--text-xs);">
            ${icons.heartFill} <span>${post.likes || 0}</span>
            ${isVideo ? `<span style="margin-left:auto;">${icons.play}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('') : '';

  const html = `
    <style>
      .profile-liked-item:hover {
        transform: scale(1.03);
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      }
      .profile-liked-item:hover .profile-liked-overlay {
        opacity: 1 !important;
      }
      .profile-avatar-container {
        position: relative;
        width: 110px;
        height: 110px;
        border-radius: 50%;
        margin: 0 auto var(--space-4);
        cursor: pointer;
      }
      .profile-avatar-container .profile-avatar-overlay {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        opacity: 0;
        transition: opacity 0.25s;
      }
      .profile-avatar-container:hover .profile-avatar-overlay {
        opacity: 1;
      }
    </style>
    <div class="section" style="padding-top: var(--space-10); max-width: 720px; margin: 0 auto;">

      <!-- Profile Header -->
      <div class="card-glass animate-fade-in-up stagger-1" style="padding: var(--space-8); border-radius: var(--radius-xl); margin-bottom: var(--space-6); text-align: center;">
        <div class="profile-avatar-container" id="profile-avatar-click" title="Change profile picture">
          <div style="width:110px;height:110px;border-radius:50%;overflow:hidden;border:3px solid var(--border-accent);" class="${tier === 'gold' ? 'avatar-ring--gold' : ''}">
            ${avatarUrl
              ? `<img id="profile-avatar-img" src="${escapeHtml(avatarUrl)}" alt="Profile" style="width:100%;height:100%;object-fit:cover;">`
              : `<div id="profile-avatar-img" style="width:100%;height:100%;background:var(--gradient-accent);display:flex;align-items:center;justify-content:center;color:var(--btn-primary-text);font-weight:700;font-size:32px;">${initials}</div>`
            }
          </div>
          ${tier === 'gold' ? `<div style="position:absolute;bottom:4px;right:4px;z-index:2;">${verifiedBadgeSvg}</div>` : ''}
          <div class="profile-avatar-overlay">
            ${icons.camera}
          </div>
          <input type="file" id="profile-avatar-input" accept="image/*" style="display:none;">
        </div>
        <h1 class="font-display" style="font-size: var(--text-2xl); margin-bottom: var(--space-1); display: flex; align-items: center; justify-content: center; gap: 4px;">${escapeHtml(user.name) || 'User'}${tier === 'gold' ? verifiedBadgeSvg : ''}</h1>
        <p style="color: var(--text-muted); font-size: var(--text-sm); display: flex; align-items: center; justify-content: center; gap: var(--space-2);">
          ${icons.mail} ${escapeHtml(user.email) || 'user@example.com'}
        </p>
        <div style="margin-top: var(--space-4);">
          <span class="sub-badge sub-badge--${tier}" style="font-size: var(--text-sm); padding: var(--space-2) var(--space-4);">
            ${tc.label} Member
          </span>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="animate-fade-in-up stagger-2" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); margin-bottom: var(--space-6);">
        <div class="card-glass" style="padding: var(--space-5); border-radius: var(--radius-lg); text-align: center;">
          <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--accent-light);">${likedCount}</div>
          <div style="font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-1);">Posts Liked</div>
        </div>
        <div class="card-glass" style="padding: var(--space-5); border-radius: var(--radius-lg); text-align: center;">
          <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--accent-light);">${state.content.filter(c => c.category !== 'story').length || 0}</div>
          <div style="font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-1);">Content Viewed</div>
        </div>
        <div class="card-glass" style="padding: var(--space-5); border-radius: var(--radius-lg); text-align: center;">
          <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--accent-light);">${memberSince.split(' ')[0]}</div>
          <div style="font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-1);">Member Since</div>
        </div>
        <div class="card-glass" style="padding: var(--space-5); border-radius: var(--radius-lg); text-align: center;">
          <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--accent-light);">0</div>
          <div style="font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-1);">Referrals</div>
        </div>
      </div>

      <!-- Liked Posts Section -->
      <div class="card-glass animate-fade-in-up stagger-2" style="padding: var(--space-8); border-radius: var(--radius-xl); margin-bottom: var(--space-6);">
        <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6);">
          <span style="color: var(--accent-light);">${icons.heart}</span>
          <h2 class="font-display" style="font-size: var(--text-xl);">Liked Posts</h2>
          <span style="font-size: var(--text-xs); color: var(--text-muted); margin-left: auto;">${likedCount} posts</span>
        </div>
        ${likedPosts.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3);" id="liked-posts-grid">
            ${likedPostsGridHtml}
          </div>
        ` : `
          <div style="text-align: center; padding: var(--space-10); color: var(--text-muted);">
            <div style="font-size: var(--text-3xl); margin-bottom: var(--space-3);">💖</div>
            <div style="font-size: var(--text-sm);">No liked posts yet</div>
            <div style="font-size: var(--text-xs); margin-top: var(--space-2);">Like some content and it will appear here!</div>
          </div>
        `}
      </div>

      <!-- Subscription Card -->
      <div class="card-glass animate-fade-in-up stagger-3" style="padding: var(--space-8); border-radius: var(--radius-xl); margin-bottom: var(--space-6);">
        <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6);">
          <span style="color: var(--accent-light);">${tc.icon}</span>
          <h2 class="font-display" style="font-size: var(--text-xl);">Subscription</h2>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); background: var(--bg-card); border-radius: var(--radius-lg); margin-bottom: var(--space-4);">
          <div>
            <div style="font-weight: 600; margin-bottom: var(--space-1);">${tc.label} Plan</div>
            <div style="font-size: var(--text-sm); color: var(--text-muted);">${tier === 'gold' ? '$14.99/month' : 'Free forever'}</div>
          </div>
          <span class="sub-badge sub-badge--${tier}">${tc.label}</span>
        </div>

        <div style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-6);">
          <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);">
            ${icons.check} Member since ${memberSince}
          </div>
          ${tier === 'gold' ? `
            <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);">
              ${icons.check} Next billing: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          ` : ''}
        </div>

        ${tier === 'free' ? `
          <a href="#/subscribe" class="btn btn-primary btn-lg w-full" style="justify-content: center;">
            ${icons.crown} Upgrade to Gold — $14.99/mo
          </a>
        ` : `
          <button class="btn btn-ghost btn-sm" id="cancel-sub-btn" style="color: var(--text-muted);">Cancel Subscription</button>
        `}
      </div>

      <!-- Account Settings -->
      <div class="card-glass animate-fade-in-up stagger-4" style="padding: var(--space-8); border-radius: var(--radius-xl); margin-bottom: var(--space-6);">
        <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6);">
          ${icons.edit}
          <h2 class="font-display" style="font-size: var(--text-xl);">Account Settings</h2>
        </div>

        <div class="form-group" style="margin-bottom: var(--space-5);">
          <label class="form-label">Display Name</label>
          <input class="form-input" type="text" id="profile-name" value="${escapeHtml(user.name || '')}" placeholder="Your display name">
        </div>

        <div class="form-group" style="margin-bottom: var(--space-5);">
          <label class="form-label">Email</label>
          <input class="form-input" type="email" id="profile-email" value="${escapeHtml(user.email || '')}" readonly style="opacity: 0.7;">
        </div>

        <div class="form-group" style="margin-bottom: var(--space-6);">
          <label class="form-label">Bio</label>
          <textarea class="form-input" id="profile-bio" rows="3" placeholder="Tell us about yourself...">${escapeHtml(user.bio || '')}</textarea>
        </div>

        <button class="btn btn-primary" id="save-profile-btn">${icons.check} Save Changes</button>
      </div>

      <!-- Security -->
      <div class="card-glass animate-fade-in-up stagger-5" style="padding: var(--space-8); border-radius: var(--radius-xl); margin-bottom: var(--space-8);">
        <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6);">
          ${icons.shield}
          <h2 class="font-display" style="font-size: var(--text-xl);">Security</h2>
        </div>

        <div class="form-group" style="margin-bottom: var(--space-4);">
          <label class="form-label">Current Password</label>
          <input class="form-input" type="password" id="current-pass" placeholder="Enter current password">
        </div>
        <div class="form-group" style="margin-bottom: var(--space-4);">
          <label class="form-label">New Password</label>
          <input class="form-input" type="password" id="new-pass" placeholder="Enter new password">
        </div>
        <div class="form-group" style="margin-bottom: var(--space-6);">
          <label class="form-label">Confirm New Password</label>
          <input class="form-input" type="password" id="confirm-pass" placeholder="Confirm new password">
        </div>

        <button class="btn btn-secondary" id="change-pass-btn">${icons.shield} Update Password</button>
      </div>
    </div>
  `;

  return {
    html,
    afterRender() {
      // Profile picture upload
      const avatarClick = document.getElementById('profile-avatar-click');
      const avatarInput = document.getElementById('profile-avatar-input');

      avatarClick?.addEventListener('click', () => avatarInput?.click());

      avatarInput?.addEventListener('change', async () => {
        if (!avatarInput.files?.length) return;
        const file = avatarInput.files[0];
        if (file.size > 5 * 1024 * 1024) {
          showToast('Image must be under 5MB', 'error');
          return;
        }
        showToast('Uploading profile picture...', 'info');
        const url = await uploadProfilePicture(file);
        if (url) {
          // Update the avatar image on the page
          const imgEl = document.getElementById('profile-avatar-img');
          if (imgEl) {
            if (imgEl.tagName === 'IMG') {
              imgEl.src = url;
            } else {
              // Replace initials div with img
              imgEl.outerHTML = `<img id="profile-avatar-img" src="${url}" alt="Profile" style="width:100%;height:100%;object-fit:cover;">`;
            }
          }
          // Update navbar avatar
          try {
            const { renderNavbar, afterNavRender } = await import('../components/navbar.js');
            const navbarEl = document.getElementById('navbar');
            if (navbarEl) {
              navbarEl.innerHTML = renderNavbar();
              afterNavRender();
            }
          } catch(e) {}
        }
        avatarInput.value = '';
      });

      // Liked posts grid click handlers
      document.querySelectorAll('.profile-liked-item').forEach(item => {
        item.addEventListener('click', () => {
          const contentId = item.dataset.contentId;
          if (contentId) navigate(`/content/${contentId}`);
        });
      });

      // Save profile
      document.getElementById('save-profile-btn')?.addEventListener('click', async () => {
        const name = document.getElementById('profile-name')?.value;
        const bio = document.getElementById('profile-bio')?.value;
        const s = getState();
        if (s.user) {
          s.user.name = name || s.user.name;
          s.user.bio = bio || '';
        }
        try {
          const { supabase } = await import('../supabase.js');
          await supabase.from('profiles').update({ name }).eq('id', s.user.id);
        } catch(e) {}
        showToast('Profile updated!', 'success');
        // Re-render navbar to update avatar initial
        import('../components/navbar.js').then(({ renderNavbar, afterNavRender }) => {
          const navbarEl = document.getElementById('navbar');
          if (navbarEl) {
            navbarEl.innerHTML = renderNavbar();
            afterNavRender();
          }
        });
      });

      // Change password
      document.getElementById('change-pass-btn')?.addEventListener('click', () => {
        const current = document.getElementById('current-pass')?.value;
        const newPass = document.getElementById('new-pass')?.value;
        const confirm = document.getElementById('confirm-pass')?.value;

        if (!current || !newPass || !confirm) {
          showToast('Please fill all password fields', 'error');
          return;
        }
        if (newPass !== confirm) {
          showToast('Passwords do not match', 'error');
          return;
        }
        if (newPass.length < 6) {
          showToast('Password must be at least 6 characters', 'error');
          return;
        }
        showToast('Password updated successfully!', 'success');
        document.getElementById('current-pass').value = '';
        document.getElementById('new-pass').value = '';
        document.getElementById('confirm-pass').value = '';
      });

      // Cancel subscription
      document.getElementById('cancel-sub-btn')?.addEventListener('click', async () => {
        if (confirm('Are you sure you want to cancel your Gold subscription?')) {
          const s = getState();
          s.currentTier = 'free';
          s.user.tier = 'free';
          try {
            const { supabase } = await import('../supabase.js');
            await supabase.from('profiles').update({ tier: 'free' }).eq('id', s.user.id);
          } catch(e) {}
          showToast('Subscription cancelled', 'success');
          navigate('/profile');
        }
      });
    }
  };
}
