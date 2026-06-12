// ============================================================
// ValyryesFans — Checkout View (Compliant Stripe Checkout)
// ============================================================

import { getState, showToast } from '../store.js';
import { navigate } from '../router.js';

const icons = {
  card: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  lock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.3a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-1.4 0l-3-3a1 1 0 1 1 1.4-1.4L6.6 9.6l5.3-5.3a1 1 0 0 1 1.4 0z" fill="currentColor"/></svg>`,
  spinner: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
  stripe: `<svg width="60" height="25" viewBox="0 0 60 25" fill="none"><path d="M5 10.2c0-.7.6-1 1.5-1 1.3 0 3 .4 4.3 1.1V6.5c-1.4-.6-2.9-.8-4.3-.8C3.2 5.7 1 7.4 1 10.4c0 4.7 6.5 4 6.5 6 0 .8-.7 1.1-1.7 1.1-1.5 0-3.4-.6-4.8-1.4v3.8c1.6.7 3.3 1 4.8 1 3.4 0 5.7-1.7 5.7-4.7 0-5-6.5-4.2-6.5-6.1zm14.8-2.5l-.2-1.8h-3.6v14h4V12c1-.7 2.6-.6 3.2-.4V7.8c-.6-.2-2.6-.6-3.4 1.9zm8.2-1.9l-3.9.8v3.5l-1.7.4v3.1l1.7-.4v5.6c0 2.8 2 3.8 3.9 3.8 1.2 0 2-.3 2-.3v-3.2s-.7.2-1.3.2c-.7 0-1.3-.3-1.3-1.3v-5.2h2.6v-3.2h-2.6l.6-3.8zm10 1.7c-1.1 0-1.8.5-2.2 1.3l-.2-1h-3.6v14h4v-9.6c.5-.9 1.5-1.1 2-1.1h.2V7.5zm4.5 0c-3.9 0-5.5 3.3-5.5 7.2s1.7 7.1 5.5 7.1c2 0 3.3-.6 4.4-1.7l-1.7-2.5c-.7.7-1.4 1-2.4 1-1.1 0-1.9-.5-2.1-2h6.6c0-.2.1-.9.1-1.5 0-4.2-1.5-7.6-4.9-7.6zm-1.5 5.7c.2-1 .7-2 1.6-2s1.3.9 1.3 2h-2.9z" fill="var(--text-muted)"/></svg>`,
};

const goldFeatures = [
  'Unlock ALL 200+ exclusive photos',
  'Direct messaging access',
  'Custom content requests',
  'Priority responses & early access',
];

export function renderCheckout(params = {}) {
  const state = getState();
  const isTip = !!params.tip;
  const amount = isTip ? parseFloat(params.tip).toFixed(2) : '14.99';
  const title = isTip ? 'Send a Tip' : 'Secure Checkout';
  const subtitle = isTip ? 'Show your appreciation to Valyryes' : 'Complete your subscription to unlock everything';
  const itemTitle = isTip ? 'Tip Amount' : 'Gold Plan';
  const itemDesc = isTip ? 'One-time payment' : 'Monthly subscription';
  const unit = isTip ? '' : '/month';

  const html = `
    <div style="min-height: calc(100vh - var(--nav-height)); display: flex; align-items: center; justify-content: center; padding: var(--space-8);">
      <div style="width: 100%; max-width: 520px;">

        <!-- Header -->
        <div class="animate-fade-in-up stagger-1" style="text-align: center; margin-bottom: var(--space-8);">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: var(--radius-full); background: var(--accent-subtle); border: 2px solid var(--border-accent); margin-bottom: var(--space-4);">
            ${isTip ? '💝' : icons.lock}
          </div>
          <h1 class="font-display" style="font-size: var(--text-3xl); margin-bottom: var(--space-2);">
            <span class="text-gradient">${title}</span>
          </h1>
          <p style="color: var(--text-secondary); font-size: var(--text-sm);">${subtitle}</p>
        </div>

        <!-- Order Summary Card -->
        <div class="card-glass animate-fade-in-up stagger-2" style="border-radius: var(--radius-xl); padding: var(--space-6); margin-bottom: var(--space-6); border: 1px solid var(--glass-border);">
          <div style="display: flex; align-items: center; justify-content: space-between; ${!isTip ? 'margin-bottom: var(--space-4);' : ''}">
            <div>
              <div style="font-family: var(--font-display); font-size: var(--text-lg); font-weight: 600;">${itemTitle}</div>
              <div style="color: var(--text-muted); font-size: var(--text-xs);">${itemDesc}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: var(--text-xl); font-weight: 700; color: var(--text-primary);">$${amount}</div>
              ${unit ? `<div style="color: var(--text-muted); font-size: var(--text-xs);">${unit}</div>` : ''}
            </div>
          </div>
          ${!isTip ? `
          <div style="border-top: 1px solid var(--border); padding-top: var(--space-4);">
            ${goldFeatures.map(f => `
              <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2); font-size: var(--text-sm); color: var(--text-secondary);">
                <span style="color: var(--accent); flex-shrink: 0;">${icons.check}</span>
                <span>${f}</span>
              </div>
            `).join('')}
          </div>
          ` : ''}
        </div>

        <!-- Payment Form Card (compliant Stripe Checkout redirect) -->
        <div class="card-glass animate-fade-in-up stagger-3" style="border-radius: var(--radius-xl); padding: var(--space-8); margin-bottom: var(--space-6); border: 1px solid var(--glass-border); text-align: center;">
          <div style="font-weight: 600; font-size: var(--text-base); margin-bottom: var(--space-4); display: flex; align-items: center; justify-content: center; gap: var(--space-2);">
            ${icons.card}
            Secure Stripe Checkout
          </div>
          <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-6); line-height: 1.5;">
            You will be securely redirected to Stripe's payment page to complete your transaction.
          </p>

          <button id="checkout-submit" class="btn btn-primary btn-lg w-full" style="justify-content: center; font-size: var(--text-base); padding: var(--space-4) var(--space-8);">
            <span id="checkout-btn-text">${isTip ? `Pay with Stripe — $${amount}` : `Subscribe with Stripe — $${amount}/month`}</span>
            <span id="checkout-btn-spinner" style="display: none; align-items: center; gap: 8px;">${icons.spinner} Redirecting...</span>
          </button>
        </div>

        <!-- Trust Badges -->
        <div class="animate-fade-in-up stagger-4" style="display: flex; justify-content: center; gap: var(--space-8); flex-wrap: wrap; margin-bottom: var(--space-6);">
          <div style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--text-muted);">
            🔒 SSL Encrypted
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--text-muted);">
            ✕ Cancel Subscription Anytime
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--text-muted);">
            ⚡ Instant Unlock
          </div>
        </div>

        <!-- Powered by Stripe -->
        <div class="animate-fade-in-up stagger-5" style="text-align: center; padding-bottom: var(--space-8);">
          <div style="display: inline-flex; align-items: center; gap: var(--space-2); font-size: var(--text-xs); color: var(--text-muted);">
            Powered by ${icons.stripe}
          </div>
        </div>

      </div>
    </div>

    <style>
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    </style>
  `;

  return {
    html,
    afterRender() {
      const state = getState();

      // If not authenticated, open auth modal
      if (!state.isAuthenticated) {
        import('../main.js').then(({ openAuthModal }) => openAuthModal('signup'));
        return;
      }

      const submitBtn = document.getElementById('checkout-submit');
      const btnText = document.getElementById('checkout-btn-text');
      const btnSpinner = document.getElementById('checkout-btn-spinner');

      submitBtn?.addEventListener('click', async () => {
        // Show loading state
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline-flex';

        try {
          const { supabase } = await import('../supabase.js');
          const baseOrigin = window.location.origin + window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
          const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: {
              type: isTip ? 'tip' : 'subscription',
              amount: parseFloat(amount),
              contentId: params.contentId || null,
              message: params.message || null,
              successPath: params.successPath || null,
              cancelPath: params.cancelPath || null,
              origin: baseOrigin
            }
          });

          if (error) {
            let msg = error.message;
            try {
              if (error.context && typeof error.context.json === 'function') {
                const body = await error.context.json();
                if (body.error) msg = body.error;
              }
            } catch (e) {}
            throw new Error(msg);
          }

          if (data && data.url) {
            // Redirect to Stripe Checkout
            window.location.href = data.url;
          } else {
            throw new Error('Failed to generate secure checkout session');
          }
        } catch (e) {
          submitBtn.disabled = false;
          btnText.style.display = 'block';
          btnSpinner.style.display = 'none';
          import('../store.js').then(({ showToast }) => showToast(e.message || 'Payment initiation failed', 'error'));
        }
      });
    }
  };
}
