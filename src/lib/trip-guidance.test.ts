import { describe, expect, it } from "vitest";
import { initialTrips } from "./schedule-data";
import { nextTripId, timeWindowWarning, canEditDay, isDayComplete } from "./trip-guidance";

const monday = initialTrips.filter((t) => t.dayId === "mon");
const first = monday[0];
const sample = first?.stops[0];
if (!first || !sample) throw new Error("Monday fixture missing");
const stop = { ...sample, completed: false, remark: undefined, window: "11:00 AM–12:00 PM" };

describe("Next trip guidance", () => {
  it("points to Trip 1 before Trip 2", () => expect(nextTripId(monday, {})).toBe("mon-t1"));
  it("advances to Trip 2 only after branch arrival", () => {
    const completedStops = monday.map((t) => ({ ...t, stops: t.stops.map((s) => ({ ...s, completed: true })) }));
    expect(nextTripId(completedStops, {})).toBe("mon-t1");
    expect(nextTripId(monday, { "mon-t1": true })).toBe("mon-t2");
  });
  it("has no next trip when the selected day is complete", () => expect(nextTripId(monday, { "mon-t1": true, "mon-t2": true })).toBeUndefined());
  it("uses the selected day's trips", () => expect(nextTripId(initialTrips.filter((t) => t.dayId === "tue"), {})).toBe("tue-t1"));
});

describe("Scheduled day access", () => {
  it("blocks future days before their scheduled date", () => expect(canEditDay("mon", new Date("2026-10-16T21:02:00Z"))).toBe(false));
  it("allows updates only on the scheduled day", () => {
    expect(canEditDay("mon", new Date("2026-10-19T21:02:00Z"))).toBe(true);
    expect(canEditDay("tue", new Date("2026-10-19T21:02:00Z"))).toBe(false);
    expect(canEditDay("mon", new Date("2026-10-20T21:02:00Z"))).toBe(false);
  });
  it("unlocks and locks at branch midnight rather than UTC midnight", () => {
    expect(canEditDay("mon", new Date("2026-10-19T06:59:59Z"))).toBe(false);
    expect(canEditDay("mon", new Date("2026-10-19T07:00:00Z"))).toBe(true);
    expect(canEditDay("mon", new Date("2026-10-20T06:59:59Z"))).toBe(true);
    expect(canEditDay("mon", new Date("2026-10-20T07:00:00Z"))).toBe(false);
  });
  it("stays read-only until the clock is hydrated", () => {
    expect(canEditDay("mon", null)).toBe(false);
    expect(canEditDay("unknown", new Date("2026-10-19T21:02:00Z"))).toBe(false);
  });
});

describe("Completed day indicator", () => {
  const resolved = monday.map((trip) => ({ ...trip, stops: trip.stops.map((s) => ({ ...s, completed: true })) }));
  it("checks the day only when every trip is resolved and returned", () => {
    expect(isDayComplete(resolved, { "mon-t1": true, "mon-t2": true })).toBe(true);
    expect(isDayComplete(resolved, { "mon-t1": true })).toBe(false);
    expect(isDayComplete(monday, { "mon-t1": true, "mon-t2": true })).toBe(false);
    expect(isDayComplete([], {})).toBe(false);
  });
});

describe("Stop time-window warnings in branch time", () => {
  it("warns at exactly 30 minutes before the end", () => expect(timeWindowWarning(stop, "mon", new Date("2026-10-19T18:30:00Z"))).toEqual({ kind: "soon", minutes: 30 }));
  it("does not warn before the last 30 minutes", () => expect(timeWindowWarning(stop, "mon", new Date("2026-10-19T18:29:59Z"))).toBeNull());
  it("flags late only after the end", () => {
    expect(timeWindowWarning(stop, "mon", new Date("2026-10-19T19:00:00Z"))).toEqual({ kind: "soon", minutes: 0 });
    expect(timeWindowWarning(stop, "mon", new Date("2026-10-19T19:00:01Z"))).toEqual({ kind: "late", minutes: 1 });
  });
  it("does not flag future dates even when the clock time is later", () => expect(timeWindowWarning(stop, "tue", new Date("2026-10-19T23:00:00Z"))).toBeNull());
  it("keeps older unresolved stops late", () => expect(timeWindowWarning(stop, "mon", new Date("2026-10-20T19:00:00Z"))?.kind).toBe("late"));
  it("suppresses warnings for completed stops", () => expect(timeWindowWarning({ ...stop, completed: true }, "mon", new Date("2026-10-19T20:00:00Z"))).toBeNull());
  it("suppresses warnings for reported stops", () => expect(timeWindowWarning({ ...stop, remark: "Site closed" }, "mon", new Date("2026-10-19T20:00:00Z"))).toBeNull());
  it("handles afternoon and midnight correctly", () => {
    expect(timeWindowWarning({ ...stop, window: "1:00 PM–2:00 PM" }, "mon", new Date("2026-10-19T20:45:00Z"))).toEqual({ kind: "soon", minutes: 15 });
    expect(timeWindowWarning({ ...stop, window: "12:00 AM–1:00 AM" }, "mon", new Date("2026-10-19T07:45:00Z"))).toEqual({ kind: "soon", minutes: 15 });
  });
  it("ignores invalid windows", () => expect(timeWindowWarning({ ...stop, window: "TBD" }, "mon", new Date("2026-10-19T20:00:00Z"))).toBeNull());
});