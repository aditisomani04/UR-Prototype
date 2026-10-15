import boomLift from "@/assets/equipment/boom-lift.jpg";
import scissorLift from "@/assets/equipment/scissor-lift.jpg";
import airCompressor from "@/assets/equipment/air-compressor.jpg";
import miniExcavator from "@/assets/equipment/mini-excavator.jpg";
import skidSteer from "@/assets/equipment/skid-steer.jpg";
import telehandler from "@/assets/equipment/telehandler.jpg";
import forklift from "@/assets/equipment/forklift.jpg";
import generator from "@/assets/equipment/generator.jpg";
import lightTower from "@/assets/equipment/light-tower.jpg";
import plateCompactor from "@/assets/equipment/plate-compactor.jpg";
import trenchBox from "@/assets/equipment/trench-box.jpg";

const UR = "https://www.unitedrentals.com/marketplace/equipment";

export type EquipmentInfo = {
  category: string;
  photo: string;
  catalogUrl: string;
  /** Spec labels are translated; values are kept verbatim. */
  specs: { label: string; value: string }[];
  checks: string[];
};

type Def = Omit<EquipmentInfo, "specs"> & { match: RegExp; specs: (name: string) => { label: string; value: string }[] };

const sizeOf = (name: string, re: RegExp) => name.match(re)?.[1] ?? "—";

const defs: Def[] = [
  { match: /boom lift/i, category: "Aerial work platform — boom lift", photo: boomLift, catalogUrl: `${UR}/aerial-work-platforms/boom-lifts`,
    specs: (n) => [{ label: "Platform height", value: `${sizeOf(n, /(\d+)ft/)} ft` }, { label: "Platform capacity", value: "500 lb" }, { label: "Power", value: "Diesel 4WD" }, { label: "Transport weight", value: "~15,000–36,000 lb" }],
    checks: ["Check harness anchor points", "Test ground & platform controls", "Note hour meter & fuel level"] },
  { match: /scissor lift/i, category: "Aerial work platform — scissor lift", photo: scissorLift, catalogUrl: `${UR}/aerial-work-platforms/scissor-lifts`,
    specs: (n) => [{ label: "Platform height", value: `${sizeOf(n, /(\d+)ft/)} ft` }, { label: "Platform capacity", value: "500–1,000 lb" }, { label: "Power", value: "Electric" }, { label: "Transport weight", value: "~2,800–5,600 lb" }],
    checks: ["Check battery charge level", "Test emergency lowering", "Inspect guardrails & gate"] },
  { match: /air compressor/i, category: "Air compressor (towable)", photo: airCompressor, catalogUrl: `${UR}/air-compressors-air-tools/air-compressors`,
    specs: () => [{ label: "Airflow", value: "185 CFM" }, { label: "Pressure", value: "100 PSI" }, { label: "Power", value: "Diesel" }, { label: "Hitch", value: "2-5/16 in ball / pintle" }],
    checks: ["Check hitch, chains & lights", "Note hour meter & fuel level", "Drain moisture from tank"] },
  { match: /excavator/i, category: "Earthmoving — mini excavator", photo: miniExcavator, catalogUrl: `${UR}/earthmoving-equipment/mini-excavators`,
    specs: (n) => [{ label: "Operating weight", value: `${sizeOf(n, /([\d.]+)T/)} t` }, { label: "Dig depth", value: "~7–12 ft" }, { label: "Power", value: "Diesel" }, { label: "Attachments", value: "Bucket + blade" }],
    checks: ["Walk-around for track damage", "Check bucket pins & teeth", "Note hour meter & fuel level"] },
  { match: /skid steer/i, category: "Earthmoving — skid steer loader", photo: skidSteer, catalogUrl: `${UR}/earthmoving-equipment/skid-steers-compact-track-loaders`,
    specs: () => [{ label: "Rated capacity", value: "2,000 lb" }, { label: "Operating weight", value: "~7,500 lb" }, { label: "Power", value: "Diesel" }, { label: "Attachments", value: "General-purpose bucket" }],
    checks: ["Check tires / tracks", "Test lift arm & bucket", "Note hour meter & fuel level"] },
  { match: /telehandler/i, category: "Forklift — telehandler", photo: telehandler, catalogUrl: `${UR}/forklifts/telehandlers`,
    specs: () => [{ label: "Lift capacity", value: "10,000 lb" }, { label: "Lift height", value: "~55 ft" }, { label: "Power", value: "Diesel 4WD" }, { label: "Attachments", value: "Pallet forks" }],
    checks: ["Inspect boom & forks", "Check load chart is in cab", "Note hour meter & fuel level"] },
  { match: /forklift/i, category: "Forklift — warehouse", photo: forklift, catalogUrl: `${UR}/forklifts/warehouse-forklifts`,
    specs: () => [{ label: "Lift capacity", value: "5,000 lb" }, { label: "Lift height", value: "~15 ft" }, { label: "Power", value: "LP gas" }, { label: "Tires", value: "Cushion" }],
    checks: ["Check LP tank is secured", "Inspect forks & mast chains", "Test horn & lights"] },
  { match: /generator/i, category: "Power generation — generator", photo: generator, catalogUrl: `${UR}/power-generation-equipment`,
    specs: (n) => [{ label: "Output", value: `${sizeOf(n, /(\d+)kW/)} kW` }, { label: "Voltage", value: "120/240 V, 480 V" }, { label: "Power", value: "Diesel, Tier 4 Final" }, { label: "Hitch", value: "Pintle" }],
    checks: ["Check hitch, chains & lights", "Check fuel & coolant level", "Confirm breakers are OFF"] },
  { match: /light tower/i, category: "Lighting — portable light tower", photo: lightTower, catalogUrl: `${UR}/lighting-equipment/portable-light-towers`,
    specs: () => [{ label: "Lamps", value: "4 × LED" }, { label: "Mast height", value: "~25 ft" }, { label: "Power", value: "Diesel" }, { label: "Hitch", value: "2 in ball" }],
    checks: ["Lower & lock mast before towing", "Check hitch, chains & lights", "Note fuel level"] },
  { match: /compactor/i, category: "Compaction — plate compactor", photo: plateCompactor, catalogUrl: `${UR}/earthmoving-equipment`,
    specs: () => [{ label: "Plate width", value: "20 in" }, { label: "Centrifugal force", value: "~3,500 lbf" }, { label: "Power", value: "Gasoline" }, { label: "Weight", value: "~200 lb" }],
    checks: ["Check fuel & oil level", "Strap upright in truck bed", "Inspect plate for cracks"] },
  { match: /trench/i, category: "Trench safety — shoring box", photo: trenchBox, catalogUrl: UR,
    specs: () => [{ label: "Size", value: "8 ft × 16 ft" }, { label: "Material", value: "Steel" }, { label: "Weight", value: "~5,000 lb" }, { label: "Spreaders", value: "Adjustable" }],
    checks: ["Inspect spreaders & pins", "Check lifting lugs", "Confirm crane/rigging on site"] },
];

/** Asset tag printed on the machine, e.g. "BL-0477" from "Boom Lift 40ft — #BL-0477". */
export const assetTag = (equipment: string) => equipment.match(/#([A-Z]{2}-\d{4})/)?.[1] ?? "";

export function equipmentInfo(equipment: string): EquipmentInfo {
  const d = defs.find((x) => x.match.test(equipment)) ?? defs[defs.length - 1]!;
  return { category: d.category, photo: d.photo, catalogUrl: d.catalogUrl, specs: d.specs(equipment), checks: d.checks };
}
