import { createClient } from '@supabase/supabase-js';
import config from '../config.js';

// Service-role client: bypasses RLS, so it must only ever run on the server.
export const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
