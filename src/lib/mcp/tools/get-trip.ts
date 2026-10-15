import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { BRANCH } from "../../trips";
import { initialTrips } from "../../schedule-data";

// Public read-only tool over the built-in sample schedule (all data is fictional).
export default defineTool({
  name: "get_trip",
  title: "Get trip details",
  description: "Get a trip's stops in route order: stop type, customer, address, equipment, contact and time window.",
  inputSchema: { tripId: z.string().min(1).describe("Trip ID from list_schedule.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ tripId }) => {
    const trip = initialTrips.find((t) => t.id === tripId);
    if (!trip) throw new ToolError(`No trip with ID "${tripId}".`);
    const stops = trip.stops.map((s, i) => ({ order: i + 1, type: s.type, customer: s.customer, address: s.address, equipment: s.equipment, qty: s.qty, window: s.window, contactName: s.contactName, contactPhone: s.contactPhone }));
    const text = [`${trip.name} — ${trip.date} from ${BRANCH.name} (${trip.miles} mi)`,
      ...stops.map((s) => `${s.order}. [${s.type}] ${s.customer}, ${s.address} — ${s.qty}× ${s.equipment}, ${s.window} (${s.contactName} ${s.contactPhone})`)].join("\n");
    return { content: [{ type: "text", text }], structuredContent: { trip: { id: trip.id, name: trip.name, date: trip.date, miles: trip.miles, stops } } };
  },
});
