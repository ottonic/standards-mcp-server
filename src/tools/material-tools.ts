import { z } from 'zod';
import { GRADES, MATERIALS_SOURCE } from '../domain/materials.js';

const material = z
  .string()
  .min(1)
  .meta({
    description:
      'Material designation, such as "6061-T6", "304", "Ti-6Al-4V" or "1018". ' +
      'A family name such as aluminium or stainless also matches. Case and separators are ignored.',
  });

const propertyName = z
  .enum([
    'density',
    'yield_strength',
    'ultimate_strength',
    'youngs_modulus',
    'poissons_ratio',
    'elongation_at_break',
    'thermal_expansion',
    'max_service_temperature',
  ])
  .meta({
    description: 'Which property to return. Omit for every property available.',
  });

/** Match on alloy, temper, alloy+temper, or the family: a caller rarely knows the key. */
function matches(grade: (typeof GRADES)[number], query: string): number {
  const normalise = (value: string) => value.toLowerCase().replace(/[\s\-_]/g, '');
  const q = normalise(query);
  const alloy = normalise(grade.alloy);
  const temper = normalise(grade.temper);
  const combined = `${alloy}${temper}`;
  const family = normalise(grade.designation.split(' (')[1]?.replace(')', '') ?? '');
  if (q === combined) return 3;
  if (q === alloy || q === temper) return 2;
  if (combined.includes(q) || alloy.includes(q)) return 2;
  if (family.includes(q)) return 1;
  return 0;
}

export const lookupSchema = z
  .object({
    material: material.describe('Material designation, e.g. "6061-T6" or "304".'),
    property: propertyName
      .optional()
      .describe('Restrict the answer to one property, so the response stays small.'),
  })
  .strict();

export const lookupExamples = [
  { material: '6061-T6' },
  { material: '304', property: 'yield_strength' },
];

export async function lookupHandler(args: z.output<typeof lookupSchema>) {
  const scored = GRADES.map((grade) => ({
    grade,
    score: matches(grade, args.material),
  }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      query: args.material,
      found: false,
      matches: [] as unknown[],
      source: MATERIALS_SOURCE,
      note:
        `No material in this reference matches "${args.material}". The reference holds ` +
        `${GRADES.length} grades of common metals and plastics; absence means it is not held ` +
        'here, not that the material does not exist.',
    };
  }

  const topScore = scored[0]!.score;
  const matches_ = scored.slice(0, 8).map(({ grade }) => ({
    designation: grade.designation,
    alloy: grade.alloy,
    temper: grade.temper,
    ...(args.property
      ? { property: grade.properties[args.property] ?? null }
      : { properties: grade.properties }),
  }));

  return {
    query: args.material,
    found: true,
    exact: topScore >= 3,
    matches: matches_,
    source: MATERIALS_SOURCE,
    note:
      'Values are typical handbook figures converted to SI, not design allowables. ' +
      'Compare them against an allowable from a qualified source before using them in a margin.',
  };
}

export const propertiesSchema = z.object({}).strict();

export async function propertiesHandler() {
  const byProperty: Record<string, { unit: string; count: number }> = {};
  for (const grade of GRADES) {
    for (const [name, value] of Object.entries(grade.properties)) {
      if (!value) continue;
      const existing = byProperty[name];
      if (existing) existing.count += 1;
      else byProperty[name] = { unit: value.unit, count: 1 };
    }
  }
  return {
    source: MATERIALS_SOURCE,
    grades: GRADES.length,
    properties: byProperty,
    note:
      'Every property here is a typical value from the cited source. The reference holds no ' +
      'design allowables, no fatigue data, and no high-temperature or creep data.',
  };
}

/** Coverage summary, used by list_standards rather than as a tool of its own. */
export function materialCoverage() {
  const families = new Set(
    GRADES.map((grade) => grade.designation.split(' (')[1]?.replace(')', '') ?? 'unknown'),
  );
  return { grades: GRADES.length, families: [...families].sort() };
}
