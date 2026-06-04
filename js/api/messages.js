// ============================================================
// ValyryeFans — Messages API Module
// ============================================================

import { getSupabase, isSupabaseConfigured } from './supabase.js';
import { getState } from '../store.js';

export async function fetchConversations() {
  if (!isSupabaseConfigured()) {
    return getState().conversations;
  }

  const sb = getSupabase();
  const { data, error } = await sb
    .from('conversations')
    .select(`
      *,
      fan:profiles!conversations_fan_id_fkey(display_name, avatar_url),
      messages(content, created_at)
    `)
    .order('created_at', { ascending: false });

  if (error) { console.error('[Messages] conversations error:', error); return []; }
  return data;
}

export async function fetchMessages(conversationId) {
  if (!isSupabaseConfigured()) {
    return getState().messages.filter(m => m.conversationId === conversationId);
  }

  const sb = getSupabase();
  const { data, error } = await sb
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) { console.error('[Messages] fetch error:', error); return []; }
  return data;
}

export async function sendMessage(conversationId, content) {
  if (!isSupabaseConfigured()) {
    // Demo mode: add to state
    const s = getState();
    const newMsg = {
      id: 'msg-' + Date.now(),
      conversationId,
      senderId: 'creator',
      content,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
    s.messages = [...s.messages, newMsg];
    return { data: newMsg, error: null };
  }

  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();

  const { data, error } = await sb.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content
  }).select().single();

  return { data, error };
}

export function subscribeToMessages(conversationId, callback) {
  if (!isSupabaseConfigured()) {
    console.warn('[Messages] Realtime unavailable in demo mode');
    return { unsubscribe: () => {} };
  }

  const sb = getSupabase();
  const channel = sb
    .channel(`messages:${conversationId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => callback(payload.new)
    )
    .subscribe();

  return {
    unsubscribe: () => sb.removeChannel(channel)
  };
}

export async function markAsRead(conversationId) {
  if (!isSupabaseConfigured()) return;

  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();

  await sb.from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id);
}
