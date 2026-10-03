import { supabase } from './supabase.js';
import { unwrap } from './helpers.js';

export async function getDashboardStats() {
  const { data } = unwrap(await supabase.rpc('admin_dashboard_stats'));
  return data;
}
