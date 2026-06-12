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
    avatarUrl: null,
    tipLimit: 0,
    subscriptionStatus: 'active',
    cardLast4: '',
  },
  isAuthenticated: false,
  isAdmin: false,
  currentTier: 'free', // 'free' | 'gold'
  content: [], // Loaded from DB
  messages: [], // Loaded from DB
  notifications: [],
  activePromo: null,
  allPromos: [],
  creatorId: null,
  bookmarks: [],
  polls: [],
  hasActiveRealtimeSub: false,
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
        state.user.avatarUrl = profile.avatar_url || null;
        state.user.tipLimit = profile.tip_limit || 0;
        state.user.subscriptionStatus = profile.subscription_status || 'active';
        state.user.cardLast4 = profile.card_last4 || '';
      }

      // Fetch Creator/Admin profile ID
      try {
        const { data: adminProf } = await supabase.from('profiles').select('id').eq('tier', 'admin').limit(1).maybeSingle();
        if (adminProf) {
          state.creatorId = adminProf.id;
        }
      } catch (e) {
        console.error('Error fetching creator profile ID:', e);
      }

      // Fetch user specific messages
      if (!state.isAdmin) {
        const { data: msgs } = await supabase.from('messages')
          .select('*')
          .or(`sender_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)
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
          notify('messages');
        }
      } else {
        // If Admin, fetch all users and messages
        await loadAdminData();
      }
    }

    // 1.5 Fetch user likes if logged in
    const likedContentIds = new Set();
    if (session) {
      try {
        const { data: likesData } = await supabase.from('content_likes').select('content_id').eq('user_id', session.user.id);
        if (likesData) {
          likesData.forEach(l => likedContentIds.add(l.content_id));
        }
      } catch (e) {
        console.error('Error loading likes:', e);
      }
    }

    // 1.6 Fetch comments (Supabase table with localStorage fallback)
    let commentsMap = {};
    try {
      const { data: commentsData, error: commentsErr } = await supabase.from('comments').select('*, profiles(tier)').order('created_at', { ascending: true });
      if (!commentsErr && commentsData) {
        commentsData.forEach(c => {
          if (!commentsMap[c.content_id]) commentsMap[c.content_id] = [];
          commentsMap[c.content_id].push({
            id: c.id,
            userId: c.user_id,
            userName: c.user_name || 'Anonymous',
            tier: (Array.isArray(c.profiles) ? c.profiles[0]?.tier : c.profiles?.tier) || 'free',
            text: c.text,
            time: formatTime(c.created_at),
            isCreator: c.user_name === 'Valyrye'
          });
        });
      } else {
        throw new Error(commentsErr?.message || 'Comments table query failed');
      }
    } catch (err) {
      const localComments = localStorage.getItem('vf-comments');
      if (localComments) {
        try {
          commentsMap = JSON.parse(localComments);
        } catch (e) {}
      }
    }

    // 2. Fetch Content Metadata
    const { data: contentData } = await supabase.from('content').select('*').order('created_at', { ascending: false });
    
    if (contentData && contentData.length > 0) {
      // 3. Generate Signed URLs for the private media bucket
      const allPaths = [];
      contentData.forEach(c => {
        const hasAccess = state.isAdmin || c.min_tier === 'free' || state.currentTier === 'gold';
        
        if (c.thumbnail) allPaths.push(c.thumbnail);
        
        // Only request signed URLs for main media if the user actually has access
        if (hasAccess) {
          if (c.video_url) allPaths.push(c.video_url);
          if (c.media && Array.isArray(c.media)) allPaths.push(...c.media);
        }
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
        const hasAccess = state.isAdmin || c.min_tier === 'free' || state.currentTier === 'gold';
        const mappedMedia = hasAccess ? (c.media || []).map(m => urlMap[m] || m) : [];
        const commentsList = commentsMap[c.id] || [];
        return {
          id: c.id,
          title: c.title,
          description: c.description || '',
          type: c.type,
          thumbnail: urlMap[c.thumbnail] || c.thumbnail,
          videoUrl: (hasAccess && c.video_url) ? (urlMap[c.video_url] || c.video_url) : null,
          media: mappedMedia,
          minTier: c.min_tier,
          likes: c.likes || 0,
          likedByUser: likedContentIds.has(c.id),
          comments: commentsList,
          views: c.views || 0,
          category: c.category || 'Other',
          createdAt: formatDate(c.created_at),
          rawCreatedAt: c.created_at
        };
      });

      // Update Creator Stats
      state.creatorProfile.stats.posts = state.content.filter(c => c.category !== 'story' && c.category !== 'promo').length;
      state.creatorProfile.stats.photos = state.content.filter(c => (c.type === 'photo' || c.type === 'carousel') && c.category !== 'story' && c.category !== 'promo').length;
      state.creatorProfile.stats.videos = state.content.filter(c => c.type === 'video' && c.category !== 'story' && c.category !== 'promo').length;

      // Generate notifications from actual content/messages
      if (session && !state.isAdmin) {
        generateNotifications(state, session);
      }

      // Load all promos
      const { data: promos } = await supabase.from('content')
        .select('*')
        .eq('category', 'promo')
        .order('created_at', { ascending: false });
      if (promos) {
        state.allPromos = promos.map(p => {
          const parts = (p.description || '').split('|');
          return {
            id: p.id,
            code: p.title || 'PROMO',
            discount: parseInt(parts[0]) || 20,
            description: parts[1] || 'Limited time offer!',
            expiresAt: parts[2] || null,
            color: parts[3] || '#E91E8C',
            status: parts[4] || 'inactive'
          };
        });
        const active = state.allPromos.find(p => p.status === 'active' && (!p.expiresAt || new Date(p.expiresAt) > new Date()));
        state.activePromo = active || null;
      } else {
        state.allPromos = [];
        state.activePromo = null;
      }
    }

    // Fetch Polls
    try {
      const { data: dbPolls, error: pollsErr } = await supabase.from('polls').select('*').order('created_at', { ascending: false });
      const { data: dbVotes, error: votesErr } = await supabase.from('poll_votes').select('*');
      
      if (!pollsErr) {
        const mappedPolls = (dbPolls || []).map(p => {
          const votesForPoll = (dbVotes || []).filter(v => v.poll_id === p.id);
          const optionsWithVotes = (p.options || []).map(opt => {
            const count = votesForPoll.filter(v => v.option_id === opt.id).length;
            return { ...opt, votes: count };
          });
          const totalVotes = votesForPoll.length;
          const userVote = session ? votesForPoll.find(v => v.user_id === session.user.id)?.option_id || null : null;
          
          const isExpired = p.expires_at ? new Date(p.expires_at) < new Date() : false;
          
          return {
            id: p.id,
            question: p.question,
            options: optionsWithVotes,
            totalVotes,
            userVote,
            createdAt: formatRelativeTime(p.created_at),
            expiresAt: p.expires_at,
            isExpired
          };
        });
        
        state.polls = mappedPolls;
        polls.length = 0;
        polls.push(...mappedPolls);
        notify('polls');
      }
    } catch (e) {
      console.error('Error loading polls:', e);
    }

    // Fetch Supabase Realtime message subscription
    if (session && !state.hasActiveRealtimeSub) {
      state.hasActiveRealtimeSub = true;
      
      supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
          const newMsg = payload.new;
          
          const isRelevant = newMsg.sender_id === state.user.id || newMsg.recipient_id === state.user.id || state.isAdmin;
          if (!isRelevant) return;

          if (newMsg.sender_id !== state.user.id) {
            playNotificationSound();
            let senderName = 'Valyrye';
            if (state.isAdmin) {
              const profile = state.adminUsers.find(u => u.id === newMsg.sender_id);
              senderName = profile ? (profile.name || 'A user') : 'A user';
            }
            showToast(`💬 New message from ${senderName}`, 'info');
          }

          await initStore();
        })
        .subscribe();
    }

  } catch (err) {
    console.error('Error initializing store:', err);
  }
}

// ------------------------------------
// Notification Generation
// ------------------------------------
function formatRelativeTime(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(dateStr);
}

function generateNotifications(st, session) {
  const notifications = [];
  const userTier = st.currentTier || 'free';
  const lastSeen = localStorage.getItem('vf-last-notif-seen') || '1970-01-01T00:00:00Z';
  const lastSeenTime = new Date(lastSeen).getTime();
  // Load persisted read notification IDs
  let readIds = [];
  try { readIds = JSON.parse(localStorage.getItem('vf-read-notif-ids') || '[]'); } catch(e) {}

  // 1. Content upload notifications (non-story feed posts)
  const feedPosts = st.content.filter(c => c.category !== 'story' && c.category !== 'promo');
  feedPosts.forEach(post => {
    // Free content → everyone gets notified. Gold content → only gold users
    if (post.minTier === 'gold' && userTier !== 'gold') return;

    const postTime = new Date(post.rawCreatedAt).getTime();
    const notifId = `notif-post-${post.id}`;
    const isNew = postTime > lastSeenTime && !readIds.includes(notifId);
    const typeLabel = post.type === 'video' ? '🎬 New Video' : post.media?.length > 1 ? '📸 New Photo Set' : '📷 New Post';

    notifications.push({
      id: notifId,
      type: 'new_post',
      title: `${typeLabel}${post.minTier === 'gold' ? ' (Gold Exclusive)' : ''}`,
      message: `Valyrye posted "${post.title || 'New content'}"${post.minTier === 'gold' ? ' — exclusive for Gold members!' : ''}`,
      time: formatRelativeTime(post.rawCreatedAt),
      rawTime: post.rawCreatedAt,
      read: !isNew,
      link: `/content/${post.id}`
    });
  });

  // 2. Story notifications
  const stories = st.content.filter(c => c.category === 'story');
  // Group stories by date (same day = one notification)
  const storyDates = new Map();
  stories.forEach(story => {
    const day = new Date(story.rawCreatedAt).toDateString();
    if (!storyDates.has(day)) storyDates.set(day, story);
  });
  storyDates.forEach((story, day) => {
    const storyTime = new Date(story.rawCreatedAt).getTime();
    const notifId = `notif-story-${day}`;
    const isNew = storyTime > lastSeenTime && !readIds.includes(notifId);
    notifications.push({
      id: notifId,
      type: 'new_post',
      title: '🔥 New Story',
      message: `Valyrye added a new story — check it out before it disappears!`,
      time: formatRelativeTime(story.rawCreatedAt),
      rawTime: story.rawCreatedAt,
      read: !isNew,
      link: '/'
    });
  });

  // 3. Message notifications (unread incoming messages)
  const incomingMsgs = st.messages.filter(m => m.sender === 'valyrye');
  if (incomingMsgs.length > 0) {
    const latest = incomingMsgs[incomingMsgs.length - 1];
    const msgNotifId = `notif-msg-${latest.id}`;
    notifications.push({
      id: msgNotifId,
      type: 'message',
      title: '💬 New Message from Valyrye',
      message: latest.content?.substring(0, 80) + (latest.content?.length > 80 ? '...' : ''),
      time: latest.time || 'Recently',
      rawTime: null,
      read: readIds.includes(msgNotifId),
      link: '/messages'
    });
  }

  // 4. Subscription welcome notification
  if (userTier === 'gold') {
    const notifId = 'notif-sub-welcome';
    notifications.push({
      id: notifId,
      type: 'subscription',
      title: '⭐ Gold VIP Active',
      message: 'You have full access to all exclusive content. Enjoy your Gold membership!',
      time: 'Active',
      rawTime: null,
      read: readIds.includes(notifId),
      link: '/profile'
    });
  }

  // 5. Welcome notification (always present)
  const welcomeNotifId = 'notif-welcome';
  notifications.push({
    id: welcomeNotifId,
    type: 'system',
    title: '👋 Welcome to ValyryeFans',
    message: 'Explore exclusive content and connect with Valyrye. Enjoy your experience!',
    time: 'Welcome',
    rawTime: null,
    read: readIds.includes(welcomeNotifId),
    link: '/'
  });

  // Sort: unread first, then by rawTime descending
  notifications.sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    if (a.rawTime && b.rawTime) return new Date(b.rawTime) - new Date(a.rawTime);
    return 0;
  });

  // Limit to 30 most recent
  st.notifications = notifications.slice(0, 30);
  notify('notifications');
}

function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, ctx.currentTime); // D6
    osc2.frequency.setValueAtTime(1760.00, ctx.currentTime + 0.1); // A6

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.45);
    osc2.stop(ctx.currentTime + 0.45);
  } catch (e) {
    console.error('AudioContext sound failed:', e);
  }
}

async function loadAdminData() {
  // Fetch all profiles that aren't admin
  const { data: profiles } = await supabase.from('profiles').select('*').neq('tier', 'admin');
  
  // Fetch all messages
  const { data: allMsgs } = await supabase.from('messages').select('*').order('created_at', { ascending: true });

  if (profiles) {
    state.adminUsers = profiles.map(p => {
      const unreadCount = (allMsgs || []).filter(m => m.sender_id === p.id && !m.is_read).length;
      return {
        id: p.id,
        name: p.name || 'Fan',
        tier: p.tier,
        lastSeen: formatDate(p.created_at),
        unread: unreadCount
      };
    });
  }

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
          type: m.type,
          mediaUrl: m.media_url
        });
      }
    });
  }

  notify('adminUsers');
  notify('adminMessages');
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
    recipient_id: state.creatorId || null, // Valyrye
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

export async function chargeSavedCard(amount, contentId = null, message = null) {
  if (!state.user.id) return { success: false, error: 'User not logged in' };
  try {
    const { data, error } = await supabase.functions.invoke('charge-saved-card', {
      body: { amount, contentId, message }
    });
    if (error || !data?.success) {
      throw new Error(error?.message || data?.error || 'Payment failed');
    }
    // Update local state tip total
    state.totalTips += parseFloat(amount);
    notify('totalTips');
    return { success: true };
  } catch (e) {
    console.error('[Store] Failed to charge saved card:', e);
    return { success: false, error: e.message };
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
export async function toggleLike(contentId) {
  if (!state.user.id) {
    showToast('Please login to like posts', 'error');
    return;
  }
  const item = state.content.find(c => c.id === contentId);
  if (!item) return;

  const originalLiked = item.likedByUser;
  const originalLikesCount = item.likes;

  // Optimistic UI update
  if (!item.likedByUser) {
    item.likes = (item.likes || 0) + 1;
    item.likedByUser = true;
  } else {
    item.likes = Math.max(0, (item.likes || 1) - 1);
    item.likedByUser = false;
  }
  notify('content');

  try {
    if (!originalLiked) {
      const { error: likeErr } = await supabase.from('content_likes').insert([{
        content_id: contentId,
        user_id: state.user.id
      }]);
      if (likeErr) throw likeErr;
    } else {
      const { error: unlikeErr } = await supabase.from('content_likes').delete().eq('content_id', contentId).eq('user_id', state.user.id);
      if (unlikeErr) throw unlikeErr;
    }
    // DB trigger automatically updates content.likes count
  } catch (err) {
    // Revert if error
    item.likedByUser = originalLiked;
    item.likes = originalLikesCount;
    notify('content');
    showToast('Failed to update like. You may not have access.', 'error');
  }
}

export async function addComment(contentId, text) {
  if (!state.user.id) {
    showToast('Please login to comment', 'error');
    return;
  }
  const item = state.content.find(c => c.id === contentId);
  if (!item) return;

  const commentObj = {
    content_id: contentId,
    user_id: state.user.id,
    user_name: state.user.name || 'Anonymous',
    text: text
  };

  let success = false;
  let newComment = null;

  try {
    const { data, error } = await supabase.from('comments').insert([commentObj]).select('*, profiles(tier)').single();
    if (!error && data) {
      newComment = {
        id: data.id,
        userId: data.user_id,
        userName: data.user_name || 'Anonymous',
        tier: (Array.isArray(data.profiles) ? data.profiles[0]?.tier : data.profiles?.tier) || state.user.tier || 'free',
        text: data.text,
        time: formatTime(data.created_at),
        isCreator: state.isAdmin
      };
      success = true;
    }
  } catch (err) {
    // Suppress and fallback
  }

  if (!success) {
    // Local storage fallback
    newComment = {
      id: Date.now().toString(36),
      userId: state.user.id,
      userName: state.user.name || 'Anonymous',
      tier: state.user.tier || 'free',
      text,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isCreator: state.isAdmin
    };
    
    const localComments = JSON.parse(localStorage.getItem('vf-comments') || '{}');
    if (!localComments[contentId]) localComments[contentId] = [];
    localComments[contentId].push(newComment);
    localStorage.setItem('vf-comments', JSON.stringify(localComments));
  }

  if (!item.comments) item.comments = [];
  item.comments.push(newComment);
  notify('content');
  return newComment;
}

export async function incrementStoryView(storyId) {
  const item = state.content.find(c => c.id === storyId);
  if (!item) return;

  item.views = (item.views || 0) + 1;
  notify('content');

  try {
    const { error } = await supabase.rpc('increment_view', { content_id: storyId });
    if (error) throw error;
  } catch (err) {
    console.error('Failed to increment view via RPC:', err);
    try {
      await supabase.from('content').update({ views: item.views }).eq('id', storyId);
    } catch (dbErr) {}
  }
}

export async function tipPost(contentId, amount, message = null, successPath = null, cancelPath = null) {
  const tipAmount = parseFloat(amount);
  if (state.user.tipLimit > 0 && tipAmount > state.user.tipLimit) {
    showToast(`Tip exceeds your limit of $${state.user.tipLimit.toFixed(2)}`, 'error');
    return { success: false, error: 'limit_exceeded' };
  }

  const hasCard = state.user?.cardOnFile || state.user?.tier === 'gold';
  if (hasCard) {
    const res = await chargeSavedCard(tipAmount, contentId, message);
    if (res.success) {
      const item = state.content.find(c => c.id === contentId);
      if (item) {
        item.tips = (item.tips || 0) + tipAmount;
        notify('content');
      }
      showToast(`💰 Sent $${tipAmount.toFixed(2)} tip! Thank you!`, 'success');
      return { success: true };
    } else {
      return { success: false, error: res.error || 'payment_failed' };
    }
  } else {
    // Redirect to checkout with dynamic parameters
    let dest = `checkout?tip=${tipAmount}`;
    if (contentId) dest += `&contentId=${encodeURIComponent(contentId)}`;
    if (message) dest += `&message=${encodeURIComponent(message)}`;
    if (successPath) dest += `&successPath=${encodeURIComponent(successPath)}`;
    if (cancelPath) dest += `&cancelPath=${encodeURIComponent(cancelPath)}`;
    
    const { navigate } = await import('./router.js');
    navigate(dest);
    return { success: true, redirecting: true };
  }
}

export async function updateTipLimit(amount) {
  if (!state.user.id) return;
  state.user.tipLimit = parseFloat(amount) || 0;
  try {
    await supabase.from('profiles').update({ tip_limit: state.user.tipLimit }).eq('id', state.user.id);
  } catch (e) {
    console.error('Error saving tip limit:', e);
  }
  notify('user');
  showToast(`Tip limit set to $${state.user.tipLimit.toFixed(2)}`, 'success');
}

export async function updateSubscriptionStatus(status) {
  if (!state.user.id) return;
  state.user.subscriptionStatus = status;
  const updates = { subscription_status: status };
  if (status === 'cancelled') {
    updates.tier = 'free';
    state.user.tier = 'free';
    state.currentTier = 'free';
    state.user.cardOnFile = false;
  } else if (status === 'paused') {
    // Keep tier as gold but mark paused
  } else if (status === 'active') {
    // Resume
  }
  try {
    await supabase.from('profiles').update(updates).eq('id', state.user.id);
  } catch (e) {
    console.error('Error updating subscription:', e);
  }
  notify('user');
}

export async function updateCardInfo(last4) {
  if (!state.user.id) return;
  state.user.cardLast4 = last4;
  try {
    await supabase.from('profiles').update({ card_last4: last4 }).eq('id', state.user.id);
  } catch (e) {
    console.error('Error updating card info:', e);
  }
  notify('user');
  showToast('Payment card updated!', 'success');
}

export async function uploadProfilePicture(file) {
  if (!state.user.id || !file) return null;
  try {
    const fileExt = file.name.split('.').pop().toLowerCase();
    const filePath = `avatars/${state.user.id}.${fileExt}`;
    
    // Upload with content type
    const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file, { 
      upsert: true,
      contentType: file.type || `image/${fileExt}`
    });
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }
    
    // Try public URL first
    let avatarUrl;
    const { data: publicData } = supabase.storage.from('media').getPublicUrl(filePath);
    if (publicData?.publicUrl) {
      // Add cache-buster to avoid stale cached images
      avatarUrl = publicData.publicUrl + '?t=' + Date.now();
    } else {
      // Fallback to signed URL
      const { data: signedData } = await supabase.storage.from('media').createSignedUrl(filePath, 60 * 60 * 24 * 365);
      avatarUrl = signedData?.signedUrl;
    }

    if (!avatarUrl) throw new Error('Could not generate avatar URL');
    
    // Update DB
    const { error: dbError } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', state.user.id);
    if (dbError) console.error('Profile DB update error:', dbError);
    
    state.user.avatarUrl = avatarUrl;
    notify('user');
    showToast('Profile picture updated! 📸', 'success');
    return avatarUrl;
  } catch (e) {
    console.error('Error uploading profile picture:', e);
    showToast('Failed to upload: ' + (e.message || 'Unknown error'), 'error');
    return null;
  }
}

// ------------------------------------
// Polls System
// ------------------------------------
export const polls = [];

export async function votePoll(pollId, optionId) {
  if (!state.user.id) {
    showToast('Please login to vote', 'error');
    return;
  }
  const poll = state.polls.find(p => p.id === pollId);
  if (!poll) return;
  if (poll.userVote) {
    showToast('You have already voted', 'error');
    return;
  }
  if (poll.isExpired) {
    showToast('This poll has expired', 'error');
    return;
  }

  const { error } = await supabase.from('poll_votes').insert([{
    poll_id: pollId,
    user_id: state.user.id,
    option_id: optionId
  }]);

  if (error) {
    if (error.code === '23505') {
      showToast('You have already voted', 'error');
    } else {
      showToast('Failed to vote: ' + error.message, 'error');
    }
    return;
  }

  showToast('Vote submitted! 📊', 'success');
  await initStore();
  notify('polls');
}

export async function createPoll({ question, options, durationHours }) {
  if (!state.isAdmin) return;
  
  const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();
  const cleanedOptions = options.map((opt, i) => ({
    id: opt.id || String.fromCharCode(97 + i),
    text: opt.text
  }));

  const { data, error } = await supabase.from('polls').insert([{
    question,
    options: cleanedOptions,
    expires_at: expiresAt
  }]).select().single();

  if (error) {
    showToast('Failed to create poll: ' + error.message, 'error');
    return null;
  }

  showToast('Poll created successfully! 📊', 'success');
  await initStore();
  notify('polls');
  return data;
}

export async function endPoll(id) {
  if (!state.isAdmin) return;

  const { error } = await supabase.from('polls').update({
    expires_at: new Date().toISOString()
  }).eq('id', id);

  if (error) {
    showToast('Failed to end poll: ' + error.message, 'error');
    return;
  }

  showToast('Poll ended successfully! 📊', 'success');
  await initStore();
  notify('polls');
}

export async function deletePoll(id) {
  if (!state.isAdmin) return;

  const { error } = await supabase.from('polls').delete().eq('id', id);
  if (error) {
    showToast('Failed to delete poll: ' + error.message, 'error');
    return;
  }

  showToast('Poll deleted', 'success');
  await initStore();
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
// Promo Management
// ------------------------------------
export async function createPromo({ code, discount, description, color, expiresAt }) {
  try {
    const descStr = `${discount}|${description}|${expiresAt || ''}|${color || '#E91E8C'}|inactive`;
    const { data, error } = await supabase.from('content').insert([{
      title: code,
      description: descStr,
      type: 'photo',
      category: 'promo',
      min_tier: 'free',
      thumbnail: 'promo',
      likes: 0
    }]).select().single();

    if (error) throw error;

    const newPromo = { id: data.id, code, discount, description, color, expiresAt, status: 'inactive' };
    state.allPromos.unshift(newPromo);
    notify('activePromo'); // notify to re-render admin tab
    showToast('Promo created! You can publish it now.', 'success');
    return data;
  } catch (e) {
    console.error('Error creating promo:', e);
    showToast('Failed to create promo', 'error');
    return null;
  }
}

export async function deletePromo(id) {
  try {
    await supabase.from('content').delete().eq('id', id);
    state.allPromos = state.allPromos.filter(p => p.id !== id);
    if (state.activePromo?.id === id) {
      state.activePromo = null;
    }
    notify('activePromo');
    showToast('Promo deleted', 'success');
  } catch (e) {
    console.error('Error deleting promo:', e);
  }
}

export async function publishPromo(id) {
  try {
    // Set all others to inactive and this one to active
    for (const p of state.allPromos) {
      if (p.id === id) {
        p.status = 'active';
        state.activePromo = p;
      } else {
        p.status = 'inactive';
      }
      const descStr = `${p.discount}|${p.description}|${p.expiresAt || ''}|${p.color || '#E91E8C'}|${p.status}`;
      await supabase.from('content').update({ description: descStr }).eq('id', p.id);
    }
    notify('activePromo');
    showToast('Promo published and live! 🎉', 'success');
  } catch (e) {
    console.error('Error publishing promo:', e);
    showToast('Failed to publish promo', 'error');
  }
}

// ------------------------------------
// Secure DRM Blob Helper
// ------------------------------------
export async function loadDrmBlob(url) {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch media blob');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (e) {
    console.warn('[DRM] Fallback to raw URL:', e);
    return url;
  }
}

// ------------------------------------
// Notification Read Helpers
// ------------------------------------
export function markNotificationRead(id) {
  let readIds = [];
  try { readIds = JSON.parse(localStorage.getItem('vf-read-notif-ids') || '[]'); } catch(e) {}
  
  let changed = false;
  state.notifications?.forEach(n => {
    if (n.id === id && !n.read) {
      n.read = true;
      if (!readIds.includes(id)) {
        readIds.push(id);
        changed = true;
      }
    }
  });
  
  if (changed) {
    localStorage.setItem('vf-read-notif-ids', JSON.stringify(readIds));
    notify('notifications');
  }
}

export function markMessageNotificationsAsRead() {
  let readIds = [];
  try { readIds = JSON.parse(localStorage.getItem('vf-read-notif-ids') || '[]'); } catch(e) {}
  
  let changed = false;
  state.notifications?.forEach(n => {
    if (n.type === 'message' && !n.read) {
      n.read = true;
      if (!readIds.includes(n.id)) {
        readIds.push(n.id);
        changed = true;
      }
    }
  });
  
  if (changed) {
    localStorage.setItem('vf-read-notif-ids', JSON.stringify(readIds));
    notify('notifications');
  }
}

export function markPostNotificationAsRead(postId) {
  const notifId = `notif-post-${postId}`;
  let readIds = [];
  try { readIds = JSON.parse(localStorage.getItem('vf-read-notif-ids') || '[]'); } catch(e) {}
  
  let changed = false;
  state.notifications?.forEach(n => {
    if (n.id === notifId && !n.read) {
      n.read = true;
      if (!readIds.includes(notifId)) {
        readIds.push(notifId);
        changed = true;
      }
    }
  });
  
  if (changed) {
    localStorage.setItem('vf-read-notif-ids', JSON.stringify(readIds));
    notify('notifications');
  }
}

export async function markMessagesAsRead(userId) {
  if (!state.isAdmin || !userId) return;
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', userId)
      .eq('recipient_id', state.user.id)
      .eq('is_read', false);
      
    if (!error) {
      const user = state.adminUsers.find(u => u.id === userId);
      if (user) {
        user.unread = 0;
        notify('adminUsers');
      }
    }
  } catch (e) {
    console.error('Failed to mark messages as read:', e);
  }
}

export async function markFanMessagesAsRead() {
  if (!state.user.id || state.isAdmin) return;
  try {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', state.creatorId)
      .eq('recipient_id', state.user.id)
      .eq('is_read', false);
  } catch (e) {
    console.error('Failed to mark fan messages as read:', e);
  }
}
