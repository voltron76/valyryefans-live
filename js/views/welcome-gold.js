// ============================================================
// ValyryesFans — Welcome Gold View
// Post-upgrade celebration and webhook confirmation page
// ============================================================

import { getState, showToast, initStore } from '../store.js';
import { navigate } from '../router.js';

const benefits = [
  {
    emoji: '📸',
    title: '200+ Exclusive Photos',
    description: 'Access the complete collection',
  },
  {
    emoji: '💬',
    title: 'Direct Messaging',
    description: 'Chat with Valyryes directly',
  },
  {
    emoji: '🎨',
    title: 'Custom Requests',
    description: 'Request personalized content',
  },
  {
    emoji: '⚡',
    title: 'Priority Access',
    description: 'First to see new drops',
  },
];

function generateConfettiParticles(count = 50) {
  let particles = '';
  const colors = [
    'var(--accent)',
    'var(--accent-light)',
    'var(--accent-dark)',
    'var(--text-primary)',
    'var(--success)',
  ];
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100;
    const delay = Math.random() * 3;
    const duration = 3 + Math.random() * 4;
    const size = 4 + Math.random() * 8;
    const colorIdx = Math.floor(Math.random() * colors.length);
    const rotation = Math.random() * 360;
    const shape = Math.random() > 0.5 ? 'border-radius: 50%;' : `border-radius: 2px; transform: rotate(${rotation}deg);`;
    particles += `<div class="confetti-particle" style="
      left: ${left}%;
      width: ${size}px;
      height: ${size * (0.5 + Math.random() * 0.8)}px;
      background: ${colors[colorIdx]};
      animation-delay: ${delay}s;
      animation-duration: ${duration}s;
      ${shape}
    "></div>`;
  }
  return particles;
}

export function renderWelcomeGold() {
  const state = getState();
  const isUpgraded = state.currentTier === 'gold' || state.isAdmin;

  if (!isUpgraded) {
    // ------------------------------------
    // Loading/Confirmation State (Race condition handling)
    // ------------------------------------
    const html = `
      <div style="min-height: calc(100vh - var(--nav-height)); display: flex; align-items: center; justify-content: center; padding: var(--space-6);">
        <div class="card-glass" style="max-width: 450px; width: 100%; text-align: center; padding: var(--space-12) var(--space-8); border-radius: var(--radius-2xl); border: 1px solid var(--glass-border);">
          <div class="spinner-gold" style="
            width: 60px;
            height: 60px;
            border: 4px solid var(--accent-subtle);
            border-top-color: var(--accent);
            border-radius: 50%;
            margin: 0 auto var(--space-8);
            animation: spin 1s linear infinite;
          "></div>
          <h1 class="font-display" style="font-size: var(--text-2xl); margin-bottom: var(--space-4);">Confirming Payment...</h1>
          <p style="color: var(--text-secondary); margin-bottom: var(--space-6); font-size: var(--text-sm); line-height: 1.6;">
            Stripe is finalizing your upgrade. This usually takes just a few seconds. We will automatically activate your VIP access.
          </p>
          <div id="confirm-status-text" style="font-size: var(--text-xs); color: var(--text-muted);">Connecting to server...</div>
          
          <button id="force-check-btn" class="btn btn-secondary btn-sm" style="margin-top: var(--space-6); display: none;">
            🔄 Check Status Manually
          </button>
        </div>
      </div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;

    let checkInterval = null;

    return {
      html,
      afterRender() {
        let attempts = 0;
        const maxAttempts = 10; // ~15 seconds total

        const checkStatus = async () => {
          attempts++;
          const statusText = document.getElementById('confirm-status-text');
          if (statusText) {
            statusText.textContent = `Checking activation status (attempt ${attempts}/${maxAttempts})...`;
          }

          try {
            const { supabase } = await import('../supabase.js');
            const sessionRes = await supabase.auth.getSession();
            const userId = sessionRes.data?.session?.user?.id;

            if (userId) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('tier')
                .eq('id', userId)
                .single();

              if (profile && (profile.tier === 'gold' || profile.tier === 'admin')) {
                if (checkInterval) clearInterval(checkInterval);
                showToast('🎉 Your Gold account is active!', 'success');
                // Refresh global store state
                await initStore();
                // Reload page to show celebration
                navigate('/welcome-gold');
                return true;
              }
            }
          } catch (e) {
            console.error('Error during status check:', e);
          }

          if (attempts >= maxAttempts) {
            if (checkInterval) clearInterval(checkInterval);
            if (statusText) {
              statusText.innerHTML = `
                <span style="color: var(--error); font-weight: 600;">Finalizing is taking a bit longer than expected.</span><br>
                If your card was charged, your account will activate shortly. Please refresh the page or check your profile in a minute.
              `;
            }
            const forceCheckBtn = document.getElementById('force-check-btn');
            if (forceCheckBtn) {
              forceCheckBtn.style.display = 'inline-flex';
              forceCheckBtn.onclick = () => {
                attempts = 0;
                forceCheckBtn.style.display = 'none';
                checkStatus();
                // Restart polling
                checkInterval = setInterval(checkStatus, 1500);
              };
            }
          }
          return false;
        };

        // Run check immediately, then poll
        checkStatus();
        checkInterval = setInterval(checkStatus, 1500);
      },
      cleanup() {
        if (checkInterval) {
          clearInterval(checkInterval);
        }
      }
    };
  }

  // ------------------------------------
  // Celebration State (Gold Tier Confirmed)
  // ------------------------------------
  const html = `
    <div style="min-height: calc(100vh - var(--nav-height)); position: relative; overflow: hidden;">

      <!-- Confetti Container -->
      <div class="confetti-container" id="confetti-container">
        ${generateConfettiParticles(50)}
      </div>

      <div class="section" style="text-align: center; padding-top: var(--space-16); position: relative; z-index: 1;">

        <!-- Crown / Sparkle Animation -->
        <div class="animate-fade-in-up stagger-1" style="margin-bottom: var(--space-6);">
          <div class="welcome-crown-anim" style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100px;
            height: 100px;
            border-radius: var(--radius-full);
            background: var(--accent-subtle);
            border: 3px solid var(--border-accent);
            font-size: 3rem;
            animation: crownPulse 2s ease-in-out infinite;
            box-shadow: var(--shadow-glow-lg);
          ">
            👑
          </div>
        </div>

        <!-- Heading -->
        <h1 class="font-display animate-fade-in-up stagger-2" style="font-size: var(--text-4xl); margin-bottom: var(--space-4);">
          Welcome to <span class="text-gradient">Gold!</span>
        </h1>

        <p class="animate-fade-in-up stagger-3" style="color: var(--text-secondary); font-size: var(--text-lg); max-width: 480px; margin: 0 auto var(--space-12);">
          You've unlocked the ultimate experience ✨
        </p>

        <!-- Benefit Cards Grid -->
        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--space-6);
          max-width: 900px;
          margin: 0 auto var(--space-12);
          padding: 0 var(--space-4);
        ">
          ${benefits.map((b, i) => `
            <div class="card-glass animate-fade-in-up stagger-${Math.min(i + 4, 12)}" style="
              border-radius: var(--radius-xl);
              padding: var(--space-8) var(--space-6);
              text-align: center;
              border: 1px solid var(--glass-border);
              transition: all var(--transition-base);
            " onmouseover="this.style.borderColor='var(--border-accent)';this.style.transform='translateY(-4px)';this.style.boxShadow='var(--shadow-glow)'"
               onmouseout="this.style.borderColor='var(--glass-border)';this.style.transform='translateY(0)';this.style.boxShadow='none'">
              <div style="font-size: 2.5rem; margin-bottom: var(--space-4);">${b.emoji}</div>
              <div style="font-family: var(--font-display); font-size: var(--text-lg); font-weight: 600; margin-bottom: var(--space-2); color: var(--text-primary);">
                ${b.title}
              </div>
              <div style="color: var(--text-muted); font-size: var(--text-sm);">
                ${b.description}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- CTA Buttons -->
        <div class="animate-fade-in-up stagger-8" style="display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap; margin-bottom: var(--space-24);">
          <a href="#/gallery" class="btn btn-primary btn-lg" id="welcome-gallery-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Browse Exclusive Gallery
          </a>
          <a href="#/messages" class="btn btn-secondary btn-lg" id="welcome-messages-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Send a Message
          </a>
        </div>

      </div>
    </div>

    <style>
      @keyframes crownPulse {
        0%, 100% { transform: scale(1); box-shadow: var(--shadow-glow); }
        50% { transform: scale(1.1); box-shadow: var(--shadow-glow-lg); }
      }

      @keyframes confettiFall {
        0% {
          transform: translateY(-10vh) rotate(0deg);
          opacity: 1;
        }
        80% {
          opacity: 1;
        }
        100% {
          transform: translateY(110vh) rotate(720deg);
          opacity: 0;
        }
      }

      @keyframes confettiSway {
        0%, 100% { margin-left: 0; }
        25% { margin-left: 30px; }
        75% { margin-left: -30px; }
      }

      .confetti-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
        z-index: 0;
      }

      .confetti-particle {
        position: absolute;
        top: -20px;
        opacity: 0;
        animation: confettiFall linear forwards, confettiSway 2s ease-in-out infinite;
      }
    </style>
  `;

  return {
    html,
    afterRender() {
      // Navigate via buttons (also works via href, but this enables SPA navigation)
      document.getElementById('welcome-gallery-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/gallery');
      });

      document.getElementById('welcome-messages-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/messages');
      });
    }
  };
}
