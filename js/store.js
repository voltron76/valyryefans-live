// ============================================================
// ValyryeFans — Supabase Reactive State Store
// ============================================================

import { supabase } from './supabase.js';

// Listeners map: key -> Set of callbacks
const listeners = new Map();

// Generate short IDs
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// Format Dates
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ------------------------------------
// Core State
// ------------------------------------
export const state = {
  creatorProfile: {
    name: 'Valyrye',
    handle: '@valyrye',
    bio: `I'M ALWAYS HERE TO REPLY 🟢 LET'S CHAT 💬‼️\n\nWanna see what I don't post anywhere else? this is the only place you'll get the real me.\n\nAll natural, playful, and sweet. Slide in and let's have some fun. 😏\nNo agencies, no chatbots, no AI. Just me, all for you 🤭`,
    avatar: 'assets/images/avatar.jpg',
    banner: 'assets/images/hero-01.jpg',
    banners: [
      'assets/images/hero-01.jpg',
      'assets/images/hero-02.jpg',
      'assets/images/hero-03.jpg',
      'assets/images/hero-04.jpg',
      'assets/images/hero-05.jpg',
    ],
    stats: { posts: 0, photos: 0, videos: 0, fans: '12.4K' },
    verified: true,
    online: true,
  },
  user: {
    name: 'Guest User',
    email: 'guest@example.com',
    tier: 'free',
    cardOnFile: false,
    id: null,
  },
  isAuthenticated: false,
  isAdmin: false,
  currentTier: 'free', // 'free' | 'gold'
  content: [], // Loaded from DB
  messages: [], // Loaded from DB
  notifications: [],
  bookmarks: [],
  ui: {
    authModalOpen: false,
    authMode: 'login',
  },
  tiers: [
    {
      id: 'free',
      name: 'Free Fan',
      price: 0,
      period: '',
      popular: false,
      cta: 'Sign Up Free',
      features: [
        { text: 'Access to free tier photos & teasers', included: true },
        { text: 'Pay-per-view messaging', included: true },
        { text: 'Exclusive Gold photo sets', included: false },
        { text: 'Behind the scenes videos', included: false },
        { text: 'Direct 1-on-1 chatting', included: false }
      ]
    },
    {
      id: 'gold',
      name: 'Gold VIP',
      price: 14.99,
      period: '/month',
      popular: true,
      cta: 'Subscribe Now',
      features: [
        { text: 'Access to free tier photos & teasers', included: true },
        { text: 'Pay-per-view messaging', included: true },
        { text: 'Exclusive Gold photo sets', included: true },
        { text: 'Behind the scenes videos', included: true },
        { text: 'Direct 1-on-1 chatting', included: true }
      ]
    }
  ],
  totalTips: 0,
  adminUsers: [],
  adminMessages: {}
};

// ------------------------------------
// Reactivity System
// ------------------------------------
export function getState() {
  return new Proxy(state, {
    get(target, prop) {
      return target[prop];
    },
    set(target, prop, value) {
      target[prop] = value;
      notify(prop);
      return true;
    }
  });
}

export function subscribe(keys, callback) {
  const keyArray = Array.isArray(keys) ? keys : [keys];
  keyArray.forEach(key => {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(callback);
  });
  return () => {
    keyArray.forEach(key => {
      listeners.get(key)?.delete(callback);
    });
  };
}

function notify(key) {
  if (listeners.has(key)) {
    listeners.get(key).forEach(cb => cb(state));
  }
}

export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type} animate-fade-in-up`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<span class="toast__icon">${icon}</span><span class="toast__message">${message}</span>`;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ------------------------------------
// Database Initialization
// ------------------------------------
export async function initStore() {
  try {
    // 1. Check Auth Session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      state.isAuthenticated = true;
      state.user.id = session.user.id;
      state.user.email = session.user.email;
      
      // Fetch Profile
      let { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      
      if (!profile) {
        // Create profile if missing — use signup display name from user_metadata
        const displayName = session.user.user_metadata?.name || session.user.email.split('@')[0];
        const newProfile = { id: session.user.id, name: displayName, tier: 'free', balance: 0 };
        const { data: p } = await supabase.from('profiles').insert([newProfile]).select().single();
        profile = p;
      }

      if (profile) {
        state.user.name = profile.name || session.user.user_metadata?.name || session.user.email.split('@')[0];
        state.user.tier = profile.tier || 'free';
        state.currentTier = profile.tier || 'free';
        state.user.cardOnFile = profile.tier === 'gold';
        state.isAdmin = profile.tier === 'admin';
      }

      // Fetch user specific messages
      if (!state.isAdmin) {
        const { data: msgs } = await supabase.from('messages')
          .select('*')
          .or(`recipient_id.eq.${session.user.id},recipient_id.is.null`)
          .order('created_at', { ascending: true });
        if (msgs) {
          state.messages = msgs.map(m => ({
            id: m.id,
            sender: m.sender_id === session.user.id ? 'fan' : 'valyrye',
            content: m.content,
            time: formatTime(m.created_at),
            type: m.type,
            mediaUrl: m.media_url
          }));
        }
      } else {
        // If Admin, fetch all users and messages
        await loadAdminData();
      }
    }

    // 2. Fetch Content Metadata
    const { data: contentData } = await supabase.from('content').select('*').order('created_at', { ascending: false });
    
    if (contentData && contentData.length > 0) {
      // 3. Generate Signed URLs for the private media bucket
      const allPaths = [];
      contentData.forEach(c => {
        if (c.thumbnail) allPaths.push(c.thumbnail);
        if (c.video_url) allPaths.push(c.video_url);
        if (c.media && Array.isArray(c.media)) allPaths.push(...c.media);
      });

      const uniquePaths = [...new Set(allPaths)].filter(p => p && !p.startsWith('http')); // Only sign relative supabase paths
      
      let urlMap = {};
      if (uniquePaths.length > 0) {
        const { data: signedUrls } = await supabase.storage.from('media').createSignedUrls(uniquePaths, 3600); // 1 hour expiry
        if (signedUrls) {
          signedUrls.forEach((su, i) => {
            if (!su.error) urlMap[uniquePaths[i]] = su.signedUrl;
          });
        }
      }

      // 4. Map content to state
      state.content = contentData.map(c => {
        const mappedMedia = (c.media || []).map(m => urlMap[m] || m);
        return {
          id: c.id,
          title: c.title,
          description: c.description || '',
          type: c.type,
          thumbnail: urlMap[c.thumbnail] || c.thumbnail,
          videoUrl: c.video_url ? (urlMap[c.video_url] || c.video_url) : null,
          media: mappedMedia,
          minTier: c.min_tier,
          likes: c.likes || 0,
          category: c.category || 'Other',
          createdAt: formatDate(c.created_at)
        };
      });

      // Update Creator Stats
      state.creatorProfile.stats.posts = state.content.length;
      state.creatorProfile.stats.photos = state.content.filter(c => c.type === 'photo' || c.type === 'carousel').length;
      state.creatorProfile.stats.videos = state.content.filter(c => c.type === 'video').length;
    }

  } catch (err) {
    console.error('Error initializing store:', err);
  }
}

async function loadAdminData() {
  // Fetch all profiles that aren't admin
  const { data: profiles } = await supabase.from('profiles').select('*').neq('tier', 'admin');
  if (profiles) {
    state.adminUsers = profiles.map(p => ({
      id: p.id,
      name: p.name || 'Fan',
      tier: p.tier,
      lastSeen: formatDate(p.created_at),
      unread: 0
    }));
  }

  // Fetch all messages
  const { data: allMsgs } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
  if (allMsgs) {
    state.adminMessages = {};
    allMsgs.forEach(m => {
      const uId = m.sender_id === state.user.id ? m.recipient_id : m.sender_id;
      if (uId && uId !== state.user.id) {
        if (!state.adminMessages[uId]) state.adminMessages[uId] = [];
        state.adminMessages[uId].push({
          id: m.id,
          sender: m.sender_id === state.user.id ? 'valyrye' : 'fan',
          content: m.content,
          time: formatTime(m.created_at),
          type: m.type
        });
      }
    });
  }
}

// ------------------------------------
// Public APIs
// ------------------------------------
export function canAccessTier(requiredTier) {
  if (state.isAdmin) return true;
  if (requiredTier === 'free') return true;
  return state.currentTier === 'gold';
}

export async function addMessage(content, sender = 'fan', type = 'text', mediaUrl = null) {
  if (!state.user.id) {
    showToast('Please login to send messages', 'error');
    return;
  }

  const msg = {
    sender_id: state.user.id,
    recipient_id: null, // Valyrye
    content,
    type,
    media_url: mediaUrl
  };

  const { data, error } = await supabase.from('messages').insert([msg]).select().single();
  if (error) {
    showToast('Failed to send message', 'error');
    return;
  }

  const newMsg = {
    id: data.id,
    sender,
    content: data.content,
    time: formatTime(data.created_at),
    type: data.type,
    mediaUrl: data.media_url
  };
  state.messages.push(newMsg);
  notify('messages');
  return newMsg;
}

export async function addAdminReply(userId, content, type = 'text', mediaUrl = null) {
  if (!state.isAdmin) return;

  const msg = {
    sender_id: state.user.id,
    recipient_id: userId,
    content,
    type,
    media_url: mediaUrl
  };

  const { data, error } = await supabase.from('messages').insert([msg]).select().single();
  if (!error) {
    if (!state.adminMessages[userId]) state.adminMessages[userId] = [];
    state.adminMessages[userId].push({
      id: data.id,
      sender: 'valyrye',
      content: data.content,
      time: formatTime(data.created_at),
      type: data.type,
      mediaUrl: data.media_url
    });
    notify('adminMessages');
  }
}

export async function uploadContent(item) {
  if (!state.isAdmin) return;

  const newContent = {
    title: item.title,
    description: item.description,
    type: item.type,
    min_tier: item.minTier,
    category: item.category,
    thumbnail: item.thumbnailPath, // Storage path
    video_url: item.videoPath,
    media: item.mediaPaths, // Array of storage paths
    likes: 0
  };

  const { data, error } = await supabase.from('content').insert([newContent]).select().single();
  
  if (error) {
    showToast('Upload failed to database', 'error');
  } else {
    showToast('Content published successfully!', 'success');
    // Refresh content
    await initStore();
    notify('content');
  }
}

export async function addTip(contentId, amount, message = null) {
  if (!state.user.id) return;
  
  const { error } = await supabase.from('tips').insert([{
    user_id: state.user.id,
    content_id: contentId,
    amount: amount,
    message: message
  }]);

  if (!error) {
    state.totalTips += parseFloat(amount);
    notify('totalTips');
  }
}

export function toggleBookmark(id) {
  const idx = state.bookmarks.indexOf(id);
  if (idx !== -1) {
    state.bookmarks.splice(idx, 1);
    showToast('Removed from bookmarks');
  } else {
    state.bookmarks.push(id);
    showToast('Added to bookmarks');
  }
  notify('bookmarks');
}

export function isBookmarked(id) {
  return state.bookmarks.includes(id);
}

export function markNotificationsRead() {
  state.notifications.forEach(n => n.read = true);
  notify('notifications');
}

export function getUnreadCount() {
  return state.notifications.filter(n => !n.read).length;
}

export function getRandomReply() {
  const replies = [
    "I love that! 💕",
    "You always know exactly what to say 😘",
    "I'll definitely think about making that for you... ✨",
    "Thank you so much! You're my favorite 😘",
    "Let me check my schedule and get back to you on that!",
    "That sounds amazing 🔥",
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

// ------------------------------------
// Post Feed System
// ------------------------------------
export function toggleLike(contentId) {
  const item = state.content.find(c => c.id === contentId);
  if (!item) return;
  if (!item.likedByUser) {
    item.likes = (item.likes || 0) + 1;
    item.likedByUser = true;
  } else {
    item.likes = Math.max(0, (item.likes || 1) - 1);
    item.likedByUser = false;
  }
  notify('content');
}

export function addComment(contentId, text) {
  const item = state.content.find(c => c.id === contentId);
  if (!item) return;
  if (!item.comments) item.comments = [];
  const comment = {
    id: Date.now().toString(36),
    userId: state.user.id,
    userName: state.user.name || 'Anonymous',
    text,
    time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    isCreator: state.isAdmin
  };
  item.comments.push(comment);
  notify('content');
  return comment;
}

export async function tipPost(contentId, amount) {
  await addTip(contentId, amount);
  const item = state.content.find(c => c.id === contentId);
  if (item) {
    item.tips = (item.tips || 0) + parseFloat(amount);
    notify('content');
  }
  showToast(`💰 Sent $${parseFloat(amount).toFixed(2)} tip!`, 'success');
}

// ------------------------------------
// Polls System
// ------------------------------------
export const polls = [
  {
    id: 'poll-1',
    question: '🔥 What should I post next?',
    options: [
      { id: 'a', text: 'Lingerie photoshoot', votes: 847 },
      { id: 'b', text: 'Beach day video', votes: 623 },
      { id: 'c', text: 'Behind-the-scenes', votes: 512 },
      { id: 'd', text: 'Q&A / Get to know me', votes: 394 },
    ],
    totalVotes: 2376,
    userVote: null,
    createdAt: '2 hours ago',
    pinned: false
  }
];

export function votePoll(pollId, optionId) {
  const poll = polls.find(p => p.id === pollId);
  if (!poll || poll.userVote) return;
  const option = poll.options.find(o => o.id === optionId);
  if (!option) return;
  option.votes++;
  poll.totalVotes++;
  poll.userVote = optionId;
  notify('polls');
}

// ------------------------------------
// Welcome Message
// ------------------------------------
export async function sendWelcomeMessage() {
  const welcomeText = `Hey ${state.user.name || 'babe'}! 💕 Welcome to my VIP! I'm SO happy you're here. You just unlocked everything 🔓\n\nDM me anytime — I always reply to my Gold members first 😘`;
  const msg = {
    id: 'welcome-' + Date.now(),
    sender: 'valyrye',
    content: welcomeText,
    time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    type: 'text'
  };
  state.messages.unshift(msg);
  notify('messages');
}

// ------------------------------------
// Promotion System
// ------------------------------------
export const activePromo = {
  active: true,
  text: '🔥 Summer Special — 40% OFF first month!',
  code: 'SUMMER40',
  expiresIn: '2d 14h',
  discount: 40
};
