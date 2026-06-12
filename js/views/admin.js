// ============================================================
// ValyryesFans — Admin Dashboard View
// Secured admin panel for creator (Valyryes) to manage platform
// ============================================================

import { getState, uploadContent, showToast, addAdminReply, createPromo, deletePromo, publishPromo, subscribe, markMessagesAsRead, sendTypingIndicator } from '../store.js';
import { navigate } from '../router.js';
import { supabase } from '../supabase.js';

// ------------------------------------
// SVG Icons (18x18, stroke-based)
// ------------------------------------
const icons = {
  send: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  lock: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  messages: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  content: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  upload: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
  dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  photo: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  video: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
  heart: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  star: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  dollar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  activity: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  filter: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  logout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  close: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  request: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  file: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  spinner: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin"><circle cx="12" cy="12" r="10" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>`,
};

// ------------------------------------
// Helper utilities
// ------------------------------------
function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name) {
  const colors = [
    'var(--accent)', 'var(--accent-dark)', '#8b5cf6', '#06b6d4',
    '#f59e0b', '#ef4444', '#10b981', '#ec4899',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function renderAvatar(name, size = 40) {
  const color = getAvatarColor(name);
  return `<div style="width:${size}px;height:${size}px;border-radius:var(--radius-full);background:${color};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${Math.round(size * 0.36)}px;color:#fff;flex-shrink:0;">${getInitials(name)}</div>`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ------------------------------------
// Admin CSS (inline styles object)
// ------------------------------------
const adminStyles = `
  <style id="admin-styles">
    .admin-pin-overlay {
      min-height: calc(100vh - var(--nav-height));
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
    }
    .admin-pin-card {
      background: var(--glass-card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--glass-card-border);
      border-radius: var(--radius-xl);
      padding: var(--space-10);
      width: 380px;
      max-width: 90vw;
      text-align: center;
      box-shadow: var(--shadow-lg);
    }
    .admin-pin-card h2 {
      color: var(--text-primary);
      margin-bottom: var(--space-2);
    }
    .admin-pin-card p {
      color: var(--text-muted);
      font-size: var(--text-sm);
      margin-bottom: var(--space-6);
    }
    .admin-pin-input {
      width: 180px;
      text-align: center;
      letter-spacing: 12px;
      font-size: var(--text-2xl);
      font-weight: 700;
      padding: var(--space-3) var(--space-4);
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      outline: none;
      transition: border-color 0.2s;
    }
    .admin-pin-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-subtle);
    }
    .admin-pin-input.error {
      border-color: #ef4444;
      animation: shake 0.4s ease-in-out;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-8px); }
      75% { transform: translateX(8px); }
    }

    .admin-layout {
      display: grid;
      grid-template-columns: 240px 1fr;
      height: calc(100vh - var(--nav-height));
      max-height: calc(100vh - var(--nav-height));
      overflow: hidden;
      background: var(--bg-primary);
    }

    /* Sidebar tabs */
    .admin-sidebar {
      background: var(--glass-card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-right: 1px solid var(--glass-card-border);
      display: flex;
      flex-direction: column;
      padding: var(--space-4) 0;
    }
    .admin-sidebar__brand {
      padding: var(--space-4) var(--space-5);
      border-bottom: 1px solid var(--border);
      margin-bottom: var(--space-2);
    }
    .admin-sidebar__brand h3 {
      color: var(--text-primary);
      font-size: var(--text-base);
      margin: 0;
    }
    .admin-sidebar__brand span {
      color: var(--text-muted);
      font-size: var(--text-xs);
    }
    .admin-tab {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-5);
      color: var(--text-secondary);
      font-size: var(--text-sm);
      font-weight: 500;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      transition: all 0.2s;
      border-left: 3px solid transparent;
      position: relative;
    }
    .admin-tab:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    .admin-tab.active {
      background: var(--accent-subtle);
      color: var(--accent);
      border-left-color: var(--accent);
    }
    .admin-tab .tab-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
    }
    .admin-tab .tab-badge {
      margin-left: auto;
      background: var(--accent);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: var(--radius-full);
      min-width: 18px;
      text-align: center;
    }
    .admin-sidebar__footer {
      margin-top: auto;
      padding: var(--space-4) var(--space-5);
      border-top: 1px solid var(--border);
    }

    /* Content panel */
    .admin-content {
      padding: var(--space-6);
      height: 100%;
      max-height: 100%;
      overflow-y: auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }
    .admin-content.admin-content--messages {
      overflow: hidden;
    }

    /* Messages tab */
    .admin-messages-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      flex: 1;
      min-height: 0;
      border-radius: var(--radius-xl);
      overflow: hidden;
      border: 1px solid var(--glass-card-border);
      background: var(--bg-card);
    }
    .admin-user-list {
      background: var(--glass-card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-right: 1px solid var(--glass-card-border);
      overflow-y: auto;
    }
    .admin-user-list__header {
      padding: var(--space-4);
      border-bottom: 1px solid var(--border);
    }
    .admin-user-list__header h3 {
      color: var(--text-primary);
      font-size: var(--text-sm);
      font-weight: 600;
      margin: 0 0 var(--space-2) 0;
    }
    .admin-user-list__search {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: var(--text-xs);
      outline: none;
    }
    .admin-user-list__search:focus {
      border-color: var(--accent);
    }
    .admin-user-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      cursor: pointer;
      transition: background 0.15s;
      border-bottom: 1px solid var(--border-light);
    }
    .admin-user-item:hover {
      background: var(--bg-hover);
    }
    .admin-user-item.active {
      background: var(--accent-subtle);
      border-left: 3px solid var(--accent);
    }
    .admin-user-item__info {
      flex: 1;
      min-width: 0;
    }
    .admin-user-item__name {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .admin-user-item__meta {
      font-size: var(--text-xs);
      color: var(--text-muted);
      margin-top: 2px;
    }
    .admin-user-item__badge {
      background: var(--accent);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      width: 20px;
      height: 20px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* Chat thread */
    .admin-chat {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }
    .admin-chat__header {
      padding: var(--space-4) var(--space-5);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: var(--space-3);
      background: var(--glass-card-bg);
      backdrop-filter: blur(8px);
    }
    .admin-chat__header-info h4 {
      color: var(--text-primary);
      font-size: var(--text-sm);
      font-weight: 600;
      margin: 0;
    }
    .admin-chat__header-info span {
      color: var(--text-muted);
      font-size: var(--text-xs);
    }
    .admin-chat__messages {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: var(--space-4) var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .admin-chat__empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      font-size: var(--text-sm);
    }
    .admin-msg {
      max-width: 70%;
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      font-size: var(--text-sm);
      line-height: 1.5;
      position: relative;
    }
    .admin-msg--fan {
      align-self: flex-start;
      background: var(--bg-elevated);
      color: var(--text-primary);
      border-bottom-left-radius: var(--radius-sm);
    }
    .admin-msg--valyryes {
      align-self: flex-end;
      background: var(--accent);
      color: #fff;
      border-bottom-right-radius: var(--radius-sm);
    }
    .admin-msg--request {
      align-self: flex-start;
      background: linear-gradient(135deg, var(--accent-subtle), transparent);
      border: 1px solid var(--accent);
      color: var(--text-primary);
      border-bottom-left-radius: var(--radius-sm);
    }
    .admin-msg--request::before {
      content: '⭐ Content Request';
      display: block;
      font-size: var(--text-xs);
      font-weight: 700;
      color: var(--accent);
      margin-bottom: var(--space-1);
    }
    .admin-msg__time {
      font-size: 10px;
      opacity: 0.7;
      margin-top: var(--space-1);
    }
    .admin-msg--valyryes .admin-msg__time {
      color: rgba(255,255,255,0.7);
    }
    .admin-chat__input {
      padding: var(--space-3) var(--space-4);
      border-top: 1px solid var(--border);
      display: flex;
      gap: var(--space-2);
      background: var(--glass-card-bg);
    }
    .admin-chat__input textarea {
      flex: 1;
      padding: var(--space-2) var(--space-3);
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: var(--text-sm);
      resize: none;
      outline: none;
      font-family: inherit;
      min-height: 38px;
      max-height: 100px;
    }
    .admin-chat__input textarea:focus {
      border-color: var(--accent);
    }
    .admin-chat__input button {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      background: var(--accent);
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
      flex-shrink: 0;
    }
    .admin-chat__input button:hover {
      opacity: 0.85;
    }

    /* Content manager */
    .admin-content-filters {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
      flex-wrap: wrap;
    }
    .admin-filter-btn {
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: 500;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
    }
    .admin-filter-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
    .admin-filter-btn.active {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }
    .admin-content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-4);
    }
    .admin-content-card {
      background: var(--glass-card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--glass-card-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
    }
    .admin-content-card:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .admin-content-card__thumb {
      width: 100%;
      aspect-ratio: 3/4;
      object-fit: cover;
      background: var(--bg-elevated);
      display: block;
    }
    .admin-content-card__info {
      padding: var(--space-3);
    }
    .admin-content-card__title {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .admin-content-card__meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: var(--space-2);
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    /* Edit modal */
    .admin-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--space-4);
    }
    .admin-modal {
      background: var(--glass-card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--glass-card-border);
      border-radius: var(--radius-xl);
      width: 500px;
      max-width: 95vw;
      max-height: 90vh;
      overflow-y: auto;
      padding: var(--space-6);
      box-shadow: var(--shadow-lg);
    }
    .admin-modal__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-5);
    }
    .admin-modal__header h3 {
      color: var(--text-primary);
      margin: 0;
    }
    .admin-modal__close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      transition: color 0.2s;
    }
    .admin-modal__close:hover {
      color: var(--text-primary);
    }

    /* Upload tab */
    .admin-dropzone {
      border: 2px dashed var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-10) var(--space-6);
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: var(--space-5);
      background: var(--bg-input);
    }
    .admin-dropzone:hover, .admin-dropzone.dragover {
      border-color: var(--accent);
      background: var(--accent-subtle);
    }
    .admin-dropzone__icon {
      color: var(--text-muted);
      margin-bottom: var(--space-3);
    }
    .admin-dropzone__text {
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }
    .admin-dropzone__text span {
      color: var(--accent);
      font-weight: 600;
    }
    .admin-dropzone__file {
      font-size: var(--text-xs);
      color: var(--text-muted);
      margin-top: var(--space-2);
    }

    .admin-radio-group {
      display: flex;
      gap: var(--space-3);
    }
    .admin-radio-option {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      cursor: pointer;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }
    .admin-radio-option input[type="radio"] {
      accent-color: var(--accent);
    }

    /* Dashboard tab */
    .admin-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }
    .admin-stat-card {
      background: var(--glass-card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--glass-card-border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      text-align: center;
    }
    .admin-stat-card__icon {
      width: 42px;
      height: 42px;
      border-radius: var(--radius-md);
      background: var(--accent-subtle);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-3);
    }
    .admin-stat-card__value {
      font-size: var(--text-2xl);
      font-weight: 700;
      color: var(--text-primary);
    }
    .admin-stat-card__label {
      font-size: var(--text-xs);
      color: var(--text-muted);
      margin-top: var(--space-1);
    }

    /* Activity feed */
    .admin-activity-feed {
      background: var(--glass-card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--glass-card-border);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
    }
    .admin-activity-feed h4 {
      color: var(--text-primary);
      font-size: var(--text-sm);
      font-weight: 600;
      margin: 0 0 var(--space-4) 0;
    }
    .admin-activity-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-3) 0;
      border-bottom: 1px solid var(--border-light);
    }
    .admin-activity-item:last-child {
      border-bottom: none;
    }
    .admin-activity-item__content {
      flex: 1;
    }
    .admin-activity-item__text {
      font-size: var(--text-sm);
      color: var(--text-primary);
    }
    .admin-activity-item__text strong {
      color: var(--accent);
    }
    .admin-activity-item__time {
      font-size: var(--text-xs);
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* Chart */
    .admin-chart {
      background: var(--glass-card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--glass-card-border);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
    }
    .admin-chart h4 {
      color: var(--text-primary);
      font-size: var(--text-sm);
      font-weight: 600;
      margin: 0 0 var(--space-4) 0;
    }
    .admin-bar {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }
    .admin-bar__label {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      width: 80px;
      flex-shrink: 0;
      text-align: right;
    }
    .admin-bar__track {
      flex: 1;
      height: 24px;
      background: var(--bg-elevated);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }
    .admin-bar__fill {
      height: 100%;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      padding-left: var(--space-2);
      font-size: 11px;
      font-weight: 600;
      color: #fff;
      transition: width 0.6s ease;
    }

    /* Dashboard grid */
    .admin-dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }
    .admin-two-col-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-6);
      max-width: 1000px;
    }

    /* Tier badge in admin */
    .admin-tier-badge {
      font-size: 9px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .admin-tier-badge--gold {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #fff;
    }
    .admin-tier-badge--free {
      background: var(--bg-elevated);
      color: var(--text-muted);
    }

    @media (max-width: 1024px) {
      .admin-layout {
        grid-template-columns: 1fr;
      }
      .admin-sidebar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        top: auto;
        border-right: none;
        border-top: 1px solid var(--glass-card-border);
        flex-direction: row;
        padding: 0;
        z-index: 100;
        height: auto;
      }
      .admin-sidebar__brand {
        display: none;
      }
      .admin-sidebar__footer {
        display: none;
      }
      .admin-tab {
        flex-direction: column;
        padding: var(--space-2) var(--space-3);
        font-size: 10px;
        border-left: none;
        border-top: 3px solid transparent;
        justify-content: center;
        align-items: center;
        flex: 1;
        gap: var(--space-1);
      }
      .admin-tab.active {
        border-left-color: transparent;
        border-top-color: var(--accent);
      }
      .admin-tab .tab-badge {
        position: absolute;
        top: 2px;
        right: 2px;
        margin-left: 0;
      }
      .admin-content {
        padding-bottom: 70px;
      }
      .admin-messages-layout {
        grid-template-columns: 1fr;
        height: calc(100vh - var(--nav-height) - 70px - var(--space-12));
      }
      .admin-user-list {
        display: none;
      }
      .admin-dashboard-grid {
        grid-template-columns: 1fr;
      }
      .admin-two-col-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
`;

// ------------------------------------
// PIN Authentication Screen
// ------------------------------------
function renderPinScreen() {
  return `
    ${adminStyles}
    <div class="admin-pin-overlay animate-fade-in-up">
      <div class="admin-pin-card">
        <div style="color:var(--accent);margin-bottom:var(--space-4);">${icons.lock}</div>
        <h2 class="font-display">Admin Access</h2>
        <p>Enter your 4-digit PIN to continue</p>
        <div style="margin-bottom:var(--space-5);">
          <input type="password" id="admin-pin-input" class="admin-pin-input"
                 maxlength="4" inputmode="numeric" pattern="[0-9]*"
                 placeholder="••••" autocomplete="off" />
        </div>
        <button class="btn btn-primary w-full" id="admin-pin-submit" style="max-width:200px;">
          Unlock Dashboard
        </button>
        <p style="margin-top:var(--space-4);font-size:var(--text-xs);color:var(--text-muted);">
          Secured access for Valyryes only
        </p>
      </div>
    </div>
  `;
}

// ------------------------------------
// Messages Tab
// ------------------------------------
function renderMessagesTab(selectedUserId) {
  const state = getState();
  const users = state.adminUsers || [];
  const activeUserId = selectedUserId || (users.length > 0 ? users[0].id : null);

  const userListHtml = users.map((user) => {
    const isActive = user.id === activeUserId;
    return `
      <div class="admin-user-item${isActive ? ' active' : ''}" data-user-id="${user.id}">
        ${renderAvatar(user.name, 36)}
        <div class="admin-user-item__info">
          <div class="admin-user-item__name">
            ${escapeHtml(user.name)}
            <span class="admin-tier-badge admin-tier-badge--${user.tier}">${user.tier}</span>
          </div>
          <div class="admin-user-item__meta">${user.lastSeen || 'Unknown'}</div>
        </div>
        ${user.unread > 0 ? `<div class="admin-user-item__badge">${user.unread}</div>` : ''}
      </div>
    `;
  }).join('');

  return `
    <div class="admin-messages-layout" id="admin-messages-layout">
      <!-- User list -->
      <div class="admin-user-list">
        <div class="admin-user-list__header">
          <h3>Fans</h3>
          <input type="text" class="admin-user-list__search" id="admin-user-search" placeholder="Search fans..." />
        </div>
        <div id="admin-user-list-items">
          ${userListHtml}
        </div>
      </div>

      <!-- Chat thread -->
      <div class="admin-chat" id="admin-chat">
        ${activeUserId ? renderChatThread(activeUserId) : `
          <div class="admin-chat__empty">
            <div style="text-align:center;">
              <div style="font-size:var(--text-3xl);margin-bottom:var(--space-2);">💬</div>
              <div>Select a fan to view messages</div>
            </div>
          </div>
        `}
      </div>
    </div>
  `;
}

function renderChatThread(userId) {
  const state = getState();
  const messages = state.adminMessages[userId] || [];
  const user = state.adminUsers.find(u => u.id === userId);
  if (!user) return '';

  const messagesHtml = messages.map(msg => {
    const isValyrye = msg.sender === 'valyryes';
    const isRequest = msg.type === 'request';
    let cls = isValyrye ? 'admin-msg--valyryes' : 'admin-msg--fan';
    if (isRequest) cls = 'admin-msg--request';

    let mediaHtml = '';
    if (msg.mediaUrl) {
      const isVideo = msg.mediaUrl.toLowerCase().endsWith('.mp4') || msg.mediaUrl.toLowerCase().endsWith('.mov') || msg.mediaUrl.toLowerCase().endsWith('.webm');
      if (isVideo) {
        mediaHtml = `<div class="message-media" style="margin-bottom:var(--space-2); max-width:200px;"><video src="${msg.mediaUrl}" controls style="width:100%; display:block; border-radius:var(--radius-md);"></video></div>`;
      } else {
        mediaHtml = `<div class="message-media" style="margin-bottom:var(--space-2); max-width:200px;"><img src="${msg.mediaUrl}" style="width:100%; display:block; border-radius:var(--radius-md);" alt="Media"></div>`;
      }
    }

    return `
      <div class="admin-msg ${cls}">
        ${mediaHtml}
        <div>${escapeHtml(msg.content)}</div>
        <div class="admin-msg__time">${msg.time || ''}${isValyrye ? `<span style="margin-left:4px;font-size:10px;${msg.read ? 'color:var(--accent-light);' : 'opacity:0.6;'}">${msg.read ? '✓✓' : '✓'}</span>` : ''}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="admin-chat__header">
      ${renderAvatar(user.name, 36)}
      <div class="admin-chat__header-info">
        <h4>${escapeHtml(user.name)} <span class="admin-tier-badge admin-tier-badge--${user.tier}" style="margin-left:var(--space-2);">${user.tier}</span></h4>
        <span>${user.online ? '<span style="color:#4ade80;">● Online</span>' : `Last seen: ${user.lastSeen || 'Unknown'}`}</span>
      </div>
    </div>
    <div class="admin-chat__messages" id="admin-chat-messages">
      ${messages.length > 0 ? messagesHtml : `
        <div class="admin-chat__empty">
          <div style="text-align:center;">
            <div style="font-size:var(--text-2xl);margin-bottom:var(--space-2);">📭</div>
            <div>No messages yet</div>
          </div>
        </div>
      `}
    </div>
    <div class="admin-chat__input" style="align-items: flex-end;">
      <input type="file" id="admin-photo-input" accept="image/*" style="display:none;">
      <input type="file" id="admin-video-input" accept="video/*" style="display:none;">
      <div style="display:flex; gap:var(--space-1); margin-bottom: 2px;">
        <button id="admin-photo-btn" title="Send photo" style="background:none; border:none; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; justify-content:center; width:38px; height:38px; border-radius:var(--radius-md); transition: background 0.2s;">${icons.photo}</button>
        <button id="admin-video-btn" title="Send video" style="background:none; border:none; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; justify-content:center; width:38px; height:38px; border-radius:var(--radius-md); transition: background 0.2s;">${icons.video}</button>
      </div>
      <textarea id="admin-reply-input" placeholder="Reply as Valyryes..." rows="1"></textarea>
      <button id="admin-reply-send" title="Send reply">${icons.send}</button>
    </div>
  `;
}

// ------------------------------------
// Content Manager Tab
// ------------------------------------
function renderContentTab() {
  const state = getState();
  const content = state.content || [];

  return `
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4);">
        <h2 class="font-display" style="color:var(--text-primary);margin:0;">Content Manager</h2>
        <span style="color:var(--text-muted);font-size:var(--text-sm);">${content.length} items</span>
      </div>

      <!-- Filters -->
      <div class="admin-content-filters" id="admin-content-filters">
        <button class="admin-filter-btn active" data-filter="all">All</button>
        <button class="admin-filter-btn" data-filter="image">${icons.photo} Photos</button>
        <button class="admin-filter-btn" data-filter="video">${icons.video} Videos</button>
        <span style="color:var(--border);margin:0 var(--space-1);">|</span>
        <button class="admin-filter-btn" data-filter="free">Free</button>
        <button class="admin-filter-btn" data-filter="gold">Gold</button>
        <span style="color:var(--border);margin:0 var(--space-1);">|</span>
        <select id="admin-sort" class="form-input" style="padding:var(--space-1) var(--space-3);font-size:var(--text-xs);width:auto;">
          <option value="newest">Newest</option>
          <option value="likes">Most Liked</option>
        </select>
      </div>

      <!-- Grid -->
      <div class="admin-content-grid" id="admin-content-grid">
        ${renderContentGrid(content)}
      </div>
    </div>

    <!-- Edit modal container -->
    <div id="admin-edit-modal"></div>
  `;
}

function renderContentGrid(contentList) {
  return contentList.map(item => `
    <div class="admin-content-card" data-content-id="${item.id}">
      <img class="admin-content-card__thumb" src="${item.thumbnail}" alt="${escapeHtml(item.title)}" loading="lazy"
           onerror="this.style.background='var(--bg-elevated)';this.alt='No preview';" />
      <div class="admin-content-card__info">
        <div class="admin-content-card__title">${escapeHtml(item.title)}</div>
        <div class="admin-content-card__meta">
          <span style="display:flex;align-items:center;gap:3px;">
            ${item.type === 'video' ? icons.video : icons.photo}
            <span class="admin-tier-badge admin-tier-badge--${item.minTier}">${item.minTier}</span>
          </span>
          <span style="display:flex;align-items:center;gap:3px;">${icons.heart} ${item.likes || 0}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderEditModal(item) {
  const categories = ['Lingerie', 'Swimwear', 'Casual', 'Studio', 'Behind The Scenes', 'Custom', 'Other'];
  return `
    <div class="admin-modal-overlay" id="admin-modal-overlay">
      <div class="admin-modal animate-fade-in-up">
        <div class="admin-modal__header">
          <h3 class="font-display">Edit Content</h3>
          <button class="admin-modal__close" id="admin-modal-close">${icons.close}</button>
        </div>

        <!-- Thumbnail preview -->
        <div style="margin-bottom:var(--space-4);border-radius:var(--radius-md);overflow:hidden;max-height:200px;">
          <img src="${item.thumbnail}" alt="${escapeHtml(item.title)}" style="width:100%;max-height:200px;object-fit:cover;display:block;"
               onerror="this.style.display='none';" />
        </div>

        <div class="form-group">
          <label class="form-label">Title</label>
          <input type="text" class="form-input" id="edit-title" value="${escapeHtml(item.title)}" />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input" id="edit-description" rows="3">${escapeHtml(item.description || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-input" id="edit-category">
            ${categories.map(c => `<option value="${c.toLowerCase()}" ${(item.category || '').toLowerCase() === c.toLowerCase() ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Tier</label>
          <div class="admin-radio-group">
            <label class="admin-radio-option">
              <input type="radio" name="edit-tier" value="free" ${item.minTier === 'free' ? 'checked' : ''} /> Free
            </label>
            <label class="admin-radio-option">
              <input type="radio" name="edit-tier" value="gold" ${item.minTier === 'gold' ? 'checked' : ''} /> Gold
            </label>
          </div>
        </div>

        <div style="display:flex;gap:var(--space-3);justify-content:flex-end;margin-top:var(--space-5);">
          <button class="btn btn-ghost btn-sm" id="edit-delete" style="color:#ef4444;">
            ${icons.trash} Delete
          </button>
          <button class="btn btn-secondary btn-sm" id="edit-cancel">Cancel</button>
          <button class="btn btn-primary btn-sm" id="edit-save">Save Changes</button>
        </div>
      </div>
    </div>
  `;
}

// ------------------------------------
// Upload Tab
// ------------------------------------
function renderUploadTab() {
  const categories = ['Lingerie', 'Swimwear', 'Casual', 'Studio', 'Behind The Scenes', 'Custom', 'Other'];

  return `
    <div style="max-width:600px;">
      <h2 class="font-display" style="color:var(--text-primary);margin:0 0 var(--space-1) 0;">Upload Content</h2>
      <p style="color:var(--text-muted);font-size:var(--text-sm);margin-bottom:var(--space-5);">Add new photos or videos to your page</p>

      <!-- Drag & drop zone -->
      <div class="admin-dropzone" id="admin-dropzone">
        <div class="admin-dropzone__icon">${icons.file}</div>
        <div class="admin-dropzone__text">
          Drag & drop files here or <span>browse</span>
        </div>
        <div class="admin-dropzone__file" id="upload-filename">Supports up to 20 files (JPG, PNG, MP4, MOV)</div>
        <input type="file" id="upload-file-input" accept="image/*,video/*" multiple max="20" style="display:none;" />
      </div>

      <!-- Publish Destination -->
      <div class="form-group">
        <label class="form-label">Publish Destination</label>
        <div class="admin-radio-group">
          <label class="admin-radio-option">
            <input type="radio" name="upload-destination" value="feed" checked /> Feed Post
          </label>
          <label class="admin-radio-option">
            <input type="radio" name="upload-destination" value="story" /> Story
          </label>
        </div>
      </div>

      <!-- File type -->
      <div class="form-group">
        <label class="form-label">File Type</label>
        <div class="admin-radio-group">
          <label class="admin-radio-option">
            <input type="radio" name="upload-type" value="image" checked /> ${icons.photo} Photo
          </label>
          <label class="admin-radio-option">
            <input type="radio" name="upload-type" value="video" /> ${icons.video} Video
          </label>
        </div>
      </div>

      <!-- Title -->
      <div class="form-group">
        <label class="form-label">Title</label>
        <input type="text" class="form-input" id="upload-title" placeholder="Give your content a title..." />
      </div>

      <!-- Description -->
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-input" id="upload-description" rows="3" placeholder="Add a description..."></textarea>
      </div>

      <!-- Category -->
      <div class="form-group">
        <label class="form-label">Category</label>
        <select class="form-input" id="upload-category">
          ${categories.map(c => `<option value="${c.toLowerCase()}">${c}</option>`).join('')}
        </select>
      </div>

      <!-- Tier -->
      <div class="form-group">
        <label class="form-label">Access Tier</label>
        <div class="admin-radio-group">
          <label class="admin-radio-option">
            <input type="radio" name="upload-tier" value="free" checked /> Free
          </label>
          <label class="admin-radio-option">
            <input type="radio" name="upload-tier" value="gold" /> Gold
          </label>
        </div>
      </div>

      <!-- Upload button -->
      <button class="btn btn-primary btn-lg w-full" id="admin-upload-btn" style="margin-top:var(--space-4);">
        ${icons.upload} Upload Content
      </button>
    </div>
  `;
}

// ------------------------------------
// Dashboard Tab
// ------------------------------------
function renderDashboardTab() {
  const state = getState();
  const users = state.adminUsers || [];
  const content = state.content || [];
  const adminMessages = state.adminMessages || {};

  const totalFans = users.length;
  const goldSubs = users.filter(u => u.tier === 'gold').length;
  const totalContent = content.length;
  const totalMessages = Object.values(adminMessages).reduce((sum, arr) => sum + arr.length, 0);
  const totalTips = state.totalTips || 0;
  const revenue = (goldSubs * 14.99).toFixed(2);

  // Content breakdown
  const photos = content.filter(c => c.type === 'image').length;
  const videos = content.filter(c => c.type === 'video').length;
  const freeCount = content.filter(c => c.minTier === 'free').length;
  const goldCount = content.filter(c => c.minTier === 'gold').length;
  const maxCount = Math.max(photos, videos, freeCount, goldCount, 1);

  // Recent activity: last 5 messages across all users
  const allMsgs = [];
  for (const [userId, msgs] of Object.entries(adminMessages)) {
    const user = users.find(u => u.id === userId);
    msgs.forEach(m => allMsgs.push({ ...m, userName: user?.name || 'Unknown' }));
  }
  const recentMsgs = allMsgs.slice(-5).reverse();

  return `
    <div>
      <h2 class="font-display" style="color:var(--text-primary);margin:0 0 var(--space-1) 0;">Dashboard</h2>
      <p style="color:var(--text-muted);font-size:var(--text-sm);margin-bottom:var(--space-5);">Platform overview & analytics</p>

      <!-- Stats cards -->
      <div class="admin-stats-grid animate-fade-in-up">
        <div class="admin-stat-card">
          <div class="admin-stat-card__icon">${icons.users}</div>
          <div class="admin-stat-card__value">${totalFans}</div>
          <div class="admin-stat-card__label">Total Fans</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-card__icon" style="background:linear-gradient(135deg,rgba(245,158,11,0.15),rgba(217,119,6,0.15));color:#f59e0b;">${icons.star}</div>
          <div class="admin-stat-card__value">${goldSubs}</div>
          <div class="admin-stat-card__label">Gold Subscribers</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-card__icon">${icons.content}</div>
          <div class="admin-stat-card__value">${totalContent}</div>
          <div class="admin-stat-card__label">Total Content</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-card__icon">${icons.messages}</div>
          <div class="admin-stat-card__value">${totalMessages}</div>
          <div class="admin-stat-card__label">Total Messages</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-card__icon" style="background:linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.15));color:#10b981;">${icons.dollar}</div>
          <div class="admin-stat-card__value">$${totalTips.toFixed(2)}</div>
          <div class="admin-stat-card__label">Total Tips</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-card__icon" style="background:linear-gradient(135deg,rgba(139,92,246,0.15),rgba(109,40,217,0.15));color:#8b5cf6;">${icons.dollar}</div>
          <div class="admin-stat-card__value">$${revenue}</div>
          <div class="admin-stat-card__label">Revenue</div>
        </div>
      </div>

      <!-- Activity feed + chart -->
      <div class="admin-dashboard-grid">
        <!-- Recent activity -->
        <div class="admin-activity-feed animate-fade-in-up stagger-2">
          <h4>${icons.activity} Recent Activity</h4>
          ${recentMsgs.length > 0 ? recentMsgs.map(msg => `
            <div class="admin-activity-item">
              ${renderAvatar(msg.userName, 28)}
              <div class="admin-activity-item__content">
                <div class="admin-activity-item__text">
                  <strong>${escapeHtml(msg.userName)}</strong>
                  ${msg.sender === 'valyryes' ? 'received a reply' : msg.type === 'request' ? 'sent a request' : 'sent a message'}
                </div>
                <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;">
                  "${escapeHtml(msg.content.substring(0, 60))}${msg.content.length > 60 ? '...' : ''}"
                </div>
                <div class="admin-activity-item__time">${msg.time || ''}</div>
              </div>
            </div>
          `).join('') : `
            <div style="text-align:center;color:var(--text-muted);padding:var(--space-6);font-size:var(--text-sm);">
              No recent activity
            </div>
          `}
        </div>

        <!-- Content breakdown -->
        <div class="admin-chart animate-fade-in-up stagger-3">
          <h4>${icons.dashboard} Content Breakdown</h4>
          <div class="admin-bar">
            <div class="admin-bar__label">Photos</div>
            <div class="admin-bar__track">
              <div class="admin-bar__fill" style="width:${(photos / maxCount * 100).toFixed(0)}%;background:var(--accent);">${photos}</div>
            </div>
          </div>
          <div class="admin-bar">
            <div class="admin-bar__label">Videos</div>
            <div class="admin-bar__track">
              <div class="admin-bar__fill" style="width:${Math.max((videos / maxCount * 100), videos > 0 ? 8 : 2).toFixed(0)}%;background:#8b5cf6;">${videos}</div>
            </div>
          </div>
          <div style="height:var(--space-4);"></div>
          <div class="admin-bar">
            <div class="admin-bar__label">Free</div>
            <div class="admin-bar__track">
              <div class="admin-bar__fill" style="width:${(freeCount / maxCount * 100).toFixed(0)}%;background:#10b981;">${freeCount}</div>
            </div>
          </div>
          <div class="admin-bar">
            <div class="admin-bar__label">Gold</div>
            <div class="admin-bar__track">
              <div class="admin-bar__fill" style="width:${(goldCount / maxCount * 100).toFixed(0)}%;background:var(--gradient-gold);">${goldCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ------------------------------------
// Promotions Tab
// ------------------------------------
function renderPromotionsTab() {
  const stateRef = getState();
  const promosListHtml = stateRef.allPromos && stateRef.allPromos.length > 0 ? 
    stateRef.allPromos.map(p => `
      <div class="card-glass" style="padding: var(--space-4); margin-bottom: var(--space-3); border-radius: var(--radius-lg); border-left: 3px solid ${p.status === 'active' ? 'var(--success)' : 'transparent'};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-weight: 600; margin-bottom: var(--space-1);">${p.code} — ${p.discount}% OFF ${p.status === 'active' ? '<span style="color:var(--success);font-size:var(--text-xs);"> (ACTIVE)</span>' : ''}</div>
            <div style="font-size: var(--text-sm); color: var(--text-muted);">${p.description}</div>
            ${p.expiresAt ? `<div style="font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-1);">Expires: ${new Date(p.expiresAt).toLocaleString()}</div>` : ''}
          </div>
          <div style="display: flex; gap: var(--space-2);">
            ${p.status !== 'active' ? `<button class="btn btn-sm btn-primary promo-publish-btn" data-id="${p.id}">🚀 Publish</button>` : ''}
            <button class="btn btn-sm promo-delete-btn" data-id="${p.id}" style="background: none; border: 1px solid var(--error); color: var(--error);">🗑️</button>
          </div>
        </div>
      </div>
    `).join('') : '<p style="color:var(--text-muted);">No promotions created yet.</p>';

  return `
<div class="admin-two-col-grid">
  <div>
    <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-6);">
      🏷️ Promotion Manager
    </h2>
    
    <!-- Manage Promos -->
    <h3 style="margin-bottom: var(--space-4); font-size: var(--text-lg);">Your Promotions</h3>
    <div id="promos-list-container">
      ${promosListHtml}
    </div>
  </div>

  <div>
    <!-- Create New Promo Form -->
    <div class="card-glass" style="padding: var(--space-6); border-radius: var(--radius-xl);">
      <h3 style="margin-bottom: var(--space-5); font-size: var(--text-lg);">Create New Promotion</h3>
      
      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Promo Code</label>
        <input class="form-input" type="text" id="promo-code" placeholder="e.g. SUMMER40" style="text-transform: uppercase;">
      </div>
      
      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Discount Percentage (%)</label>
        <input class="form-input" type="number" id="promo-discount" placeholder="20" min="1" max="100" value="20">
      </div>
      
      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Banner Text</label>
        <input class="form-input" type="text" id="promo-text" placeholder="Limited time offer! Subscribe now!">
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Expiry Date & Time</label>
          <input class="form-input" type="datetime-local" id="promo-expiry">
        </div>
        <div class="form-group">
          <label class="form-label">Banner Color</label>
          <div style="display: flex; gap: var(--space-2); align-items: center;">
            <input type="color" id="promo-color" value="#E91E8C" style="width: 48px; height: 40px; border: none; border-radius: var(--radius-md); cursor: pointer; background: none;">
            <span id="promo-color-hex" style="font-size: var(--text-sm); color: var(--text-muted);">#E91E8C</span>
          </div>
        </div>
      </div>
      
      <!-- Preview -->
      <div style="margin-bottom: var(--space-5);">
        <label class="form-label">Preview</label>
        <div id="promo-preview" class="promo-banner" style="color: #fff; padding: var(--space-4); position: relative !important; top: 0 !important; z-index: 1 !important;">
          <div class="promo-banner__shimmer"></div>
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
            <div>
              <div style="font-weight: 700; font-size: var(--text-lg);">🔥 <span id="preview-discount">20</span>% OFF</div>
              <div style="font-size: var(--text-sm); opacity: 0.9;"><span id="preview-text">Limited time offer!</span></div>
            </div>
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              <div style="padding: var(--space-1) var(--space-3); background: rgba(255,255,255,0.2); border-radius: var(--radius-full); font-weight: 700; font-size: var(--text-sm);">Code: <span id="preview-code">PROMO</span></div>
            </div>
          </div>
        </div>
      </div>
      
      <button class="btn btn-primary w-full" id="promo-create-btn" style="justify-content:center;">Create Promotion</button>
    </div>
  </div>
</div>
  `;
}

// ------------------------------------
// Polls Tab
// ------------------------------------
function renderPollsTab() {
  const stateRef = getState();
  const pollsList = stateRef.polls || [];
  const activePoll = pollsList.find(p => !p.isExpired);
  
  const pollsListHtml = pollsList.length > 0 ? 
    pollsList.map(p => {
      const total = p.totalVotes || 0;
      return `
        <div class="card-glass" style="padding: var(--space-4); margin-bottom: var(--space-3); border-radius: var(--radius-lg); border-left: 3px solid ${p.isExpired ? 'var(--text-muted)' : 'var(--success)'};">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1; min-width: 0; padding-right: var(--space-4);">
              <div style="font-weight: 600; margin-bottom: var(--space-2);">${p.question}</div>
              <div style="display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-2);">
                ${p.options.map(opt => {
                  const pct = total > 0 ? Math.round(opt.votes / total * 100) : 0;
                  return `
                    <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--text-secondary);">
                      <span>${opt.text}</span>
                      <span>${opt.votes} votes (${pct}%)</span>
                    </div>
                    <div style="width: 100%; height: 4px; background: var(--bg-elevated); border-radius: var(--radius-full); overflow: hidden; margin-bottom: var(--space-1);">
                      <div style="height: 100%; width: ${pct}%; background: var(--accent);"></div>
                    </div>
                  `;
                }).join('')}
              </div>
              <div style="font-size: var(--text-xs); color: var(--text-muted);">
                ${total} votes · ${p.isExpired ? '<span style="color:var(--error);">Completed</span>' : '<span style="color:var(--success);">Active</span>'}
                ${p.expiresAt ? ` · Expires: ${new Date(p.expiresAt).toLocaleString()}` : ''}
              </div>
            </div>
            <button class="btn btn-sm poll-delete-btn" data-id="${p.id}" style="background: none; border: 1px solid var(--error); color: var(--error); flex-shrink:0;">🗑️</button>
          </div>
        </div>
      `;
    }).join('') : '<p style="color:var(--text-muted);">No polls created yet.</p>';

  let rightColumnHtml = '';
  if (activePoll) {
    rightColumnHtml = `
      <div class="card-glass" style="padding: var(--space-6); border-radius: var(--radius-xl); border-top: 4px solid var(--accent);">
        <h3 style="margin-bottom: var(--space-3); font-size: var(--text-lg); display: flex; align-items: center; gap: 8px;">
          📊 Active Poll Running
        </h3>
        <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-4);">
          You can only run one active poll at a time. The current poll must complete or be ended before you can create a new one.
        </p>
        
        <div class="card-glass" style="background: rgba(255,255,255,0.03); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-5);">
          <div style="font-weight: 600; margin-bottom: var(--space-3);">${activePoll.question}</div>
          <div style="font-size: var(--text-sm); font-weight: 700; color: var(--accent); margin-bottom: var(--space-2);">
            Time Remaining: <span id="active-poll-countdown" data-expiry="${activePoll.expiresAt}">Calculating...</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-3);">
            ${activePoll.options.map(opt => {
              const total = activePoll.totalVotes || 0;
              const pct = total > 0 ? Math.round(opt.votes / total * 100) : 0;
              return `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); margin-bottom: 2px;">
                    <span>${opt.text}</span>
                    <strong>${opt.votes} votes (${pct}%)</strong>
                  </div>
                  <div style="width: 100%; height: 6px; background: var(--bg-elevated); border-radius: var(--radius-full); overflow: hidden;">
                    <div style="height: 100%; width: ${pct}%; background: var(--accent);"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <button class="btn btn-secondary w-full active-poll-end-btn" data-id="${activePoll.id}" style="justify-content:center; border: 1px solid var(--accent); color: var(--accent); font-weight: 700;">
          🛑 End Poll Now
        </button>
      </div>
    `;
  } else {
    rightColumnHtml = `
      <div class="card-glass" style="padding: var(--space-6); border-radius: var(--radius-xl);">
        <h3 style="margin-bottom: var(--space-5); font-size: var(--text-lg);">Create New Poll</h3>
        
        <div class="form-group" style="margin-bottom: var(--space-4);">
          <label class="form-label">Question</label>
          <input class="form-input" type="text" id="poll-question" placeholder="e.g. What should I post next?">
        </div>
        
        <div class="form-group" style="margin-bottom: var(--space-4);">
          <label class="form-label">Option 1</label>
          <input class="form-input" type="text" id="poll-opt-1" placeholder="e.g. Lingerie photoshoot">
        </div>
        
        <div class="form-group" style="margin-bottom: var(--space-4);">
          <label class="form-label">Option 2</label>
          <input class="form-input" type="text" id="poll-opt-2" placeholder="e.g. Beach day video">
        </div>
        
        <div class="form-group" style="margin-bottom: var(--space-4);">
          <label class="form-label">Option 3 (Optional)</label>
          <input class="form-input" type="text" id="poll-opt-3" placeholder="e.g. Behind-the-scenes">
        </div>
        
        <div class="form-group" style="margin-bottom: var(--space-4);">
          <label class="form-label">Option 4 (Optional)</label>
          <input class="form-input" type="text" id="poll-opt-4" placeholder="e.g. Q&A session">
        </div>

        <div class="form-group" style="margin-bottom: var(--space-5);">
          <label class="form-label">Duration (Hours)</label>
          <input class="form-input" type="number" id="poll-duration" placeholder="e.g. 24" min="1" value="24">
        </div>
        
        <button class="btn btn-primary w-full" id="poll-create-btn" style="justify-content:center;">Create Poll</button>
      </div>
    `;
  }

  return `
<div class="admin-two-col-grid">
  <div>
    <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-6);">
      📊 Polls Manager
    </h2>
    
    <!-- Manage Polls -->
    <h3 style="margin-bottom: var(--space-4); font-size: var(--text-lg);">Your Polls</h3>
    <div id="polls-list-container">
      ${pollsListHtml}
    </div>
  </div>

  <div>
    ${rightColumnHtml}
  </div>
</div>
  `;
}

// ------------------------------------
// Main Admin Dashboard
// ------------------------------------
function renderDashboardLayout(activeTab = 'messages', selectedUserId = null) {
  const state = getState();
  const users = state.adminUsers || [];
  const totalUnread = users.reduce((sum, u) => sum + (u.unread || 0), 0);

  const tabs = [
    { id: 'messages', label: 'Messages', icon: icons.messages, badge: totalUnread },
    { id: 'content', label: 'Content', icon: icons.content, badge: 0 },
    { id: 'upload', label: 'Upload', icon: icons.upload, badge: 0 },
    { id: 'promotions', label: 'Promotions', icon: icons.star, badge: 0 },
    { id: 'polls', label: 'Polls', icon: icons.activity, badge: 0 },
    { id: 'dashboard', label: 'Dashboard', icon: icons.dashboard, badge: 0 },
  ];

  let contentHtml = '';
  switch (activeTab) {
    case 'messages': contentHtml = renderMessagesTab(selectedUserId); break;
    case 'content': contentHtml = renderContentTab(); break;
    case 'upload': contentHtml = renderUploadTab(); break;
    case 'promotions': contentHtml = renderPromotionsTab(); break;
    case 'polls': contentHtml = renderPollsTab(); break;
    case 'dashboard': contentHtml = renderDashboardTab(); break;
  }

  return `
    ${adminStyles}
    <div class="admin-layout">
      <!-- Sidebar -->
      <nav class="admin-sidebar">
        <div class="admin-sidebar__brand">
          <h3 class="font-display" style="display:flex;align-items:center;gap:var(--space-2);">
            <span style="color:var(--accent);">⚡</span> Admin Panel
          </h3>
          <span>Valyryes Management</span>
        </div>

        ${tabs.map(tab => `
          <button class="admin-tab${tab.id === activeTab ? ' active' : ''}" data-tab="${tab.id}">
            <span class="tab-icon">${tab.icon}</span>
            ${tab.label}
            ${tab.badge > 0 ? `<span class="tab-badge">${tab.badge}</span>` : ''}
          </button>
        `).join('')}

        <div class="admin-sidebar__footer">
          <button class="admin-tab" id="admin-logout" style="border:none;">
            <span class="tab-icon">${icons.logout}</span>
            Sign Out
          </button>
        </div>
      </nav>

      <!-- Content -->
      <div class="admin-content" id="admin-tab-content">
        ${contentHtml}
      </div>
    </div>
  `;
}

// ------------------------------------
// Exported render function
// ------------------------------------
export function renderAdmin() {
  const isAuthed = sessionStorage.getItem('vf-admin-auth') === 'true';
  
  if (!isAuthed) {
    setTimeout(() => navigate('/admin-login'), 0);
    return { html: '<div>Redirecting to login...</div>', afterRender() {} };
  }

  let currentTab = 'messages';
  let selectedUserId = null;
  let activePollInterval = null;
  let adminMessagesSub = null;

  // Initial HTML
  const html = renderDashboardLayout(currentTab, selectedUserId);

  return {
    html,
    afterRender() {


      // --- Dashboard is loaded ---
      const state = getState();

      // Initialize selected user and setup initial tab layout
      if (state.adminUsers?.length > 0) {
        selectedUserId = state.adminUsers[0].id;
      }
      const initialContentEl = document.getElementById('admin-tab-content');
      if (initialContentEl) {
        initialContentEl.classList.toggle('admin-content--messages', currentTab === 'messages');
      }

      // Tab switching
      function switchTab(tabId) {
        currentTab = tabId;
        const contentEl = document.getElementById('admin-tab-content');
        if (!contentEl) return;

        if (activePollInterval) {
          clearInterval(activePollInterval);
          activePollInterval = null;
        }

        if (adminMessagesSub) {
          adminMessagesSub();
          adminMessagesSub = null;
        }

        // Toggle overflow control class specifically for messages view
        contentEl.classList.toggle('admin-content--messages', tabId === 'messages');

        // Update active tab
        document.querySelectorAll('.admin-tab[data-tab]').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        switch (tabId) {
          case 'messages': contentEl.innerHTML = renderMessagesTab(selectedUserId); wireMessagesTab(); break;
          case 'content': contentEl.innerHTML = renderContentTab(); wireContentTab(); break;
          case 'upload': contentEl.innerHTML = renderUploadTab(); wireUploadTab(); break;
          case 'promotions': contentEl.innerHTML = renderPromotionsTab(); wirePromotionsTab(); break;
          case 'polls': contentEl.innerHTML = renderPollsTab(); wirePollsTab(); break;
          case 'dashboard': contentEl.innerHTML = renderDashboardTab(); break;
        }
      }

      document.querySelectorAll('.admin-tab[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
      });

      // Logout
      document.getElementById('admin-logout')?.addEventListener('click', () => {
        sessionStorage.removeItem('vf-admin-auth');
        localStorage.removeItem('vf-state');
        import('../supabase.js').then(({ supabase }) => {
          supabase.auth.signOut().finally(() => {
            window.location.hash = '#/';
            window.location.reload();
          });
        });
      });

      // Wire up initial tab
      if (currentTab === 'messages') wireMessagesTab();

      // =====================
      // Messages Tab Wiring
      // =====================
      function wireMessagesTab() {
        const userListItems = document.getElementById('admin-user-list-items');
        const chatContainer = document.getElementById('admin-chat');
        const searchInput = document.getElementById('admin-user-search');

        // Mark messages as read on load
        if (selectedUserId) {
          markMessagesAsRead(selectedUserId);
        }

        // Select user
        userListItems?.addEventListener('click', async (e) => {
          const item = e.target.closest('.admin-user-item');
          if (!item) return;

          const userId = item.dataset.userId;
          selectedUserId = userId;

          // Update active state
          userListItems.querySelectorAll('.admin-user-item').forEach(el => el.classList.remove('active'));
          item.classList.add('active');

          // Mark messages as read
          await markMessagesAsRead(userId);

          // Render chat
          if (chatContainer) {
            chatContainer.innerHTML = renderChatThread(userId);
            wireChatInput(userId);
            scrollChatToBottom();
          }
        });

        // Search users
        searchInput?.addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase();
          const items = userListItems?.querySelectorAll('.admin-user-item');
          items?.forEach(item => {
            const name = item.querySelector('.admin-user-item__name')?.textContent?.toLowerCase() || '';
            item.style.display = name.includes(query) ? '' : 'none';
          });
        });

        // Wire initial chat
        if (selectedUserId) {
          wireChatInput(selectedUserId);
          scrollChatToBottom();
        }

        // Setup store subscription for messages and user list updates
        if (adminMessagesSub) {
          adminMessagesSub();
          adminMessagesSub = null;
        }

        adminMessagesSub = subscribe(['adminMessages', 'adminUsers'], (newState) => {
          // If the currently selected user has unread messages, mark them as read immediately in DB/state
          if (selectedUserId) {
            const userObj = newState.adminUsers?.find(u => u.id === selectedUserId);
            if (userObj && userObj.unread > 0) {
              markMessagesAsRead(selectedUserId);
              return; // Wait for the state update to notify again
            }
          }

          // Re-render the user list items to update unread badge counts
          const listContainer = document.getElementById('admin-user-list-items');
          if (listContainer) {
            const query = searchInput?.value?.toLowerCase() || '';
            const activeUserId = selectedUserId || (newState.adminUsers?.length > 0 ? newState.adminUsers[0].id : null);
            listContainer.innerHTML = newState.adminUsers.map((user) => {
              const isActive = user.id === activeUserId;
              const name = user.name || 'Fan';
              const displayStyle = name.toLowerCase().includes(query) ? '' : 'none';
              return `
                <div class="admin-user-item${isActive ? ' active' : ''}" data-user-id="${user.id}" style="display: ${displayStyle};">
                  ${renderAvatar(user.name, 36)}
                  <div class="admin-user-item__info">
                    <div class="admin-user-item__name">
                      ${escapeHtml(user.name)}
                      <span class="admin-tier-badge admin-tier-badge--${user.tier}">${user.tier}</span>
                    </div>
                    <div class="admin-user-item__meta">${user.lastSeen || 'Unknown'}</div>
                  </div>
                  ${user.unread > 0 ? `<div class="admin-user-item__badge">${user.unread}</div>` : ''}
                </div>
              `;
            }).join('');
          }

          // Re-render the chat messages area dynamically
          if (selectedUserId && chatContainer) {
            const messages = newState.adminMessages[selectedUserId] || [];
            const chatMsgsEl = document.getElementById('admin-chat-messages');
            if (chatMsgsEl) {
              if (messages.length === 0) {
                chatMsgsEl.innerHTML = `
                  <div class="admin-chat__empty">
                    <div style="text-align:center;">
                      <div style="font-size:var(--text-2xl);margin-bottom:var(--space-2);">📭</div>
                      <div>No messages yet</div>
                    </div>
                  </div>
                `;
              } else {
                chatMsgsEl.innerHTML = messages.map(msg => {
                  const isValyrye = msg.sender === 'valyryes';
                  const isRequest = msg.type === 'request';
                  let cls = isValyrye ? 'admin-msg--valyryes' : 'admin-msg--fan';
                  if (isRequest) cls = 'admin-msg--request';

                  let mediaHtml = '';
                  if (msg.mediaUrl) {
                    const isVideo = msg.mediaUrl.toLowerCase().endsWith('.mp4') || msg.mediaUrl.toLowerCase().endsWith('.mov') || msg.mediaUrl.toLowerCase().endsWith('.webm');
                    if (isVideo) {
                      mediaHtml = `<div class="message-media" style="margin-bottom:var(--space-2); max-width:200px;"><video src="${msg.mediaUrl}" controls style="width:100%; display:block; border-radius:var(--radius-md);"></video></div>`;
                    } else {
                      mediaHtml = `<div class="message-media" style="margin-bottom:var(--space-2); max-width:200px;"><img src="${msg.mediaUrl}" style="width:100%; display:block; border-radius:var(--radius-md);" alt="Media"></div>`;
                    }
                  }

                  return `
                    <div class="admin-msg ${cls}">
                      ${mediaHtml}
                      <div>${escapeHtml(msg.content)}</div>
                      <div class="admin-msg__time">${msg.time || ''}</div>
                    </div>
                  `;
                }).join('');
              }
              scrollChatToBottom();
            }
          }
        });
      }

      function wireChatInput(userId) {
        const input = document.getElementById('admin-reply-input');
        const sendBtn = document.getElementById('admin-reply-send');
        const photoBtn = document.getElementById('admin-photo-btn');
        const videoBtn = document.getElementById('admin-video-btn');
        const photoInput = document.getElementById('admin-photo-input');
        const videoInput = document.getElementById('admin-video-input');

        photoBtn?.addEventListener('click', () => photoInput?.click());
        videoBtn?.addEventListener('click', () => videoInput?.click());

        const handleAdminUpload = async (fileInput, isVideo) => {
          if (!fileInput?.files?.length || !userId) return;
          const file = fileInput.files[0];

          try {
            showToast('Uploading media...', 'info');

            const fileExt = file.name.split('.').pop();
            const fileName = `chat_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `chat/${fileName}`;

            const { supabase } = await import('../supabase.js');
            const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);

            if (uploadError) {
              console.error(uploadError);
              throw new Error('Failed to upload file');
            }

            const { data } = supabase.storage.from('media').getPublicUrl(filePath);
            const mediaUrl = data.publicUrl;

            const msgText = isVideo ? '🎬 Sent a video' : '📸 Sent a photo';
            await addAdminReply(userId, msgText, 'media', mediaUrl);

            fileInput.value = '';

            // Re-render chat thread
            const chatContainer = document.getElementById('admin-chat');
            if (chatContainer) {
              chatContainer.innerHTML = renderChatThread(userId);
              wireChatInput(userId);
              scrollChatToBottom();
            }
            showToast('Media sent! 💬', 'success');

          } catch (e) {
            showToast(e.message || 'Media upload failed', 'error');
          }
        };

        photoInput?.addEventListener('change', () => handleAdminUpload(photoInput, false));
        videoInput?.addEventListener('change', () => handleAdminUpload(videoInput, true));

        async function sendReply() {
          const text = input?.value?.trim();
          if (!text || !userId) return;

          sendTypingIndicator(false);
          await addAdminReply(userId, text);
          input.value = '';

          // Re-render chat thread
          const chatContainer = document.getElementById('admin-chat');
          if (chatContainer) {
            chatContainer.innerHTML = renderChatThread(userId);
            wireChatInput(userId);
            scrollChatToBottom();
          }
          showToast('Reply sent! 💬', 'success');
        }

        sendBtn?.addEventListener('click', sendReply);
        input?.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendReply();
          }
        });

        // Auto-resize textarea + typing indicator broadcast
        let adminTypingTimer = null;
        input?.addEventListener('input', () => {
          if (input) {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 100) + 'px';
          }
          // Broadcast typing
          sendTypingIndicator(true);
          clearTimeout(adminTypingTimer);
          adminTypingTimer = setTimeout(() => sendTypingIndicator(false), 2000);
        });
      }

      function scrollChatToBottom() {
        const msgs = document.getElementById('admin-chat-messages');
        if (msgs) {
          requestAnimationFrame(() => { msgs.scrollTop = msgs.scrollHeight; });
        }
      }

      // =====================
      // Content Tab Wiring
      // =====================
      function wireContentTab() {
        const filtersContainer = document.getElementById('admin-content-filters');
        const gridContainer = document.getElementById('admin-content-grid');
        const sortSelect = document.getElementById('admin-sort');
        let activeFilter = 'all';

        function applyFilters() {
          const state = getState();
          let filtered = [...state.content];

          // Filter
          if (activeFilter === 'image') filtered = filtered.filter(c => c.type === 'image');
          else if (activeFilter === 'video') filtered = filtered.filter(c => c.type === 'video');
          else if (activeFilter === 'free') filtered = filtered.filter(c => c.minTier === 'free');
          else if (activeFilter === 'gold') filtered = filtered.filter(c => c.minTier === 'gold');

          // Sort
          const sortVal = sortSelect?.value || 'newest';
          if (sortVal === 'newest') filtered.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          else if (sortVal === 'likes') filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));

          if (gridContainer) gridContainer.innerHTML = renderContentGrid(filtered);
          wireContentCards();
        }

        // Filter buttons
        filtersContainer?.addEventListener('click', (e) => {
          const btn = e.target.closest('.admin-filter-btn');
          if (!btn) return;

          activeFilter = btn.dataset.filter;
          filtersContainer.querySelectorAll('.admin-filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          applyFilters();
        });

        // Sort
        sortSelect?.addEventListener('change', applyFilters);

        // Content card clicks
        wireContentCards();

        function wireContentCards() {
          gridContainer?.querySelectorAll('.admin-content-card').forEach(card => {
            card.addEventListener('click', () => {
              const contentId = card.dataset.contentId;
              const item = getState().content.find(c => c.id === contentId);
              if (!item) return;

              const modalContainer = document.getElementById('admin-edit-modal');
              if (modalContainer) {
                modalContainer.innerHTML = renderEditModal(item);
                wireEditModal(item, modalContainer, applyFilters);
              }
            });
          });
        }
      }

      function wireEditModal(item, modalContainer, refreshGrid) {
        const closeBtn = document.getElementById('admin-modal-close');
        const cancelBtn = document.getElementById('edit-cancel');
        const saveBtn = document.getElementById('edit-save');
        const deleteBtn = document.getElementById('edit-delete');
        const overlay = document.getElementById('admin-modal-overlay');

        function closeModal() {
          if (modalContainer) modalContainer.innerHTML = '';
        }

        closeBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);
        overlay?.addEventListener('click', (e) => {
          if (e.target === overlay) closeModal();
        });

        // Save
        saveBtn?.addEventListener('click', () => {
          const state = getState();
          const idx = state.content.findIndex(c => c.id === item.id);
          if (idx === -1) return;

          state.content[idx] = {
            ...state.content[idx],
            title: document.getElementById('edit-title')?.value || item.title,
            description: document.getElementById('edit-description')?.value || item.description,
            category: document.getElementById('edit-category')?.value || item.category,
            minTier: document.querySelector('input[name="edit-tier"]:checked')?.value || item.minTier,
            isPublic: (document.querySelector('input[name="edit-tier"]:checked')?.value || item.minTier) === 'free',
          };

          closeModal();
          refreshGrid();
          showToast('Content updated! ✨', 'success');
        });

        // Delete
        deleteBtn?.addEventListener('click', async () => {
          if (!confirm('Are you sure you want to permanently delete this content from the server?')) return;
          try {
            const { supabase } = await import('../supabase.js');
            const { error } = await supabase.from('content').delete().eq('id', item.id);
            if (error) throw error;
            
            const state = getState();
            state.content = state.content.filter(c => c.id !== item.id);
            closeModal();
            refreshGrid();
            showToast('Content deleted from server', 'success');
          } catch (err) {
            console.error('Delete error:', err);
            showToast('Failed to delete content', 'error');
          }
        });
      }

      // =====================
      // Upload Tab Wiring
      // =====================
      function wireUploadTab() {
        const dropzone = document.getElementById('admin-dropzone');
        const fileInput = document.getElementById('upload-file-input');
        const filenameLabel = document.getElementById('upload-filename');
        const uploadBtn = document.getElementById('admin-upload-btn');
        let selectedFiles = [];

        // Dropzone click → file input
        dropzone?.addEventListener('click', () => fileInput?.click());

        // Toggle form groups based on destination (feed post vs story)
        const destRadios = document.querySelectorAll('input[name="upload-destination"]');
        const titleGroup = document.getElementById('upload-title')?.closest('.form-group');
        const descGroup = document.getElementById('upload-description')?.closest('.form-group');
        const catGroup = document.getElementById('upload-category')?.closest('.form-group');
        const tierGroup = document.getElementById('upload-tier')?.closest('.form-group');

        destRadios.forEach(radio => {
          radio.addEventListener('change', () => {
            const isStory = radio.value === 'story';
            if (isStory) {
              if (titleGroup) titleGroup.querySelector('label').textContent = 'Story Caption (Optional)';
              if (descGroup) descGroup.style.display = 'none';
              if (catGroup) catGroup.style.display = 'none';
              if (tierGroup) tierGroup.style.display = 'none';
            } else {
              if (titleGroup) titleGroup.querySelector('label').textContent = 'Title';
              if (descGroup) descGroup.style.display = '';
              if (catGroup) catGroup.style.display = '';
              if (tierGroup) tierGroup.style.display = '';
            }
          });
        });

        // Drag & drop events
        dropzone?.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
        dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone?.addEventListener('drop', (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
          if (e.dataTransfer?.files?.length) {
            selectedFiles = Array.from(e.dataTransfer.files).slice(0, 20);
            if (filenameLabel) filenameLabel.textContent = `Selected: ${selectedFiles.length} file(s)`;
          }
        });

        // File input change
        fileInput?.addEventListener('change', () => {
          if (fileInput.files?.length) {
            selectedFiles = Array.from(fileInput.files).slice(0, 20);
            if (filenameLabel) filenameLabel.textContent = `Selected: ${selectedFiles.length} file(s)`;
          }
        });

        // Upload button
        uploadBtn?.addEventListener('click', async () => {
          const isStory = document.querySelector('input[name="upload-destination"]:checked')?.value === 'story';
          const rawTitle = document.getElementById('upload-title')?.value?.trim();
          const title = rawTitle || (isStory ? 'Story' : '');
          const description = document.getElementById('upload-description')?.value?.trim();
          const category = isStory ? 'story' : document.getElementById('upload-category')?.value;
          const type = document.querySelector('input[name="upload-type"]:checked')?.value || 'image';
          const tier = isStory ? 'free' : (document.querySelector('input[name="upload-tier"]:checked')?.value || 'free');

          if (!title) {
            showToast('Please enter a title', 'error');
            return;
          }
          
          if (!selectedFiles.length) {
            showToast('Please select at least one file', 'error');
            return;
          }

          uploadBtn.disabled = true;
          uploadBtn.innerHTML = `${icons.spinner} Uploading...`;

          try {
            const mediaPaths = [];
            for (const file of selectedFiles) {
              const fileExt = file.name.split('.').pop();
              const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
              const filePath = `uploads/${fileName}`;

              const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
              
              if (uploadError) {
                console.error(uploadError);
                throw new Error('Failed to upload file to storage');
              }
              mediaPaths.push(filePath);
            }

            const item = {
              title,
              description: isStory ? 'Story Upload' : (description || ''),
              thumbnailPath: mediaPaths[0],
              mediaPaths: mediaPaths,
              type: selectedFiles.length > 1 ? 'carousel' : type,
              isPublic: isStory ? true : (tier === 'free'),
              minTier: isStory ? 'free' : tier,
              category,
            };

            await uploadContent(item);

            // Reset form
            if (document.getElementById('upload-title')) document.getElementById('upload-title').value = '';
            if (document.getElementById('upload-description')) document.getElementById('upload-description').value = '';
            if (document.getElementById('upload-category')) document.getElementById('upload-category').value = 'lingerie';
            document.querySelectorAll('input[name="upload-type"]').forEach(r => r.checked = r.value === 'image');
            document.querySelectorAll('input[name="upload-tier"]').forEach(r => r.checked = r.value === 'free');
            document.querySelectorAll('input[name="upload-destination"]').forEach(r => r.checked = r.value === 'feed');
            if (titleGroup) titleGroup.querySelector('label').textContent = 'Title';
            if (descGroup) descGroup.style.display = '';
            if (catGroup) catGroup.style.display = '';
            if (tierGroup) tierGroup.style.display = '';
            selectedFiles = [];
            if (filenameLabel) filenameLabel.textContent = 'Supports up to 20 files (JPG, PNG, MP4, MOV)';
            
          } catch (e) {
            showToast(e.message || 'Upload failed', 'error');
          } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = `${icons.upload} Upload Content`;
          }
        });
      }

      // =====================
      // Promotions Tab Wiring
      // =====================
      function wirePromotionsTab() {
        // Set preview background to selected color on load
        const previewEl = document.getElementById('promo-preview');
        const colorInput = document.getElementById('promo-color');
        if (previewEl && colorInput) {
          previewEl.style.background = colorInput.value;
        }

        // Live preview updates
        document.getElementById('promo-code')?.addEventListener('input', (e) => {
          const el = document.getElementById('preview-code');
          if (el) el.textContent = e.target.value.toUpperCase() || 'PROMO';
        });

        document.getElementById('promo-discount')?.addEventListener('input', (e) => {
          const el = document.getElementById('preview-discount');
          if (el) el.textContent = e.target.value || '20';
        });

        document.getElementById('promo-text')?.addEventListener('input', (e) => {
          const el = document.getElementById('preview-text');
          if (el) el.textContent = e.target.value || 'Limited time offer!';
        });

        document.getElementById('promo-color')?.addEventListener('input', (e) => {
          const preview = document.getElementById('promo-preview');
          const hexLabel = document.getElementById('promo-color-hex');
          if (preview) preview.style.background = e.target.value;
          if (hexLabel) hexLabel.textContent = e.target.value;
        });

        const reRenderTab = () => {
          const contentEl = document.getElementById('admin-tab-content');
          if (contentEl) {
            contentEl.innerHTML = renderPromotionsTab();
            wirePromotionsTab();
          }
        };

        // Create promo button
        document.getElementById('promo-create-btn')?.addEventListener('click', async () => {
          const code = document.getElementById('promo-code')?.value?.trim().toUpperCase();
          const discount = parseInt(document.getElementById('promo-discount')?.value) || 20;
          const description = document.getElementById('promo-text')?.value?.trim() || 'Limited time offer!';
          const expiresAt = document.getElementById('promo-expiry')?.value || null;
          const color = document.getElementById('promo-color')?.value || '#E91E8C';

          if (!code) { showToast('Please enter a promo code', 'error'); return; }
          if (discount < 1 || discount > 100) { showToast('Discount must be 1-100%', 'error'); return; }

          await createPromo({ code, discount, description, color, expiresAt });
          reRenderTab();
        });

        // List buttons
        document.querySelectorAll('.promo-publish-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            await publishPromo(id);
            reRenderTab();
          });
        });

        document.querySelectorAll('.promo-delete-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (confirm('Delete this promotion?')) {
              const id = btn.dataset.id;
              await deletePromo(id);
              reRenderTab();
            }
          });
        });
      }

      // =====================
      // Polls Tab Wiring
      // =====================
      function wirePollsTab() {
        const reRenderTab = () => {
          if (activePollInterval) {
            clearInterval(activePollInterval);
            activePollInterval = null;
          }
          const contentEl = document.getElementById('admin-tab-content');
          if (contentEl) {
            contentEl.innerHTML = renderPollsTab();
            wirePollsTab();
          }
        };

        if (activePollInterval) {
          clearInterval(activePollInterval);
          activePollInterval = null;
        }

        // Countdown Timer for Active Poll
        const countdownEl = document.getElementById('active-poll-countdown');
        if (countdownEl) {
          const expiry = countdownEl.dataset.expiry;
          if (expiry) {
            const updateCountdown = () => {
              const now = Date.now();
              const end = new Date(expiry).getTime();
              const diff = end - now;
              if (diff <= 0) {
                countdownEl.textContent = 'Expired';
                clearInterval(activePollInterval);
                activePollInterval = null;
                reRenderTab();
                return;
              }
              const h = Math.floor(diff / 3600000);
              const m = Math.floor((diff % 3600000) / 60000);
              const s = Math.floor((diff % 60000) / 1000);
              countdownEl.textContent = `${h}h ${m}m ${s}s`;
            };
            updateCountdown();
            activePollInterval = setInterval(updateCountdown, 1000);
          }
        }

        // End poll button
        document.querySelector('.active-poll-end-btn')?.addEventListener('click', async (e) => {
          if (confirm('Are you sure you want to end this poll now?')) {
            const btn = e.currentTarget;
            const id = btn.dataset.id;
            const { endPoll } = await import('../store.js');
            await endPoll(id);
            reRenderTab();
          }
        });

        // Create poll button
        document.getElementById('poll-create-btn')?.addEventListener('click', async () => {
          const question = document.getElementById('poll-question')?.value?.trim();
          const opt1 = document.getElementById('poll-opt-1')?.value?.trim();
          const opt2 = document.getElementById('poll-opt-2')?.value?.trim();
          const opt3 = document.getElementById('poll-opt-3')?.value?.trim();
          const opt4 = document.getElementById('poll-opt-4')?.value?.trim();
          const durationHours = parseInt(document.getElementById('poll-duration')?.value) || 24;

          if (!question) { showToast('Please enter a question', 'error'); return; }
          if (!opt1 || !opt2) { showToast('Please enter at least Option 1 and Option 2', 'error'); return; }

          const options = [
            { id: 'a', text: opt1 },
            { id: 'b', text: opt2 }
          ];
          if (opt3) options.push({ id: 'c', text: opt3 });
          if (opt4) options.push({ id: 'd', text: opt4 });

          const { createPoll } = await import('../store.js');
          await createPoll({ question, options, durationHours });
          reRenderTab();
        });

        // Delete poll button
        document.querySelectorAll('.poll-delete-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this poll?')) {
              const id = btn.dataset.id;
              const { deletePoll } = await import('../store.js');
              await deletePoll(id);
              reRenderTab();
            }
          });
        });
      }
    },
    cleanup() {
      if (adminMessagesSub) {
        adminMessagesSub();
        adminMessagesSub = null;
      }
      if (activePollInterval) {
        clearInterval(activePollInterval);
        activePollInterval = null;
      }
    }
  };
}
