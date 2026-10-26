import { z } from "zod";
import {
  PROCESS_LIMITS,
  checkLimit,
  processProfile,
} from "../domain/process.js";

const process = z
  .string()
  .min(1)
  .meta({
    description: `Manufacturing process: ${Object.keys(PROCESS_LIMITS).join(", ")}.`,
  });

const feature = z
  .string()
  .min(1)
  .meta({
    description:
      "The feature to check, such as wall_thickness, hole_to_edge, draft_angle or internal_corner_radius. " +
      "Call process_limits first to see which features a process has limits for.",
  });

export const limitsSchema = z
  .object({ process: process.describe("Which process to describe.") })
  .strict();

export const limitsExamples = [
  { process: "cnc-machining" },
  { process: "injection-molding" },
];

export async function limitsHandler(args: z.output<typeof limitsSchema>) {
  const profile = processProfile(args.process);
  return {
    process: profile.process,
    title: profile.title,
    applies_to: profile.appliesTo,
    limits: profile.limits,
    notes: profile.notes,
    source: profile.source,
    basis: profile.basis,
    unit_note: "Limits are millimetres except draft_angle, which is degrees.",
  };
}

export const checkSchema = z
  .object({
    process: process.describe("Which process the feature is being made by."),
    feature: feature.describe("Which limit to check."),
    measured: z.number().positive().meta({
      description:
        "The measured value for the feature, in millimetres (or degrees for draft).",
    }),
    thickness: z
      .number()
      .positive()
      .optional()
      .meta({
        description:
          "Material thickness in millimetres. Required when the limit is expressed as a ratio of " +
          "thickness, which is common for sheet metal — the error says so if it is missing.",
      }),
  })
  .strict();

export const checkExamples = [
  { process: "cnc-machining", feature: "wall_thickness", measured: 2.5 },
  {
    process: "sheet-metal",
    feature: "hole_to_edge",
    measured: 1.2,
    thickness: 2,
  },
];

export async function checkHandler(args: z.output<typeof checkSchema>) {
  const result = checkLimit(args.process, args.feature, args.measured, {
    thickness: args.thickness,
  });
  return {
    process: result.process,
    feature: result.feature,
    measured: result.measured,
    unit: result.unit,
    limit: Number(result.limit.toPrecision(6)),
    threshold_kind: result.thresholdApplied.kind,
    verdict: result.verdict,
    basis: result.basis,
    source: result.source,
    note: result.note,
  };
}

export const listSchema = z.object({}).strict();

export async function listHandler() {
  return {
    processes: Object.values(PROCESS_LIMITS).map((limits) => ({
      process: limits.process,
      title: limits.title,
      applies_to: limits.appliesTo,
      features: Object.keys(limits.limits),
    })),
    basis: "advisory",
    note:
      "These are published rules of thumb for whether a feature is geometrically feasible, not a " +
      "shop's capability. No public dataset of shop capability exists, so a specific envelope has " +
      "to come from the supplier. Cost, lead time and achievable tolerance are not modelled.",
  };
}
