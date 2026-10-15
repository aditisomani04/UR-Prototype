import { defineTool } from "@lovable.dev/mcp-js";
import { days, initialTrips } from "../../trips";

export default defineTool({
  name: "list_schedule",
  title: "List weekly schedule",
  description: "List the sample Mon–Fri schedule with each day's trips and stop counts.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const schedule = days.map((d) => ({
      day: d.id,
      label: d.label,
      date: d.date,
      trips: initialTrips.filter((t) => t.dayId === d.id).map((t) => ({ id: t.id, name: t.name, stops: t.stops.length, miles: t.miles })),
    }));
    const text = schedule.map((d) => `${d.label} ${d.date}: ` + d.trips.map((t) => `${t.id} ${t.name} (${t.stops} stops, ${t.miles} mi)`).join("; ")).join("\n");
    return { content: [{ type: "text", text }], structuredContent: { schedule } };
  },
});
