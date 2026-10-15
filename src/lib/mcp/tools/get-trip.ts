import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { BRANCH, initialTrips } from "../../trips";

export default defineTool({
  name: "get_trip",
  title: "Get trip details",
  description: "Get a sample trip's stops in route order: type, customer, address, equipment, time window, contact, and site notes.",
  inputSchema: { tripId: z.string().min(1).describe("Trip ID from list_schedule.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ tripId }) => {
    const trip = initialTrips.find((t) => t.id === tripId);
    if (!trip) throw new ToolError(`No trip with ID "${tripId}".`);
    const stops = trip.stops.map((s, i) => ({
      order: i + 1, id: s.id, type: s.type, customer: s.customer, address: s.address,
      equipment: s.equipment, qty: s.qty, window: s.window, contactName: s.contactName,
      contactPhone: s.contactPhone, notes: s.notes,
    }));
    const text = [`${trip.name} — ${trip.date} from ${BRANCH.name} (${trip.miles} mi)`,
      ...stops.map((s) => `${s.order}. [${s.type}] ${s.customer}, ${s.address} — ${s.qty}× ${s.equipment}, ${s.window}. Contact ${s.contactName} ${s.contactPhone}. Notes: ${s.notes}`),
      `Then return to ${BRANCH.name}, ${BRANCH.address}.`].join("\n");
    return { content: [{ type: "text", text }], structuredContent: { trip: { id: trip.id, name: trip.name, date: trip.date, miles: trip.miles, stops } } };
  },
});
