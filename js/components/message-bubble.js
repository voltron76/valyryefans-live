// ============================================================
// ValyryesFans — Message Bubble Component
// ============================================================

export function renderMessageBubble(msg) {
  const isSent = msg.sender === 'fan';
  const bubbleClass = isSent ? 'message-bubble--sent' : 'message-bubble--received';
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
      <div class="message-bubble ${bubbleClass}" style="border: 1px solid var(--accent-subtle); background: var(--accent-subtle);">
        <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-1);font-size:var(--text-xs);color:var(--accent-light);font-weight:600;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> Request
        </div>
        ${mediaHtml}
        <div>${msg.content}</div>
        <div class="message-time">${msg.time}</div>
      </div>`;
  }

  return `
    <div class="message-bubble ${bubbleClass}">
      ${mediaHtml}
      <div>${msg.content}</div>
      <div class="message-time">${msg.time}</div>
    </div>
  `;
}
