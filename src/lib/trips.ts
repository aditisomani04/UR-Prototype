export type StopType = "delivery" | "pickup";
export type Stop = {
  id: string;
  type: StopType;
  customer: string;
  address: string;
  lat: number;
  lng: number;
  equipment: string;
  qty: number;
  window: string;
  contactName: string;
  contactPhone: string;
  notes: string;
  /** Translated site notes [es, hi], supplied with the private schedule. */
  notesI18n?: readonly [string, string] | undefined;
  completed: boolean;
  /** Driver remark explaining why a stop couldn't be completed. */
  remark?: string | undefined;
  /** Asset tag the driver scanned/typed to verify the equipment. */
  scannedTag?: string | undefined;
  /** Condition photos attached by the driver (data URLs, kept in memory). */
  photos?: string[] | undefined;
  /** Optional driver-reported condition: "Good" | "Needs attention" | "Damaged". */
  condition?: string | undefined;
  /** Optional free-text detail about the condition. */
  conditionNote?: string | undefined;
  /** Pickup only: fuel gauge level reported by the driver. */
  fuelLevel?: string | undefined;
  /** Pickup only: engine hour-meter reading, as typed. */
  hourMeter?: string | undefined;
};
export type Trip = { id: string; dayId: string; name: string; branch: string; date: string; stops: Stop[]; miles: number };
export type Day = { id: string; short: string; label: string; date: string };
export type Driver = { id: string; name: string; email: string; truck?: string };

/** Sample drivers for the prototype. All share the demo password "password". */
export const drivers = [
  { id: "D-1042", name: "Marcus Reed", email: "marcus.reed@example.com", password: "password", truck: "T-108" },
  { id: "D-1087", name: "Priya Nair", email: "priya.nair@example.com", password: "password", truck: "T-112" },
  { id: "D-1115", name: "Diego Alvarez", email: "diego.alvarez@example.com", password: "password", truck: "T-121" },
  { id: "D-1163", name: "Sarah Kim", email: "sarah.kim@example.com", password: "password", truck: "T-126" },
  { id: "D-1201", name: "Jamal Carter", email: "jamal.carter@example.com", password: "password", truck: "T-133" },
  { id: "D-1248", name: "Elena Petrova", email: "elena.petrova@example.com", password: "password", truck: "T-140" },
];

export const BRANCH = { name: "Branch 214", address: "1200 Industrial Pkwy W, Hayward, CA", lat: 37.6354, lng: -122.1155 };

export const days: Day[] = [
  { id: "mon", short: "Mon", label: "Monday", date: "Oct 19" },
  { id: "tue", short: "Tue", label: "Tuesday", date: "Oct 20" },
  { id: "wed", short: "Wed", label: "Wednesday", date: "Oct 21" },
  { id: "thu", short: "Thu", label: "Thursday", date: "Oct 22" },
  { id: "fri", short: "Fri", label: "Friday", date: "Oct 23" },
];

export function miles(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 3958.8, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function loopLength<T extends { lat: number; lng: number }>(order: T[]) {
  let d = 0, prev: { lat: number; lng: number } = BRANCH;
  for (const p of order) { d += miles(prev, p); prev = p; }
  return d + miles(prev, BRANCH);
}

function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  return arr.flatMap((x, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [x, ...p]));
}

/** Shortest round trip branch → all stops → branch (exact, fine for ≤ 7 stops). */
export function optimizeRoute<T extends { lat: number; lng: number }>(stops: T[]): T[] {
  let best = stops, bestD = Infinity;
  for (const p of permutations(stops)) { const d = loopLength(p); if (d < bestD) { bestD = d; best = p; } }
  return best;
}


/** Preserve the displayed stop order. The final customer is the destination so
 * four-stop trips fit Google Maps mobile web's three-intermediate-stop limit.
 * After progress, omit origin so Maps can use the driver's current location.
 * Branch return is a separate leg, never a fourth intermediate waypoint.
 */
export function mapsRouteUrl(stops: Stop[]) {
  const remaining = stops.filter((stop) => !stop.completed && !stop.remark);
  const destination = remaining.at(-1);
  if (!destination) return mapsBranchUrl();
  const p = new URLSearchParams({ api: "1", destination: destination.address, travelmode: "driving" });
  if (!stops.some((stop) => stop.completed || stop.remark)) p.set("origin", BRANCH.address);
  const waypoints = remaining.slice(0, -1);
  if (waypoints.length) p.set("waypoints", waypoints.map((stop) => stop.address).join("|"));
  return `https://www.google.com/maps/dir/?${p.toString()}`;
}
export function mapsBranchUrl() {
  const p = new URLSearchParams({ api: "1", destination: BRANCH.address, travelmode: "driving", dir_action: "navigate" });
  return `https://www.google.com/maps/dir/?${p.toString()}`;
}
export function mapsStopUrl(s: Stop) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.address)}&travelmode=driving`;
}
