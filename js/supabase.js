import { CONFIG } from './config.js';

let supabase;
try {
  supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
} catch (e) {
  console.error('Failed to initialize Supabase client:', e);
  supabase = null;
}
export { supabase };
