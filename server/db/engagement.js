import { supabase } from './supabase.js';
import { pageOf, rangeFor, unwrap } from './helpers.js';
import { SPOT_COLUMNS } from './spots.js';

/** Resolves to { liked, like_count }, or null if the spot is not an active spot. */
export async function likeSpot(userId, spotId) {
  const { data } = unwrap(await supabase.rpc('like_spot', { p_user_id: userId, p_spot_id: spotId }));
  return data;
}

/** Resolves to { liked, like_count }, or null if the spot does not exist. */
export async function unlikeSpot(userId, spotId) {
  const { data } = unwrap(await supabase.rpc('unlike_spot', { p_user_id: userId, p_spot_id: spotId }));
  return data;
}

export async function listBookmarks(userId, params) {
  const { from, to } = rangeFor(params);
  const { data, count } = unwrap(
    await supabase
      .from('bookmarks')
      .select(`created_at,spots!inner(${SPOT_COLUMNS})`, { count: 'exact' })
      .eq('user_id', userId)
      .eq('spots.status', 'active')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(from, to),
  );

  const items = data.map(({ created_at, spots }) => ({ ...spots, bookmarked_at: created_at }));
  return pageOf(items, count ?? items.length, params);
}

/** Idempotent. Resolves to false if the spot is not an active spot. */
export async function addBookmark(userId, spotId) {
  const { data: spot } = unwrap(
    await supabase.from('spots').select('id').eq('id', spotId).eq('status', 'active').maybeSingle(),
  );
  if (!spot) return false;

  unwrap(
    await supabase
      .from('bookmarks')
      .upsert({ user_id: userId, spot_id: spotId }, { onConflict: 'user_id,spot_id', ignoreDuplicates: true }),
  );
  return true;
}

export async function removeBookmark(userId, spotId) {
  unwrap(await supabase.from('bookmarks').delete().eq('user_id', userId).eq('spot_id', spotId));
}
