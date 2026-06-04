// ============================================================
// ValyryeFans — Tier Card Component
// ============================================================

export function renderTierCard(tier, isCurrentTier = false, index = 0) {
  const staggerClass = `stagger-${index + 1}`;
  const checkSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>`;
  const xSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" width="16" height="16" style="opacity:0.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  const priceDisplay = tier.price === 0
    ? '<span class="tier-card__amount">Free</span>'
    : `<span class="tier-card__amount">$${tier.price.toFixed(2)}</span><span class="tier-card__period">${tier.period}</span>`;

  let ctaHtml;
  if (isCurrentTier) {
    ctaHtml = `<button class="btn btn-ghost btn-lg w-full" disabled style="border: 1px solid var(--border); opacity: 0.7;">
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
      Current Plan
    </button>`;
  } else if (tier.popular) {
    ctaHtml = `<button class="btn btn-primary btn-lg w-full tier-cta" data-tier="${tier.id}">${tier.cta}</button>`;
  } else {
    ctaHtml = `<button class="btn btn-secondary btn-lg w-full tier-cta" data-tier="${tier.id}">${tier.cta}</button>`;
  }

  return `
    <div class="tier-card ${tier.popular ? 'tier-card--popular' : ''} animate-fade-in-up ${staggerClass}">
      ${tier.popular ? '<div class="tier-badge">Most Popular</div>' : ''}
      <h3 class="tier-card__name font-display">${tier.name}</h3>
      <div class="tier-card__price">${priceDisplay}</div>
      <ul class="tier-card__features">
        ${tier.features.map(f => `
          <li class="tier-card__feature ${!f.included ? 'tier-card__feature--disabled' : ''}">
            ${f.included ? checkSvg : xSvg}
            <span>${f.text}</span>
          </li>
        `).join('')}
      </ul>
      ${ctaHtml}
    </div>
  `;
}
