// ============================================================
// ValyryeFans — Messages View
// Single direct chat with Valyrye
// ============================================================

import { getState, canAccessTier, showToast, addMessage, getRandomReply, addTip } from '../store.js';
import { navigate } from '../router.js';

const icons = {
  send: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  lock: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  star: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  request: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  photo: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  video: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
};

function renderMessageBubble(msg) {
  const isSent = msg.sender === 'fan';
  const isRequest = msg.type === 'request';

  if (isRequest) {
    return `
      <div class="message-bubble message-bubble--${isSent ? 'sent' : 'received'}" style="border: 1px solid var(--accent-subtle); background: var(--accent-subtle);">
        <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-1);font-size:var(--text-xs);color:var(--accent-light);font-weight:600;">
          ${icons.request} Request
        </div>
        <div>${msg.content}</div>
        <div class="message-time">${msg.time}</div>
      </div>`;
  }

  return `
    <div class="message-bubble message-bubble--${isSent ? 'sent' : 'received'}">
      <div>${msg.content}</div>
      <div class="message-time">${msg.time}</div>
    </div>`;
}

export function renderMessages() {
  const state = getState();
  const { isAuthenticated, messages } = state;

  // ── Auth gate ──
  if (!isAuthenticated) {
    return {
      html: `
        <div style="min-height: calc(100vh - var(--nav-height)); display: flex; align-items: center; justify-content: center;">
          <div class="paywall-overlay animate-fade-in-up">
            <div class="paywall-overlay__icon animate-pulse-glow">${icons.lock}</div>
            <h2 class="paywall-overlay__title font-display">Sign In to Message</h2>
            <p class="paywall-overlay__text">Create an account or sign in to access direct messaging with Valyrye.</p>
            <button class="btn btn-primary btn-lg" id="msg-auth-btn">
              ${icons.star} Sign In
            </button>
            <p style="margin-top: var(--space-4); font-size: var(--text-sm); color: var(--text-muted);">
              Messaging is available with the <span style="color: var(--accent-light);">Gold</span> subscription
            </p>
          </div>
        </div>`,
      afterRender() {
        document.getElementById('msg-auth-btn')?.addEventListener('click', () => {
          import('../main.js').then(({ openAuthModal }) => openAuthModal('login'));
        });
      },
      cleanup() {}
    };
  }

  // ── Tier gate ──
  if (!canAccessTier('gold')) {
    return {
      html: `
        <div style="min-height: calc(100vh - var(--nav-height)); display: flex; align-items: center; justify-content: center;">
          <div class="paywall-overlay animate-fade-in-up">
            <div class="paywall-overlay__icon animate-pulse-glow">💬</div>
            <h2 class="paywall-overlay__title font-display">Upgrade to Message</h2>
            <p class="paywall-overlay__text">Direct messaging is available to Gold subscribers. Upgrade your plan to start chatting with Valyrye.</p>
            <a href="#/subscribe" class="btn btn-primary btn-lg">
              ${icons.star} Upgrade Plan
            </a>
          </div>
        </div>`,
      afterRender() {},
      cleanup() {}
    };
  }

  // ── Main chat UI ──
  const html = `
    <div class="messages-layout" style="display: flex !important; flex-direction:column; background: var(--bg-primary); width: 100%;">
      <main class="chat-area" style="display:flex;flex-direction:column;height:calc(100vh - var(--nav-height));max-width:1200px;margin:0 auto;width:100%;box-shadow:var(--shadow-lg);border-left:1px solid var(--border-light);border-right:1px solid var(--border-light);">

        <!-- Chat Header -->
        <div class="chat-header" style="background:var(--glass-card-bg);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--glass-card-border);padding:var(--space-4) var(--space-6);display:flex;align-items:center;gap:var(--space-4);">
          <div style="position:relative;flex-shrink:0;">
            <img src="assets/images/avatar.jpg" alt="Valyrye" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid var(--accent);">
            <span style="position:absolute;bottom:2px;right:2px;width:10px;height:10px;border-radius:50%;background:#4ade80;border:2px solid var(--bg-primary);"></span>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;font-size:var(--text-lg);color:var(--text-primary);display:flex;align-items:center;gap:var(--space-2);">
              Valyrye
              <span class="tier-badge" style="font-size:var(--text-xs);">👑 Creator</span>
            </div>
            <div style="font-size:var(--text-xs);color:var(--text-muted);display:flex;align-items:center;gap:var(--space-1);">
              @valyrye · <span style="width:8px;height:8px;border-radius:50%;background:#4ade80;display:inline-block;"></span> Online now
            </div>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="chat-messages" id="chat-messages" style="flex:1;overflow-y:auto;padding:var(--space-4) var(--space-6);">
          <!-- Date separator -->
          <div style="text-align:center;color:var(--text-muted);font-size:var(--text-xs);padding:var(--space-4) 0;">
            <span style="background:var(--bg-elevated);padding:var(--space-1) var(--space-3);border-radius:var(--radius-full);border:1px solid var(--border-light);">Today</span>
          </div>
          ${messages.map(m => renderMessageBubble(m)).join('')}

          <!-- Typing indicator -->
          <div class="typing-indicator" id="typing-indicator" style="display:none;">
            <span></span><span></span><span></span>
          </div>
        </div>

        <!-- Tip UI (hidden by default) -->
        <div id="tip-ui" style="display:none;padding:var(--space-3) var(--space-6);background:var(--glass-card-bg);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-top:1px solid var(--glass-card-border);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3);">
            <div style="font-weight:600;font-size:var(--text-sm);color:var(--text-primary);">💝 Send a Tip</div>
            <button class="btn btn-ghost btn-sm" id="tip-close" style="padding:var(--space-1) var(--space-2);font-size:var(--text-xs);">✕</button>
          </div>
          <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-3);flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm tip-preset" data-amount="5">$5</button>
            <button class="btn btn-secondary btn-sm tip-preset" data-amount="10">$10</button>
            <button class="btn btn-secondary btn-sm tip-preset" data-amount="25">$25</button>
            <button class="btn btn-secondary btn-sm tip-preset" data-amount="50">$50</button>
            <div style="display:flex;align-items:center;gap:var(--space-1);flex:1;min-width:80px;">
              <span style="color:var(--text-muted);font-size:var(--text-sm);">$</span>
              <input type="number" id="tip-custom-amount" class="form-input" placeholder="Custom" min="1" style="padding:var(--space-1) var(--space-2);font-size:var(--text-sm);width:100%;">
            </div>
          </div>
          <div class="form-group" style="margin-bottom:var(--space-3);">
            <input type="text" id="tip-message" class="form-input" placeholder="Add a message (optional)" style="font-size:var(--text-sm);">
          </div>
          <button class="btn btn-primary w-full btn-sm" id="tip-send-btn">Send Tip</button>
        </div>

        <!-- Quick Actions -->
        <div class="chat-quick-actions" id="quick-actions" style="padding:var(--space-2) var(--space-6);display:flex;gap:var(--space-2);overflow-x:auto;border-top:1px solid var(--border-light);">
          <button class="quick-action-btn" data-action="photo">📸 Request Photo</button>
          <button class="quick-action-btn" data-action="video">🎬 Request Video</button>
          <button class="quick-action-btn" data-action="tip">💝 Send Tip</button>
          <button class="quick-action-btn" data-action="custom">⭐ Custom Request</button>
        </div>

        <!-- Input Area -->
        <div class="chat-input-area" style="padding:var(--space-3) var(--space-6);border-top:1px solid var(--border-light);background:var(--glass-card-bg);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);">
          <div class="chat-input-wrapper" style="display:flex;align-items:flex-end;gap:var(--space-3);background:var(--bg-input);padding:var(--space-2);border-radius:var(--radius-xl);border:1px solid var(--border);">
            <div style="display:flex;gap:var(--space-1);padding-bottom:var(--space-1);">
              <button class="btn btn-ghost btn-icon" id="attach-photo-btn" aria-label="Attach Photo" title="Send Picture">${icons.photo}</button>
              <button class="btn btn-ghost btn-icon" id="attach-video-btn" aria-label="Attach Video" title="Send Video">${icons.video}</button>
            </div>
            <textarea class="chat-input" id="chat-input" placeholder="Type a message…" rows="1" style="background:transparent;border:none;flex:1;outline:none;color:var(--text-primary);resize:none;min-height:36px;padding:var(--space-2) 0;font-family:inherit;"></textarea>
            <button class="chat-send-btn" id="chat-send-btn" aria-label="Send message" style="background:var(--accent);color:#fff;border:none;border-radius:var(--radius-full);width:40px;height:40px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;">
              ${icons.send}
            </button>
          </div>
        </div>
      </main>
    </div>`;

  let replyTimeout = null;

  return {
    html,
    afterRender() {
      const chatMessages = document.getElementById('chat-messages');
      const chatInput = document.getElementById('chat-input');
      const sendBtn = document.getElementById('chat-send-btn');
      const typingIndicator = document.getElementById('typing-indicator');
      const tipUI = document.getElementById('tip-ui');
      const tipCloseBtn = document.getElementById('tip-close');
      const tipSendBtn = document.getElementById('tip-send-btn');
      const tipCustomAmount = document.getElementById('tip-custom-amount');
      const tipMessageInput = document.getElementById('tip-message');
      let selectedTipAmount = null;

      // ── Scroll to bottom ──
      function scrollToBottom() {
        if (chatMessages) {
          requestAnimationFrame(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
          });
        }
      }
      scrollToBottom();

      // ── Append a bubble to DOM ──
      function appendBubble(msg, animate = true) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = renderMessageBubble(msg);
        const bubble = wrapper.firstElementChild;
        if (animate) bubble.classList.add('animate-fade-in-up');
        chatMessages?.insertBefore(bubble, typingIndicator);
        scrollToBottom();
      }

      // ── Send message ──
      async function sendMessage() {
        const text = chatInput?.value?.trim();
        if (!text) return;

        // Add to store & render
        const msg = await addMessage(text, 'fan');
        if (!msg) return;
        appendBubble(msg);
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // Show typing indicator
        if (typingIndicator) {
          typingIndicator.style.display = 'flex';
          scrollToBottom();
        }

        // Auto-reply after 2-3s
        const delay = 2000 + Math.random() * 1000;
        replyTimeout = setTimeout(async () => {
          if (typingIndicator) typingIndicator.style.display = 'none';
          const replyContent = getRandomReply();
          const replyMsg = await addMessage(replyContent, 'valyrye');
          if (!replyMsg) return;
          appendBubble(replyMsg);
        }, delay);
      }

      sendBtn?.addEventListener('click', sendMessage);

      chatInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });

      // ── Auto-resize textarea ──
      chatInput?.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
      });

      // ── Quick actions ──
      document.getElementById('quick-actions')?.addEventListener('click', async (e) => {
        const btn = e.target.closest('.quick-action-btn');
        if (!btn) return;

        const action = btn.dataset.action;

        if (action === 'tip') {
          // Toggle tip UI
          if (tipUI) {
            tipUI.style.display = tipUI.style.display === 'none' ? 'block' : 'none';
          }
          return;
        }

        const requestMessages = {
          photo: '📸 I\'d love to request a custom photo set!',
          video: '🎬 Could you make a special video for me?',
          custom: '⭐ I have a custom content request!',
        };

        if (requestMessages[action]) {
          const msg = await addMessage(requestMessages[action], 'fan', 'request');
          if (!msg) return;
          appendBubble(msg);

          // Auto-reply
          if (typingIndicator) {
            typingIndicator.style.display = 'flex';
            scrollToBottom();
          }
          const delay = 2000 + Math.random() * 1000;
          replyTimeout = setTimeout(async () => {
            if (typingIndicator) typingIndicator.style.display = 'none';
            const replyContent = getRandomReply();
            const replyMsg = await addMessage(replyContent, 'valyrye');
            if (!replyMsg) return;
            appendBubble(replyMsg);
          }, delay);
        }
      });

      // ── Tip UI ──
      tipCloseBtn?.addEventListener('click', () => {
        if (tipUI) tipUI.style.display = 'none';
        selectedTipAmount = null;
        if (tipCustomAmount) tipCustomAmount.value = '';
        if (tipMessageInput) tipMessageInput.value = '';
        // Clear active state on presets
        document.querySelectorAll('.tip-preset').forEach(b => b.classList.remove('btn-primary'));
        document.querySelectorAll('.tip-preset').forEach(b => b.classList.add('btn-secondary'));
      });

      // Preset amount buttons
      document.querySelectorAll('.tip-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedTipAmount = parseFloat(btn.dataset.amount);
          if (tipCustomAmount) tipCustomAmount.value = '';
          // Visual active state
          document.querySelectorAll('.tip-preset').forEach(b => {
            b.classList.remove('btn-primary');
            b.classList.add('btn-secondary');
          });
          btn.classList.remove('btn-secondary');
          btn.classList.add('btn-primary');
        });
      });

      // Custom amount clears preset selection
      tipCustomAmount?.addEventListener('input', () => {
        selectedTipAmount = null;
        document.querySelectorAll('.tip-preset').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
      });

      // Send tip
      tipSendBtn?.addEventListener('click', async () => {
        const state = getState();
        const hasCard = state.user?.tier === 'gold';
        
        const amount = selectedTipAmount || parseFloat(tipCustomAmount?.value);
        if (!amount || amount <= 0) {
          showToast('Please select or enter a tip amount', 'error');
          return;
        }

        if (!hasCard) {
          navigate(`/checkout?tip=${amount}`);
          return;
        }

        const tipMsg = tipMessageInput?.value?.trim() || '';

        // Record the tip
        addTip(null, amount, tipMsg);
        showToast('💝 Tip sent! Thank you!');

        // Send as a chat message
        const content = tipMsg
          ? `💝 Sent a $${amount} tip! "${tipMsg}"`
          : `💝 Sent a $${amount} tip!`;
        const msg = await addMessage(content, 'fan');
        if (!msg) return;
        appendBubble(msg);

        // Close tip UI & reset
        if (tipUI) tipUI.style.display = 'none';
        selectedTipAmount = null;
        if (tipCustomAmount) tipCustomAmount.value = '';
        if (tipMessageInput) tipMessageInput.value = '';
        document.querySelectorAll('.tip-preset').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });

        // Auto-reply
        if (typingIndicator) {
          typingIndicator.style.display = 'flex';
          scrollToBottom();
        }
        replyTimeout = setTimeout(async () => {
          if (typingIndicator) typingIndicator.style.display = 'none';
          const replyMsg = await addMessage('Omg thank you so much! You\'re incredibly generous! 💕🥰', 'valyrye');
          if (!replyMsg) return;
          appendBubble(replyMsg);
        }, 1500);
      });
    },

    cleanup() {
      if (replyTimeout) clearTimeout(replyTimeout);
    }
  };
}
