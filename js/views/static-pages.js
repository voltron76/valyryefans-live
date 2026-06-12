// ============================================================
// ValyryesFans — Static Pages
// Terms, Privacy, Help Center, Support, Leaderboard,
// Referrals, Become a Creator
// ============================================================

import { getState, showToast } from '../store.js';
import { navigate } from '../router.js';

// ── Shared glass panel style ────────────────────────────────
const glass = `background: var(--glass-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--glass-border); border-radius: var(--radius-xl);`;

// ── SVG Icons ───────────────────────────────────────────────
const icons = {
  search: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`,
  copy: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  crown: `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z"/></svg>`,
  medal: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  share: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  gift: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,
  dollar: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  users: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  star: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  check: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  mail: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  arrow: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
};


// ============================================================
// 1. TERMS OF SERVICE
// ============================================================
export function renderTerms() {
  const html = `
    <section class="section animate-fade-in-up" style="max-width: 800px; margin: 0 auto;">
      <h1 class="font-display" style="font-size: var(--text-4xl); margin-bottom: var(--space-2);">
        <span class="text-gradient">Terms of Service</span>
      </h1>
      <p style="color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-8);">Last updated: June 1, 2026</p>

      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-6);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">1. Introduction</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          Welcome to ValyryesFans ("Platform", "we", "us", or "our"). These Terms of Service ("Terms") govern your access to and use of the ValyryesFans website, mobile applications, and all related services. By accessing or using our Platform, you agree to be bound by these Terms. If you do not agree, you may not access or use the Platform.
        </p>
      </div>

      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-6);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">2. Account Terms</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          You must be at least 18 years of age to create an account and use this Platform. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity. You may not transfer or assign your account to any other person or entity without our prior written consent.
        </p>
      </div>

      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-6);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">3. Subscription Terms</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          Certain features of the Platform require a paid subscription. By purchasing a subscription, you authorize us to charge the applicable fees to your designated payment method on a recurring basis. Subscriptions automatically renew at the end of each billing period unless canceled prior to the renewal date. Refunds are handled in accordance with our Refund Policy. We reserve the right to modify pricing with at least 30 days' notice to existing subscribers. All fees are exclusive of applicable taxes unless stated otherwise.
        </p>
      </div>

      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-6);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">4. Content Policy</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          Users are solely responsible for the content they upload, share, or distribute on the Platform. You represent and warrant that you own or have the necessary rights to all content you post. You agree not to upload content that is unlawful, defamatory, harassing, threatening, or that infringes on the intellectual property rights of others. We reserve the right to remove content that violates these Terms without prior notice. Repeated violations may result in permanent account suspension.
        </p>
      </div>

      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-6);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">5. Intellectual Property</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          The Platform and its original content (excluding user-generated content), features, and functionality are owned by ValyryesFans and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. Our trademarks, logos, and service marks may not be used in connection with any product or service without our prior written consent. By posting content on the Platform, you grant us a non-exclusive, worldwide, royalty-free license to display and distribute such content solely in connection with operating the Platform.
        </p>
      </div>

      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-6);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">6. Termination</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          We may terminate or suspend your account and access to the Platform at our sole discretion, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the Platform will immediately cease. You may also terminate your account at any time by contacting our support team. Provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
        </p>
      </div>

      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-6);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">7. Limitation of Liability</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          In no event shall ValyryesFans, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of (or inability to access or use) the Platform. Our total aggregate liability shall not exceed the amount you paid us in the twelve (12) months preceding the event giving rise to the claim.
        </p>
      </div>

      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-6);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">8. Governing Law</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          These Terms shall be governed and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Wilmington, Delaware. Our failure to enforce any right or provision of these Terms will not be considered a waiver of such right or provision.
        </p>
      </div>

      <div style="${glass} padding: var(--space-8);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">9. Contact Us</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          If you have any questions about these Terms, please contact us at <a href="mailto:legal@valyryesfans.com" style="color: var(--accent-light);">legal@valyryesfans.com</a> or visit our <a href="#/support" style="color: var(--accent-light);">Support Center</a>.
        </p>
      </div>
    </section>
  `;

  return { html, afterRender() {} };
}


// ============================================================
// 2. PRIVACY POLICY
// ============================================================
export function renderPrivacy() {
  const html = `
    <section class="section animate-fade-in-up" style="max-width: 800px; margin: 0 auto;">
      <h1 class="font-display" style="font-size: var(--text-4xl); margin-bottom: var(--space-2);">
        <span class="text-gradient">Privacy Policy</span>
      </h1>
      <p style="color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-8);">Last updated: June 1, 2026</p>

      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-6);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">1. Information We Collect</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          We collect information you provide directly, including your name, email address, payment information, and profile details when you create an account. We also automatically collect technical data such as your IP address, browser type, device information, operating system, and usage patterns through cookies and similar tracking technologies. If you interact with our Platform via third-party services, we may receive additional information from those providers in accordance with their privacy policies.
        </p>
      </div>

      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-6);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">2. How We Use Your Information</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          We use your information to provide, maintain, and improve our Platform; process transactions and send related notifications; personalize your experience and deliver relevant content; communicate with you about updates, promotions, and support inquiries; detect and prevent fraud, abuse, and security incidents; and comply with legal obligations. We do not sell your personal information to third parties for their marketing purposes.
        </p>
      </div>

      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-6);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">3. Cookies & Tracking</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          We use cookies, web beacons, and similar technologies to enhance your browsing experience, remember your preferences, analyze usage trends, and deliver targeted advertisements. Essential cookies are required for the Platform to function properly. You may control cookie preferences through your browser settings, although disabling certain cookies may limit your ability to use some features. For more details, please refer to our Cookie Policy.
        </p>
      </div>

      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-6);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">4. Third-Party Services</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          Our Platform may integrate with or contain links to third-party services, including payment processors (e.g., Stripe), analytics providers (e.g., Google Analytics), and social media platforms. These third parties have their own privacy policies governing the data they collect. We are not responsible for the privacy practices of third-party services and encourage you to review their policies before providing any personal information.
        </p>
      </div>

      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-6);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">5. Data Security</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          We implement industry-standard security measures, including encryption (TLS/SSL), secure server infrastructure, and regular security audits to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee its absolute security. In the event of a data breach, we will notify affected users as required by applicable law.
        </p>
      </div>

      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-6);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">6. Your Rights</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          Depending on your jurisdiction, you may have the right to access, correct, update, or delete your personal information; object to or restrict certain processing activities; request data portability; and withdraw consent at any time. To exercise these rights, please contact us at <a href="mailto:privacy@valyryesfans.com" style="color: var(--accent-light);">privacy@valyryesfans.com</a>. We will respond to your request within 30 days, in compliance with applicable data protection regulations including GDPR and CCPA.
        </p>
      </div>

      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-6);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">7. Children's Privacy</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          Our Platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided us with personal data, we will take immediate steps to delete such information from our servers. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately.
        </p>
      </div>

      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-6);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">8. Changes to This Policy</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, or legal requirements. We will notify you of any material changes by posting the updated policy on the Platform with a revised "Last updated" date. Your continued use of the Platform after such modifications constitutes your acknowledgment and acceptance of the updated Privacy Policy.
        </p>
      </div>

      <div style="${glass} padding: var(--space-8);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4); color: var(--accent-light);">9. Contact Us</h2>
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: var(--text-sm);">
          For questions regarding this Privacy Policy or our data practices, please contact us at <a href="mailto:privacy@valyryesfans.com" style="color: var(--accent-light);">privacy@valyryesfans.com</a> or visit our <a href="#/support" style="color: var(--accent-light);">Support Center</a>.
        </p>
      </div>
    </section>
  `;

  return { html, afterRender() {} };
}


// ============================================================
// 3. HELP CENTER
// ============================================================
export function renderHelpCenter() {
  const categories = [
    {
      icon: '🚀',
      title: 'Getting Started',
      topics: [
        'How to create an account',
        'Setting up your profile',
        'Navigating the platform',
        'Following your first creator',
      ],
    },
    {
      icon: '💳',
      title: 'Subscription & Billing',
      topics: [
        'How subscriptions work',
        'Updating payment methods',
        'Canceling a subscription',
        'Understanding your invoice',
      ],
    },
    {
      icon: '📸',
      title: 'Content & Features',
      topics: [
        'Viewing exclusive content',
        'Saving and favoriting posts',
        'Content download policy',
      ],
    },
    {
      icon: '🔒',
      title: 'Account & Security',
      topics: [
        'Changing your password',
        'Enabling two-factor authentication',
        'Managing email notifications',
        'Deleting your account',
      ],
    },
    {
      icon: '🛠️',
      title: 'Technical Support',
      topics: [
        'Supported browsers & devices',
        'Clearing cache and cookies',
        'Reporting a bug',
      ],
    },
  ];

  const html = `
    <section class="section animate-fade-in-up" style="max-width: 900px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: var(--space-12);">
        <h1 class="font-display" style="font-size: var(--text-4xl); margin-bottom: var(--space-4);">
          <span class="text-gradient">Help Center</span>
        </h1>
        <p style="color: var(--text-secondary); font-size: var(--text-lg); margin-bottom: var(--space-8);">
          Find answers to your questions or reach out to our support team.
        </p>

        <!-- Search bar -->
        <div style="max-width: 500px; margin: 0 auto; position: relative;">
          <div style="position: absolute; left: var(--space-4); top: 50%; transform: translateY(-50%); color: var(--text-muted);">
            ${icons.search}
          </div>
          <input
            type="text"
            class="form-input"
            placeholder="Search for help articles..."
            style="padding-left: var(--space-12); padding: var(--space-4) var(--space-4) var(--space-4) var(--space-12); border-radius: var(--radius-full); font-size: var(--text-base);"
          />
        </div>
      </div>

      <!-- Category cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--space-6); margin-bottom: var(--space-16);">
        ${categories.map((cat, i) => `
          <div class="animate-fade-in-up stagger-${Math.min(i + 1, 12)}" style="${glass} padding: var(--space-6);">
            <div style="font-size: 32px; margin-bottom: var(--space-4);">${cat.icon}</div>
            <h3 class="font-display" style="font-size: var(--text-lg); margin-bottom: var(--space-4); color: var(--text-primary);">${cat.title}</h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: var(--space-2);">
              ${cat.topics.map(topic => `
                <li>
                  <a href="#/support" style="display: flex; align-items: center; gap: var(--space-2); color: var(--text-secondary); font-size: var(--text-sm); padding: var(--space-2) 0; transition: color var(--transition-fast);"
                     onmouseover="this.style.color='var(--accent-light)'"
                     onmouseout="this.style.color='var(--text-secondary)'">
                    ${icons.arrow} ${topic}
                  </a>
                </li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      <!-- Contact Support CTA -->
      <div style="${glass} padding: var(--space-10); text-align: center;" class="animate-fade-in-up">
        <div style="font-size: 48px; margin-bottom: var(--space-4);">💬</div>
        <h2 class="font-display" style="font-size: var(--text-2xl); margin-bottom: var(--space-3);">Still need help?</h2>
        <p style="color: var(--text-secondary); margin-bottom: var(--space-6); max-width: 400px; margin-left: auto; margin-right: auto;">
          Our support team is available 24/7 to help you with any questions or concerns.
        </p>
        <a href="#/support" class="btn btn-primary btn-lg">
          ${icons.mail} Contact Support
        </a>
      </div>
    </section>
  `;

  return { html, afterRender() {} };
}


// ============================================================
// 4. CONTACT SUPPORT
// ============================================================
export function renderSupport() {
  const html = `
    <section class="section animate-fade-in-up" style="max-width: 700px; margin: 0 auto;">
      <h1 class="font-display" style="font-size: var(--text-4xl); margin-bottom: var(--space-2);">
        <span class="text-gradient">Contact Support</span>
      </h1>
      <p style="color: var(--text-secondary); margin-bottom: var(--space-8);">
        We're here to help. Fill out the form below and we'll get back to you as soon as possible.
      </p>

      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-8);">
        <form id="support-form">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-input" id="support-category" style="cursor: pointer;">
              <option value="">Select a category...</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="content">Content</option>
              <option value="account">Account</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Subject</label>
            <input type="text" class="form-input" id="support-subject" placeholder="Brief description of your issue" />
          </div>

          <div class="form-group">
            <label class="form-label">Message</label>
            <textarea class="form-input" id="support-message" rows="6" placeholder="Please describe your issue in detail..." style="resize: vertical; min-height: 120px;"></textarea>
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-full" style="justify-content: center;">
            ${icons.mail} Submit Ticket
          </button>
        </form>
      </div>

      <!-- Additional info -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6);">
        <div style="${glass} padding: var(--space-6); text-align: center;">
          <div style="font-size: 28px; margin-bottom: var(--space-3);">📧</div>
          <h3 style="font-size: var(--text-base); font-weight: 600; margin-bottom: var(--space-2);">Email Us</h3>
          <a href="mailto:support@valyryesfans.com" style="color: var(--accent-light); font-size: var(--text-sm);">
            support@valyryesfans.com
          </a>
        </div>
        <div style="${glass} padding: var(--space-6); text-align: center;">
          <div style="font-size: 28px; margin-bottom: var(--space-3);">⏱️</div>
          <h3 style="font-size: var(--text-base); font-weight: 600; margin-bottom: var(--space-2);">Response Time</h3>
          <p style="color: var(--text-secondary); font-size: var(--text-sm);">
            We typically respond within 24 hours
          </p>
        </div>
      </div>
    </section>
  `;

  return {
    html,
    afterRender() {
      const form = document.getElementById('support-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          showToast("Support ticket submitted! We'll respond within 24 hours.");
          form.reset();
        });
      }
    },
  };
}


// ============================================================
// 5. LEADERBOARD — TOP FANS
// ============================================================
export function renderLeaderboard() {
  const state = getState();
  const isAuth = state.isAuthenticated;

  const fans = [
    { rank: 1, name: 'Sophia Laurent', points: 48250, badge: 'Diamond' },
    { rank: 2, name: 'Marcus Chen', points: 41800, badge: 'Diamond' },
    { rank: 3, name: 'Isabella Reyes', points: 37400, badge: 'Platinum' },
    { rank: 4, name: 'Liam Nakamura', points: 31900, badge: 'Platinum' },
    { rank: 5, name: 'Ava Petrova', points: 28650, badge: 'Platinum' },
    { rank: 6, name: 'Noah Williams', points: 25100, badge: 'Gold' },
    { rank: 7, name: 'Emma Johansson', points: 22800, badge: 'Gold' },
    { rank: 8, name: 'Ethan Brooks', points: 20450, badge: 'Gold' },
    { rank: 9, name: 'Mia Fontaine', points: 18900, badge: 'Gold' },
    { rank: 10, name: 'James Kim', points: 17200, badge: 'Gold' },
    { rank: 11, name: 'Olivia Santos', points: 15800, badge: 'Silver' },
    { rank: 12, name: 'Benjamin Hart', points: 14350, badge: 'Silver' },
    { rank: 13, name: 'Charlotte Moon', points: 12900, badge: 'Silver' },
    { rank: 14, name: 'Alexander Volkov', points: 11600, badge: 'Silver' },
    { rank: 15, name: 'Amelia Drake', points: 10200, badge: 'Silver' },
    { rank: 16, name: 'Daniel Okafor', points: 9450, badge: 'Bronze' },
    { rank: 17, name: 'Harper Ellis', points: 8700, badge: 'Bronze' },
    { rank: 18, name: 'Lucas Rivera', points: 7950, badge: 'Bronze' },
    { rank: 19, name: 'Aria Patel', points: 7100, badge: 'Bronze' },
    { rank: 20, name: 'Jack Morrison', points: 6400, badge: 'Bronze' },
  ];

  const medalColors = ['var(--accent)', '#a0a0b0', '#cd7f32'];
  const currentUserName = state.profile?.name || state.user?.email || null;

  function badgeStyle(badge) {
    const colors = {
      Diamond: 'color: #b9f2ff;',
      Platinum: 'color: #e5e4e2;',
      Gold: 'color: var(--accent-light);',
      Silver: 'color: #c0c0c0;',
      Bronze: 'color: #cd7f32;',
    };
    return colors[badge] || '';
  }

  const html = `
    <section class="section animate-fade-in-up" style="max-width: 900px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: var(--space-12);">
        <h1 class="font-display" style="font-size: var(--text-4xl); margin-bottom: var(--space-4);">
          <span class="text-gradient">Top Fans</span>
        </h1>
        <p style="color: var(--text-secondary); font-size: var(--text-lg);">
          The most dedicated fans of the community — show your support and climb the ranks!
        </p>
      </div>

      <!-- Top 3 podium -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-6); margin-bottom: var(--space-12); align-items: end;">
        ${fans.slice(0, 3).map((fan, i) => {
          const order = [1, 0, 2]; // 2nd, 1st, 3rd visually
          const f = fans[order[i]];
          const isFirst = order[i] === 0;
          return `
            <div class="animate-fade-in-up stagger-${i + 1}" style="${glass} padding: var(--space-6); text-align: center; ${isFirst ? 'padding: var(--space-8); transform: scale(1.05);' : ''}">
              <div style="color: ${medalColors[order[i]]}; margin-bottom: var(--space-3); display: flex; justify-content: center;">
                ${order[i] === 0 ? icons.crown : icons.medal}
              </div>
              <div style="width: ${isFirst ? '72px' : '56px'}; height: ${isFirst ? '72px' : '56px'}; border-radius: var(--radius-full); background: var(--accent-subtle); border: 2px solid ${medalColors[order[i]]}; display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-3); font-size: ${isFirst ? 'var(--text-2xl)' : 'var(--text-xl)'}; font-weight: 700; color: var(--accent-light);">
                ${f.name.charAt(0)}
              </div>
              <div style="font-weight: 600; font-size: var(--text-base); margin-bottom: var(--space-1);">${f.name}</div>
              <div style="font-size: var(--text-sm); color: var(--accent-light); font-weight: 700; margin-bottom: var(--space-2);">${f.points.toLocaleString()} pts</div>
              <span style="font-size: var(--text-xs); padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); background: var(--accent-subtle); ${badgeStyle(f.badge)} font-weight: 600;">${f.badge}</span>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Full ranking table -->
      <div style="${glass} padding: var(--space-6); overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border);">
              <th style="text-align: left; padding: var(--space-3) var(--space-4); color: var(--text-muted); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Rank</th>
              <th style="text-align: left; padding: var(--space-3) var(--space-4); color: var(--text-muted); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Fan</th>
              <th style="text-align: right; padding: var(--space-3) var(--space-4); color: var(--text-muted); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Points</th>
              <th style="text-align: right; padding: var(--space-3) var(--space-4); color: var(--text-muted); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Badge</th>
            </tr>
          </thead>
          <tbody>
            ${fans.map(f => {
              const isCurrentUser = isAuth && currentUserName && f.name === currentUserName;
              const rowBg = isCurrentUser ? 'background: var(--accent-subtle);' : '';
              return `
                <tr style="border-bottom: 1px solid var(--border); transition: background var(--transition-fast); ${rowBg}" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='${isCurrentUser ? 'var(--accent-subtle)' : ''}'">
                  <td style="padding: var(--space-3) var(--space-4); font-weight: 700; color: ${f.rank <= 3 ? 'var(--accent-light)' : 'var(--text-muted)'}; font-size: var(--text-sm);">
                    ${f.rank <= 3 ? '🏆' : '#'}${f.rank}
                  </td>
                  <td style="padding: var(--space-3) var(--space-4);">
                    <div style="display: flex; align-items: center; gap: var(--space-3);">
                      <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--accent-subtle); display: flex; align-items: center; justify-content: center; font-size: var(--text-sm); font-weight: 600; color: var(--accent-light); flex-shrink: 0;">
                        ${f.name.charAt(0)}
                      </div>
                      <span style="font-size: var(--text-sm); font-weight: 500;">${f.name}${isCurrentUser ? ' <span style="color: var(--accent); font-size: var(--text-xs);">(You)</span>' : ''}</span>
                    </div>
                  </td>
                  <td style="padding: var(--space-3) var(--space-4); text-align: right; font-weight: 600; font-size: var(--text-sm); color: var(--text-secondary);">
                    ${f.points.toLocaleString()}
                  </td>
                  <td style="padding: var(--space-3) var(--space-4); text-align: right;">
                    <span style="font-size: var(--text-xs); padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); background: var(--accent-subtle); ${badgeStyle(f.badge)} font-weight: 600;">${f.badge}</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;

  return { html, afterRender() {} };
}


// ============================================================
// 6. REFERRAL PROGRAM
// ============================================================
export function renderReferrals() {
  const state = getState();
  const refCode = state.user?.email ? btoa(state.user.email).slice(0, 8).toUpperCase() : 'VF' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const refLink = `https://valyryesfans.com/ref/${refCode}`;

  const steps = [
    { icon: icons.share, title: 'Share Your Link', desc: 'Send your unique referral link to friends via social media, text, or email.' },
    { icon: icons.users, title: 'Friend Subscribes', desc: 'When your friend signs up and subscribes using your link, the referral is tracked.' },
    { icon: icons.dollar, title: 'You Earn', desc: 'Earn 15% of your referral\'s first subscription payment as a credit on your account.' },
  ];

  const html = `
    <section class="section animate-fade-in-up" style="max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: var(--space-12);">
        <div style="font-size: 48px; margin-bottom: var(--space-4);">${icons.gift}</div>
        <h1 class="font-display" style="font-size: var(--text-4xl); margin-bottom: var(--space-4);">
          <span class="text-gradient">Referral Program</span>
        </h1>
        <p style="color: var(--text-secondary); font-size: var(--text-lg); max-width: 500px; margin: 0 auto;">
          Share the love and earn rewards! Invite friends to ValyryesFans and earn credit for every subscription.
        </p>
      </div>

      <!-- Referral link -->
      <div style="${glass} padding: var(--space-8); margin-bottom: var(--space-8);">
        <h2 class="font-display" style="font-size: var(--text-xl); margin-bottom: var(--space-4);">Your Referral Link</h2>
        <div style="display: flex; gap: var(--space-3); align-items: center;">
          <input
            type="text"
            class="form-input"
            id="referral-link"
            value="${refLink}"
            readonly
            style="flex: 1; font-size: var(--text-sm); font-family: monospace;"
          />
          <button class="btn btn-primary" id="copy-referral-btn">
            ${icons.copy} Copy
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); margin-bottom: var(--space-12);">
        <div style="${glass} padding: var(--space-6); text-align: center;">
          <div style="font-size: var(--text-3xl); font-weight: 700; color: var(--accent-light); font-family: var(--font-display);">0</div>
          <div style="color: var(--text-secondary); font-size: var(--text-sm); margin-top: var(--space-2);">Total Referrals</div>
        </div>
        <div style="${glass} padding: var(--space-6); text-align: center;">
          <div style="font-size: var(--text-3xl); font-weight: 700; color: var(--accent-light); font-family: var(--font-display);">$0.00</div>
          <div style="color: var(--text-secondary); font-size: var(--text-sm); margin-top: var(--space-2);">Total Earned</div>
        </div>
      </div>

      <!-- How it works -->
      <h2 class="font-display" style="font-size: var(--text-2xl); text-align: center; margin-bottom: var(--space-8);">How It Works</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); margin-bottom: var(--space-12);">
        ${steps.map((step, i) => `
          <div class="animate-fade-in-up stagger-${i + 1}" style="${glass} padding: var(--space-6); text-align: center;">
            <div style="width: 48px; height: 48px; border-radius: var(--radius-full); background: var(--accent-subtle); border: 1px solid var(--border-accent); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-4); color: var(--accent-light);">
              ${step.icon}
            </div>
            <div style="font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2);">Step ${i + 1}</div>
            <h3 style="font-size: var(--text-base); font-weight: 600; margin-bottom: var(--space-2);">${step.title}</h3>
            <p style="color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.6;">${step.desc}</p>
          </div>
        `).join('')}
      </div>

      <!-- Referral program terms -->
      <div style="${glass} padding: var(--space-6);">
        <h3 class="font-display" style="font-size: var(--text-lg); margin-bottom: var(--space-4); color: var(--accent-light);">Referral Program Terms</h3>
        <ul style="color: var(--text-secondary); font-size: var(--text-sm); line-height: 2; list-style: none;">
          <li style="display: flex; align-items: start; gap: var(--space-2);">${icons.check} <span>Referral credits are applied after the referred user's first successful payment.</span></li>
          <li style="display: flex; align-items: start; gap: var(--space-2);">${icons.check} <span>Self-referrals or fraudulent referrals will result in disqualification.</span></li>
          <li style="display: flex; align-items: start; gap: var(--space-2);">${icons.check} <span>Credits are non-transferable and can only be used towards subscriptions.</span></li>
          <li style="display: flex; align-items: start; gap: var(--space-2);">${icons.check} <span>ValyryesFans reserves the right to modify or terminate this program at any time.</span></li>
          <li style="display: flex; align-items: start; gap: var(--space-2);">${icons.check} <span>There is no limit to the number of referrals you can make.</span></li>
        </ul>
      </div>
    </section>
  `;

  return {
    html,
    afterRender() {
      const copyBtn = document.getElementById('copy-referral-btn');
      const linkInput = document.getElementById('referral-link');
      if (copyBtn && linkInput) {
        copyBtn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(linkInput.value);
            showToast('Referral link copied to clipboard!');
          } catch {
            // Fallback for older browsers
            linkInput.select();
            document.execCommand('copy');
            showToast('Referral link copied to clipboard!');
          }
        });
      }
    },
  };
}


// ============================================================
// 7. BECOME A CREATOR
// ============================================================
export function renderBecomeCreator() {
  const benefits = [
    { icon: icons.dollar, title: 'Earn on Your Terms', desc: 'Set your own subscription prices and keep up to 85% of all revenue.' },
    { icon: icons.users, title: 'Build Your Community', desc: 'Connect directly with fans through messaging, exclusive content, and personalized interactions.' },
    { icon: icons.star, title: 'Powerful Tools', desc: 'Analytics dashboard, scheduling, mass messaging, and promotional tools to grow your audience.' },
    { icon: icons.gift, title: 'Creator Support', desc: 'Dedicated creator success team, priority support, and resources to help you thrive.' },
  ];

  const html = `
    <section class="section animate-fade-in-up" style="max-width: 800px; margin: 0 auto;">
      <!-- Hero -->
      <div style="${glass} padding: var(--space-12); text-align: center; margin-bottom: var(--space-12);">
        <div style="font-size: 48px; margin-bottom: var(--space-4);">✨</div>
        <h1 class="font-display" style="font-size: var(--text-4xl); margin-bottom: var(--space-4);">
          Become a <span class="text-gradient">Creator</span>
        </h1>
        <p style="color: var(--text-secondary); font-size: var(--text-lg); max-width: 520px; margin: 0 auto; line-height: 1.7;">
          Join thousands of creators earning a living by sharing exclusive content with their fans. Take control of your brand, your content, and your income.
        </p>
      </div>

      <!-- Benefits -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-6); margin-bottom: var(--space-12);">
        ${benefits.map((b, i) => `
          <div class="animate-fade-in-up stagger-${i + 1}" style="${glass} padding: var(--space-6);">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-full); background: var(--accent-subtle); border: 1px solid var(--border-accent); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-4); color: var(--accent-light);">
              ${b.icon}
            </div>
            <h3 style="font-size: var(--text-base); font-weight: 600; margin-bottom: var(--space-2);">${b.title}</h3>
            <p style="color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.6;">${b.desc}</p>
          </div>
        `).join('')}
      </div>

      <!-- Application form -->
      <div style="${glass} padding: var(--space-8);">
        <h2 class="font-display" style="font-size: var(--text-2xl); margin-bottom: var(--space-2);">Apply Now</h2>
        <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-8);">Tell us about yourself and we'll review your application within 48 hours.</p>

        <form id="creator-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-5);">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" id="creator-name" placeholder="Your full name" required />
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" id="creator-email" placeholder="you@example.com" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Social Media Links</label>
            <input type="text" class="form-input" id="creator-socials" placeholder="Instagram, Twitter, TikTok URLs (comma separated)" />
          </div>

          <div class="form-group">
            <label class="form-label">Content Type</label>
            <select class="form-input" id="creator-content-type" style="cursor: pointer;">
              <option value="">Select your primary content type...</option>
              <option value="photography">Photography</option>
              <option value="video">Video Content</option>
              <option value="art">Digital Art & Illustration</option>
              <option value="fitness">Fitness & Wellness</option>
              <option value="music">Music & Audio</option>
              <option value="education">Education & Tutorials</option>
              <option value="lifestyle">Lifestyle & Fashion</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Bio / About You</label>
            <textarea class="form-input" id="creator-bio" rows="4" placeholder="Tell us about yourself, your content, and your goals as a creator..." style="resize: vertical; min-height: 100px;" required></textarea>
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-full" style="justify-content: center;">
            ${icons.star} Submit Application
          </button>
        </form>
      </div>
    </section>
  `;

  return {
    html,
    afterRender() {
      const form = document.getElementById('creator-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          showToast("Application submitted! We'll review within 48 hours.");
          form.reset();
        });
      }
    },
  };
}
