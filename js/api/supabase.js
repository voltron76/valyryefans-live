// ============================================================
// ValyryeFans — Supabase Client Configuration
// ============================================================

const SUPABASE_URL = 'https://uuipvnitgjjlcysicsmy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1aXB2bml0Z2pqbGN5c2ljc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MTQzOTcsImV4cCI6MjA5NjA5MDM5N30.Vg61Ha66HZTlNgtpDFs1bI4UoV9P2BIX7EjjvMEkmto';

let supabaseClient = null;

export function getSupabase() {
  if (!supabaseClient && window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

export function isSupabaseConfigured() {
  return SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY_HERE';
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };
