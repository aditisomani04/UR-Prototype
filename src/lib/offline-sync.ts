// Offline-first progress store: every change is written to this device first,
// queued, and pushed to the database whenever a connection is available.
import { supabase } from "@/integrations/supabase/client";

export type ProgressData = Record<string, unknown>;
type Pending = Record<string, { data: ProgressData; updated_at: string }>;

const cacheKey = (driverId: string) => `driver-progress:${driverId}`;
const queueKey = (driverId: string) => `driver-progress-queue:${driverId}`;

function read<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}
function write(key: string, value: unknown): boolean {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}

export function cachedProgress(driverId: string): Record<string, ProgressData> {
  return read(cacheKey(driverId), {});
}
export function pendingCount(driverId: string): number {
  return Object.keys(read<Pending>(queueKey(driverId), {})).length;
}

/** Returns false if the device storage is full; in that case the change is
 * retried without photos so completions/remarks are never silently lost. */
export function saveLocal(driverId: string, stopId: string, data: ProgressData): boolean {
  const attempt = (d: ProgressData) => {
    const cache = cachedProgress(driverId);
    cache[stopId] = d;
    const queue = read<Pending>(queueKey(driverId), {});
    queue[stopId] = { data: d, updated_at: new Date().toISOString() };
    const q = write(queueKey(driverId), queue);
    const c = write(cacheKey(driverId), cache);
    return q && c;
  };
  if (attempt(data)) return true;
  if (Array.isArray(data["photos"]) && data["photos"].length) attempt({ ...data, photos: [] });
  return false;
}

/** Push queued changes. Returns remaining pending count. */
export async function flush(driverId: string): Promise<number> {
  const queue = read<Pending>(queueKey(driverId), {});
  const entries = Object.entries(queue);
  if (!entries.length || (typeof navigator !== "undefined" && !navigator.onLine)) return entries.length;
  const rows = entries.map(([stop_id, v]) => ({ driver_id: driverId, stop_id, data: v.data as never, updated_at: v.updated_at }));
  const { error } = await supabase.from("stop_progress").upsert(rows);
  if (error) return entries.length;
  // Drop only entries that weren't changed again while syncing.
  const latest = read<Pending>(queueKey(driverId), {});
  for (const [id, v] of entries) if (latest[id]?.updated_at === v.updated_at) delete latest[id];
  write(queueKey(driverId), latest);
  return Object.keys(latest).length;
}

/** Load server progress, overlaying any unsynced local changes. */
export async function fetchProgress(driverId: string): Promise<Record<string, ProgressData> | null> {
  const { data, error } = await supabase.from("stop_progress").select("stop_id, data").eq("driver_id", driverId);
  if (error || !data) return null;
  const merged: Record<string, ProgressData> = {};
  for (const r of data) merged[r.stop_id] = r.data as ProgressData;
  for (const [id, v] of Object.entries(read<Pending>(queueKey(driverId), {}))) merged[id] = v.data;
  write(cacheKey(driverId), merged);
  return merged;
}

export function clearLocal(driverId: string) {
  try { localStorage.removeItem(cacheKey(driverId)); localStorage.removeItem(queueKey(driverId)); } catch { /* ignore */ }
}
