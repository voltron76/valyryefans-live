// ============================================================
// ValyryesFans — Messages View
// Single direct chat with Valyrye
// ============================================================

import { getState, canAccessTier, showToast, addMessage, tipPost, markMessageNotificationsAsRead, subscribe, markFanMessagesAsRead, sendTypingIndicator } from '../store.js';
import { navigate } from '../router.js';

const icons = {
  send: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  lock: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  star: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  request: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  photo: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  video: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
};

const verifiedBadgeSvg = '<span class="verified-badge"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span>';

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function renderMessageBubble(msg) {
  const isSent = msg.sender === 'fan';
  const isRequest = msg.type === 'request';

  let mediaHtml = '';
  if (msg.mediaUrl) {
    const isVideo = msg.mediaUrl.toLowerCase().endsWith('.mp4') || msg.mediaUrl.toLowerCase().endsWith('.mov') || msg.mediaUrl.toLowerCase().endsWith('.webm');
    if (isVideo) {
      mediaHtml = `<div class="message-media"><video src="${msg.mediaUrl}" controls class="message-video"></video></div>`;
    } else {
      mediaHtml = `<div class="message-media"><img src="${msg.mediaUrl}" alt="Media attachment" class="message-img"></div>`;
    }
  }

  if (isRequest) {
    return `
      <div class="message-bubble message-bubble--${isSent ? 'sent' : 'received'}" style="border: 1px solid var(--accent-subtle); background: var(--accent-subtle);">
        <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-1);font-size:var(--text-xs);color:var(--accent-light);font-weight:600;">
          ${icons.request} Request
        </div>
        ${mediaHtml}
        <div>${msg.content}</div>
        <div class="message-time">${msg.time}</div>
      </div>`;
  }

  const s = getState();
  const isGoldUser = s.currentTier === 'gold';
  const senderName = isSent ? (s.user?.name || 'You') : 'Valyryes';
  const nameHtml = isSent && isGoldUser
    ? `<div style="font-size:var(--text-xs);font-weight:600;margin-bottom:2px;display:flex;align-items:center;gap:2px;color:var(--text-secondary);">${senderName}${verifiedBadgeSvg}</div>`
    : '';

  return `
    <div class="message-bubble message-bubble--${isSent ? 'sent' : 'received'}">
      ${nameHtml}
      ${mediaHtml}
      <div>${escapeHtml(msg.content)}</div>
      <div class="message-time">${msg.time}${isSent ? `<span style="margin-left:4px;font-size:10px;${msg.read ? 'color:var(--accent-light);' : 'opacity:0.6;'}">${msg.read ? '✓✓' : '✓'}</span>` : ''}</div>
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
            <p class="paywall-overlay__text">Create an account or sign in to access direct messaging with Valyryes.</p>
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
            <p class="paywall-overlay__text">Direct messaging is available to Gold subscribers. Upgrade your plan to start chatting with Valyryes.</p>
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
      <main class="chat-area" style="display:flex;flex-direction:column;max-width:1200px;margin:0 auto;width:100%;box-shadow:var(--shadow-lg);border-left:1px solid var(--border-light);border-right:1px solid var(--border-light);">

        <!-- Chat Header -->
        <div class="chat-header" style="background:var(--glass-card-bg);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--glass-card-border);padding:var(--space-4) var(--space-6);display:flex;align-items:center;gap:var(--space-4);">
          <div style="position:relative;flex-shrink:0;">
            <img src="assets/images/avatar.jpg" alt="Valyryes" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid var(--accent);">
            <span style="position:absolute;bottom:2px;right:2px;width:10px;height:10px;border-radius:50%;background:#4ade80;border:2px solid var(--bg-primary);"></span>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;font-size:var(--text-lg);color:var(--text-primary);display:flex;align-items:center;gap:var(--space-2);">
              Valyryes
              <span class="tier-badge" style="font-size:var(--text-xs);">👑 Creator</span>
            </div>
            <div style="font-size:var(--text-xs);color:var(--text-muted);display:flex;align-items:center;gap:var(--space-1);">
              @valyryes · ${state.creatorProfile.online ? '<span style="color:#4ade80;">● Online now</span>' : '<span style="color:var(--text-muted);">○ Offline</span>'}
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
              <input type="file" id="message-photo-input" accept="image/*" style="display:none;">
              <input type="file" id="message-video-input" accept="video/*" style="display:none;">
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

  let storeUnsubscribe = null;
  let typingUnsub = null;
  let msgReadUnsub = null;

  return {
    html,
    afterRender() {
      // Clear message notifications
      markMessageNotificationsAsRead();
      markFanMessagesAsRead();

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

      // ---- Real-time Store Subscription ----
      storeUnsubscribe = subscribe(['messages'], (newState) => {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
          const typingIndicatorEl = document.getElementById('typing-indicator');
          const isTypingVisible = typingIndicatorEl?.style.display || 'none';
          
          const dateSepHtml = `
            <div style="text-align:center;color:var(--text-muted);font-size:var(--text-xs);padding:var(--space-4) 0;">
              <span style="background:var(--bg-elevated);padding:var(--space-1) var(--space-3);border-radius:var(--radius-full);border:1px solid var(--border-light);">Today</span>
            </div>
          `;
          const bubblesHtml = newState.messages.map(m => renderMessageBubble(m)).join('');
          
          messagesContainer.innerHTML = dateSepHtml + bubblesHtml + `
            <div class="typing-indicator" id="typing-indicator" style="display:${isTypingVisible};">
              <span></span><span></span><span></span>
            </div>
          `;
          
          scrollToBottom();
        }
      });

      // ---- Typing state subscription ----
      typingUnsub = subscribe(['typing'], (s) => {
        const typingEl = document.getElementById('typing-indicator');
        if (typingEl) {
          typingEl.style.display = s.creatorTyping ? 'flex' : 'none';
        }
      });

      // ---- Mark incoming messages as read ----
      msgReadUnsub = subscribe(['messages'], (s) => {
        const hasUnread = s.messages.some(m => m.sender === 'valyryes' && !m.read);
        if (hasUnread) markFanMessagesAsRead();
      });

      // ---- Typing broadcast on input ----
      let typingTimer = null;
      chatInput?.addEventListener('input', () => {
        sendTypingIndicator(true);
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => sendTypingIndicator(false), 2000);
      });

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
        chatInput.value = '';
        sendTypingIndicator(false);
        await addMessage(text);
        // Realtime handler will append the message and scroll
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

      // ── Media Attachments Wiring ──
      const photoBtn = document.getElementById('attach-photo-btn');
      const videoBtn = document.getElementById('attach-video-btn');
      const photoInput = document.getElementById('message-photo-input');
      const videoInput = document.getElementById('message-video-input');

      photoBtn?.addEventListener('click', () => photoInput?.click());
      videoBtn?.addEventListener('click', () => videoInput?.click());

      const handleMediaUpload = async (input, isVideo) => {
        if (!input?.files?.length) return;
        const file = input.files[0];
        
        try {
          showToast('Uploading media...', 'info');
          
          const fileExt = file.name.split('.').pop();
          const fileName = `chat_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
          const filePath = `chat/${fileName}`;
          
          const { supabase } = await import('../supabase.js');
          const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
          
          if (uploadError) {
            console.error(uploadError);
            throw new Error('Failed to upload file to storage');
          }
          
          const { data } = supabase.storage.from('media').getPublicUrl(filePath);
          const mediaUrl = data.publicUrl;
          
          const msgText = isVideo ? '🎬 Sent a video' : '📸 Sent a photo';
          await addMessage(msgText, 'media', mediaUrl);
          
          input.value = '';
          
        } catch (e) {
          showToast(e.message || 'Media upload failed', 'error');
        }
      };

      photoInput?.addEventListener('change', () => handleMediaUpload(photoInput, false));
      videoInput?.addEventListener('change', () => handleMediaUpload(videoInput, true));

      // ── Custom Request Modal ──
      function openRequestModal(config) {
        const modalHtml = `
          <div class="paywall-overlay active" id="request-modal" style="position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.85); height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
            <div class="card-glass" style="max-width: 450px; width: 90%; text-align: left; position: relative; padding: var(--space-6); border: 1px solid var(--glass-card-border); border-radius: var(--radius-xl); background: var(--glass-card-bg); box-shadow: var(--glass-card-shadow);">
              <button class="paywall-overlay__close" id="close-request-modal" style="position:absolute; top:var(--space-4); right:var(--space-4); background:none; border:none; color:var(--text-muted); cursor:pointer;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div style="font-size: 32px; margin-bottom: var(--space-3);">${config.icon}</div>
              <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-2); color: var(--text-primary); font-weight:600;">${config.title}</h2>
              <p style="color: var(--text-secondary); margin-bottom: var(--space-4); font-size: var(--text-sm);">Describe what you want Valyryes to create, and select the price you want to offer (minimum $${config.minAmount}).</p>
              
              <div class="form-group" style="margin-bottom: var(--space-4);">
                <label class="form-label" style="font-weight:600; font-size:12px; margin-bottom: 6px; display:block;">Request Description</label>
                <textarea id="request-description" class="form-input" rows="4" placeholder="Tell Valyryes in detail what you want..." style="resize:none; font-size: var(--text-sm); width: 100%; box-sizing: border-box; padding:var(--space-2) var(--space-3); border-radius:var(--radius-md); border:1px solid var(--border); background:var(--bg-input); color:var(--text-primary); outline:none;"></textarea>
              </div>

              <div class="form-group" style="margin-bottom: var(--space-4);">
                <label class="form-label" style="font-weight:600; font-size:12px; margin-bottom: 6px; display:block;">Offer Amount ($)</label>
                <div style="display:flex; gap:var(--space-2); margin-bottom:var(--space-2); flex-wrap:wrap;">
                  ${config.presets.map((amount, idx) => `
                    <button class="btn btn-secondary btn-sm req-preset-btn ${idx === 0 ? 'btn-primary' : ''}" data-amount="${amount}">$${amount}</button>
                  `).join('')}
                </div>
                <div style="display:flex; align-items:center; gap:var(--space-2);">
                  <span style="color:var(--text-muted); font-size:var(--text-sm);">$</span>
                  <input type="number" id="request-custom-amount" class="form-input" placeholder="Custom offer amount" min="${config.minAmount}" style="padding:var(--space-2); font-size:var(--text-sm); flex:1; box-sizing: border-box; border-radius:var(--radius-md); border:1px solid var(--border); background:var(--bg-input); color:var(--text-primary); outline:none;">
                </div>
              </div>
              
              <button class="btn btn-primary w-full" id="request-submit-btn" style="justify-content:center; margin-top:var(--space-4);">Send Request & Offer</button>
            </div>
          </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById('request-modal');
        const closeBtn = document.getElementById('close-request-modal');
        const submitBtn = document.getElementById('request-submit-btn');
        const descInput = document.getElementById('request-description');
        const customAmtInput = document.getElementById('request-custom-amount');
        const presetBtns = modal.querySelectorAll('.req-preset-btn');
        
        let selectedAmount = config.presets[0];
        
        const removeModal = () => {
          modal?.remove();
        };
        
        closeBtn?.addEventListener('click', removeModal);
        modal?.addEventListener('click', (e) => {
          if (e.target === modal) removeModal();
        });
        
        presetBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            selectedAmount = parseFloat(btn.dataset.amount);
            if (customAmtInput) customAmtInput.value = '';
            presetBtns.forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-secondary'); });
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
          });
        });
        
        customAmtInput?.addEventListener('input', () => {
          selectedAmount = null;
          presetBtns.forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-secondary'); });
        });
        
        submitBtn?.addEventListener('click', async () => {
          const desc = descInput?.value?.trim();
          if (!desc) {
            showToast('Please describe your request', 'error');
            return;
          }
          
          const finalAmount = selectedAmount || parseFloat(customAmtInput?.value);
          if (!finalAmount || finalAmount < config.minAmount) {
            showToast(`Minimum offer is $${config.minAmount}`, 'error');
            return;
          }
          
          const state = getState();
          removeModal();
          
          // Monetize: process tip (saved card or Stripe checkout redirect)
          const res = await tipPost(
            null, 
            finalAmount, 
            `Request: ${config.label} - ${desc}`, 
            '#/messages'
          );

          if (res && res.success && !res.redirecting) {
            // Send request bubble (only for instant payments - for Stripe redirects, the DB trigger handles it)
            const messageContent = `
              <strong>${config.icon} ${config.label} Sent</strong><br>
              <span style="color: var(--text-secondary); font-size: 13px; display: block; margin-top: 4px;">"${escapeHtml(desc)}"</span>
              <div style="margin-top: 8px; font-weight: 600; color: #ffd700; display: flex; align-items: center; gap: 4px;">
                <span>💰 Offer:</span>
                <span style="font-size: 15px;">$${finalAmount.toFixed(2)}</span>
              </div>
            `;
            
            await addMessage(messageContent, 'request');
          }
        });
      }

      // ── Quick actions ──
      document.getElementById('quick-actions')?.addEventListener('click', async (e) => {
        const btn = e.target.closest('.quick-action-btn');
        if (!btn) return;

        const action = btn.dataset.action;

        if (action === 'tip') {
          if (tipUI) {
            tipUI.style.display = tipUI.style.display === 'none' ? 'block' : 'none';
          }
          return;
        }

        const requestConfig = {
          photo: {
            title: '📸 Request Custom Photo',
            icon: '📸',
            minAmount: 15,
            presets: [15, 25, 50],
            label: 'Photo Request'
          },
          video: {
            title: '🎬 Request Custom Video',
            icon: '🎬',
            minAmount: 30,
            presets: [30, 50, 100],
            label: 'Video Request'
          },
          custom: {
            title: '⭐ Request Custom Content',
            icon: '⭐',
            minAmount: 50,
            presets: [50, 100, 200],
            label: 'Custom Request'
          }
        };

        const config = requestConfig[action];
        if (config) {
          openRequestModal(config);
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
        const amount = selectedTipAmount || parseFloat(tipCustomAmount?.value);
        if (!amount || amount <= 0) {
          showToast('Please select or enter a tip amount', 'error');
          return;
        }

        const tipMsg = tipMessageInput?.value?.trim() || '';

        // Close tip UI & reset
        if (tipUI) tipUI.style.display = 'none';
        selectedTipAmount = null;
        if (tipCustomAmount) tipCustomAmount.value = '';
        if (tipMessageInput) tipMessageInput.value = '';
        document.querySelectorAll('.tip-preset').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });

        const res = await tipPost(null, amount, tipMsg, '#/messages');

        if (res && res.success && !res.redirecting) {
          // Tip processed successfully — realtime will handle any creator response
        }
      });
    },

    cleanup() {
      if (storeUnsubscribe) storeUnsubscribe();
      if (typingUnsub) typingUnsub();
      if (msgReadUnsub) msgReadUnsub();
    }
  };
}
