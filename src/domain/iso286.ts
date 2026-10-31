/**
 * ISO 286 limits and fits.
 *
 * **The tables are normative; the arithmetic is a cross-check.** The 2010 edition
 * of ISO 286-1 removed the deviation formulas and tabulates IT grades 01 to 18 and
 * the fundamental deviations (Annex A of IS 919-1, the earlier technically
 * identical edition, is where the formulas survive). Measured against the published
 * table across all 182 step/grade cells, `multiple x i` with any rounding rule
 * reproduces the upper grades but not all of them — at the first size step the
 * published IT18 is 1400 um where 2500i is 1355 um. So values come from the table,
 * and `toleranceFactor` exists to check them and to explain where they come from.
 *
 * Two things the standard genuinely does not define are reported rather than
 * approximated: IT2/IT3/IT4 are "approximately scaled in geometrical progression"
 * rather than derived, and j and J have no fundamental deviation at all.
 */

import { describeError, domainError } from '../errors.js';

export const ISO_286_EDITION = 'iso286-1:2010+cor1:2013';

/** Nominal size steps for sizes up to 500 mm, in mm: (over, up to]. */
const STEPS_UP_TO_500: ReadonlyArray<readonly [number, number]> = [
  [0, 3],
  [3, 6],
  [6, 10],
  [10, 18],
  [18, 30],
  [30, 50],
  [50, 80],
  [80, 120],
  [120, 180],
  [180, 250],
  [250, 315],
  [315, 400],
  [400, 500],
];

/**
 * The published IT table, micrometres, sizes up to 500 mm.
 * Columns: IT01, IT0, IT1, IT2, IT3, IT4, then IT5..IT18.
 */
export const IT_TABLE: Readonly<Record<string, readonly number[]>> = {
  '0-3': [0.3, 0.5, 0.8, 1.2, 2, 3, 4, 6, 10, 14, 25, 40, 60, 100, 140, 250, 400, 600, 1000, 1400],
  '3-6': [0.4, 0.6, 1, 1.5, 2.5, 4, 5, 8, 12, 18, 30, 48, 75, 120, 180, 300, 480, 750, 1200, 1800],
  '6-10': [0.4, 0.6, 1, 1.5, 2.5, 4, 6, 9, 15, 22, 36, 58, 90, 150, 220, 360, 580, 900, 1500, 2200],
  '10-18': [
    0.5, 0.8, 1.2, 2, 3, 5, 8, 11, 18, 27, 43, 70, 110, 180, 270, 430, 700, 1100, 1800, 2700,
  ],
  '18-30': [
    0.6, 1, 1.5, 2.5, 4, 6, 9, 13, 21, 33, 52, 84, 130, 210, 330, 520, 840, 1300, 2100, 3300,
  ],
  '30-50': [
    0.6, 1, 1.5, 2.5, 4, 7, 11, 16, 25, 39, 62, 100, 160, 250, 390, 620, 1000, 1600, 2500, 3900,
  ],
  '50-80': [
    0.8, 1.2, 2, 3, 5, 8, 13, 19, 30, 46, 74, 120, 190, 300, 460, 740, 1200, 1900, 3000, 4600,
  ],
  '80-120': [
    1, 1.5, 2.5, 4, 6, 10, 15, 22, 35, 54, 87, 140, 220, 350, 540, 870, 1400, 2200, 3500, 5400,
  ],
  '120-180': [
    1.2, 2, 3.5, 5, 8, 12, 18, 25, 40, 63, 100, 160, 250, 400, 630, 1000, 1600, 2500, 4000, 6300,
  ],
  '180-250': [
    2, 3, 4.5, 7, 10, 14, 20, 29, 46, 72, 115, 185, 290, 460, 720, 1150, 1850, 2900, 4600, 7200,
  ],
  '250-315': [
    2.5, 4, 6, 8, 12, 16, 23, 32, 52, 81, 130, 210, 320, 520, 810, 1300, 2100, 3200, 5200, 8100,
  ],
  '315-400': [
    3, 5, 7, 9, 13, 18, 25, 36, 57, 89, 140, 230, 360, 570, 890, 1400, 2300, 3600, 5700, 8900,
  ],
  '400-500': [
    4, 6, 8, 10, 15, 20, 27, 40, 63, 97, 155, 250, 400, 630, 970, 1550, 2500, 4000, 6300, 9700,
  ],
};

/**
 * Coarse-range shaft deviations for d–g (Table 4) and k–n (Table 5), in µm.
 *
 * **Which limit the number is matters.** For a to g the tabulated value is the
 * *upper* deviation (es, always negative); for k to zc it is the *lower* deviation
 * (ei). The j shaft class is grade-specific and has no general fundamental
 * deviation. Getting this backwards is silent: `h`, `f` and `s` can still look
 * plausible while the resulting limits are wrong by a full tolerance grade.
 *
 * Each resolved source cell carries its basis explicitly; never infer it from
 * the number's sign.
 */
const COARSE_SHAFT_DEVIATIONS: Readonly<Record<string, Readonly<Record<string, number>>>> = {
  '0-3': {
    d: -20,
    e: -14,
    f: -6,
    g: -2,
    k: 0,
    m: 2,
    n: 4,
  },
  '3-6': {
    d: -30,
    e: -20,
    f: -10,
    g: -4,
    k: 1,
    m: 4,
    n: 8,
  },
  '6-10': {
    d: -40,
    e: -25,
    f: -13,
    g: -5,
    k: 1,
    m: 6,
    n: 10,
  },
  '10-18': {
    d: -50,
    e: -32,
    f: -16,
    g: -6,
    k: 1,
    m: 7,
    n: 12,
  },
  '18-30': {
    d: -65,
    e: -40,
    f: -20,
    g: -7,
    k: 2,
    m: 8,
    n: 15,
  },
  '30-50': {
    d: -80,
    e: -50,
    f: -25,
    g: -9,
    k: 2,
    m: 9,
    n: 17,
  },
  '50-80': {
    d: -100,
    e: -60,
    f: -30,
    g: -10,
    k: 2,
    m: 11,
    n: 20,
  },
  '80-120': {
    d: -120,
    e: -72,
    f: -36,
    g: -12,
    k: 3,
    m: 13,
    n: 23,
  },
  '120-180': {
    d: -145,
    e: -85,
    f: -43,
    g: -14,
    k: 3,
    m: 15,
    n: 27,
  },
  '180-250': {
    d: -170,
    e: -100,
    f: -50,
    g: -15,
    k: 4,
    m: 17,
    n: 31,
  },
  '250-315': {
    d: -190,
    e: -110,
    f: -56,
    g: -17,
    k: 4,
    m: 20,
    n: 34,
  },
  '315-400': {
    d: -210,
    e: -125,
    f: -62,
    g: -18,
    k: 4,
    m: 21,
    n: 37,
  },
  '400-500': {
    d: -230,
    e: -135,
    f: -68,
    g: -20,
    k: 5,
    m: 23,
    n: 40,
  },
};

/**
 * Exact ISO 286-1 Table 4 c-shaft subdivisions. Values are in µm and intervals
 * use the standard's (over, up to] convention.
 */
const SUBDIVIDED_SHAFT_DEVIATIONS: Readonly<
  Record<string, ReadonlyArray<readonly [number, number, number]>>
> = {
  c: [
    [0, 3, -60],
    [3, 6, -70],
    [6, 10, -80],
    [10, 18, -95],
    [18, 30, -110],
    [30, 40, -120],
    [40, 50, -130],
    [50, 65, -140],
    [65, 80, -150],
    [80, 100, -170],
    [100, 120, -180],
    [120, 140, -200],
    [140, 160, -210],
    [160, 180, -230],
    [180, 200, -240],
    [200, 225, -260],
    [225, 250, -280],
    [250, 280, -300],
    [280, 315, -330],
    [315, 355, -360],
    [355, 400, -400],
    [400, 450, -440],
    [450, 500, -480],
  ],
};

/** ISO 286-1 Table 5 row boundaries and fundamental deviations (µm). */
const SHAFT_TABLE5_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0, 3],
  [3, 6],
  [6, 10],
  [10, 14],
  [14, 18],
  [18, 24],
  [24, 30],
  [30, 40],
  [40, 50],
  [50, 65],
  [65, 80],
  [80, 100],
  [100, 120],
  [120, 140],
  [140, 160],
  [160, 180],
  [180, 200],
  [200, 225],
  [225, 250],
  [250, 280],
  [280, 315],
  [315, 355],
  [355, 400],
  [400, 450],
  [450, 500],
];

/**
 * Table 5: lower shaft deviations ei in µm. Null preserves an unpopulated
 * standard cell; these classes are accepted only where a value is published.
 */
const SHAFT_TABLE5: Readonly<Record<string, readonly (number | null)[]>> = {
  p: [
    6, 12, 15, 18, 18, 22, 22, 26, 26, 32, 32, 37, 37, 43, 43, 43, 50, 50, 50, 56, 56, 62, 62, 68,
    68,
  ],
  r: [
    10, 15, 19, 23, 23, 28, 28, 34, 34, 41, 43, 51, 54, 63, 65, 68, 77, 80, 84, 94, 98, 108, 114,
    126, 132,
  ],
  s: [
    14, 19, 23, 28, 28, 35, 35, 43, 43, 53, 59, 71, 79, 92, 100, 108, 122, 130, 140, 158, 170, 190,
    208, 232, 252,
  ],
  t: [
    null,
    null,
    null,
    null,
    null,
    null,
    41,
    48,
    54,
    66,
    75,
    91,
    104,
    122,
    134,
    146,
    166,
    180,
    196,
    218,
    240,
    268,
    294,
    330,
    360,
  ],
  u: [
    18, 23, 28, 33, 33, 41, 48, 60, 70, 87, 102, 124, 144, 170, 190, 210, 236, 258, 284, 315, 350,
    390, 435, 490, 540,
  ],
  v: [
    null,
    null,
    null,
    null,
    39,
    47,
    55,
    68,
    81,
    102,
    120,
    146,
    172,
    202,
    228,
    252,
    284,
    310,
    340,
    385,
    425,
    475,
    530,
    595,
    660,
  ],
  x: [
    20, 28, 34, 40, 45, 54, 64, 80, 97, 122, 146, 178, 210, 248, 280, 310, 350, 385, 425, 475, 525,
    590, 660, 740, 820,
  ],
  y: [
    null,
    null,
    null,
    null,
    null,
    63,
    75,
    94,
    114,
    144,
    174,
    214,
    254,
    300,
    340,
    380,
    425,
    470,
    520,
    580,
    650,
    730,
    820,
    920,
    1000,
  ],
  z: [
    26, 35, 42, 50, 60, 73, 88, 112, 136, 172, 210, 258, 310, 365, 415, 465, 520, 575, 640, 710,
    790, 900, 1000, 1100, 1250,
  ],
  za: [
    32, 42, 52, 64, 77, 98, 118, 148, 180, 226, 274, 335, 400, 470, 535, 600, 670, 740, 820, 920,
    1000, 1150, 1300, 1450, 1600,
  ],
  zb: [
    40, 50, 67, 90, 108, 136, 160, 200, 242, 300, 360, 445, 525, 620, 700, 780, 880, 960, 1050,
    1200, 1300, 1500, 1650, 1850, 2100,
  ],
  zc: [
    60, 80, 97, 130, 150, 188, 218, 274, 325, 405, 480, 585, 690, 800, 900, 1000, 1150, 1250, 1350,
    1550, 1700, 1900, 2100, 2400, 2600,
  ],
};

/**
 * ISO 286-1 Table 3 ∆ values, keyed to the standard's exact size steps.
 * ∆ is zero at sizes up to 3 mm; the small-size rows are easy to shift by one.
 */
const DELTA_TABLE: ReadonlyArray<readonly [number, number, readonly number[]]> = [
  [0, 3, [0, 0, 0, 0, 0, 0]],
  [3, 6, [1, 1.5, 1, 3, 4, 6]],
  [6, 10, [1, 1.5, 2, 3, 6, 7]],
  [10, 18, [1, 2, 3, 3, 7, 9]],
  [18, 30, [1.5, 2, 3, 4, 8, 12]],
  [30, 50, [1.5, 3, 4, 5, 9, 14]],
  [50, 80, [2, 3, 5, 6, 11, 16]],
  [80, 120, [2, 4, 5, 7, 13, 19]],
  [120, 180, [3, 4, 6, 7, 15, 23]],
  [180, 250, [3, 4, 6, 9, 17, 26]],
  [250, 315, [4, 4, 7, 9, 20, 29]],
  [315, 400, [4, 5, 7, 11, 21, 32]],
  [400, 500, [5, 5, 7, 13, 23, 34]],
];

interface HoleDeviationRule {
  feature: 'hole';
  source: 'ISO 286-1 Table 2' | 'ISO 286-1 Table 3';
  fundamentalBasis: 'ei';
  fundamentalGrade?: number;
  deltaThroughGrade: 7 | 8;
  aboveDeltaRule: 'zero' | 'fundamental-mirror';
  /** K: the zero cell exists only up to this size; larger cells are blank. */
  aboveDeltaThroughSize?: number;
  /** N: zero applies only above this size; at or below it the fundamental mirrors. */
  aboveDeltaAboveSize?: number;
  exception?: {
    grade: 6;
    over: 250;
    upTo: 315;
    upperDeviationUm: -9;
  };
  excludesAboveGradeAtOrBelowSize?: {
    grade: 8;
    size: 1;
  };
}

/** Hole-specific rules; the corresponding shaft cell supplies the ei value. */
const TABLE3_INTERFERENCE_RULE: HoleDeviationRule = {
  feature: 'hole',
  source: 'ISO 286-1 Table 3',
  fundamentalBasis: 'ei',
  deltaThroughGrade: 7,
  aboveDeltaRule: 'fundamental-mirror',
};

const HOLE_DEVIATION_RULES: Readonly<Record<string, HoleDeviationRule>> = {
  k: {
    feature: 'hole',
    source: 'ISO 286-1 Table 2',
    fundamentalBasis: 'ei',
    fundamentalGrade: 6,
    deltaThroughGrade: 8,
    aboveDeltaRule: 'zero',
    aboveDeltaThroughSize: 3,
  },
  m: {
    feature: 'hole',
    source: 'ISO 286-1 Table 2',
    fundamentalBasis: 'ei',
    deltaThroughGrade: 8,
    aboveDeltaRule: 'fundamental-mirror',
    exception: {
      grade: 6,
      over: 250,
      upTo: 315,
      upperDeviationUm: -9,
    },
  },
  n: {
    feature: 'hole',
    source: 'ISO 286-1 Table 3',
    fundamentalBasis: 'ei',
    deltaThroughGrade: 8,
    aboveDeltaRule: 'zero',
    // Table 3 prints −4 in both N columns up to 3 mm; above 3 mm the
    // above-IT8 cell is 0.
    aboveDeltaAboveSize: 3,
    excludesAboveGradeAtOrBelowSize: { grade: 8, size: 1 },
  },
  ...Object.fromEntries(
    ['p', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', 'za', 'zb', 'zc'].map((letter) => [
      letter,
      TABLE3_INTERFERENCE_RULE,
    ]),
  ),
};

/**
 * ISO 286-1 Table 4: j is grade-specific and tabulates the *lower* deviation
 * ei, not a general fundamental deviation. j5 and j6 share a column; j8 is
 * published only for nominal sizes up to 3 mm.
 */
const SHAFT_J_EI_UM: Readonly<Record<string, readonly [number, number][]>> = {
  '0-3': [
    [5, -2],
    [6, -2],
    [7, -4],
    [8, -6],
  ],
  '3-6': [
    [5, -2],
    [6, -2],
    [7, -4],
  ],
  '6-10': [
    [5, -2],
    [6, -2],
    [7, -5],
  ],
  '10-18': [
    [5, -3],
    [6, -3],
    [7, -6],
  ],
  '18-30': [
    [5, -4],
    [6, -4],
    [7, -8],
  ],
  '30-50': [
    [5, -5],
    [6, -5],
    [7, -10],
  ],
  '50-80': [
    [5, -7],
    [6, -7],
    [7, -12],
  ],
  '80-120': [
    [5, -9],
    [6, -9],
    [7, -15],
  ],
  '120-180': [
    [5, -11],
    [6, -11],
    [7, -18],
  ],
  '180-250': [
    [5, -13],
    [6, -13],
    [7, -21],
  ],
  '250-315': [
    [5, -16],
    [6, -16],
    [7, -26],
  ],
  '315-400': [
    [5, -18],
    [6, -18],
    [7, -28],
  ],
  '400-500': [
    [5, -20],
    [6, -20],
    [7, -32],
  ],
};

/** ISO 286-1 Table 2: hole J upper deviations ES for grades 6–8 (µm). */
const HOLE_J_ES_UM: Readonly<Record<string, readonly [number, number, number]>> = {
  '0-3': [2, 4, 6],
  '3-6': [5, 6, 10],
  '6-10': [5, 8, 12],
  '10-18': [6, 10, 15],
  '18-30': [8, 12, 20],
  '30-50': [10, 14, 24],
  '50-80': [13, 18, 28],
  '80-120': [16, 22, 34],
  '120-180': [18, 26, 41],
  '180-250': [22, 30, 47],
  '250-315': [25, 36, 55],
  '315-400': [29, 39, 60],
  '400-500': [33, 43, 66],
};

const GRADE_COLUMNS = [
  'IT01',
  'IT0',
  'IT1',
  'IT2',
  'IT3',
  'IT4',
  'IT5',
  'IT6',
  'IT7',
  'IT8',
  'IT9',
  'IT10',
  'IT11',
  'IT12',
  'IT13',
  'IT14',
  'IT15',
  'IT16',
  'IT17',
  'IT18',
];

type DeviationBasis = 'es' | 'ei';
type DeviationSource = 'ISO 286-1 Table 4' | 'ISO 286-1 Table 5';

interface ShaftDeviationCell {
  feature: 'shaft';
  letter: string;
  grade: number;
  interval: readonly [over: number, upTo: number];
  basis: DeviationBasis;
  valueUm: number | null;
  source: DeviationSource;
}

/** Resolve the applicable source cell once; calculations consume this record. */
function shaftDeviationCell(
  letter: string,
  nominal: number,
  grade: number,
): ShaftDeviationCell | undefined {
  const shaftStep = sizeStep(nominal);
  const key = letter.toLowerCase();
  const table5Index = SHAFT_TABLE5_RANGES.findIndex(
    ([over, upTo]) => nominal > over && nominal <= upTo,
  );
  const table5Row = SHAFT_TABLE5[key]?.[table5Index];
  const table5Source = SHAFT_TABLE5[key] !== undefined;
  const subdivided = SUBDIVIDED_SHAFT_DEVIATIONS[key]?.find(
    ([over, upTo]) => nominal > over && nominal <= upTo,
  );
  const coarseValue = COARSE_SHAFT_DEVIATIONS[shaftStep.key]?.[key];

  let interval: readonly [number, number];
  let source: DeviationSource;
  let valueUm: number | null | undefined;
  if (table5Source) {
    interval = SHAFT_TABLE5_RANGES[table5Index]!;
    source = 'ISO 286-1 Table 5';
    valueUm = table5Row;
  } else if (subdivided) {
    interval = [subdivided[0], subdivided[1]];
    source = 'ISO 286-1 Table 4';
    valueUm = subdivided[2];
  } else {
    interval = [shaftStep.over, shaftStep.upTo];
    source = ['k', 'm', 'n'].includes(key) ? 'ISO 286-1 Table 5' : 'ISO 286-1 Table 4';
    valueUm = coarseValue;
  }

  // Table 5 has separate k columns: nonzero ei is limited to IT4–IT7.
  if (key === 'k' && nominal > 3 && nominal <= 500 && (grade <= 3 || grade > 7)) {
    valueUm = 0;
  }
  if (valueUm === undefined) return undefined;

  return {
    feature: 'shaft',
    letter: key,
    grade,
    interval,
    basis: source === 'ISO 286-1 Table 4' && 'cdefg'.includes(key) ? 'es' : 'ei',
    valueUm,
    source,
  };
}

export type ItGrade = number;

export interface SizeStep {
  over: number;
  upTo: number;
  key: string;
}

export function sizeStep(nominal: number): SizeStep {
  if (!Number.isFinite(nominal) || nominal <= 0) {
    throw domainError('invalid_size', 'nominal size must be a positive number of millimetres');
  }
  if (nominal > 500) {
    throw domainError(
      'unsupported_size',
      `nominal sizes above 500 mm are not implemented (asked for ${nominal} mm)`,
    );
  }
  for (const [over, upTo] of STEPS_UP_TO_500) {
    if (nominal > over && nominal <= upTo) return { over, upTo, key: `${over}-${upTo}` };
  }
  return { over: 0, upTo: 3, key: '0-3' };
}

/** The geometric mean of the step, which is what the factor is defined from. */
export function stepMean(step: SizeStep): number {
  if (step.over === 0) return Math.sqrt(1 * 3);
  return Math.sqrt(step.over * step.upTo);
}

/** `i = 0.45·cbrt(D) + 0.001·D` micrometers: a cross-check on the table, not its source. */
export function toleranceFactor(step: SizeStep): number {
  const d = stepMean(step);
  return 0.45 * Math.cbrt(d) + 0.001 * d;
}

/** The published IT grade value in micrometres. */
export function itGrade(nominal: number, grade: ItGrade): number {
  const step = sizeStep(nominal);
  const label = grade === 0.1 ? 'IT01' : grade === 0 ? 'IT0' : `IT${grade}`;
  const column = GRADE_COLUMNS.indexOf(label);
  if (column < 0) {
    throw domainError(
      'unsupported_grade',
      `'${label}' is not a standard tolerance grade: expected IT01, IT0, or IT1 to IT18`,
    );
  }
  return IT_TABLE[step.key]![column]!;
}

/** How far the computed factor is from the published value, for a caller checking us. */
export function factorCheck(
  nominal: number,
  grade: ItGrade,
): {
  published: number;
  multiplesOfFactor: number;
} {
  return {
    published: itGrade(nominal, grade),
    multiplesOfFactor: Number(
      (itGrade(nominal, grade) / toleranceFactor(sizeStep(nominal))).toFixed(3),
    ),
  };
}

export interface Limits {
  nominal: number;
  designation: string;
  hole: boolean;
  upperDeviation: number;
  lowerDeviation: number;
  upperLimit: number;
  lowerLimit: number;
  tolerance: number;
  unit: string;
  edition: string;
}

interface ParsedDesignation {
  letter: string;
  gradeToken: string;
  grade: number;
  upperLetter: string;
  hole: boolean;
}

function parseDesignation(designation: string): ParsedDesignation {
  const match = /^([A-Za-z]{1,2})\s?(\d{1,2})$/.exec(designation.trim());
  if (!match) {
    throw domainError(
      'invalid_designation',
      `'${designation}' is not a tolerance class: expected a deviation letter and a grade, such as H7 or g6`,
    );
  }
  const letter = match[1]!;
  const gradeToken = match[2]!;
  if (gradeToken !== '01' && gradeToken.length > 1 && gradeToken.startsWith('0')) {
    throw domainError(
      'invalid_designation',
      `'IT${gradeToken}' is not a standard tolerance grade; use IT01 or IT0 explicitly`,
    );
  }
  const grade = gradeToken === '01' ? 0.1 : Number(gradeToken);
  const upperLetter = letter.toUpperCase();
  const hole = letter === upperLetter;
  if (letter !== letter.toLowerCase() && letter !== upperLetter) {
    throw domainError(
      'invalid_designation',
      `mixed-case deviation '${letter}' is invalid; use uppercase for a hole or lowercase for a shaft`,
    );
  }
  return { letter, gradeToken, grade, upperLetter, hole };
}

/** Exact size intervals where a tolerance designation is implemented. */
export function applicableSizeIntervals(
  designation: string,
): Array<{ over: number; upTo: number }> {
  const parsed = parseDesignation(designation);
  itGrade(500, parsed.grade);
  const boundaries = new Set<number>([0, 1, 3, 500]);
  for (const [over, upTo] of STEPS_UP_TO_500) {
    boundaries.add(over);
    boundaries.add(upTo);
  }
  for (const [over, upTo] of SHAFT_TABLE5_RANGES) {
    boundaries.add(over);
    boundaries.add(upTo);
  }
  for (const intervals of Object.values(SUBDIVIDED_SHAFT_DEVIATIONS)) {
    for (const [over, upTo] of intervals) {
      boundaries.add(over);
      boundaries.add(upTo);
    }
  }

  const sorted = [...boundaries].sort((a, b) => a - b);
  const intervals: Array<{ over: number; upTo: number }> = [];
  for (let index = 1; index < sorted.length; index += 1) {
    const over = sorted[index - 1]!;
    const upTo = sorted[index]!;
    try {
      limitsOfSize(upTo, designation);
      const previous = intervals.at(-1);
      if (previous?.upTo === over) previous.upTo = upTo;
      else intervals.push({ over, upTo });
    } catch (error) {
      if (describeError(error).code === 'internal_error') throw error;
      // Unsupported source cells remain gaps in the generated applicability.
    }
  }
  return intervals;
}

/**
 * Limits of size for one tolerance class, e.g. `40H7` or `40g6`.
 *
 * The hole basis is handled by its own Table 2/3 rules where deviations are not
 * simple mirrors, including ∆ corrections and the documented M6 exception.
 */
export function limitsOfSize(nominal: number, designation: string): Limits {
  const { letter, gradeToken, grade, upperLetter, hole } = parseDesignation(designation);
  const step = sizeStep(nominal);
  const tolerance = itGrade(nominal, grade) / 1000;

  let upper: number;
  let lower: number;

  if (upperLetter === 'H' && hole) {
    // Zero-deviation hole: the tolerance sits above the nominal.
    upper = tolerance;
    lower = 0;
  } else if (upperLetter === 'JS' && hole) {
    upper = tolerance / 2;
    lower = -tolerance / 2;
  } else if (upperLetter === 'J' && hole) {
    const values = HOLE_J_ES_UM[step.key];
    const gradeIndex = grade - 6;
    if (!values || gradeIndex < 0 || gradeIndex > 2) {
      throw domainError(
        'unsupported_deviation',
        `hole J is tabulated only for IT6–IT8 in ISO 286-1 Table 2; ${letter}${grade} is not covered`,
      );
    }
    upper = values[gradeIndex]! / 1000;
    lower = upper - tolerance;
  } else if (upperLetter === 'H') {
    // Zero-deviation shaft: the tolerance sits below the nominal.
    upper = 0;
    lower = -tolerance;
  } else if (upperLetter === 'JS') {
    upper = tolerance / 2;
    lower = -tolerance / 2;
  } else {
    const shaftKey = letter.toLowerCase();
    const holeRule = hole ? HOLE_DEVIATION_RULES[shaftKey] : undefined;
    const cell = shaftDeviationCell(shaftKey, nominal, holeRule?.fundamentalGrade ?? grade);
    const jDeviation = SHAFT_J_EI_UM[step.key]?.find(([jGrade]) => jGrade === grade)?.[1];
    const tabulated = cell?.valueUm;

    if (holeRule) {
      if (tabulated === undefined || tabulated === null) {
        throw domainError(
          'unsupported_deviation',
          `hole deviation '${letter}' has no published Table 2/3 cell at ${nominal} mm`,
        );
      }
      if (cell?.basis !== holeRule.fundamentalBasis) {
        throw domainError(
          'internal_error',
          `hole rule for ${letter.toUpperCase()} requires ${holeRule.fundamentalBasis}, but its source cell does not match`,
        );
      }
      const tabulatedUm = tabulated!;
      const deltaApplies = grade <= holeRule.deltaThroughGrade;
      let delta = 0;
      if (deltaApplies) {
        const deltaGrade = [3, 4, 5, 6, 7, 8].indexOf(grade);
        const deltaRow = DELTA_TABLE.find(([over, upTo]) => nominal > over && nominal <= upTo);
        if (deltaGrade < 0 || !deltaRow) {
          throw domainError(
            'unsupported_deviation',
            `ISO 286-1 Table 3 does not publish a ∆ correction for ${letter}${grade} at ${nominal} mm`,
          );
        }
        delta = deltaRow[2][deltaGrade]!;
      }
      let es: number;
      if (grade <= holeRule.deltaThroughGrade) {
        es = -tabulatedUm + delta;
      } else if (holeRule.aboveDeltaRule === 'zero') {
        const belowZeroCell =
          holeRule.aboveDeltaAboveSize !== undefined && nominal <= holeRule.aboveDeltaAboveSize;
        const aboveBlankCell =
          holeRule.aboveDeltaThroughSize !== undefined && nominal > holeRule.aboveDeltaThroughSize;
        if (aboveBlankCell) {
          throw domainError(
            'unsupported_deviation',
            `${letter}${grade} has no published hole deviation at ${nominal} mm`,
          );
        }
        es = belowZeroCell ? -tabulatedUm : 0;
      } else {
        es = -tabulatedUm;
      }
      if (
        holeRule.exception &&
        grade === holeRule.exception.grade &&
        nominal > holeRule.exception.over &&
        nominal <= holeRule.exception.upTo
      ) {
        es = holeRule.exception.upperDeviationUm;
      }
      if (
        holeRule.excludesAboveGradeAtOrBelowSize &&
        grade > holeRule.excludesAboveGradeAtOrBelowSize.grade &&
        nominal <= holeRule.excludesAboveGradeAtOrBelowSize.size
      ) {
        throw domainError(
          'unsupported_deviation',
          `${holeRule.source} excludes hole ${letter.toUpperCase()} above IT${holeRule.excludesAboveGradeAtOrBelowSize.grade} for nominal sizes up to ${holeRule.excludesAboveGradeAtOrBelowSize.size} mm`,
        );
      }
      upper = es / 1000;
      lower = upper - tolerance;
    } else {
      // j is grade-specific; its table value is the lower deviation, not a
      // general fundamental deviation.
      if (
        (shaftKey === 'j' && (hole || jDeviation === undefined)) ||
        (shaftKey !== 'j' && (tabulated === undefined || tabulated === null))
      ) {
        if (shaftKey === 'j') {
          throw domainError(
            'unsupported_deviation',
            'shaft j is tabulated only for IT5–IT7, and IT8 up to 3 mm, in ISO 286-1 Table 4',
          );
        }
        throw domainError(
          'unsupported_deviation',
          `the shaft class '${letter}' is not supported for this size and grade. ` +
            `Only source-verified letter/size/grade combinations are returned; ` +
            `blank Table 5 cells remain unsupported`,
        );
      }
      if (shaftKey === 'j' && !hole) {
        lower = jDeviation! / 1000;
        upper = lower + tolerance;
      } else {
        const basis = cell!.basis;
        // A hole is the mirror of the same-letter shaft about the zero line: its upper
        // deviation is the negated shaft lower deviation.
        const shaftUpper = basis === 'es' ? tabulated! / 1000 : tabulated! / 1000 + tolerance;
        const shaftLower = shaftUpper - tolerance;
        if (hole) {
          upper = -shaftLower;
          lower = -shaftUpper;
        } else {
          upper = shaftUpper;
          lower = shaftLower;
        }
      }
    }
  }

  const round = (value: number) => Number(value.toFixed(6));
  return {
    nominal,
    designation: `${letter}${gradeToken}`,
    hole,
    upperDeviation: round(upper),
    lowerDeviation: round(lower),
    upperLimit: round(nominal + upper),
    lowerLimit: round(nominal + lower),
    tolerance: round(tolerance),
    unit: 'mm',
    edition: ISO_286_EDITION,
  };
}

export interface FitResult {
  hole: Limits;
  shaft: Limits;
  type: 'clearance' | 'transition' | 'interference';
  maximumClearance: number;
  minimumClearance: number;
  maximumInterference: number;
  minimumInterference: number;
  unit: string;
}

/** The resulting fit between a hole and a shaft at one nominal size. */
export function fit(nominal: number, holeDesignation: string, shaftDesignation: string): FitResult {
  const hole = limitsOfSize(nominal, holeDesignation);
  const shaft = limitsOfSize(nominal, shaftDesignation);
  if (!hole.hole || shaft.hole) {
    throw domainError(
      'invalid_fit_roles',
      'fit requires an uppercase hole class first and a lowercase shaft class second',
    );
  }
  const maximumClearance = hole.upperLimit - shaft.lowerLimit;
  const minimumClearance = hole.lowerLimit - shaft.upperLimit;
  const type =
    minimumClearance >= 0 ? 'clearance' : maximumClearance > 0 ? 'transition' : 'interference';
  const round = (value: number) => Number(value.toFixed(6));
  return {
    hole,
    shaft,
    type,
    maximumClearance: round(maximumClearance),
    minimumClearance: round(minimumClearance),
    maximumInterference: round(Math.max(0, -minimumClearance)),
    minimumInterference: round(Math.max(0, -maximumClearance)),
    unit: 'mm',
  };
}

/** The IT table as published, for callers that want the whole series. */
export function itTable() {
  return STEPS_UP_TO_500.map(([over, upTo]) => {
    const values = IT_TABLE[`${over}-${upTo}`]!;
    return {
      over,
      upTo,
      grades: Object.fromEntries(GRADE_COLUMNS.map((name, index) => [name, values[index]!])),
    };
  });
}
