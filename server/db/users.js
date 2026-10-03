import { supabase } from './supabase.js';
import { unwrap } from './helpers.js';

const USER_COLUMNS = 'id,display_name,email,avatar_url,role';

export async function getUserById(id) {
  const { data } = unwrap(await supabase.from('users').select(USER_COLUMNS).eq('id', id).maybeSingle());
  return data;
}

// role is not in the payload, so a promotion made directly in the database survives later sign-ins.
export async function upsertGoogleUser({ googleId, displayName, email, avatarUrl }) {
  const { data } = unwrap(
    await supabase
      .from('users')
      .upsert(
        { google_id: googleId, display_name: displayName, email, avatar_url: avatarUrl },
        { onConflict: 'google_id' },
      )
      .select(USER_COLUMNS)
      .single(),
  );
  return data;
}
