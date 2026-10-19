import type { Stop, Trip } from "./trips";

export const WINDOW_WARNING_MINUTES = 30;
export const BRANCH_TIME_ZONE = "America/Los_Angeles";

/** The built-in sample week starts on October 19, 2026. */
export function scheduleDate(dayId: string): string | null {
  const offset = ["mon", "tue", "wed", "thu", "fri"].indexOf(dayId);
  return offset < 0 ? null : `2026-10-${19 + offset}`;
}

export function nextTripId(trips: Trip[], returned: Record<string, boolean>): string | undefined {
  return trips.find((trip) => !returned[trip.id])?.id;
}

export function canEditDay(dayId: string, now: Date | null): boolean {
  const date = scheduleDate(dayId);
  if (!date || !now || !Number.isFinite(now.getTime())) return false;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BRANCH_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return date === `${part("year")}-${part("month")}-${part("day")}`;
}

export function isDayComplete(trips: Trip[], returned: Record<string, boolean>): boolean {
  return trips.length > 0 && trips.every((trip) => returned[trip.id] && trip.stops.every((stop) => stop.completed || !!stop.remark));
}

export type WindowWarning = { kind: "late" | "soon"; minutes: number };

export function timeWindowWarning(stop: Stop, dayId: string, now: Date): WindowWarning | null {
  if (stop.completed || stop.remark || !Number.isFinite(now.getTime())) return null;
  const date = scheduleDate(dayId);
  const times = stop.window.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/gi);
  if (!date || times?.length !== 2) return null;
  const end = times[1]?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!end) return null;
  const hour = Number(end[1]), minute = Number(end[2]);
  if (hour < 1 || hour > 12 || minute > 59) return null;
  const endMinute = (hour % 12 + (end[3]?.toUpperCase() === "PM" ? 12 : 0)) * 60 + minute;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BRANCH_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const today = `${part("year")}-${part("month")}-${part("day")}`;
  if (today < date) return null;
  // Older unresolved stops remain overdue without misleading minute counts.
  if (today > date) return { kind: "late", minutes: 0 };
  const remaining = endMinute - (Number(part("hour")) * 60 + Number(part("minute")) + Number(part("second")) / 60);
  if (remaining < 0) return { kind: "late", minutes: Math.ceil(-remaining) };
  if (remaining <= WINDOW_WARNING_MINUTES) return { kind: "soon", minutes: Math.ceil(remaining) };
  return null;
}