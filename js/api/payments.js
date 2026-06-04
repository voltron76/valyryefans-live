// ============================================================
// ValyryeFans — Payments API Module
// ============================================================

import { getSupabase, isSupabaseConfigured, SUPABASE_URL } from './supabase.js';
import { getState, showToast } from '../store.js';

export async function createCheckoutSession(tierId) {
  if (!isSupabaseConfigured()) {
    console.log('[Payments] Demo mode — would create checkout for tier:', tierId);
    showToast('Payment system will be available once Supabase is configured', 'info');
    return { url: null, error: { message: 'Demo mode' } };
  }

  try {
    const sb = getSupabase();
    const { data: { session } } = await sb.auth.getSession();

    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ tierId })
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url; // Redirect to Stripe Checkout
    }

    return { url: data.url, error: data.error };
  } catch (error) {
    console.error('[Payments] checkout error:', error);
    return { url: null, error };
  }
}

export async function getSubscriptionStatus() {
  if (!isSupabaseConfigured()) {
    return { tier: getState().currentTier, status: 'active' };
  }

  const sb = getSupabase();
  const { data, error } = await sb
    .from('subscriptions')
    .select('*, tier:tiers(*)')
    .eq('status', 'active')
    .single();

  if (error || !data) return { tier: 'free', status: 'inactive' };
  return { tier: data.tier.name.toLowerCase(), status: data.status, data };
}

export async function openCustomerPortal() {
  if (!isSupabaseConfigured()) {
    console.log('[Payments] Demo mode — customer portal unavailable');
    showToast('Customer portal will be available once Stripe is connected', 'info');
    return;
  }

  try {
    const sb = getSupabase();
    const { data: { session } } = await sb.auth.getSession();

    const response = await fetch(`${SUPABASE_URL}/functions/v1/customer-portal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();
    if (data.url) window.location.href = data.url;
  } catch (error) {
    console.error('[Payments] portal error:', error);
  }
}
