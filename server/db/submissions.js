import { supabase } from './supabase.js';
import { pageOf, rangeFor, unwrap } from './helpers.js';

const SUBMISSION_COLUMNS =
  'id,user_id,name,category_slug,lat,lng,description,best_time_to_visit,image_url,status,created_at,updated_at';
const SUBMITTER = 'submitter:users(id,display_name,email,avatar_url)';

export async function countPendingSubmissions(userId) {
  const { count } = unwrap(
    await supabase
      .from('spot_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending'),
  );
  return count ?? 0;
}

export async function createSubmission(userId, input) {
  const { data } = unwrap(
    await supabase.from('spot_submissions').insert({ ...input, user_id: userId }).select(SUBMISSION_COLUMNS).single(),
  );
  return data;
}

export async function listUserSubmissions(userId, params) {
  const { from, to } = rangeFor(params);
  const { data, count } = unwrap(
    await supabase
      .from('spot_submissions')
      .select(SUBMISSION_COLUMNS, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(from, to),
  );
  return pageOf(data, count ?? data.length, params);
}

// --- admin -----------------------------------------------------------------

export async function adminListSubmissions(params) {
  const { status } = params;

  let query = supabase.from('spot_submissions').select(`${SUBMISSION_COLUMNS},${SUBMITTER}`, { count: 'exact' });
  if (status !== 'all') query = query.eq('status', status);
  // Oldest first while triaging, newest first when browsing history.
  query = query.order('created_at', { ascending: status === 'pending' }).order('id', { ascending: status === 'pending' });

  const { from, to } = rangeFor(params);
  const { data, count } = unwrap(await query.range(from, to));
  return pageOf(data, count ?? data.length, params);
}

export async function adminGetSubmission(id) {
  const { data } = unwrap(
    await supabase.from('spot_submissions').select(`${SUBMISSION_COLUMNS},${SUBMITTER}`).eq('id', id).maybeSingle(),
  );
  return data;
}

/** Atomically moves a pending submission to a new status. Resolves to null if it was no longer pending. */
export async function transitionSubmission(id, status) {
  const { data } = unwrap(
    await supabase
      .from('spot_submissions')
      .update({ status })
      .eq('id', id)
      .eq('status', 'pending')
      .select(SUBMISSION_COLUMNS)
      .maybeSingle(),
  );
  return data;
}

export async function restorePendingSubmission(id) {
  unwrap(await supabase.from('spot_submissions').update({ status: 'pending' }).eq('id', id));
}
