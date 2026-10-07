import { supabase } from './supabase.js';
import { escapeLike, pageOf, rangeFor, unwrap } from './helpers.js';
import { getSchemaCapabilities } from './schemaCompat.js';

const BASE_EVENT_COLUMNS =
  'id,title,spot_id,event_date,start_time,categories,status,age_limit,price,booking_link,hero_img,created_at,updated_at';
const FULL_EVENT_COLUMNS =
  'id,title,spot_id,event_date,start_time,end_time,categories,status,age_limit,price,booking_link,hero_img,created_at,updated_at';

async function getEventColumns() {
  const caps = await getSchemaCapabilities();
  return caps.eventsHasEndTime ? FULL_EVENT_COLUMNS : BASE_EVENT_COLUMNS;
}

async function getPublicVenueJoin() {
  const caps = await getSchemaCapabilities();
  if (caps.spotsHasCityLandmark) {
    return 'spots!inner(id,name,area,street,landmark,city,state,pincode,category_slug,hero_img,lat,lng)';
  }
  return 'spots!inner(id,name,area,street,state,pincode,category_slug,hero_img,lat,lng)';
}

async function getAdminVenueJoin() {
  const caps = await getSchemaCapabilities();
  if (caps.spotsHasCityLandmark) {
    return 'spot:spots(id,name,area,city)';
  }
  return 'spot:spots(id,name,area)';
}

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
  const { spots: rawVenue, spot: rawAdminVenue, ...event } = row;
  const venueSource = rawVenue ?? rawAdminVenue;
  const venue = venueSource
    ? {
        ...venueSource,
        city: venueSource.city ?? 'Patna',
        landmark: venueSource.landmark ?? null,
      }
    : null;

  return {
    ...event,
    end_time: event.end_time ?? null,
    hero_img: event.hero_img ?? venue?.hero_img ?? null,
    spot: venue,
  };
}

// --- public ----------------------------------------------------------------

export async function listEvents(params) {
  await expirePastEvents();

  const columns = await getEventColumns();
  const publicVenue = await getPublicVenueJoin();
  const { status } = params;
  const pastOnly = status.every((item) => item === 'completed' || item === 'cancelled');
  const ascending = !pastOnly;

  const query = supabase
    .from('events')
    .select(`${columns},${publicVenue}`, { count: 'exact' })
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

  const columns = await getEventColumns();
  const publicVenue = await getPublicVenueJoin();
  const { data } = unwrap(
    await supabase
      .from('events')
      .select(`${columns},${publicVenue}`)
      .eq('id', id)
      .eq('spots.status', 'active')
      .maybeSingle(),
  );
  return data ? withVenue(data) : null;
}

// --- admin -----------------------------------------------------------------

export async function adminListEvents(params) {
  await expirePastEvents();

  const columns = await getEventColumns();
  const adminVenue = await getAdminVenueJoin();
  const { q, status } = params;
  let query = supabase.from('events').select(`${columns},${adminVenue}`, { count: 'exact' });
  if (status) query = query.eq('status', status);
  if (q) query = query.ilike('title', `%${escapeLike(q)}%`);
  query = query.order('event_date', { ascending: false }).order('id', { ascending: false });

  const { from, to } = rangeFor(params);
  const { data, count } = unwrap(await query.range(from, to));
  return pageOf(data.map(withVenue), count ?? data.length, params);
}

export async function adminGetEvent(id) {
  const columns = await getEventColumns();
  const adminVenue = await getAdminVenueJoin();
  const { data } = unwrap(
    await supabase.from('events').select(`${columns},${adminVenue}`).eq('id', id).maybeSingle(),
  );
  return data ? withVenue(data) : null;
}

export async function adminCreateEvent(input) {
  const caps = await getSchemaCapabilities();
  const columns = await getEventColumns();
  const payload = { ...input };
  if (!caps.eventsHasEndTime) {
    delete payload.end_time;
  }
  const { data } = unwrap(await supabase.from('events').insert(payload).select(columns).single());
  return withVenue(data);
}

export async function adminUpdateEvent(id, patch) {
  const caps = await getSchemaCapabilities();
  const columns = await getEventColumns();
  const payload = { ...patch };
  if (!caps.eventsHasEndTime) {
    delete payload.end_time;
  }
  const { data } = unwrap(await supabase.from('events').update(payload).eq('id', id).select(columns).maybeSingle());
  return withVenue(data);
}

export async function adminDeleteEvent(id) {
  const { data } = unwrap(await supabase.from('events').delete().eq('id', id).select('id'));
  return data.length > 0;
}
