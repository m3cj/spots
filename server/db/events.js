import { supabase } from './supabase.js';
import { escapeLike, pageOf, rangeFor, unwrap } from './helpers.js';

const EVENT_COLUMNS =
  'id,title,spot_id,event_date,start_time,categories,status,age_limit,price,booking_link,hero_img,created_at,updated_at';
// Inner join: events at a draft or archived venue are not public.
const PUBLIC_VENUE = 'spots!inner(id,name,area,street,category_slug,hero_img,lat,lng)';
const ADMIN_VENUE = 'spot:spots(id,name,area)';

const EXPIRY_INTERVAL_MS = 5 * 60 * 1000;
let lastExpiry = 0;

/** Marks past events completed. Throttled, and never fails a request. */
async function expirePastEvents() {
  const now = Date.now();
  if (now - lastExpiry < EXPIRY_INTERVAL_MS) return;
  lastExpiry = now;

  const { error } = await supabase.rpc('expire_past_events');
  if (error) {
    lastExpiry = 0;
    console.warn('[events] expire_past_events failed:', error.message);
  }
}

function withVenue(row) {
  const { spots: venue, ...event } = row;
  return { ...event, hero_img: event.hero_img ?? venue?.hero_img ?? null, spot: venue ?? null };
}

// --- public ----------------------------------------------------------------

export async function listEvents(params) {
  await expirePastEvents();

  const { status } = params;
  const pastOnly = status.every((item) => item === 'completed' || item === 'cancelled');
  const ascending = !pastOnly;

  const query = supabase
    .from('events')
    .select(`${EVENT_COLUMNS},${PUBLIC_VENUE}`, { count: 'exact' })
    .in('status', status)
    .eq('spots.status', 'active')
    .order('event_date', { ascending })
    .order('start_time', { ascending })
    .order('id', { ascending });

  const { from, to } = rangeFor(params);
  const { data, count } = unwrap(await query.range(from, to));
  return pageOf(data.map(withVenue), count ?? data.length, params);
}

export async function getEvent(id) {
  await expirePastEvents();

  const { data } = unwrap(
    await supabase
      .from('events')
      .select(`${EVENT_COLUMNS},${PUBLIC_VENUE}`)
      .eq('id', id)
      .eq('spots.status', 'active')
      .maybeSingle(),
  );
  return data ? withVenue(data) : null;
}

// --- admin -----------------------------------------------------------------

export async function adminListEvents(params) {
  await expirePastEvents();

  const { q, status } = params;
  let query = supabase.from('events').select(`${EVENT_COLUMNS},${ADMIN_VENUE}`, { count: 'exact' });
  if (status) query = query.eq('status', status);
  if (q) query = query.ilike('title', `%${escapeLike(q)}%`);
  query = query.order('event_date', { ascending: false }).order('id', { ascending: false });

  const { from, to } = rangeFor(params);
  const { data, count } = unwrap(await query.range(from, to));
  return pageOf(data, count ?? data.length, params);
}

export async function adminGetEvent(id) {
  const { data } = unwrap(
    await supabase.from('events').select(`${EVENT_COLUMNS},${ADMIN_VENUE}`).eq('id', id).maybeSingle(),
  );
  return data;
}

export async function adminCreateEvent(input) {
  const { data } = unwrap(await supabase.from('events').insert(input).select(EVENT_COLUMNS).single());
  return data;
}

export async function adminUpdateEvent(id, patch) {
  const { data } = unwrap(await supabase.from('events').update(patch).eq('id', id).select(EVENT_COLUMNS).maybeSingle());
  return data;
}

export async function adminDeleteEvent(id) {
  const { data } = unwrap(await supabase.from('events').delete().eq('id', id).select('id'));
  return data.length > 0;
}
