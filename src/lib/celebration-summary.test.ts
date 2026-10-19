import { expect, it } from "vitest";
import { initialTrips } from "./schedule-data";
import { celebrationSummary } from "./celebration-summary";

const sample = initialTrips[0];
if (!sample) throw new Error("Trip fixture missing");
const stop = sample.stops[0];
if (!stop) throw new Error("Stop fixture missing");
const trips = [
  { ...sample, id: "first", stops: [
    { ...stop, id: "delivery", type: "delivery" as const, qty: 3, completed: true },
    { ...stop, id: "pickup", type: "pickup" as const, completed: true },
    { ...stop, id: "reported", completed: false, remark: "Site closed" },
  ] },
  { ...sample, id: "second", stops: [{ ...stop, id: "second-delivery", type: "delivery" as const, completed: true }] },
];

it("counts completed deliveries, pickups and unresolved reports for a trip", () => {
  expect(celebrationSummary(trips, "first", { first: true })).toEqual({ delivered: 1, pickedUp: 1, reported: 1, dayComplete: false });
});
it("counts all of the selected day only after both branch returns", () => {
  expect(celebrationSummary(trips, "second", { first: true, second: true })).toEqual({ delivered: 2, pickedUp: 1, reported: 1, dayComplete: true });
});
it("does not count a completed stop twice when it has an older remark", () => {
  const updated = [{ ...trips[0], ...sample, id: "first", stops: [{ ...stop, type: "delivery" as const, completed: true, remark: "Old issue" }] }];
  expect(celebrationSummary(updated, "first", { first: true })).toEqual({ delivered: 1, pickedUp: 0, reported: 0, dayComplete: true });
});
it("does not award day completion if a stop is undone", () => {
  const undone = trips.map((trip) => ({ ...trip, stops: trip.stops.map((s) => ({ ...s, completed: false, remark: undefined })) }));
  expect(celebrationSummary(undone, "second", { first: true, second: true }).dayComplete).toBe(false);
});
it("excludes other days from the total", () => {
  expect(celebrationSummary([...trips, { ...trips[1], ...sample, id: "other", dayId: "tue", stops: [{ ...stop, completed: true }] }], "second", { first: true, second: true }).delivered).toBe(2);
});