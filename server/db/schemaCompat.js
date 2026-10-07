import { supabase } from './supabase.js';

let capabilities = null;

/**
 * Dynamically probes the database to see if the admin overhaul migration
 * (server/db/migrations/001_admin_overhaul.sql) has been run in Supabase.
 * This guarantees zero 500 runtime errors whether the migration has been executed yet or not.
 */
export async function getSchemaCapabilities() {
  if (capabilities) return capabilities;

  const caps = {
    spotsHasCityLandmark: false,
    eventsHasEndTime: false,
    submissionsHasExtendedFields: false,
  };

  try {
    const [s, e, sub] = await Promise.all([
      supabase.from('spots').select('landmark,city').limit(1),
      supabase.from('events').select('end_time').limit(1),
      supabase.from('spot_submissions').select('reject_reason,city').limit(1),
    ]);
    caps.spotsHasCityLandmark = !s.error;
    caps.eventsHasEndTime = !e.error;
    caps.submissionsHasExtendedFields = !sub.error;
  } catch (err) {
    console.warn('[schemaCompat] Error probing schema capabilities:', err);
  }

  capabilities = caps;
  return caps;
}

export function resetSchemaCapabilities() {
  capabilities = null;
}
