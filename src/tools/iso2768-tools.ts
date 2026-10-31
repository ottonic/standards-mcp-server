import { z } from 'zod';
import { compliesWithGeneralTolerance, generalTolerance, linearTable } from '../domain/iso2768.js';

const nominal = z
  .number()
  .positive()
  .meta({
    description:
      'Nominal size in millimetres for linear dimensions, or the length of the shorter side for angular ' +
      'dimensions. Example: 45.',
  });

const toleranceClass = z
  .string()
  .min(1)
  .meta({
    description:
      'ISO 2768-1 tolerance class: f (fine), m (medium), c (coarse) or v (very coarse). ' +
      'A drawing note such as "ISO 2768-m" is accepted as written.',
  });

export const generalSchema = z
  .object({
    nominal: nominal.describe('Nominal size, or the shorter side of an angle.'),
    tolerance_class: toleranceClass.describe('Class letter from the drawing note, e.g. m.'),
    kind: z
      .enum(['linear', 'broken-edge', 'angular'])
      .optional()
      .meta({
        description:
          'Which table to read: linear dimensions (default), broken edges such as chamfers and external ' +
          'radii, or angular dimensions. They have different values.',
      }),
  })
  .strict();

export const generalExamples = [
  { nominal: 45, tolerance_class: 'm' },
  { nominal: 45, tolerance_class: 'm', kind: 'broken-edge' },
];

export async function generalHandler(args: z.output<typeof generalSchema>) {
  const tolerance = generalTolerance(args.nominal, args.tolerance_class, args.kind ?? 'linear');
  return {
    nominal: args.nominal,
    tolerance_class: tolerance.class,
    kind: tolerance.kind,
    deviation: tolerance.deviation,
    symmetric: tolerance.symmetric,
    unit: tolerance.unit,
    size_step_mm: tolerance.step,
    applies_to: tolerance.appliesTo,
    standard: tolerance.standard,
    note:
      'A general tolerance applies only to a dimension with no individual tolerance indication, ' +
      'and only to what the named table covers.',
  };
}

export const complianceSchema = z
  .object({
    nominal: nominal.describe('Nominal size, or the shorter side of an angle.'),
    tolerance_class: toleranceClass.describe('Class letter from the drawing note, e.g. m.'),
    stated_deviation: z.number().meta({
      description:
        'The deviation the drawing actually states for this dimension, in millimetres (or degrees for ' +
        'angular). Sign is ignored: the tables are symmetric.',
    }),
    kind: z
      .enum(['linear', 'broken-edge', 'angular'])
      .optional()
      .meta({ description: 'Which table applies. Default: linear.' }),
  })
  .strict();

export const complianceExamples = [{ nominal: 45, tolerance_class: 'm', stated_deviation: 0.1 }];

export async function complianceHandler(args: z.output<typeof complianceSchema>) {
  const result = compliesWithGeneralTolerance(
    args.nominal,
    args.tolerance_class,
    args.stated_deviation,
    args.kind ?? 'linear',
  );
  return {
    nominal: args.nominal,
    tolerance_class: args.tolerance_class,
    stated_deviation: result.stated,
    permitted_deviation: result.permitted,
    complies: result.complies,
    unit: result.unit,
    standard: result.standard,
    note: result.note,
  };
}

export const tableSchema = z.object({}).strict();

export async function tableHandler() {
  return {
    standard: 'iso2768-1:1989',
    unit: 'mm',
    table: 'Table 1 — permissible deviations for linear dimensions except broken edges',
    steps: linearTable(),
    other_tables: [
      'Table 2 covers broken edges (external radii and chamfer heights) and is read with kind: broken-edge',
      'Table 3 covers angular dimensions and is keyed by the shorter side of the angle, read with kind: angular',
    ],
    note:
      'ISO 2768-2:1989, which covered geometrical tolerances as classes H, K and L, was withdrawn and ' +
      'replaced by ISO 22081:2021, which has no such classes. It is not implemented here.',
  };
}
