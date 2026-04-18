import { supabase } from './supabase';

type EventType = 'item_view' | 'add_to_bill' | 'category_click' | 'search_used' | 'session_start';

type TrackEventPayload = {
  item_id?: string | null;
  category_id?: string | null;
  dedupeKey?: string;
  dedupeWindowMs?: number;
};

const SESSION_ID_KEY = 'planb_menu_session_id';
const SESSION_LAST_ACTIVITY_KEY = 'planb_menu_session_last_activity';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const recentEventTimestamps = new Map<string, number>();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_DEDUPE_KEYS = 200;

function nowMs() {
  return Date.now();
}

function safeReadStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWriteStorage(key: string, value: string) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures to keep UI safe.
  }
}

function createSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `session-${nowMs()}-${Math.random().toString(16).slice(2)}`;
}

export function getOrCreateSessionId() {
  const lastActivityRaw = safeReadStorage(SESSION_LAST_ACTIVITY_KEY);
  const previousSessionId = safeReadStorage(SESSION_ID_KEY);
  const currentTime = nowMs();
  const lastActivity = lastActivityRaw ? Number(lastActivityRaw) : NaN;

  const isExpired = Number.isFinite(lastActivity) ? currentTime - lastActivity > SESSION_TIMEOUT_MS : true;
  const sessionId = previousSessionId && !isExpired ? previousSessionId : createSessionId();

  safeWriteStorage(SESSION_ID_KEY, sessionId);
  safeWriteStorage(SESSION_LAST_ACTIVITY_KEY, String(currentTime));

  return sessionId;
}

function shouldTrackEvent(key: string, dedupeWindowMs: number) {
  const currentTime = nowMs();
  const previousTime = recentEventTimestamps.get(key);

  if (typeof previousTime === 'number' && currentTime - previousTime < dedupeWindowMs) {
    return false;
  }

  recentEventTimestamps.set(key, currentTime);

  if (recentEventTimestamps.size > MAX_DEDUPE_KEYS) {
    const expiryThreshold = currentTime - 2 * SESSION_TIMEOUT_MS;
    for (const [trackedKey, trackedAt] of recentEventTimestamps.entries()) {
      if (trackedAt < expiryThreshold) {
        recentEventTimestamps.delete(trackedKey);
      }
    }
  }

  return true;
}

function sendEventInsert(event_type: EventType, session_id: string, payload: TrackEventPayload) {
  const safeItemId = payload.item_id && UUID_PATTERN.test(payload.item_id) ? payload.item_id : null;
  const safeCategoryId = payload.category_id && UUID_PATTERN.test(payload.category_id) ? payload.category_id : null;

  const insertPayload = {
    event_type,
    session_id,
    item_id: safeItemId,
    category_id: safeCategoryId
  };

  void supabase.from('events').insert(insertPayload).then(({ error }) => {
    if (error) {
      console.warn('[analytics] event insert failed', error.message);
    }
  });
}

export function trackEvent(eventType: EventType, payload: TrackEventPayload = {}) {
  if (typeof window === 'undefined') return;

  const sessionId = getOrCreateSessionId();
  const dedupeKey = payload.dedupeKey ?? `${eventType}:${payload.item_id ?? ''}:${payload.category_id ?? ''}`;
  const dedupeWindowMs = payload.dedupeWindowMs ?? 800;

  if (!shouldTrackEvent(dedupeKey, dedupeWindowMs)) {
    return;
  }

  window.setTimeout(() => {
    sendEventInsert(eventType, sessionId, payload);
  }, 0);
}
