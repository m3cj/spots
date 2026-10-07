import cron from 'node-cron';
import { supabase } from '../db/supabase.js';

async function runExpiry() {
  try {
    const { data, error } = await supabase.rpc('expire_past_events');
    if (error) {
      console.warn('[cron] expire_past_events failed:', error.message);
    } else if (data > 0) {
      console.log(`[cron] expired/updated ${data} events`);
    }
  } catch (err) {
    console.warn('[cron] error running expire_past_events:', err.message);
  }
}

export function startEventExpiryJob() {
  // Run once on startup
  runExpiry();

  // Run every 15 minutes in Asia/Kolkata timezone
  const task = cron.schedule('*/15 * * * *', runExpiry, {
    timezone: 'Asia/Kolkata',
  });

  console.log('[cron] event expiry job scheduled (every 15 min, Asia/Kolkata)');
  return task;
}
