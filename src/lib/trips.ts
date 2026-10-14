export type StopType = "delivery" | "pickup";
export type Stop = {
  id: string;
  type: StopType;
  customer: string;
  address: string;
  equipment: string;
  qty: number;
  window: string;
  completed: boolean;
};
export type Trip = { id: string; name: string; branch: string; date: string; stops: Stop[] };

export const initialTrips: Trip[] = [
  {
    id: "t1",
    name: "Trip 1",
    branch: "Branch 214 · 1200 Industrial Pkwy",
    date: "Morning · 7:00 AM",
    stops: [
      { id: "s1", type: "delivery", customer: "Apex Construction", address: "455 Market St, Oakland, CA", equipment: "Scissor Lift 19ft — #SL-4471", qty: 1, window: "7:30–8:30 AM", completed: false },
      { id: "s2", type: "pickup", customer: "Bayview Builders", address: "88 Harbor Blvd, Alameda, CA", equipment: "Mini Excavator 3.5T — #EX-2210", qty: 1, window: "9:00–10:00 AM", completed: false },
      { id: "s3", type: "delivery", customer: "Summit Roofing Co.", address: "1720 Telegraph Ave, Berkeley, CA", equipment: "Boom Lift 45ft — #BL-0932", qty: 1, window: "10:30–11:30 AM", completed: false },
    ],
  },
  {
    id: "t2",
    name: "Trip 2",
    branch: "Branch 214 · 1200 Industrial Pkwy",
    date: "Afternoon · 1:00 PM",
    stops: [
      { id: "s4", type: "pickup", customer: "Greenline Landscaping", address: "301 Elm St, San Leandro, CA", equipment: "Skid Steer Loader — #SS-1188", qty: 1, window: "1:30–2:30 PM", completed: false },
      { id: "s5", type: "delivery", customer: "Metro Electric", address: "62 Fulton Rd, Hayward, CA", equipment: "Light Tower — #LT-3305", qty: 2, window: "3:00–4:00 PM", completed: false },
    ],
  },
];
