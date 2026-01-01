// Keep heartbeat between 2–3 minutes to limit write churn while staying responsive
export const PRESENCE_HEARTBEAT_MS = 150_000;
// Ensure stale threshold comfortably exceeds heartbeat to avoid false offline states
export const PRESENCE_STALE_MS = 210_000;
