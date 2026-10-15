import { defineMcp } from "@lovable.dev/mcp-js";
import listSchedule from "./tools/list-schedule";
import getTrip from "./tools/get-trip";

export default defineMcp({
  name: "ur-driver-s-delight",
  title: "UR Driver's Delight",
  version: "0.1.0",
  instructions: "Read-only access to the driver app's sample weekly delivery/pickup schedule. Use list_schedule to find trips, then get_trip for stop details.",
  tools: [listSchedule, getTrip],
});
