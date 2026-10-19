import type { Trip } from "./trips";

export type CelebrationSummary = { delivered: number; pickedUp: number; reported: number; dayComplete: boolean };

/** Totals count customer stops, not equipment quantities. */
export function celebrationSummary(trips: Trip[], tripId: string, returned: Record<string, boolean>): CelebrationSummary {
  const trip = trips.find((item) => item.id === tripId);
  const dayTrips = trip ? trips.filter((item) => item.dayId === trip.dayId) : [];
  const dayComplete = dayTrips.length > 0 && dayTrips.every((item) =>
    returned[item.id] && item.stops.every((stop) => stop.completed || Boolean(stop.remark)));
  const stops = (dayComplete ? dayTrips : trip ? [trip] : []).flatMap((item) => item.stops);
  return {
    delivered: stops.filter((stop) => stop.completed && stop.type === "delivery").length,
    pickedUp: stops.filter((stop) => stop.completed && stop.type === "pickup").length,
    reported: stops.filter((stop) => !stop.completed && Boolean(stop.remark)).length,
    dayComplete,
  };
}