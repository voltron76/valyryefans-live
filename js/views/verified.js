// ============================================================
// ValyryesFans — Email Verification Landing Page
// Shows success state after user clicks the email confirmation link
// ============================================================

import { getState, initStore, showToast } from '../store.js';
import { navigate } from '../router.js';

function generateSparkles(count = 30) {
  let sparkles = '';
  const colors = ['#e91e8c', '#ff6bb3', '#ffd700', '#ffffff', '#c4167a'];
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * 3;
    const duration = 2 + Math.random() * 3;
    const size = 2 + Math.random() * 4;
    const color = colors[Math.floor(Math.random() * colors.length)];
    sparkles += `<div style="
      position: absolute;
      left: ${left}%;
      top: ${top}%;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${color};
      animation: sparkle ${duration}s ${delay}s ease-in-out infinite;
      pointer-events: none;
    "></div>`;
  }
  return sparkles;
}

export function renderVerified() {
  const state = getState();
  const isLoggedIn = state.isAuthenticated;
  const userName = state.user?.name || 'there';

  const html = `
    <div style="min-height: calc(100vh - var(--nav-height)); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">

      <!-- Sparkle Background -->
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;">
        ${generateSparkles(30)}
      </div>

      <!-- Ambient Glow -->
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(233, 30, 140, 0.12) 0%, transparent 70%);
        pointer-events: none;
        z-index: 0;
      "></div>

      <div style="position: relative; z-index: 1; max-width: 520px; width: 100%; padding: var(--space-6); text-align: center;">

        <!-- Success Card -->
        <div class="card-glass animate-fade-in-up stagger-1" style="
          border-radius: var(--radius-2xl);
          padding: var(--space-12) var(--space-8);
          border: 1px solid rgba(233, 30, 140, 0.2);
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 40px rgba(233, 30, 140, 0.1);
        ">

          <!-- Checkmark Icon -->
          <div class="animate-fade-in-up stagger-2" style="margin-bottom: var(--space-6);">
            <div id="verify-icon" style="
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 88px;
              height: 88px;
              border-radius: var(--radius-full);
              background: linear-gradient(135deg, rgba(233, 30, 140, 0.15), rgba(255, 215, 0, 0.1));
              border: 2px solid rgba(233, 30, 140, 0.3);
              animation: successPulse 2s ease-in-out infinite;
            ">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
          </div>

          <!-- Heading -->
          <h1 class="font-display animate-fade-in-up stagger-3" style="
            font-size: var(--text-3xl);
            margin: 0 0 var(--space-3);
            background: linear-gradient(135deg, #e91e8c, #ffd700);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          ">
            Email Verified!
          </h1>

          <p class="animate-fade-in-up stagger-4" style="
            color: var(--text-secondary);
            font-size: var(--text-base);
            line-height: 1.7;
            margin: 0 0 var(--space-8);
          ">
            ${isLoggedIn 
              ? `Welcome, <strong style="color: var(--text-primary);">${userName}</strong>! Your account is now fully activated. You're all set to explore.`
              : `Your email has been confirmed successfully! You can now sign in to start exploring exclusive content.`
            }
          </p>

          <!-- What's Next -->
          <div class="animate-fade-in-up stagger-5" style="
            background: rgba(255,255,255,0.03);
            border-radius: var(--radius-xl);
            border: 1px solid rgba(255,255,255,0.06);
            padding: var(--space-6);
            margin-bottom: var(--space-8);
            text-align: left;
          ">
            <p style="margin: 0 0 var(--space-4); font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); text-align: center;">
              ✨ Here's what you can do now:
            </p>
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              <div style="display: flex; align-items: center; gap: var(--space-3); font-size: var(--text-sm); color: var(--text-secondary);">
                <span style="flex-shrink: 0; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: rgba(233, 30, 140, 0.1); border-radius: var(--radius-md); font-size: 14px;">📸</span>
                Browse the public gallery
              </div>
              <div style="display: flex; align-items: center; gap: var(--space-3); font-size: var(--text-sm); color: var(--text-secondary);">
                <span style="flex-shrink: 0; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: rgba(233, 30, 140, 0.1); border-radius: var(--radius-md); font-size: 14px;">❤️</span>
                Like & comment on posts
              </div>
              <div style="display: flex; align-items: center; gap: var(--space-3); font-size: var(--text-sm); color: var(--text-secondary);">
                <span style="flex-shrink: 0; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: rgba(233, 30, 140, 0.1); border-radius: var(--radius-md); font-size: 14px;">👑</span>
                Upgrade to <strong style="color: var(--accent);">Gold VIP</strong> for full access
              </div>
              <div style="display: flex; align-items: center; gap: var(--space-3); font-size: var(--text-sm); color: var(--text-secondary);">
                <span style="flex-shrink: 0; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: rgba(233, 30, 140, 0.1); border-radius: var(--radius-md); font-size: 14px;">💬</span>
                Send a direct message
              </div>
            </div>
          </div>

          <!-- CTA Buttons -->
          <div class="animate-fade-in-up stagger-6" style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${isLoggedIn ? `
              <a href="/gallery" id="verified-gallery-btn" class="btn btn-primary btn-lg" style="width: 100%; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                Explore Gallery
              </a>
              <a href="/profile" id="verified-profile-btn" class="btn btn-secondary" style="width: 100%; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Set Up Profile
              </a>
            ` : `
              <button id="verified-signin-btn" class="btn btn-primary btn-lg" style="width: 100%; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Sign In Now
              </button>
              <a href="/" class="btn btn-secondary" style="width: 100%; justify-content: center;">
                Browse as Guest
              </a>
            `}
          </div>

        </div>

        <!-- Powered by footer -->
        <p class="animate-fade-in-up stagger-7" style="margin-top: var(--space-6); font-size: var(--text-xs); color: var(--text-muted);">
          ValyReyes Fans · Exclusive Content Platform
        </p>

      </div>
    </div>

    <style>
      @keyframes successPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(233, 30, 140, 0.2); }
        50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(233, 30, 140, 0.15); }
      }
      @keyframes sparkle {
        0%, 100% { opacity: 0; transform: scale(0); }
        50% { opacity: 0.8; transform: scale(1); }
      }
    </style>
  `;

  return {
    html,
    async afterRender() {
      // Refresh store to pick up latest auth state
      try {
        await initStore();
      } catch(e) {
        console.error('Store refresh on verify page:', e);
      }

      // Gallery button
      document.getElementById('verified-gallery-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/gallery');
      });

      // Profile button 
      document.getElementById('verified-profile-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/profile');
      });

      // Sign in button (opens auth modal)
      document.getElementById('verified-signin-btn')?.addEventListener('click', async () => {
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
          authModal.classList.add('active');
          // Import and render auth modal dynamically
          try {
            const { renderAuthModal, wireAuthModal } = await import('../components/auth-modal.js');
            authModal.innerHTML = renderAuthModal();
            wireAuthModal();
          } catch(e) {
            console.error('Failed to load auth modal:', e);
            showToast('Please use the Sign In button in the navigation bar.', 'info');
          }
        }
      });
    }
  };
}
