// ============================================================
// ValyryeFans — Admin Login View
// Separate login page for admin access
// ============================================================

import { navigate } from '../router.js';
import { showToast } from '../store.js';

const icons = {
  lock: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
};

export function renderAdminLogin() {
  // If already authenticated, redirect to dashboard
  if (sessionStorage.getItem('vf-admin-auth') === 'true') {
    setTimeout(() => navigate('/admin'), 0);
    return { html: '<div>Redirecting...</div>', afterRender() {} };
  }

  const html = `
    <div style="min-height: calc(100vh - var(--nav-height)); display: flex; align-items: center; justify-content: center; background: var(--bg-primary);">
      <div class="card-glass animate-fade-in-up" style="padding: var(--space-10); width: 400px; max-width: 90vw; text-align: center; border-radius: var(--radius-xl);">
        <div style="color: var(--accent); margin-bottom: var(--space-4); display: flex; justify-content: center;">
          ${icons.lock}
        </div>
        <h1 class="font-display" style="font-size: var(--text-2xl); margin-bottom: var(--space-2);">Creator Portal</h1>
        <p style="color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-8);">Enter your 4-digit security PIN to access the management dashboard.</p>
        
        <div style="margin-bottom: var(--space-6);">
          <input type="password" id="admin-pin-input" 
                 style="width: 200px; text-align: center; letter-spacing: 12px; font-size: var(--text-3xl); font-weight: 700; padding: var(--space-3) var(--space-4); background: var(--bg-input); border: 2px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); outline: none; transition: border-color 0.2s;"
                 maxlength="4" inputmode="numeric" pattern="[0-9]*" placeholder="••••" autocomplete="off" />
        </div>
        
        <button class="btn btn-primary btn-lg w-full" id="admin-pin-submit" style="justify-content: center;">
          Unlock Dashboard
        </button>
        
        <a href="#/" class="btn btn-ghost btn-sm" style="margin-top: var(--space-4); color: var(--text-muted);">
          Return to App
        </a>
      </div>
    </div>
  `;

  return {
    html,
    afterRender() {
      const pinInput = document.getElementById('admin-pin-input');
      const submitBtn = document.getElementById('admin-pin-submit');

      function verifyPin() {
        const pin = pinInput.value;
        if (pin === '4242') {
          sessionStorage.setItem('vf-admin-auth', 'true');
          showToast('Welcome back, Valyrye!', 'success');
          navigate('/admin');
        } else {
          pinInput.style.borderColor = 'var(--danger)';
          pinInput.style.animation = 'shake 0.4s ease-in-out';
          setTimeout(() => {
            pinInput.style.animation = '';
            pinInput.style.borderColor = 'var(--border)';
          }, 400);
          showToast('Invalid PIN', 'error');
          pinInput.value = '';
          pinInput.focus();
        }
      }

      submitBtn?.addEventListener('click', verifyPin);
      pinInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') verifyPin();
      });
      pinInput?.focus();
    }
  };
}
