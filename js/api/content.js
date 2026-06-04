// ============================================================
// ValyryeFans — Content API Module
// ============================================================

import { getSupabase, isSupabaseConfigured } from './supabase.js';
import { getState } from '../store.js';

export async function fetchPublicContent() {
  if (!isSupabaseConfigured()) {
    return getState().content.filter(c => c.isPublic);
  }

  const sb = getSupabase();
  const { data, error } = await sb
    .from('content')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) { console.error('[Content] fetch error:', error); return []; }
  return data;
}

export async function fetchAllContent() {
  if (!isSupabaseConfigured()) {
    return getState().content;
  }

  const sb = getSupabase();
  const { data, error } = await sb
    .from('content')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('[Content] fetch error:', error); return []; }
  return data;
}

export async function fetchContentById(id) {
  if (!isSupabaseConfigured()) {
    return getState().content.find(c => c.id === id) || null;
  }

  const sb = getSupabase();
  const { data, error } = await sb
    .from('content')
    .select('*')
    .eq('id', id)
    .single();

  if (error) { console.error('[Content] fetch by id error:', error); return null; }
  return data;
}

export async function getSignedMediaUrl(storagePath) {
  if (!isSupabaseConfigured()) {
    return storagePath; // Return path directly in demo mode
  }

  const sb = getSupabase();
  const { data, error } = await sb.storage
    .from('protected-media')
    .createSignedUrl(storagePath, 60); // 60 second expiry

  if (error) { console.error('[Content] signed URL error:', error); return null; }
  return data.signedUrl;
}

export async function uploadContent(file, metadata) {
  if (!isSupabaseConfigured()) {
    console.warn('[Content] Upload unavailable in demo mode');
    return { error: { message: 'Demo mode' } };
  }

  const sb = getSupabase();
  const bucket = metadata.isPublic ? 'public-media' : 'protected-media';
  const path = `${Date.now()}-${file.name}`;

  // Upload file
  const { error: uploadError } = await sb.storage
    .from(bucket)
    .upload(path, file);

  if (uploadError) return { error: uploadError };

  // Insert metadata
  const { data, error } = await sb.from('content').insert({
    title: metadata.title,
    description: metadata.description,
    storage_path: path,
    thumbnail_path: metadata.thumbnailPath || path,
    is_public: metadata.isPublic,
    min_tier_id: metadata.minTierId,
    content_type: file.type.startsWith('video') ? 'video' : 'image',
  }).select().single();

  return { data, error };
}
