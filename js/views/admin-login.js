// ============================================================
// ValyryeFans — Admin Login View
// Separate login page for admin access
// ============================================================

import { navigate } from '../router.js';
import { showToast, getState, initStore } from '../store.js';

const icons = {
  lock: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
};

export function renderAdminLogin() {
  const state = getState();

  // If already authenticated and is admin, redirect to dashboard
  if (state.isAuthenticated && state.isAdmin) {
    sessionStorage.setItem('vf-admin-auth', 'true');
    setTimeout(() => navigate('/admin'), 0);
    return { html: '<div>Redirecting...</div>', afterRender() {} };
  }

  const html = `
    <div style="min-height: calc(100vh - var(--nav-height)); display: flex; align-items: center; justify-content: center; background: var(--bg-primary);">
      <div class="card-glass animate-fade-in-up" style="padding: var(--space-10); width: 400px; max-width: 90vw; border-radius: var(--radius-xl);">
        <div style="color: var(--accent); margin-bottom: var(--space-4); display: flex; justify-content: center;">
          ${icons.lock}
        </div>
        <h1 class="font-display" style="font-size: var(--text-2xl); margin-bottom: var(--space-2); text-align: center;">Creator Portal</h1>
        <p style="color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-8); text-align: center;">Secure access for authorized creators only.</p>
        
        <form id="admin-login-form">
          <div class="form-group" style="margin-bottom: var(--space-4);">
            <label class="form-label">Email Address</label>
            <input type="email" id="admin-email" class="form-input" placeholder="admin@example.com" required autocomplete="email" />
          </div>
          
          <div class="form-group" style="margin-bottom: var(--space-6);">
            <label class="form-label">Password</label>
            <input type="password" id="admin-password" class="form-input" placeholder="••••••••" required autocomplete="current-password" />
          </div>
          
          <button type="submit" class="btn btn-primary btn-lg w-full" id="admin-submit-btn" style="justify-content: center;">
            Sign In to Dashboard
          </button>
        </form>
        
        <div style="text-align: center; margin-top: var(--space-4);">
          <a href="#/" class="btn btn-ghost btn-sm" style="color: var(--text-muted);">
            Return to App
          </a>
        </div>
      </div>
    </div>
  `;

  return {
    html,
    afterRender() {
      const form = document.getElementById('admin-login-form');
      const submitBtn = document.getElementById('admin-submit-btn');

      form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Authenticating...';

        try {
          const { supabase } = await import('../supabase.js');
          
          // Attempt sign in
          let { data, error } = await supabase.auth.signInWithPassword({ email, password });
          
          if (error) {
            // If it fails, maybe they need to sign up first?
            if (error.message.includes('Invalid login credentials')) {
              showToast('Invalid credentials. If this is your first time, create a normal account first.', 'error');
            } else {
              showToast(error.message, 'error');
            }
            throw error;
          }

          // Re-initialize store to pull or create correct profile data
          await initStore();
          const s = getState();

          if (s.isAdmin) {
            sessionStorage.setItem('vf-admin-auth', 'true');
            showToast('Welcome to the Creator Portal!', 'success');
            
            // Re-render navbar
            const { renderNavbar, afterNavRender } = await import('../components/navbar.js');
            const navbarEl = document.getElementById('navbar');
            if (navbarEl) {
              navbarEl.innerHTML = renderNavbar();
              afterNavRender();
            }

            navigate('/admin');
          } else {
            // Not an admin
            await supabase.auth.signOut();
            showToast('Access denied. You are not an authorized admin.', 'error');
          }
        } catch (err) {
          console.error(err);
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Sign In to Dashboard';
        }
      });
    }
  };
}
