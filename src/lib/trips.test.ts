import { describe, expect, it } from "vitest";
import { BRANCH, initialTrips, mapsBranchUrl, mapsRouteUrl } from "./trips";

describe("Google Maps trip links", () => {
  it("includes every trip stop in displayed order within the mobile waypoint limit", () => {
    for (const trip of initialTrips) {
      const params = new URL(mapsRouteUrl(trip.stops)).searchParams;
      const intermediates = params.get("waypoints")?.split("|") ?? [];
      expect(intermediates.length).toBeLessThanOrEqual(3);
      expect([...intermediates, params.get("destination")]).toEqual(trip.stops.map((stop) => stop.address));
      expect(params.get("origin")).toBe(BRANCH.address);
      expect(params.get("travelmode")).toBe("driving");
    }
  });

  it("excludes completed and reported stops and allows Maps to resolve the current origin", () => {
    const trip = initialTrips.find((item) => item.stops.length === 4);
    if (!trip) throw new Error("Four-stop fixture missing");
    const stops = trip.stops.map((stop, i) => ({ ...stop, completed: i === 0, remark: i === 1 ? "Site closed" : undefined }));
    const params = new URL(mapsRouteUrl(stops)).searchParams;
    expect(params.has("origin")).toBe(false);
    expect(params.get("waypoints")).toBe(stops[2]?.address);
    expect(params.get("destination")).toBe(stops[3]?.address);
  });

  it("handles one remaining stop and all resolved stops", () => {
    const trip = initialTrips[0];
    if (!trip) throw new Error("Trip fixture missing");
    const stops = trip.stops.map((stop, i) => ({ ...stop, completed: i !== 0 }));
    const params = new URL(mapsRouteUrl(stops)).searchParams;
    expect(params.has("waypoints")).toBe(false);
    expect(params.get("destination")).toBe(stops[0]?.address);
    expect(mapsRouteUrl(stops.map((stop) => ({ ...stop, completed: true })))).toBe(mapsBranchUrl());
    const branchParams = new URL(mapsBranchUrl()).searchParams;
    expect(branchParams.get("destination")).toBe(BRANCH.address);
    expect(branchParams.has("origin")).toBe(false);
    expect(branchParams.has("waypoints")).toBe(false);
  });
});