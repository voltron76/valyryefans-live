import { CONFIG } from './config.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
