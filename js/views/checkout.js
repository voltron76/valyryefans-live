// ============================================================
// ValyryeFans — Checkout View
// Mock Stripe-style checkout page
// ============================================================

import { getState, showToast } from '../store.js';
import { navigate } from '../router.js';

const icons = {
  card: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  lock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.3a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-1.4 0l-3-3a1 1 0 1 1 1.4-1.4L6.6 9.6l5.3-5.3a1 1 0 0 1 1.4 0z" fill="currentColor"/></svg>`,
  calendar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
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
  const subtitle = isTip ? 'Show your appreciation to Valyrye' : 'Complete your subscription to unlock everything';
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

        <!-- Payment Form Card -->
        <div class="card-glass animate-fade-in-up stagger-3" style="border-radius: var(--radius-xl); padding: var(--space-8); margin-bottom: var(--space-6); border: 1px solid var(--glass-border);">
          <div style="font-weight: 600; font-size: var(--text-base); margin-bottom: var(--space-6); display: flex; align-items: center; gap: var(--space-2);">
            ${icons.card}
            Payment Details
          </div>

          <form id="checkout-form" autocomplete="off">
            <!-- Card Number -->
            <div class="form-group" style="margin-bottom: var(--space-5);">
              <label class="form-label" for="card-number">Card Number</label>
              <div style="position: relative;">
                <input
                  class="form-input"
                  type="text"
                  id="card-number"
                  placeholder="4242 4242 4242 4242"
                  maxlength="19"
                  inputmode="numeric"
                  autocomplete="cc-number"
                  style="padding-left: var(--space-10);"
                  required
                >
                <div style="position: absolute; left: var(--space-3); top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex; align-items: center;">
                  ${icons.card}
                </div>
              </div>
            </div>

            <!-- Expiry & CVC Row -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-5);">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="card-expiry">Expiry Date</label>
                <input
                  class="form-input"
                  type="text"
                  id="card-expiry"
                  placeholder="MM / YY"
                  maxlength="7"
                  inputmode="numeric"
                  autocomplete="cc-exp"
                  required
                >
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="card-cvc">CVC</label>
                <input
                  class="form-input"
                  type="text"
                  id="card-cvc"
                  placeholder="123"
                  maxlength="4"
                  inputmode="numeric"
                  autocomplete="cc-csc"
                  required
                >
              </div>
            </div>

            <!-- Cardholder Name -->
            <div class="form-group" style="margin-bottom: var(--space-8);">
              <label class="form-label" for="card-name">Cardholder Name</label>
              <input
                class="form-input"
                type="text"
                id="card-name"
                placeholder="Full name on card"
                autocomplete="cc-name"
                required
              >
            </div>

            <!-- Submit Button -->
            <button type="submit" id="checkout-submit" class="btn btn-primary btn-lg w-full" style="justify-content: center; font-size: var(--text-base); padding: var(--space-4) var(--space-8);">
              <span id="checkout-btn-text">${isTip ? `Send Tip — $${amount}` : `Subscribe — $${amount}/month`}</span>
              <span id="checkout-btn-spinner" class="hidden" style="display: none;">${icons.spinner}</span>
            </button>
          </form>
        </div>

        <!-- Trust Badges -->
        <div class="animate-fade-in-up stagger-4" style="display: flex; justify-content: center; gap: var(--space-8); flex-wrap: wrap; margin-bottom: var(--space-6);">
          <div style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--text-muted);">
            🔒 Secure Payment
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--text-muted);">
            ✕ Cancel Anytime
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--text-muted);">
            ⚡ Instant Access
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
      #checkout-form .form-input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-glow);
      }
      #checkout-form .form-input.invalid {
        border-color: var(--error);
        box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.15);
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

      const form = document.getElementById('checkout-form');
      const cardNumber = document.getElementById('card-number');
      const cardExpiry = document.getElementById('card-expiry');
      const cardCvc = document.getElementById('card-cvc');
      const cardName = document.getElementById('card-name');
      const submitBtn = document.getElementById('checkout-submit');
      const btnText = document.getElementById('checkout-btn-text');
      const btnSpinner = document.getElementById('checkout-btn-spinner');

      // Auto-format card number with spaces every 4 digits
      cardNumber?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.substring(0, 16);
        const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = formatted;
        e.target.classList.remove('invalid');
      });

      // Auto-format expiry MM/YY
      cardExpiry?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.substring(0, 4);
        if (value.length >= 2) {
          value = value.substring(0, 2) + ' / ' + value.substring(2);
        }
        e.target.value = value;
        e.target.classList.remove('invalid');
      });

      // CVC — digits only
      cardCvc?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        e.target.classList.remove('invalid');
      });

      // Name — remove invalid on type
      cardName?.addEventListener('input', () => {
        cardName.classList.remove('invalid');
      });

      // Form submit
      form?.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate all fields
        const fields = [cardNumber, cardExpiry, cardCvc, cardName];
        let valid = true;

        fields.forEach(field => {
          if (!field || !field.value.trim()) {
            field?.classList.add('invalid');
            valid = false;
          }
        });

        // Validate card number length (16 digits)
        if (cardNumber && cardNumber.value.replace(/\s/g, '').length < 16) {
          cardNumber.classList.add('invalid');
          valid = false;
        }

        // Validate expiry length
        if (cardExpiry && cardExpiry.value.replace(/\D/g, '').length < 4) {
          cardExpiry.classList.add('invalid');
          valid = false;
        }

        // Validate CVC length
        if (cardCvc && cardCvc.value.length < 3) {
          cardCvc.classList.add('invalid');
          valid = false;
        }

        if (!valid) return;

        // Show loading state
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline-flex';
        btnSpinner.classList.remove('hidden');

        // Call Secure Supabase Edge Function
        try {
          const { supabase } = await import('../supabase.js');
          const { data, error } = await supabase.functions.invoke('stripe-checkout', {
            body: {
              type: isTip ? 'tip' : 'subscription',
              amount: parseFloat(amount),
              contentId: params.contentId || null
            }
          });

          if (error) throw error;

          btnText.style.display = 'block';
          btnSpinner.style.display = 'none';

          if (isTip) {
            import('../store.js').then(({ addTip }) => {
               addTip(params.contentId || null, parseFloat(amount));
               showToast('💝 Tip sent! Thank you!', 'success');
               navigate(params.contentId ? `/content/${params.contentId}` : '/gallery');
            });
          } else {
            const s = getState();
            s.currentTier = 'gold';

            // Re-render navbar with Gold badge
            try {
              const { renderNavbar, afterNavRender } = await import('../components/navbar.js');
              const navbarEl = document.getElementById('navbar');
              if (navbarEl) {
                navbarEl.innerHTML = renderNavbar();
                const { default: initEvents } = await import('../main.js').catch(() => ({}));
                afterNavRender();
              }
            } catch(e) {}

            showToast('🎉 Welcome to Gold!', 'success');
            navigate('/welcome-gold');
          }
        } catch (e) {
          submitBtn.disabled = false;
          btnText.style.display = 'block';
          btnSpinner.style.display = 'none';
          import('../store.js').then(({ showToast }) => showToast(e.message || 'Payment failed', 'error'));
        }
      });
    }
  };
}
