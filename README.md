# ✨ ValyryeFans

A premium creator platform built with vanilla JavaScript and Supabase — delivering an exclusive content experience with subscription tiers, real-time messaging, stories, and a full admin dashboard.

![Status](https://img.shields.io/badge/status-live-brightgreen) ![JS](https://img.shields.io/badge/vanilla-JavaScript-F7DF1E?logo=javascript&logoColor=black) ![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E?logo=supabase&logoColor=white) ![License](https://img.shields.io/badge/license-ISC-blue)

---

## 🚀 Features

### For Fans
- **Subscription Tiers** — Free & Gold VIP with tiered content access
- **Content Feed** — Instagram-style feed with likes, comments, tips, and bookmarks
- **Image Carousels** — Multi-image posts with swipe navigation and dot indicators
- **Stories** — Full-screen story viewer with progress bars, navigation arrows, and auto-advance
- **Real-Time Messaging** — Direct chat with media sharing (photos & videos)
- **Notifications** — Dynamic, tier-based alerts for new uploads, messages, and stories
- **Gallery** — Filterable content grid (Photos, Videos, Free, Exclusive)
- **Promo Codes** — Apply discount codes at checkout for reduced subscription pricing
- **Profile** — Avatar upload, liked posts grid, subscription management
- **Dark / Light Mode** — Full theme support with smooth transitions

### For the Creator (Admin)
- **Admin Dashboard** — Secure login with full content management
- **Content Upload** — Drag & drop media upload (up to 20 files), auto-carousel detection
- **Story Management** — Publish stories visible to all users
- **Promotion System** — Create discount banners with custom colors, expiry countdown, and promo codes
- **User Management** — View all subscribers, tiers, and activity
- **Messaging** — Reply to fan messages with photo/video attachments
- **Analytics** — Dashboard with revenue, subscriber, and engagement stats

### Gold VIP Perks
- 🔓 Access to all exclusive content
- ✅ Verified badge on messages and comments
- 💫 Gold ring on profile avatar across all pages
- 📬 Gold-tier upload notifications
- 💬 Priority messaging

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vanilla JavaScript (ES Modules), HTML5, CSS3 |
| **Backend** | [Supabase](https://supabase.com) (Auth, Database, Storage, Realtime) |
| **Database** | PostgreSQL (via Supabase) |
| **Storage** | Supabase Storage (media bucket) |
| **Auth** | Supabase Auth (email/password) |
| **Hosting** | Static file hosting (GitHub Pages / Netlify / Vercel) |

> **Zero build step** — No bundler, no framework, no compilation. Pure ES modules loaded directly by the browser.

---

## 📁 Project Structure

```
valyryefans/
├── index.html              # Entry point — SPA shell
├── css/
│   └── style.css           # Complete design system (~3800 lines)
├── js/
│   ├── main.js             # App bootstrap, auth modal, router init
│   ├── router.js           # Hash-based SPA router
│   ├── store.js            # Reactive state management + Supabase API
│   ├── supabase.js         # Supabase client initialization
│   ├── theme.js            # Dark/light mode toggle
│   ├── config.js           # App configuration
│   ├── components/
│   │   └── navbar.js       # Responsive navbar + mobile bottom nav
│   └── views/
│       ├── home.js          # Feed, stories, promo banners, polls
│       ├── gallery.js       # Filterable content gallery
│       ├── messages.js      # Real-time messaging with media
│       ├── notifications.js # Dynamic notification center
│       ├── profile.js       # User profile + avatar upload
│       ├── settings.js      # Account, subscription, billing
│       ├── subscribe.js     # Subscription tiers + promo codes
│       ├── checkout.js      # Payment flow
│       ├── admin.js         # Full admin dashboard
│       ├── admin-login.js   # Admin authentication
│       ├── content-detail.js# Single content viewer
│       ├── bookmarks.js     # Saved content
│       ├── purchases.js     # Purchase history
│       ├── welcome-gold.js  # Gold welcome page
│       └── static-pages.js  # Terms, Privacy, FAQ, etc.
├── assets/
│   └── images/             # Static assets (avatars, banners)
└── supabase/               # Database schema & migrations
```

---

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/voltron76/valyryefans-live.git
cd valyryefans-live
```

### 2. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/` in the SQL Editor
3. Create a `media` storage bucket and set it to **public**
4. Add storage policies for authenticated uploads (see `storage-policies.sql` if provided)

### 3. Configure credentials
Update `js/supabase.js` with your Supabase project URL and anon key:
```js
const supabase = window.supabase.createClient(
  'https://YOUR_PROJECT.supabase.co',
  'YOUR_ANON_KEY'
);
```

### 4. Serve locally
Any static file server works:
```bash
# Using Python
python -m http.server 8000

# Using Node
npx serve .

# Using VS Code
# Install "Live Server" extension → right-click index.html → "Open with Live Server"
```

### 5. Open in browser
Navigate to `http://localhost:8000` — the app loads instantly with no build step.

---

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `profiles` | User profiles (name, tier, avatar, subscription status) |
| `content` | All media posts, stories, and promo data |
| `messages` | Fan ↔ Creator messaging with media attachments |
| `comments` | Post comments |
| `likes` | Post likes (user → content mapping) |
| `tips` | Tip transactions with amounts |

---

## 🎨 Design System

The CSS uses a comprehensive token-based design system:

- **Color tokens** — Semantic colors for both dark and light themes
- **Typography** — Inter + Outfit fonts from Google Fonts
- **Spacing scale** — 4px base with `--space-1` through `--space-24`
- **Animations** — Staggered fade-in-up, shimmer, glow, and micro-interactions
- **Glassmorphism** — Frosted glass cards with backdrop-filter
- **Responsive** — Mobile-first with breakpoints at 768px and 1024px

---

## 🔐 Admin Access

Navigate to `#/admin-login` and authenticate with your admin credentials. The admin dashboard provides:

- 📊 **Dashboard** — Revenue, subscribers, and engagement analytics
- 📤 **Upload** — Publish content to feed or stories with tier restrictions
- 🏷️ **Promotions** — Create discount banners with live preview
- 💬 **Messages** — Reply to fan messages
- 👥 **Users** — Manage subscribers and view activity
- 📋 **Content** — Edit or remove published content

---

## 📱 Mobile Experience

- Responsive bottom navigation bar with notification badges
- Touch-swipe carousels for multi-image posts
- Full-screen story viewer optimized for mobile
- Adaptive layouts for all screen sizes

---

## 📄 License

ISC License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ for creators
</p>
