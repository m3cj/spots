import { supabase } from './supabase.js';
import { escapeLike, pageOf, rangeFor, unwrap } from './helpers.js';

// created_by and search_text stay server-side on public responses.
export const SPOT_COLUMNS =
  'id,name,category_slug,status,hero_img,lat,lng,gmap_link,description,direction,tags,best_time_to_visit,street,area,pincode,state,like_count,views,contacts,created_at,updated_at';
const ADMIN_SPOT_COLUMNS = `${SPOT_COLUMNS},created_by`;
const GALLERY = 'spot_images(id,image_url,caption,sort_order)';

// Every word must appear somewhere in name, area, street, description, tags or category (spots.search_text).
function applySearch(query, q) {
  for (const word of (q ?? '').split(/\s+/).filter(Boolean).slice(0, 6)) {
    query = query.ilike('search_text', `%${escapeLike(word)}%`);
  }
  return query;
}

// --- public ----------------------------------------------------------------

export async function listSpots(params) {
  const { q, category, area, pincode, time, sort } = params;

  let query = supabase.from('spots').select(SPOT_COLUMNS, { count: 'exact' }).eq('status', 'active');
  if (category) query = query.eq('category_slug', category);
  if (area) query = query.ilike('area', escapeLike(area));
  if (pincode) query = query.eq('pincode', pincode);
  // A spot that is good "anytime" is also good at any specific time.
  if (time) query = query.in('best_time_to_visit', time === 'anytime' ? ['anytime'] : [time, 'anytime']);
  query = applySearch(query, q);

  if (sort === 'popular') query = query.order('like_count', { ascending: false });
  query = query.order('created_at', { ascending: false }).order('id', { ascending: false });

  const { from, to } = rangeFor(params);
  const { data, count } = unwrap(await query.range(from, to));
  return pageOf(data, count ?? data.length, params);
}

export async function getSpotDetail(id) {
  const { data } = unwrap(
    await supabase
      .from('spots')
      .select(`${SPOT_COLUMNS},${GALLERY}`)
      .eq('id', id)
      .eq('status', 'active')
      .order('sort_order', { referencedTable: 'spot_images' })
      .maybeSingle(),
  );
  return data;
}

/** Counts a detail view. A failed counter must never fail the page, so errors are logged and swallowed. */
export async function bumpViews(id) {
  const { data, error } = await supabase.rpc('increment_spot_views', { p_spot_id: id });
  if (error) {
    console.warn('[spots] views increment failed:', error.message);
    return null;
  }
  return data;
}

export async function getHotSpots() {
  const { data } = unwrap(
    await supabase
      .from('spots')
      .select(SPOT_COLUMNS)
      .eq('status', 'active')
      .order('like_count', { ascending: false })
      .order('views', { ascending: false })
      .order('id')
      .limit(10),
  );
  return data;
}

export async function getSpotFacets() {
  const { data } = unwrap(await supabase.rpc('spot_facets'));
  return data;
}

export async function getViewerState(userId, spotId) {
  const [likes, bookmarks] = await Promise.all([
    supabase.from('likes').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('spot_id', spotId),
    supabase.from('bookmarks').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('spot_id', spotId),
  ]);
  return { liked: unwrap(likes).count > 0, bookmarked: unwrap(bookmarks).count > 0 };
}

// --- admin -----------------------------------------------------------------

export async function adminListSpots(params) {
  const { q, status, category, ownerId } = params;

  let query = supabase.from('spots').select(ADMIN_SPOT_COLUMNS, { count: 'exact' });
  if (status) query = query.eq('status', status);
  if (category) query = query.eq('category_slug', category);
  if (ownerId) query = query.eq('created_by', ownerId);
  query = applySearch(query, q).order('updated_at', { ascending: false }).order('id', { ascending: false });

  const { from, to } = rangeFor(params);
  const { data, count } = unwrap(await query.range(from, to));
  return pageOf(data, count ?? data.length, params);
}

export async function adminGetSpot(id) {
  const { data } = unwrap(
    await supabase
      .from('spots')
      .select(`${ADMIN_SPOT_COLUMNS},${GALLERY}`)
      .eq('id', id)
      .order('sort_order', { referencedTable: 'spot_images' })
      .maybeSingle(),
  );
  return data;
}

export async function adminCreateSpot(input) {
  const { data } = unwrap(await supabase.from('spots').insert(input).select(ADMIN_SPOT_COLUMNS).single());
  return data;
}

export async function adminUpdateSpot(id, patch) {
  const { data } = unwrap(
    await supabase.from('spots').update(patch).eq('id', id).select(ADMIN_SPOT_COLUMNS).maybeSingle(),
  );
  return data;
}

/** Rejects with IN_USE while events still point at the spot. */
export async function adminDeleteSpot(id) {
  const { data } = unwrap(await supabase.from('spots').delete().eq('id', id).select('id'));
  return data.length > 0;
}

export async function replaceSpotImages(spotId, images) {
  unwrap(await supabase.rpc('replace_spot_images', { p_spot_id: spotId, p_images: images }));
  const { data } = unwrap(
    await supabase
      .from('spot_images')
      .select('id,image_url,caption,sort_order')
      .eq('spot_id', spotId)
      .order('sort_order'),
  );
  return data;
}
