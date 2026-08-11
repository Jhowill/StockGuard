import * as Crypto from 'expo-crypto';
import { withExclusiveTransaction } from '../db';
import { localDateKey, nowIso } from '@/utils/date';

const INTERSTITIAL_COOLDOWN_MS = 4 * 60 * 1000;
const INTERSTITIAL_DAILY_LIMIT = 3;
const PLACEMENT = 'interstitial_transition';

export async function claimInterstitialDisplay() {
  return withExclusiveTransaction(async (db) => {
    const now = new Date();
    const latest = await db.getFirstAsync<{ displayed_at: string }>(
      'SELECT displayed_at FROM ad_display_events WHERE placement = ? ORDER BY displayed_at DESC LIMIT 1',
      PLACEMENT,
    );
    if (latest && now.getTime() - new Date(latest.displayed_at).getTime() < INTERSTITIAL_COOLDOWN_MS) {
      return { allowed: false as const };
    }
    const today = localDateKey(now);
    const count = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM ad_display_events WHERE placement = ? AND date_key = ?',
      PLACEMENT,
      today,
    );
    if ((count?.count ?? 0) >= INTERSTITIAL_DAILY_LIMIT) {
      return { allowed: false as const };
    }
    const eventId = Crypto.randomUUID();
    await db.runAsync(
      'INSERT INTO ad_display_events (id, placement, displayed_at, date_key) VALUES (?, ?, ?, ?)',
      eventId,
      PLACEMENT,
      nowIso(),
      today,
    );
    return { allowed: true as const, eventId };
  });
}

export async function releaseInterstitialDisplayClaim(eventId: string) {
  return withExclusiveTransaction(async (db) => {
    await db.runAsync(
      'DELETE FROM ad_display_events WHERE id = ? AND placement = ?',
      eventId,
      PLACEMENT,
    );
  });
}
