/**
 * ISO 2768-1:1989 general tolerances for linear and angular dimensions.
 *
 * A drawing note such as "ISO 2768-m" sets a default deviation for every
 * dimension that carries no individual tolerance, so this is the standard that
 * decides whether an unmarked dimension is acceptable. The values are the
 * published tables.
 *
 * **Scope conditions are part of the answer.** Table 1 excludes broken edges,
 * whose deviations are Table 2, and the angular table keys off the length of the
 * *shorter* side of the angle rather than the nominal size. Returning a number
 * without its condition would be worse than returning nothing, so each result
 * carries the table it came from and what it applies to.
 *
 * Provenance: the values were taken from published reproductions of the standard
 * and cross-checked against independent ones (EN 22768-1, ZEISS, Engineers Edge,
 * Fictiv). The three tables agreeing across those sources is what makes them
 * usable; the disagreements found in secondary sources are recorded in the
 * workspace research notes.
 */

import { domainError } from "../errors.js";

export const ISO_2768_EDITION = "iso2768-1:1989";

/** Table 1: linear dimensions except broken edges. Values in millimetres. */
const LINEAR_STEPS = [
  "0.5-3",
  "3-6",
  "6-30",
  "30-120",
  "120-400",
  "400-1000",
  "1000-2000",
  "2000-4000",
] as const;

const LINEAR: Readonly<
  Record<string, Readonly<Record<string, number | null>>>
> = {
  f: {
    "0.5-3": 0.05,
    "3-6": 0.05,
    "6-30": 0.1,
    "30-120": 0.15,
    "120-400": 0.2,
    "400-1000": 0.3,
    "1000-2000": 0.5,
    "2000-4000": null,
  },
  m: {
    "0.5-3": 0.1,
    "3-6": 0.1,
    "6-30": 0.2,
    "30-120": 0.3,
    "120-400": 0.5,
    "400-1000": 0.8,
    "1000-2000": 1.2,
    "2000-4000": 2,
  },
  c: {
    "0.5-3": 0.2,
    "3-6": 0.3,
    "6-30": 0.5,
    "30-120": 0.8,
    "120-400": 1.2,
    "400-1000": 2,
    "1000-2000": 3,
    "2000-4000": 4,
  },
  v: {
    "0.5-3": null,
    "3-6": 0.5,
    "6-30": 1,
    "30-120": 1.5,
    "120-400": 2.5,
    "400-1000": 4,
    "1000-2000": 6,
    "2000-4000": 8,
  },
};

/** Table 2: broken edges (external radii and chamfer heights). Millimetres. */

const BROKEN_EDGES: Readonly<Record<string, Readonly<Record<string, number>>>> =
  {
    f: { "0.5-3": 0.2, "3-6": 0.5, "6+": 1 },
    c: { "0.5-3": 0.4, "3-6": 1, "6+": 2 },
  };

/** Table 3: angular dimensions, keyed by the shorter side of the angle. */
const ANGULAR_STEPS = ["0-10", "10-50", "50-120", "120-400", "400+"] as const;

const ANGULAR: Readonly<Record<string, Readonly<Record<string, number>>>> = {
  f: {
    "0-10": 1,
    "10-50": 0.5,
    "50-120": 1 / 3,
    "120-400": 1 / 6,
    "400+": 1 / 12,
  },
  c: { "0-10": 1.5, "10-50": 1, "50-120": 0.5, "120-400": 0.25, "400+": 1 / 6 },
  v: { "0-10": 3, "10-50": 2, "50-120": 1, "120-400": 0.5, "400+": 1 / 3 },
};

export type ToleranceClass = "f" | "m" | "c" | "v";

export function linearStep(nominal: number): string {
  if (!Number.isFinite(nominal) || nominal <= 0) {
    throw domainError(
      "invalid_size",
      "nominal size must be a positive number of millimetres",
    );
  }
  if (nominal > 4000) {
    throw domainError(
      "unsupported_size",
      `ISO 2768-1 linear tolerances cover sizes up to 4000 mm (asked for ${nominal} mm)`,
    );
  }
  for (const step of LINEAR_STEPS) {
    const [over, upTo] = step.split("-").map(Number) as [number, number];
    if (nominal > over && nominal <= upTo) return step;
  }
  return "0.5-3";
}

export interface GeneralTolerance {
  class: ToleranceClass;
  kind: "linear" | "broken-edge" | "angular";
  deviation: number;
  symmetric: boolean;
  unit: string;
  appliesTo: string;
  step: string;
  standard: string;
}

/** A note such as `ISO 2768-m` gives the class; this is the deviation it implies. */
export function generalTolerance(
  nominal: number,
  toleranceClass: string,
  kind: "linear" | "broken-edge" | "angular" = "linear",
): GeneralTolerance {
  const letter = toleranceClass
    .trim()
    .toLowerCase()
    .replace(/^iso\s*2768\s*-?/, "") as ToleranceClass;
  if (!["f", "m", "c", "v"].includes(letter)) {
    throw domainError(
      "invalid_class",
      `'${toleranceClass}' is not an ISO 2768-1 tolerance class: expected f, m, c or v`,
    );
  }

  if (kind === "angular") {
    if (!Number.isFinite(nominal) || nominal <= 0) {
      throw domainError(
        "invalid_size",
        "the shorter side of the angle must be a positive number of millimetres",
      );
    }
    const step =
      ANGULAR_STEPS.find((candidate) => {
        const [over, upTo] = candidate
          .replace("+", "")
          .split("-")
          .map(Number) as [number, number];
        return candidate.endsWith("+")
          ? nominal > over
          : nominal > over && nominal <= upTo;
      }) ?? "0-10";
    const value = ANGULAR[letter]?.[step];
    if (value === undefined) {
      throw domainError(
        "unsupported_class",
        `ISO 2768-1 gives no angular deviation for class '${letter}'`,
      );
    }
    return {
      class: letter,
      kind: "angular",
      deviation: value,
      symmetric: true,
      unit: "deg",
      appliesTo: `angular dimensions whose shorter side is over ${step.replace("+", "")} mm`,
      step,
      standard: ISO_2768_EDITION,
    };
  }

  const step = linearStep(nominal);
  if (kind === "broken-edge") {
    const lookup = step === "0.5-3" || step === "3-6" ? step : "6+";
    const value = BROKEN_EDGES[letter]?.[lookup];
    if (value === undefined) {
      throw domainError(
        "unsupported_class",
        `ISO 2768-1 gives no broken-edge deviation for class '${letter}': only f and c are tabulated`,
      );
    }
    return {
      class: letter,
      kind: "broken-edge",
      deviation: value,
      symmetric: true,
      unit: "mm",
      appliesTo: "external radii and chamfer heights",
      step: lookup,
      standard: ISO_2768_EDITION,
    };
  }

  const value = LINEAR[letter]?.[step];
  if (value === null || value === undefined) {
    throw domainError(
      "unsupported_class",
      `ISO 2768-1 leaves the '${letter}' class unspecified for sizes ${step} mm`,
    );
  }
  return {
    class: letter,
    kind: "linear",
    deviation: value,
    symmetric: true,
    unit: "mm",
    appliesTo: "linear dimensions except broken edges",
    step,
    standard: ISO_2768_EDITION,
  };
}

/** Whether a stated deviation is at least as tight as the general-tolerance note. */
export function compliesWithGeneralTolerance(
  nominal: number,
  toleranceClass: string,
  statedDeviation: number,
  kind: "linear" | "broken-edge" | "angular" = "linear",
): {
  permitted: number;
  stated: number;
  complies: boolean;
  unit: string;
  standard: string;
  note: string;
} {
  const tolerance = generalTolerance(nominal, toleranceClass, kind);
  const stated = Math.abs(statedDeviation);
  return {
    permitted: tolerance.deviation,
    stated,
    complies: stated <= tolerance.deviation + 1e-12,
    unit: tolerance.unit,
    standard: ISO_2768_EDITION,
    note:
      `Compared a stated +/-${stated} ${tolerance.unit} against the ${tolerance.deviation} ${tolerance.unit} ` +
      `permitted by ISO 2768-${tolerance.class} for ${tolerance.appliesTo}. ` +
      "This is a numerical comparison only: a general tolerance applies only when no individual tolerance is indicated. " +
      "It says nothing about whether a tolerance can be achieved.",
  };
}

/** The whole of Table 1, for a caller that wants to see the series. */
export function linearTable() {
  return LINEAR_STEPS.map((step) => ({
    over: Number(step.split("-")[0]),
    upTo: Number(step.split("-")[1]),
    classes: Object.fromEntries(
      (["f", "m", "c", "v"] as const).map((letter) => [
        letter,
        LINEAR[letter]?.[step] ?? null,
      ]),
    ),
  }));
}
