// ============================================================
// ValyryesFans — Supabase Reactive State Store
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
    name: 'Valyryes',
    handle: '@valyryes',
    bio: `I'M ALWAYS HERE TO REPLY 🟢 LET'S CHAT 💬‼️\n\nWanna see what I don't post anywhere else? this is the only place you'll get the real me.\n\nAll natural, playful, and sweet. Slide in and let's have some fun. 😏\nNo agencies, no chatbots, no AI. Just me, all for you 🤭`,
    avatar: 'assets/images/avatar.jpg',
    banner: 'assets/images/hero-01.jpg',
    banners: [
      'assets/images/hero-01.jpg',
      'assets/images/hero-02.jpg',
      'assets/images/hero-03.jpg',
      'assets/images/hero-04.jpg',
    ],
    stats: { posts: 0, photos: 0, videos: 0, fans: '12.4K' },
    verified: true,
    online: false,
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
  presenceChannel: null,
  typingChannel: null,
  creatorTyping: false,
  fanTyping: {},
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
export async function initStore(bypassCache = false) {
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
        const newProfile = { id: session.user.id, name: displayName, tier: 'free', balance: 0, email: session.user.email };
        const { data: p } = await supabase.from('profiles').insert([newProfile]).select().single();
        profile = p;

        // Trigger Welcome Email (async, non-blocking)
        supabase.functions.invoke('send-email-notification', {
          body: {
            event: 'welcome',
            recipientId: session.user.id,
            variables: { site_url: window.location.origin }
          }
        }).catch(err => console.error('[Store] Welcome email error:', err));
      } else if (!profile.email) {
        // Backfill email address if missing
        const { data: p } = await supabase.from('profiles').update({ email: session.user.email }).eq('id', session.user.id).select().single();
        if (p) profile = p;
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
            sender: m.sender_id === session.user.id ? 'fan' : 'valyryes',
            content: m.content,
            time: formatTime(m.created_at),
            type: m.type,
            mediaUrl: m.media_url,
            read: m.sender_id === session.user.id ? true : !!m.is_read
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

    // 1.6 Fetch cached public data from Edge API
    let publicData = { content: [], commentsMap: {}, polls: [] };
    try {
      const res = await fetch('/api/public-data' + (bypassCache || state.isAdmin ? `?t=${Date.now()}` : ''));
      if (res.ok) {
        publicData = await res.json();
      } else {
        throw new Error('Failed to fetch from /api/public-data');
      }
    } catch (err) {
      console.warn('Failed to load public data from edge, falling back to local fallback comments', err);
      // Fallback comments from localStorage if edge failed
      const localComments = localStorage.getItem('vf-comments');
      if (localComments) {
        try { publicData.commentsMap = JSON.parse(localComments); } catch (e) {}
      }
    }

    const { content: contentData, commentsMap, polls: pollsData } = publicData;

    // Fetch logged-in user's poll votes to show their active selections
    const userVotesMap = {};
    if (session) {
      try {
        const { data: userVotes } = await supabase.from('poll_votes').select('poll_id, option_id').eq('user_id', session.user.id);
        if (userVotes) {
          userVotes.forEach(v => {
            userVotesMap[v.poll_id] = v.option_id;
          });
        }
      } catch (e) {
        console.error('Error fetching user votes:', e);
      }
    }

    if (contentData && contentData.length > 0) {
      // 3. Separate Public vs Private Media URLs to optimize caching and egress
      const privatePathsToSign = [];
      const hasGoldAccess = state.isAdmin || state.currentTier === 'gold';

      contentData.forEach(c => {
        // Main media for Gold content is private and requires signed URLs
        if (c.min_tier === 'gold' && hasGoldAccess) {
          if (c.video_url) privatePathsToSign.push(c.video_url);
          if (c.media && Array.isArray(c.media)) privatePathsToSign.push(...c.media);
        }
      });

      const uniquePrivatePaths = [...new Set(privatePathsToSign)].filter(p => p && !p.startsWith('http'));
      
      let signedUrlMap = {};
      if (uniquePrivatePaths.length > 0) {
        try {
          const { data: signedUrls, error } = await supabase.storage.from('media').createSignedUrls(uniquePrivatePaths, 3600); // 1 hour expiry
          if (!error && signedUrls) {
            signedUrls.forEach((su, i) => {
              if (!su.error) signedUrlMap[uniquePrivatePaths[i]] = su.signedUrl;
            });
          }
        } catch (e) {
          console.error('Error generating signed URLs:', e);
        }
      }

      // Helper to resolve media URLs (Public bucket vs Private signed URLs)
      const resolveMediaUrl = (path, isGoldPrivate) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;

        if (isGoldPrivate) {
          // Requires signed URL from 'media' bucket
          return signedUrlMap[path] || null;
        } else {
          // Served directly from 'public_media' bucket, fully cached by CDN
          return supabase.storage.from('public_media').getPublicUrl(path).data.publicUrl;
        }
      };

      // 4. Map content to state
      state.content = contentData.map(c => {
        const hasAccess = state.isAdmin || c.min_tier === 'free' || state.currentTier === 'gold';
        
        // Thumbnails are always public teasers
        const thumbnailUrl = resolveMediaUrl(c.thumbnail, false);
        
        let mappedMedia = [];
        let videoUrl = null;

        if (hasAccess) {
          const isGoldPrivate = c.min_tier === 'gold';
          mappedMedia = (c.media || []).map(m => resolveMediaUrl(m, isGoldPrivate));
          videoUrl = c.video_url ? resolveMediaUrl(c.video_url, isGoldPrivate) : null;
        }

        const commentsList = (commentsMap[c.id] || []).map(comm => ({
          ...comm,
          time: formatTime(comm.createdAt)
        }));

        return {
          id: c.id,
          title: c.title,
          description: c.description || '',
          type: c.type,
          thumbnail: thumbnailUrl,
          videoUrl: videoUrl,
          media: mappedMedia,
          rawThumbnail: c.thumbnail,
          rawMedia: c.media || [],
          rawVideoUrl: c.video_url || null,
          minTier: c.min_tier,
          likes: c.likes || 0,
          likedByUser: likedContentIds.has(c.id),
          comments: commentsList,
          views: c.views || 0,
          category: c.category || 'Other',
          createdAt: formatDate(c.created_at || c.createdAt),
          rawCreatedAt: c.created_at || c.createdAt
        };
      });

      // Update Creator Stats
      state.creatorProfile.stats.posts = state.content.filter(c => c.category !== 'story' && c.category !== 'promo').length;
      state.creatorProfile.stats.photos = state.content
        .filter(c => (c.type === 'photo' || c.type === 'carousel') && c.category !== 'story' && c.category !== 'promo')
        .reduce((sum, c) => sum + (Array.isArray(c.rawMedia) && c.rawMedia.length > 0 ? c.rawMedia.length : 1), 0);
      state.creatorProfile.stats.videos = state.content.filter(c => c.type === 'video' && c.category !== 'story' && c.category !== 'promo').length;

      // Generate notifications from actual content/messages
      if (session && !state.isAdmin) {
        generateNotifications(state, session);
      }

      // Load all promos (already in contentData but marked as category 'promo')
      const promos = contentData.filter(p => p.category === 'promo');
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
    }

    // Fetch Polls
    try {
      if (pollsData) {
        const mappedPolls = pollsData.map(p => {
          const isExpired = p.expiresAt ? new Date(p.expiresAt) < new Date() : false;
          const userVote = userVotesMap[p.id] || null;
          
          return {
            id: p.id,
            question: p.question,
            options: p.options,
            totalVotes: p.totalVotes,
            userVote,
            createdAt: formatRelativeTime(p.createdAt),
            expiresAt: p.expiresAt,
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

    // ---- Real-time Messaging (incremental, no full reload) ----
    if (session && !state.hasActiveRealtimeSub) {
      state.hasActiveRealtimeSub = true;

      // 1. Message INSERT — new messages arrive in real-time
      supabase
        .channel('realtime:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const n = payload.new;
          const isRelevant = n.sender_id === state.user.id || n.recipient_id === state.user.id || state.isAdmin;
          if (!isRelevant) return;

          if (!state.isAdmin) {
            // Fan side — append to state.messages if not duplicate
            if (!state.messages.find(m => m.id === n.id)) {
              const mapped = {
                id: n.id,
                sender: n.sender_id === state.user.id ? 'fan' : 'valyryes',
                content: n.content,
                time: formatTime(n.created_at),
                type: n.type,
                mediaUrl: n.media_url,
                read: n.sender_id === state.user.id ? true : !!n.is_read
              };
              state.messages.push(mapped);
              notify('messages');
              generateNotifications(state);
              notify('notifications');
            }
          } else {
            // Admin side — append to adminMessages
            const uId = n.sender_id === state.user.id ? n.recipient_id : n.sender_id;
            if (uId && uId !== state.user.id) {
              if (!state.adminMessages[uId]) state.adminMessages[uId] = [];
              if (!state.adminMessages[uId].find(m => m.id === n.id)) {
                state.adminMessages[uId].push({
                  id: n.id,
                  sender: n.sender_id === state.user.id ? 'valyryes' : 'fan',
                  content: n.content,
                  time: formatTime(n.created_at),
                  createdAt: n.created_at,
                  type: n.type,
                  mediaUrl: n.media_url,
                  read: !!n.is_read
                });
                // Update unread count for this user
                if (n.sender_id !== state.user.id) {
                  const user = state.adminUsers.find(u => u.id === n.sender_id);
                  if (user) { user.unread = (user.unread || 0) + 1; }
                }
                
                // Re-sort the user list since a new message arrived
                sortAdminUsers();
                
                notify('adminMessages');
                notify('adminUsers');
              }
            }
          }

          // Play sound + toast for incoming messages
          if (n.sender_id !== state.user.id) {
            playNotificationSound();
            let senderName = 'Valyryes';
            if (state.isAdmin) {
              const profile = state.adminUsers.find(u => u.id === n.sender_id);
              senderName = profile ? (profile.name || 'A user') : 'A user';
            }
            showToast(`💬 New message from ${senderName}`, 'info');
          }
        })
        // 2. Message UPDATE — read receipts in real-time
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
          const updated = payload.new;
          if (!state.isAdmin) {
            // Fan side — update read status (for sent messages: see if creator read them)
            const msg = state.messages.find(m => m.id === updated.id);
            if (msg && msg.read !== !!updated.is_read) {
              msg.read = !!updated.is_read;
              notify('messages');
            }
          } else {
            // Admin side — update read status in admin messages
            for (const userId of Object.keys(state.adminMessages)) {
              const msg = state.adminMessages[userId].find(m => m.id === updated.id);
              if (msg) { msg.read = !!updated.is_read; notify('adminMessages'); break; }
            }
          }
        })
        .subscribe();

      // 3. Presence — online/offline tracking
      state.presenceChannel = supabase.channel('presence:chat', { config: { presence: { key: state.user.id } } });
      state.presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const presenceState = state.presenceChannel.presenceState();
          // Check if creator (admin) is online
          if (!state.isAdmin && state.creatorId) {
            const wasOnline = state.creatorProfile.online;
            state.creatorProfile.online = !!presenceState[state.creatorId];
            if (wasOnline !== state.creatorProfile.online) notify('presence');
          }
          // Admin: track which fans are online
          if (state.isAdmin) {
            let changed = false;
            state.adminUsers.forEach(u => {
              const isOnline = !!presenceState[u.id];
              if (u.online !== isOnline) { u.online = isOnline; changed = true; }
            });
            if (changed) notify('adminUsers');
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await state.presenceChannel.track({ user_id: state.user.id, online_at: new Date().toISOString() });
          }
        });

      // 4. Typing indicators — broadcast channel
      state.typingChannel = supabase.channel('typing:chat');
      state.typingChannel
        .on('broadcast', { event: 'typing' }, (payload) => {
          const { userId, isTyping } = payload.payload;
          if (userId === state.user.id) return; // ignore own typing
          if (!state.isAdmin) {
            // Fan sees creator typing
            if (state.creatorTyping !== isTyping) {
              state.creatorTyping = isTyping;
              notify('typing');
            }
          } else {
            // Admin sees fan typing
            state.fanTyping[userId] = isTyping;
            notify('typing');
          }
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
      message: `Valyryes posted "${post.title || 'New content'}"${post.minTier === 'gold' ? ' — exclusive for Gold members!' : ''}`,
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
      message: `Valyryes added a new story — check it out before it disappears!`,
      time: formatRelativeTime(story.rawCreatedAt),
      rawTime: story.rawCreatedAt,
      read: !isNew,
      link: '/'
    });
  });

  // 3. Message notifications (only UNREAD incoming messages)
  const unreadIncoming = st.messages.filter(m => m.sender === 'valyryes' && !m.read);
  if (unreadIncoming.length > 0) {
    const latest = unreadIncoming[unreadIncoming.length - 1];
    const msgNotifId = `notif-msg-${latest.id}`;
    notifications.push({
      id: msgNotifId,
      type: 'message',
      title: `💬 ${unreadIncoming.length} New Message${unreadIncoming.length > 1 ? 's' : ''} from Valyryes`,
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
    title: '👋 Welcome to ValyryesFans',
    message: 'Explore exclusive content and connect with Valyryes. Enjoy your experience!',
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

function sortAdminUsers() {
  if (!state.adminUsers) return;
  state.adminUsers.sort((a, b) => {
    const msgsA = state.adminMessages[a.id] || [];
    const msgsB = state.adminMessages[b.id] || [];
    
    const lastA = msgsA.length > 0 ? new Date(msgsA[msgsA.length - 1].createdAt || 0).getTime() : 0;
    const lastB = msgsB.length > 0 ? new Date(msgsB[msgsB.length - 1].createdAt || 0).getTime() : 0;
    
    if (lastA !== lastB) {
      return lastB - lastA; // Latest message first
    }
    
    // Fallback: profile creation date
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
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
        createdAt: p.created_at, // raw timestamp for sorting fallback
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
          sender: m.sender_id === state.user.id ? 'valyryes' : 'fan',
          content: m.content,
          time: formatTime(m.created_at),
          createdAt: m.created_at, // raw timestamp for sorting
          type: m.type,
          mediaUrl: m.media_url,
          read: !!m.is_read
        });
      }
    });
  }

  // Sort users so latest conversations are on top
  sortAdminUsers();

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

export async function addMessage(content, type = 'text', mediaUrl = null) {
  if (!state.user.id) {
    showToast('Please login to send messages', 'error');
    return;
  }

  const msg = {
    sender_id: state.user.id,
    recipient_id: state.creatorId || null,
    content,
    type,
    media_url: mediaUrl
  };

  const { data, error } = await supabase.from('messages').insert([msg]).select().single();
  if (error) {
    showToast('Failed to send message', 'error');
    return;
  }

  // Note: the realtime INSERT handler will append this to state.messages
  // so we just return the mapped message for optimistic UI
  return {
    id: data.id,
    sender: 'fan',
    content: data.content,
    time: formatTime(data.created_at),
    type: data.type,
    mediaUrl: data.media_url,
    read: false
  };
}

// Broadcast typing indicator
export function sendTypingIndicator(isTyping) {
  if (state.typingChannel) {
    state.typingChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: state.user.id, isTyping }
    });
  }
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
    // Trigger message email notification (async, non-blocking)
    supabase.functions.invoke('send-email-notification', {
      body: {
        event: 'new_message',
        recipientId: userId,
        variables: {
          message_snippet: content.length > 60 ? content.substring(0, 57) + '...' : content,
          site_url: window.location.origin
        }
      }
    }).catch(err => console.error('[Store] Message notification email error:', err));

    if (!state.adminMessages[userId]) state.adminMessages[userId] = [];
    state.adminMessages[userId].push({
      id: data.id,
      sender: 'valyryes',
      content: data.content,
      time: formatTime(data.created_at),
      createdAt: data.created_at,
      type: data.type,
      mediaUrl: data.media_url,
      read: false
    });
    
    // Sort users so they jump to top on reply
    sortAdminUsers();
    
    notify('adminMessages');
    notify('adminUsers');
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
     // Refresh content with cache bypass
    await initStore(true);
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
  const action = idx !== -1 ? 'remove' : 'add';
  if (idx !== -1) {
    state.bookmarks.splice(idx, 1);
    showToast('Removed from bookmarks');
  } else {
    state.bookmarks.push(id);
    showToast('Added to bookmarks');
  }
  notify('bookmarks');
  const item = state.content.find(c => c.id === id);
  trackEvent('bookmark', { contentId: id, action, title: item?.title || 'Unknown' });
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
      trackEvent('like', { contentId, title: item.title, action: 'like' });
    } else {
      const { error: unlikeErr } = await supabase.from('content_likes').delete().eq('content_id', contentId).eq('user_id', state.user.id);
      if (unlikeErr) throw unlikeErr;
      trackEvent('like', { contentId, title: item.title, action: 'unlike' });
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
  trackEvent('comment', { contentId, title: item.title, textLength: text.length });
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
  if (!tipAmount || tipAmount <= 0) {
    showToast('Please enter a valid tip amount', 'error');
    return { success: false, error: 'invalid_amount' };
  }
  if (state.user.tipLimit > 0 && tipAmount > state.user.tipLimit) {
    showToast(`Tip exceeds your limit of $${state.user.tipLimit.toFixed(2)}`, 'error');
    return { success: false, error: 'limit_exceeded' };
  }

  // Always redirect to Stripe Checkout for secure payment
  showToast('Redirecting to secure payment...', 'info');
  let dest = `/checkout?tip=${tipAmount}`;
  if (contentId) dest += `&contentId=${encodeURIComponent(contentId)}`;
  if (message) dest += `&message=${encodeURIComponent(message)}`;
  if (successPath) dest += `&successPath=${encodeURIComponent(successPath)}`;
  if (cancelPath) dest += `&cancelPath=${encodeURIComponent(cancelPath)}`;

  const { navigate } = await import('./router.js');
  navigate(dest);
  return { success: true, redirecting: true };
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
  await initStore(true);
  notify('polls');
  trackEvent('poll_vote', { pollId, optionId, question: poll.question });
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
  await initStore(true);
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
  await initStore(true);
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
  await initStore(true);
  notify('polls');
}

// ------------------------------------
// Welcome Message
// ------------------------------------
export async function sendWelcomeMessage() {
  const welcomeText = `Hey ${state.user.name || 'babe'}! 💕 Welcome to my VIP! I'm SO happy you're here. You just unlocked everything 🔓\n\nDM me anytime — I always reply to my Gold members first 😘`;
  const msg = {
    id: 'welcome-' + Date.now(),
    sender: 'valyryes',
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
  // Immediately update local state so navbar badge clears
  let changed = false;
  state.messages.forEach(m => {
    if (m.sender !== 'fan' && !m.read) {
      m.read = true;
      changed = true;
    }
  });
  if (changed) notify('messages');

  // Persist to DB
  try {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('recipient_id', state.user.id)
      .neq('sender_id', state.user.id)
      .eq('is_read', false);
  } catch (e) {
    console.error('Failed to mark fan messages as read:', e);
  }
}

// ============================================================
// Web Analytics Tracking System
// ============================================================
let sessionLocation = null;
const SESSION_KEY = 'vf-session-id';
const LOCATION_KEY = 'vf-location-data';

// Generate or fetch session ID
let sessionId = sessionStorage.getItem(SESSION_KEY);
if (!sessionId) {
  sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
  sessionStorage.setItem(SESSION_KEY, sessionId);
}

// Fetch geodata once per session with sessionStorage cache
async function getSessionLocation() {
  if (sessionLocation) return sessionLocation;

  try {
    const cached = sessionStorage.getItem(LOCATION_KEY);
    if (cached) {
      sessionLocation = JSON.parse(cached);
      return sessionLocation;
    }
  } catch (e) {}

  // Try ipapi.co (HTTPS-friendly, no key required for basic tier)
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      sessionLocation = {
        country: data.country_name || 'Unknown',
        country_code: data.country_code || 'UN',
        region: data.region || 'Unknown',
        city: data.city || 'Unknown',
        ip: data.ip || 'Unknown'
      };
      sessionStorage.setItem(LOCATION_KEY, JSON.stringify(sessionLocation));
      return sessionLocation;
    }
  } catch (err) {
    console.warn('Primary geolocation API failed, trying fallback...');
  }

  // Fallback: geolocation-db.com (HTTPS secure lookup)
  try {
    const res = await fetch('https://geolocation-db.com/json/');
    if (res.ok) {
      const data = await res.json();
      sessionLocation = {
        country: data.country_name || 'Unknown',
        country_code: data.country_code || 'UN',
        region: data.state || 'Unknown',
        city: data.city || 'Unknown',
        ip: data.IPv4 || 'Unknown'
      };
      sessionStorage.setItem(LOCATION_KEY, JSON.stringify(sessionLocation));
      return sessionLocation;
    }
  } catch (err) {
    console.warn('Fallback geolocation API failed:', err);
  }

  // Final fallback
  sessionLocation = {
    country: 'Unknown',
    country_code: 'UN',
    region: 'Unknown',
    city: 'Unknown',
    ip: 'Unknown'
  };
  return sessionLocation;
}

export async function trackEvent(eventType, details = {}) {
  try {
    const location = await getSessionLocation();
    const pagePath = window.location.pathname + window.location.search;
    
    const eventObj = {
      session_id: sessionId,
      user_id: state.user?.id || null,
      event_type: eventType,
      page_path: pagePath,
      details: {
        ...details,
        location,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        referrer: document.referrer || 'Direct'
      }
    };

    // Run insert asynchronously (do not block user interactions)
    supabase.from('analytics_events').insert([eventObj]).then(({ error }) => {
      if (error) console.warn('Supabase analytics insert error:', error);
    });
  } catch (e) {
    console.warn('Analytics tracking failed:', e);
  }
}

