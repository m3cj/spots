import { supabase } from './supabase.js';
import { pageOf, rangeFor, unwrap } from './helpers.js';
import { getSchemaCapabilities } from './schemaCompat.js';

const BASE_SUBMISSION_COLUMNS =
  'id,user_id,name,category_slug,lat,lng,description,best_time_to_visit,image_url,status,created_at,updated_at';
const FULL_SUBMISSION_COLUMNS =
  'id,user_id,name,category_slug,lat,lng,description,best_time_to_visit,image_url,status,reject_reason,street,landmark,area,city,state,pincode,created_at,updated_at';

async function getSubmissionColumns() {
  const caps = await getSchemaCapabilities();
  return caps.submissionsHasExtendedFields ? FULL_SUBMISSION_COLUMNS : BASE_SUBMISSION_COLUMNS;
}

function hydrateSubmission(row) {
  if (!row) return row;
  return {
    ...row,
    reject_reason: row.reject_reason ?? null,
    street: row.street ?? null,
    landmark: row.landmark ?? null,
    area: row.area ?? null,
    city: row.city ?? 'Patna',
    state: row.state ?? 'Bihar',
    pincode: row.pincode ?? null,
  };
}

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
  const caps = await getSchemaCapabilities();
  const columns = await getSubmissionColumns();
  const payload = { ...input, user_id: userId };
  if (!caps.submissionsHasExtendedFields) {
    delete payload.reject_reason;
    delete payload.street;
    delete payload.landmark;
    delete payload.area;
    delete payload.city;
    delete payload.state;
    delete payload.pincode;
  }
  const { data } = unwrap(
    await supabase.from('spot_submissions').insert(payload).select(columns).single(),
  );
  return hydrateSubmission(data);
}

export async function listUserSubmissions(userId, params) {
  const columns = await getSubmissionColumns();
  const { from, to } = rangeFor(params);
  const { data, count } = unwrap(
    await supabase
      .from('spot_submissions')
      .select(columns, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(from, to),
  );
  const hydrated = (data ?? []).map(hydrateSubmission);
  return pageOf(hydrated, count ?? hydrated.length, params);
}

// --- admin -----------------------------------------------------------------

export async function adminListSubmissions(params) {
  const columns = await getSubmissionColumns();
  const { status } = params;

  let query = supabase.from('spot_submissions').select(`${columns},${SUBMITTER}`, { count: 'exact' });
  if (status !== 'all') query = query.eq('status', status);
  // Oldest first while triaging, newest first when browsing history.
  query = query.order('created_at', { ascending: status === 'pending' }).order('id', { ascending: status === 'pending' });

  const { from, to } = rangeFor(params);
  const { data, count } = unwrap(await query.range(from, to));
  const hydrated = (data ?? []).map(hydrateSubmission);
  return pageOf(hydrated, count ?? hydrated.length, params);
}

export async function adminGetSubmission(id) {
  const columns = await getSubmissionColumns();
  const { data } = unwrap(
    await supabase.from('spot_submissions').select(`${columns},${SUBMITTER}`).eq('id', id).maybeSingle(),
  );
  return hydrateSubmission(data);
}

export async function adminUpdateSubmission(id, patch) {
  const caps = await getSchemaCapabilities();
  const columns = await getSubmissionColumns();
  const payload = { ...patch };
  if (!caps.submissionsHasExtendedFields) {
    delete payload.reject_reason;
    delete payload.street;
    delete payload.landmark;
    delete payload.area;
    delete payload.city;
    delete payload.state;
    delete payload.pincode;
  }
  const { data } = unwrap(
    await supabase
      .from('spot_submissions')
      .update(payload)
      .eq('id', id)
      .select(`${columns},${SUBMITTER}`)
      .maybeSingle(),
  );
  return hydrateSubmission(data);
}

/** Atomically moves a pending submission to a new status. Resolves to null if it was no longer pending. */
export async function transitionSubmission(id, status, extra = {}) {
  const caps = await getSchemaCapabilities();
  const columns = await getSubmissionColumns();
  const payload = { status, ...extra };
  if (!caps.submissionsHasExtendedFields) {
    delete payload.reject_reason;
    delete payload.street;
    delete payload.landmark;
    delete payload.area;
    delete payload.city;
    delete payload.state;
    delete payload.pincode;
  }
  const { data } = unwrap(
    await supabase
      .from('spot_submissions')
      .update(payload)
      .eq('id', id)
      .select(columns)
      .maybeSingle(),
  );
  return hydrateSubmission(data);
}

export async function restorePendingSubmission(id) {
  unwrap(await supabase.from('spot_submissions').update({ status: 'pending' }).eq('id', id));
}
