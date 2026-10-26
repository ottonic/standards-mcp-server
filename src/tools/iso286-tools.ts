import { z } from "zod";
import { domainError } from "../errors.js";
import {
  ISO_286_EDITION,
  fit,
  itGrade,
  itTable,
  limitsOfSize,
  sizeStep,
} from "../domain/iso286.js";

const nominal = z
  .number()
  .positive()
  .max(500)
  .meta({
    description:
      "Nominal size in millimetres, above 0 and up to 500. Example: 36.",
  });

const designation = z
  .string()
  .min(2)
  .meta({
    description:
      "Tolerance class: a fundamental deviation letter and a grade, such as H7, g6 or n6. " +
      "Uppercase is a hole, lowercase a shaft.",
  });

export const limitsSchema = z
  .object({
    nominal: nominal.describe("Nominal size in millimetres."),
    designation: designation.describe("Tolerance class, e.g. H7 or g6."),
  })
  .strict();

export const limitsExamples = [
  { nominal: 36, designation: "H7" },
  { nominal: 36, designation: "g6" },
];

export async function limitsHandler(args: z.output<typeof limitsSchema>) {
  const limits = limitsOfSize(args.nominal, args.designation);
  return {
    nominal: limits.nominal,
    designation: limits.designation,
    hole: limits.hole,
    upper_deviation: limits.upperDeviation,
    lower_deviation: limits.lowerDeviation,
    upper_limit: limits.upperLimit,
    lower_limit: limits.lowerLimit,
    tolerance: limits.tolerance,
    unit: limits.unit,
    standard: ISO_286_EDITION,
    note: "Deviations are from the nominal size, in millimetres. A negative deviation is below nominal.",
  };
}

export const fitSchema = z
  .object({
    nominal: nominal.describe(
      "Nominal size in millimetres, shared by the hole and shaft.",
    ),
    hole: designation.describe("Hole tolerance class, e.g. H7."),
    shaft: designation.describe("Shaft tolerance class, e.g. g6 or n6."),
  })
  .strict();

export const fitExamples = [
  { nominal: 12, hole: "H7", shaft: "h6" },
  { nominal: 36, hole: "H7", shaft: "n6" },
];

export async function fitHandler(args: z.output<typeof fitSchema>) {
  const result = fit(args.nominal, args.hole, args.shaft);
  return {
    nominal: args.nominal,
    hole: result.hole.designation,
    shaft: result.shaft.designation,
    type: result.type,
    minimum_clearance: result.minimumClearance,
    maximum_clearance: result.maximumClearance,
    maximum_interference: result.maximumInterference,
    unit: result.unit,
    standard: ISO_286_EDITION,
    limits: {
      hole: {
        upper_deviation: result.hole.upperDeviation,
        lower_deviation: result.hole.lowerDeviation,
      },
      shaft: {
        upper_deviation: result.shaft.upperDeviation,
        lower_deviation: result.shaft.lowerDeviation,
      },
    },
    note:
      "A negative minimum_clearance means the fit can interfere. " +
      "Whether a fit is suitable for a joint is an engineering decision, not a value this server returns.",
  };
}

export const gradeSchema = z
  .object({
    nominal: nominal.describe("Nominal size in millimetres."),
    grade: z
      .number()
      .int()
      .min(1)
      .max(18)
      .meta({
        description: "Standard tolerance grade, IT1 to IT18. Example: 7.",
      }),
  })
  .strict();

export const gradeExamples = [{ nominal: 36, grade: 7 }];

export async function gradeHandler(args: z.output<typeof gradeSchema>) {
  const step = sizeStep(args.nominal);
  return {
    nominal: args.nominal,
    grade: `IT${args.grade}`,
    tolerance_micrometres: itGrade(args.nominal, args.grade),
    tolerance_mm: Number((itGrade(args.nominal, args.grade) / 1000).toFixed(4)),
    size_step_mm: { over: step.over, up_to: step.upTo },
    standard: ISO_286_EDITION,
  };
}

export const tableSchema = z.object({}).strict();

export async function tableHandler() {
  const steps = itTable();
  if (steps.length === 0)
    throw domainError("internal_error", "the tolerance table is empty");
  return {
    standard: ISO_286_EDITION,
    unit: "micrometre",
    size_range_mm: {
      over: steps[0]!.over,
      up_to: steps[steps.length - 1]!.upTo,
    },
    steps: steps.map((step) => ({
      over: step.over,
      up_to: step.upTo,
      grades: step.grades,
    })),
    note: "Published standard tolerance grades. Values are the standard table, not a computation.",
  };
}
