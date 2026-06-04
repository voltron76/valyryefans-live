// ============================================================
// ValyryeFans — Auth API Module
// ============================================================

import { getSupabase, isSupabaseConfigured } from './supabase.js';

export async function signUp(email, password, name) {
  if (!isSupabaseConfigured()) {
    console.warn('[Auth] Supabase not configured — using demo mode');
    return { user: { id: 'demo-' + Date.now(), email }, error: null };
  }

  const sb = getSupabase();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name }
    }
  });

  return { user: data?.user, error };
}

export async function signIn(email, password) {
  if (!isSupabaseConfigured()) {
    console.warn('[Auth] Supabase not configured — using demo mode');
    return { user: { id: 'demo-' + Date.now(), email }, error: null };
  }

  const sb = getSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  return { user: data?.user, error };
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    console.warn('[Auth] Supabase not configured — Google login unavailable in demo mode');
    return { error: { message: 'Supabase not configured' } };
  }

  const sb = getSupabase();
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  return { data, error };
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  const sb = getSupabase();
  const { error } = await sb.auth.signOut();
  return { error };
}

export async function getSession() {
  if (!isSupabaseConfigured()) {
    return { session: null };
  }

  const sb = getSupabase();
  const { data } = await sb.auth.getSession();
  return { session: data?.session };
}

export function onAuthChange(callback) {
  if (!isSupabaseConfigured()) {
    console.warn('[Auth] Supabase not configured — auth state changes unavailable');
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  const sb = getSupabase();
  return sb.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
