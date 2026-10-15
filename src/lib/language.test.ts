import { describe, expect, it } from "vitest";
import { initialTrips } from "./schedule-data";
import { isLanguage, translate } from "./language";

describe("driver language", () => {
  it("only restores supported language preferences", () => {
    expect(isLanguage("es")).toBe(true);
    expect(isLanguage("hi")).toBe(true);
    expect(isLanguage(null)).toBe(false);
    expect(isLanguage("unsupported")).toBe(false);
  });

  it("translates every sample site instruction in both added languages", () => {
    for (const trip of initialTrips) {
      for (const stop of trip.stops) {
        expect(stop.notesI18n?.[0]).toBeTruthy();
        expect(stop.notesI18n?.[0]).not.toBe(stop.notes);
        expect(stop.notesI18n?.[1]).not.toBe(stop.notes);
      }
    }
  });

  it("interpolates progress without changing operational or driver-authored text", () => {
    expect(translate("es", "{done} of {total} stops completed", { done: 1, total: 3 })).toBe("1 de 3 paradas completadas");
    for (const value of ["Apex Construction", "#SL-4471", "ग्राहक ने कल आने को कहा", "Gate is flooded; dispatch notified."]) {
      expect(translate("hi", value)).toBe(value);
      expect(translate("es", value)).toBe(value);
    }
  });
});