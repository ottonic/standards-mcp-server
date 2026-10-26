/**
 * Process capability: what a manufacturing process can hold, and where.
 *
 * Two things are deliberately kept apart:
 *
 *  - **Limits** are geometric feasibility — a minimum wall, a draft angle, a
 *    hole-to-edge distance. These are published rules of thumb and standards, and
 *    they are advisory rather than normative: a shop with the right tooling can
 *    beat any of them.
 *  - **A capability profile** is a *particular* shop's envelope: usable area, kerf
 *    width, stock thicknesses, achievable tolerances. No public dataset of these
 *    exists, so the server ships a documented default and lets a caller override it.
 *
 * The shape follows `open-mrp/dfm` (Apache-2.0), which is the closest thing to a
 * working convention: every value carries its unit, thresholds are `error` and
 * `warning`, and a threshold may be an absolute minimum or a ratio of the material
 * thickness — because that is how real capability is usually expressed.
 *
 * This reports whether a feature is within a limit. Whether a part is manufacturable,
 * and at what cost, is an engineering and commercial judgement that stays with the
 * caller.
 */

import { domainError } from "../errors.js";

export interface Length {
  value: number;
  unit: "mm";
}

export interface Angle {
  value: number;
  unit: "deg";
}

type Measurement = Length | Angle;

export interface Threshold {
  /** Below this is an error: the feature cannot be made as drawn. */
  error?: { min?: Measurement; ratioOfThickness?: number };
  /** Below this is a warning: makeable, but worth questioning. */
  warning?: { min?: Measurement; ratioOfThickness?: number };
}

export interface ProcessLimits {
  process: string;
  title: string;
  /** What this process is, so a caller can judge applicability. */
  appliesTo: string;
  limits: Record<string, Threshold>;
  notes: string[];
  source: string;
}

export const PROCESS_SOURCE = {
  name: "Published rules of thumb and standard practice",
  basis: "advisory" as const,
  caveat:
    "Rules of thumb, not shop capability. A specific machine, tooling and operator can differ " +
    "either way, so treat these as questions to ask a supplier rather than as limits.",
};

const mm = (value: number): Length => ({ value, unit: "mm" });
const deg = (value: number): Angle => ({ value, unit: "deg" });

/**
 * Published limits, per process. Values are the commonly cited figures; each
 * process lists where they come from so a caller can weigh them.
 */
export const PROCESS_LIMITS: Readonly<Record<string, ProcessLimits>> = {
  "cnc-machining": {
    process: "cnc-machining",
    title: "CNC machining (3-axis milling)",
    appliesTo: "Prismatic metal and plastic parts cut with rotating tooling",
    limits: {
      wall_thickness: {
        error: { min: mm(0.5) },
        warning: { min: mm(0.8) },
      },
      pocket_depth_to_width: {
        // Tool deflection sets this: a deep, narrow pocket needs a long slender tool.
        warning: { ratioOfThickness: 4 },
      },
      internal_corner_radius: {
        // A sharp internal corner cannot be milled; the radius is the tool radius.
        error: { min: mm(0.5) },
        warning: { min: mm(1) },
      },
      feature_size: {
        error: { min: mm(0.5) },
      },
    },
    notes: [
      "Plastics tolerate less than metals: wall thickness minimums are roughly double.",
      "These are for a light finishing cut; heavy roughing needs more stock.",
    ],
    source: "Commonly published DFM guidance for machined parts",
  },
  "sheet-metal": {
    process: "sheet-metal",
    title: "Sheet metal (laser/plasma cut, press-brake formed)",
    appliesTo: "Flat parts cut from sheet and formed on a brake",
    limits: {
      hole_diameter: {
        error: { min: mm(0.5), ratioOfThickness: 0.5 },
        warning: { ratioOfThickness: 1 },
      },
      hole_to_edge: {
        // Half a thickness is the cutting-process limit; one thickness is the
        // forming limit, which is why the two differ.
        error: { ratioOfThickness: 0.5 },
        warning: { ratioOfThickness: 1 },
      },
      hole_to_bend: {
        warning: { ratioOfThickness: 2 },
      },
      bend_radius: {
        warning: { ratioOfThickness: 1 },
      },
      web_width: {
        error: { min: mm(0.5), ratioOfThickness: 0.5 },
        warning: { ratioOfThickness: 1 },
      },
    },
    notes: [
      "A hole closer to a bend than about two thicknesses will deform when formed.",
      "Bend radius below one thickness risks cracking, and depends on the alloy and temper.",
    ],
    source: "Commonly published sheet-metal DFM guidance",
  },
  "injection-molding": {
    process: "injection-molding",
    title: "Injection moulding",
    appliesTo: "Thermoplastic parts formed in a two-part mould",
    limits: {
      wall_thickness: {
        error: { min: mm(0.5) },
        warning: { min: mm(1.2) },
      },
      draft_angle: {
        error: { min: deg(0.5) },
        warning: { min: deg(1) },
      },
      rib_thickness: {
        // Ribs thinner than roughly two thirds of the wall avoid sink marks.
        warning: { ratioOfThickness: 0.6 },
      },
    },
    notes: [
      "The draft angle values are in degrees, not millimetres, and are the one limit here " +
        "whose unit is not a length.",
      "Wall thickness should be as uniform as the design allows; variation is what causes sink and warp.",
      "Draft requirement rises with surface texture: a textured face needs more draft than a polished one.",
    ],
    source: "Commonly published moulding DFM guidance",
  },
  "additive-sls": {
    process: "additive-sls",
    title: "Additive manufacturing (SLS)",
    appliesTo: "Powder-bed fusion of polymer parts",
    limits: {
      wall_thickness: {
        error: { min: mm(0.7) },
        warning: { min: mm(1) },
      },
      feature_size: {
        error: { min: mm(0.5) },
      },
    },
    notes: ["No draft is needed: the part is not ejected from a mould."],
    source: "Commonly published SLS DFM guidance",
  },
};

export interface CapabilityProfile {
  schemaVersion: string;
  process: string;
  /** The shop's envelope, when a caller supplies one. */
  overrides: Record<string, Threshold>;
  source: string;
}

export function processLimits(process: string): ProcessLimits {
  const limits = PROCESS_LIMITS[process.toLowerCase()];
  if (!limits) {
    throw domainError(
      "unknown_process",
      `'${process}' is not a process this server knows. Available: ${Object.keys(PROCESS_LIMITS).join(", ")}`,
    );
  }
  return limits;
}

export type Verdict = "within" | "warning" | "exceeds";

export interface LimitCheck {
  feature: string;
  process: string;
  measured: number;
  unit: string;
  verdict: Verdict;
  thresholdApplied: { kind: "absolute" | "thickness-ratio"; value: number };
  limit: number;
  basis: string;
  source: string;
  note: string;
}

/**
 * Compare one measured feature value against a process limit.
 *
 * `thickness` is required only for limits expressed as a ratio of material
 * thickness, and is the reason the ratio form exists: a 1 mm hole is fine in 0.5 mm
 * sheet and marginal in 6 mm plate.
 */
export function checkLimit(
  process: string,
  feature: string,
  measured: number,
  options: { thickness?: number; overrides?: Record<string, Threshold> } = {},
): LimitCheck {
  const limits = processLimits(process);
  const threshold = options.overrides?.[feature] ?? limits.limits[feature];
  if (!threshold) {
    throw domainError(
      "unknown_feature",
      `'${feature}' is not a limit for ${process}. Available: ${Object.keys(limits.limits).join(", ")}`,
    );
  }
  if (!Number.isFinite(measured) || measured <= 0) {
    throw domainError(
      "invalid_measurement",
      "the measured value must be a positive number",
    );
  }

  const resolve = (
    band: Threshold["error"],
  ):
    | {
        limit: number;
        unit: Measurement["unit"];
        kind: "absolute" | "thickness-ratio";
      }
    | undefined => {
    if (!band) return undefined;
    if (band.min)
      return { limit: band.min.value, unit: band.min.unit, kind: "absolute" };
    if (band.ratioOfThickness !== undefined) {
      if (options.thickness === undefined) {
        throw domainError(
          "thickness_required",
          `the ${feature} limit for ${process} is expressed as a ratio of material thickness, ` +
            "so a thickness must be supplied",
        );
      }
      return {
        limit: band.ratioOfThickness * options.thickness,
        unit: "mm",
        kind: "thickness-ratio",
      };
    }
    return undefined;
  };

  const error = resolve(threshold.error);
  const warning = resolve(threshold.warning);
  let verdict: Verdict = "within";
  let applied = error ?? warning;
  if (error && measured < error.limit) {
    verdict = "exceeds";
    applied = error;
  } else if (warning && measured < warning.limit) {
    verdict = "warning";
    applied = warning;
  }
  if (!applied) {
    throw domainError(
      "unknown_feature",
      `${feature} has no threshold for ${process}`,
    );
  }

  return {
    feature,
    process,
    measured,
    unit: applied.unit,
    verdict,
    thresholdApplied: { kind: applied.kind, value: applied.limit },
    limit: applied.limit,
    basis: PROCESS_SOURCE.basis,
    source: limits.source,
    note:
      verdict === "within"
        ? "Within the published rule of thumb. That is not a statement that the feature is economical or that a specific shop can hold it."
        : verdict === "warning"
          ? "Below the recommended value but above the hard limit. Makeable, and worth confirming with the supplier."
          : "Below the published hard limit. Expect this to need a design change or a different process.",
  };
}

/** Every limit for a process, so a caller can see the whole envelope. */
export function processProfile(process: string) {
  const limits = processLimits(process);
  return {
    process: limits.process,
    title: limits.title,
    appliesTo: limits.appliesTo,
    limits: Object.entries(limits.limits).map(([feature, threshold]) => ({
      feature,
      error: threshold.error ?? null,
      warning: threshold.warning ?? null,
    })),
    notes: limits.notes,
    source: limits.source,
    basis: PROCESS_SOURCE.basis,
  };
}
