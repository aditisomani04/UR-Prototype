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
  completed: boolean;
  /** Driver remark explaining why a stop couldn't be completed. */
  remark?: string | undefined;
};
export type Trip = { id: string; dayId: string; name: string; branch: string; date: string; stops: Stop[]; miles: number };
export type Day = { id: string; short: string; label: string; date: string };
export type Driver = { id: string; name: string; truck: string; password: string };

export const drivers: Driver[] = [
  { id: "D-1042", name: "Marcus Reed", truck: "Truck 27", password: "password" },
  { id: "D-1087", name: "Priya Nair", truck: "Truck 12", password: "password" },
  { id: "D-1115", name: "Diego Alvarez", truck: "Truck 08", password: "password" },
  { id: "D-1163", name: "Sarah Kim", truck: "Truck 31", password: "password" },
  { id: "D-1201", name: "Jamal Carter", truck: "Truck 19", password: "password" },
  { id: "D-1248", name: "Elena Petrova", truck: "Truck 05", password: "password" },
];

export const BRANCH = { name: "Branch 214", address: "1200 Industrial Pkwy W, Hayward, CA", lat: 37.6354, lng: -122.1155 };

export const days: Day[] = [
  { id: "mon", short: "Mon", label: "Monday", date: "Oct 19" },
  { id: "tue", short: "Tue", label: "Tuesday", date: "Oct 20" },
  { id: "wed", short: "Wed", label: "Wednesday", date: "Oct 21" },
  { id: "thu", short: "Thu", label: "Thursday", date: "Oct 22" },
  { id: "fri", short: "Fri", label: "Friday", date: "Oct 23" },
];

type Seed = Omit<Stop, "id" | "window" | "completed">;
const S = (type: StopType, customer: string, address: string, lat: number, lng: number, equipment: string, qty: number, contactName: string, contactPhone: string, notes: string): Seed =>
  ({ type, customer, address, lat, lng, equipment, qty, contactName, contactPhone, notes });

// Stops are listed in no particular order — routes are optimized below.
const schedule: Record<string, [Seed[], Seed[]]> = {
  mon: [
    [
      S("delivery", "Summit Roofing Co.", "1720 Telegraph Ave, Berkeley, CA", 37.8698, -122.2593, "Boom Lift 45ft — #BL-0932", 1, "Dale Morgan", "(510) 555-0142", "Check in with site super Dale at the east gate. Offload on the paved pad, not the gravel."),
      S("delivery", "Apex Construction", "455 Market St, Oakland, CA", 37.8044, -122.2712, "Scissor Lift 19ft — #SL-4471", 1, "Rosa Lin", "(510) 555-0178", "Loading dock is on 5th St side. Call 15 min before arrival."),
      S("pickup", "Bayview Builders", "88 Harbor Blvd, Alameda, CA", 37.7712, -122.2824, "Mini Excavator 3.5T — #EX-2210", 1, "Tom Becker", "(510) 555-0119", "Unit is staged behind the blue trailer. Keys in lockbox, code 4471."),
    ],
    [
      S("delivery", "Metro Electric", "62 Fulton Rd, Hayward, CA", 37.6688, -122.0808, "Light Tower — #LT-3305", 2, "Kevin Ortiz", "(510) 555-0163", "Drop both towers along the north fence. Do not block the fire lane."),
      S("pickup", "Greenline Landscaping", "301 Elm St, San Leandro, CA", 37.7249, -122.1561, "Skid Steer Loader — #SS-1188", 1, "Ana Flores", "(510) 555-0127", "Gate code 2290#. Machine may need a wash-down before loading."),
      S("delivery", "Castro Valley Medical", "20103 Lake Chabot Rd, Castro Valley, CA", 37.6966, -122.0864, "Telehandler 10K — #TH-5520", 1, "Brian Shaw", "(510) 555-0191", "Hospital zone — 5 mph, no horn. Report to security booth first."),
    ],
  ],
  tue: [
    [
      S("delivery", "Fremont Logistics Hub", "45500 Fremont Blvd, Fremont, CA", 37.4904, -121.9431, "Forklift 5K — #FL-7781", 1, "Liam Patel", "(510) 555-0104", "Use truck entrance on Grimmer Blvd. Wear hi-vis vest on site."),
      S("pickup", "Union City Paving", "33300 Alvarado-Niles Rd, Union City, CA", 37.5934, -122.0438, "Plate Compactor — #PC-1420", 3, "Gina Russo", "(510) 555-0155", "Three compactors on pallets by the trailer office. Forklift on site."),
      S("delivery", "Newark Tech Park", "39899 Balentine Dr, Newark, CA", 37.5374, -122.0050, "Scissor Lift 26ft — #SL-6630", 2, "Omar Haddad", "(510) 555-0133", "Building C, roll-up door 4. Floor protection mats required inside."),
      S("pickup", "Hayward Shoreline Works", "3800 Arden Rd, Hayward, CA", 37.6311, -122.1336, "Air Compressor 185 CFM — #AC-0218", 1, "Pat Nguyen", "(510) 555-0170", "Gravel lot — stay on the marked path. Tow hitch is 2-5/16\"."),
    ],
    [
      S("delivery", "San Lorenzo Schools", "15510 Usher St, San Lorenzo, CA", 37.6849, -122.1345, "Boom Lift 60ft — #BL-1144", 1, "Dale Whitman", "(510) 555-0186", "Deliver after 3:00 PM only (school dismissal). Check in at main office."),
      S("pickup", "Oakland Port Annex", "1 Ferro St, Oakland, CA", 37.7955, -122.2840, "Generator 56kW — #GN-3009", 1, "Mike Duran", "(510) 555-0112", "TWIC escort required. Meet escort at Gate B."),
      S("delivery", "Emeryville Lofts", "5900 Hollis St, Emeryville, CA", 37.8410, -122.2896, "Trench Shoring Box — #TS-0811", 1, "Jen Park", "(510) 555-0148", "Street parking only — place cones before offloading."),
    ],
  ],
  wed: [
    [
      S("delivery", "Dublin Retail Center", "4550 Tassajara Rd, Dublin, CA", 37.7049, -121.8713, "Scissor Lift 32ft — #SL-9012", 2, "Chris Allen", "(925) 555-0121", "Back lot behind Target. Offload on asphalt only."),
      S("pickup", "Pleasanton Civic", "200 Old Bernal Ave, Pleasanton, CA", 37.6624, -121.8747, "Light Tower — #LT-2201", 2, "Maria Gomez", "(925) 555-0166", "Towers staged by the parking structure ramp."),
      S("delivery", "Livermore Winery Build", "5565 Tesla Rd, Livermore, CA", 37.6600, -121.7210, "Mini Excavator 5T — #EX-3381", 1, "Dale Hughes", "(925) 555-0109", "Check in with site super Dale at the east gate. Offload on the paved pad, not the gravel."),
    ],
    [
      S("pickup", "San Ramon Office Park", "2600 Camino Ramon, San Ramon, CA", 37.7725, -121.9686, "Boom Lift 40ft — #BL-0477", 1, "Steve Kwan", "(925) 555-0182", "Unit is on level P2 — max clearance 8'2\". Use spotter."),
      S("delivery", "Danville Residence", "500 La Gonda Way, Danville, CA", 37.8121, -122.0143, "Skid Steer Loader — #SS-2290", 1, "Laura Benton", "(925) 555-0137", "Residential street — narrow. Homeowner will move cars; call on arrival."),
      S("delivery", "Castro Valley Plaza", "3295 Castro Valley Blvd, Castro Valley, CA", 37.6941, -122.0726, "Plate Compactor — #PC-1503", 2, "Ray Soto", "(510) 555-0198", "Deliver to rear service alley. Store manager signs the ticket."),
    ],
  ],
  thu: [
    [
      S("delivery", "Richmond Refinery Gate 3", "841 Chevron Way, Richmond, CA", 37.9365, -122.3810, "Generator 125kW — #GN-5512", 1, "Hank Ellis", "(510) 555-0115", "Safety orientation required (20 min). H2S monitor provided at gate."),
      S("pickup", "El Cerrito Plaza", "6000 El Cerrito Plaza, El Cerrito, CA", 37.8987, -122.3000, "Scissor Lift 19ft — #SL-2287", 2, "Nina Brooks", "(510) 555-0144", "Lifts are chained near the loading area. Bring bolt key #7."),
      S("delivery", "Albany Hillside Homes", "1000 San Pablo Ave, Albany, CA", 37.8888, -122.2977, "Mini Excavator 1.8T — #EX-0905", 1, "Dale Ford", "(510) 555-0159", "Steep driveway — offload at street level. Super Dale on site from 7 AM."),
      S("pickup", "Berkeley Marina", "201 University Ave, Berkeley, CA", 37.8668, -122.3080, "Air Compressor 185 CFM — #AC-0331", 1, "Tara Wells", "(510) 555-0126", "Parking lot B. Watch for pedestrians on the bay trail."),
    ],
    [
      S("delivery", "Alameda Point Hangar", "2151 Ferry Point, Alameda, CA", 37.7865, -122.3089, "Boom Lift 80ft — #BL-8001", 1, "Victor Lane", "(510) 555-0102", "Hangar 12. Escort from front gate. No phones inside hangar."),
      S("pickup", "Fruitvale Station Lofts", "3301 E 12th St, Oakland, CA", 37.7754, -122.2245, "Telehandler 10K — #TH-1190", 1, "Carla Reyes", "(510) 555-0173", "Pick up from the southeast corner of the lot."),
      S("delivery", "San Leandro Marina", "40 Mulford Point Dr, San Leandro, CA", 37.6980, -122.1910, "Light Tower — #LT-4410", 3, "Ben Ito", "(510) 555-0151", "Place towers along the seawall path, 30 ft apart."),
    ],
  ],
  fri: [
    [
      S("pickup", "Milpitas Data Center", "1501 McCarthy Blvd, Milpitas, CA", 37.4180, -121.9200, "Scissor Lift 26ft — #SL-6630", 2, "Arjun Mehta", "(408) 555-0138", "Badge in at security. Lifts on loading dock 2."),
      S("delivery", "Fremont Warm Springs", "45000 Warm Springs Blvd, Fremont, CA", 37.5010, -121.9300, "Boom Lift 45ft — #BL-0932", 1, "Dale Kim", "(510) 555-0167", "Check in with site super Dale at the east gate. Offload on the paved pad, not the gravel."),
      S("pickup", "Newark Retail", "5500 Mowry Ave, Newark, CA", 37.5240, -122.0040, "Plate Compactor — #PC-1420", 1, "Lisa Tran", "(510) 555-0184", "Compactor is behind the garden center fence."),
    ],
    [
      S("delivery", "Hayward City Hall", "777 B St, Hayward, CA", 37.6730, -122.0830, "Generator 56kW — #GN-3009", 1, "Sam Ochoa", "(510) 555-0106", "Event setup — place on the B St side near the stage."),
      S("pickup", "Castro Valley Medical", "20103 Lake Chabot Rd, Castro Valley, CA", 37.6966, -122.0864, "Telehandler 10K — #TH-5520", 1, "Brian Shaw", "(510) 555-0191", "Hospital zone — 5 mph. Unit staged near the north parking lot."),
      S("pickup", "San Lorenzo Schools", "15510 Usher St, San Lorenzo, CA", 37.6849, -122.1345, "Boom Lift 60ft — #BL-1144", 1, "Dale Whitman", "(510) 555-0186", "Pick up before 7:30 AM or after 3:00 PM only."),
      S("delivery", "Oakland Coliseum Lot", "7000 Coliseum Way, Oakland, CA", 37.7516, -122.2005, "Light Tower — #LT-2201", 2, "Ike Turner", "(510) 555-0193", "Enter at Gate D. Stage towers in lot C, row 4."),
    ],
  ],
};

// Haversine distance in miles
export function miles(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 3958.8, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function loopLength<T extends { lat: number; lng: number }>(order: T[]) {
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

const fmt = (mins: number) => {
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${((h + 11) % 12) + 1}:${m.toString().padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

function buildTrip(dayId: string, idx: number, seeds: Seed[]): Trip {
  const ordered = optimizeRoute(seeds);
  let t = idx === 0 ? 7 * 60 : 12 * 60 + 30;
  const start = t;
  let prev: { lat: number; lng: number } = BRANCH;
  const stops = ordered.map((s, i) => {
    t += Math.round((miles(prev, s) * 1.3 / 30) * 60 / 15) * 15 + 15; // drive ~30mph, round to 15m
    prev = s;
    const w = `${fmt(t)}–${fmt(t + 60)}`;
    t += 45; // on-site time
    return { ...s, id: `${dayId}-${idx}-${i}`, window: w, completed: false };
  });
  return {
    id: `${dayId}-t${idx + 1}`, dayId, name: `Trip ${idx + 1}`,
    branch: `${BRANCH.name} · ${BRANCH.address}`,
    date: `${idx === 0 ? "Morning" : "Afternoon"} · departs ${fmt(start)}`,
    stops, miles: Math.round(loopLength(ordered) * 1.3),
  };
}

export const initialTrips: Trip[] = days.flatMap((d) => schedule[d.id]!.map((seeds, i) => buildTrip(d.id, i, seeds)));

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
