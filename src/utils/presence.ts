import { PRESENCE_STALE_MS } from '@/constants/presence';

type PossibleTimestamp = { toDate: () => Date };

/**
 * Normalizes presence timestamps from Firestore or serialized values into a native Date.
 * Returns null when the value cannot be safely converted.
 */
export function normalizePresenceDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  if (
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as PossibleTimestamp).toDate === 'function'
  ) {
    return (value as PossibleTimestamp).toDate();
  }

  return null;
}

/**
 * Determines whether a presence timestamp is still considered fresh.
 * A participant is deemed online if their last ping was within PRESENCE_STALE_MS.
 */
export function isPresenceRecent(lastSeen: unknown, staleWindowMs: number = PRESENCE_STALE_MS): boolean {
  const lastSeenDate = normalizePresenceDate(lastSeen);
  if (!lastSeenDate || isNaN(lastSeenDate.getTime())) return false;

  return Date.now() - lastSeenDate.getTime() <= staleWindowMs;
}
