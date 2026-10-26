/**
 * Indicative material properties, in SI.
 *
 * Data: `KittyCAD/material-properties`, Apache-2.0, 67 alloys across 119
 * grade/temper combinations. The published values are English units and are
 * converted with exact factors, not fitted.
 *
 * **These are typical handbook values, not design allowables.** The source cites
 * Beer & Johnston and a vendor filament table and calls itself a work in progress.
 * Every property carries `basis: "typical"`, and the server will not describe them
 * as an allowable, a margin or a certification. A verdict that needs A- or B-basis
 * allowables needs another source, and saying so is more useful than returning a
 * number that looks authoritative.
 *
 * The conversion and the types live in `material-conversion.ts` so the generated
 * data can call them at initialisation time without a circular import.
 */

import { createHash } from "node:crypto";
import type { MaterialGrade } from "./material-conversion.js";
import { MATERIAL_GRADES } from "../data/materials.generated.js";

export type {
  MaterialGrade,
  PropertyName,
  PropertyValue,
} from "./material-conversion.js";
export { buildGrades, convertProperty } from "./material-conversion.js";

/** Digest of the exact converted material snapshot shipped by this build. */
const MATERIALS_DATASET_REVISION = `sha256:${createHash("sha256")
  .update(JSON.stringify(MATERIAL_GRADES))
  .digest("hex")}`;

export const MATERIALS_SOURCE = {
  name: "KittyCAD/material-properties",
  license: "Apache-2.0",
  basis: "typical" as const,
  revision: MATERIALS_DATASET_REVISION,
  revision_note:
    "Digest of the embedded converted dataset; it identifies this snapshot, not an upstream release or material certification.",
  caveat:
    "Typical handbook values, not design allowables. Do not use for a strength margin " +
    "without an allowable from a qualified source.",
};

/** Every grade the reference holds. */
export const GRADES: readonly MaterialGrade[] = MATERIAL_GRADES;

/** Families present, derived from the designations the generator wrote. */
export function families(): string[] {
  return [
    ...new Set(
      GRADES.map(
        (grade) =>
          grade.designation.split(" (")[1]?.replace(")", "") ?? "unknown",
      ),
    ),
  ].sort();
}
