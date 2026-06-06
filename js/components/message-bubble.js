// ============================================================
// ValyryeFans — Message Bubble Component
// ============================================================

export function renderMessageBubble(msg) {
  const isSent = msg.sender === 'fan';
  const bubbleClass = isSent ? 'message-bubble--sent' : 'message-bubble--received';

  return `
    <div class="message-bubble ${bubbleClass}">
      <div>${msg.content}</div>
      <div class="message-time">${msg.time}</div>
    </div>
  `;
}
