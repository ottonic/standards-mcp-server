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

import { domainError } from "../errors.js";

export const ISO_286_EDITION = "iso286-1:2010+cor1:2013";

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
  "0-3": [
    0.3, 0.5, 0.8, 1.2, 2, 3, 4, 6, 10, 14, 25, 40, 60, 100, 140, 250, 400, 600,
    1000, 1400,
  ],
  "3-6": [
    0.4, 0.6, 1, 1.5, 2.5, 4, 5, 8, 12, 18, 30, 48, 75, 120, 180, 300, 480, 750,
    1200, 1800,
  ],
  "6-10": [
    0.4, 0.6, 1, 1.5, 2.5, 4, 6, 9, 15, 22, 36, 58, 90, 150, 220, 360, 580, 900,
    1500, 2200,
  ],
  "10-18": [
    0.5, 0.8, 1.2, 2, 3, 5, 8, 11, 18, 27, 43, 70, 110, 180, 270, 430, 700,
    1100, 1800, 2700,
  ],
  "18-30": [
    0.6, 1, 1.5, 2.5, 4, 6, 9, 13, 21, 33, 52, 84, 130, 210, 330, 520, 840,
    1300, 2100, 3300,
  ],
  "30-50": [
    0.6, 1, 1.5, 2.5, 4, 7, 11, 16, 25, 39, 62, 100, 160, 250, 390, 620, 1000,
    1600, 2500, 3900,
  ],
  "50-80": [
    0.8, 1.2, 2, 3, 5, 8, 13, 19, 30, 46, 74, 120, 190, 300, 460, 740, 1200,
    1900, 3000, 4600,
  ],
  "80-120": [
    1, 1.5, 2.5, 4, 6, 10, 15, 22, 35, 54, 87, 140, 220, 350, 540, 870, 1400,
    2200, 3500, 5400,
  ],
  "120-180": [
    1.2, 2, 3.5, 5, 8, 12, 18, 25, 40, 63, 100, 160, 250, 400, 630, 1000, 1600,
    2500, 4000, 6300,
  ],
  "180-250": [
    2, 3, 4.5, 7, 10, 14, 20, 29, 46, 72, 115, 185, 290, 460, 720, 1150, 1850,
    2900, 4600, 7200,
  ],
  "250-315": [
    2.5, 4, 6, 8, 12, 16, 23, 32, 52, 81, 130, 210, 320, 520, 810, 1300, 2100,
    3200, 5200, 8100,
  ],
  "315-400": [
    3, 5, 7, 9, 13, 18, 25, 36, 57, 89, 140, 230, 360, 570, 890, 1400, 2300,
    3600, 5700, 8900,
  ],
  "400-500": [
    4, 6, 8, 10, 15, 20, 27, 40, 63, 97, 155, 250, 400, 630, 970, 1550, 2500,
    4000, 6300, 9700,
  ],
};

/**
 * Fundamental deviations for shafts, micrometres, as published.
 *
 * **Which limit the number is matters.** For a to g the tabulated value is the
 * *upper* deviation (es, always negative); for j to n it is the *lower* deviation
 * (ei, positive or negative); from p to zc it is again the *upper* deviation
 * (es, positive). Getting this backwards is silent: `h`, `f` and `s` still come
 * out right, while `n`, `p` and `u` are wrong by exactly one tolerance grade.
 *
 * The letter classes are listed in `DEVIATION_BASIS` below rather than inferred
 * from the number's sign, because that inference is wrong for k, m, n and js.
 */
const SHAFT_DEVIATIONS: Readonly<
  Record<string, Readonly<Record<string, number>>>
> = {
  "0-3": {
    c: -60,
    d: -20,
    e: -14,
    f: -6,
    g: -2,
    h: 0,
    k: 0,
    m: 2,
    n: 4,
    p: 6,
    r: 10,
    s: 14,
    t: 19,
    u: 24,
    v: 28,
    x: 34,
    y: 40,
    z: 46,
    za: 54,
    zb: 60,
    zc: 66,
  },
  "3-6": {
    c: -70,
    d: -30,
    e: -20,
    f: -10,
    g: -4,
    h: 0,
    j: -2,
    k: 1,
    m: 4,
    n: 8,
    p: 12,
    r: 15,
    s: 19,
    t: 23,
    u: 28,
    v: 34,
    x: 42,
    y: 48,
    z: 54,
    za: 82,
    zb: 98,
    zc: 114,
  },
  "6-10": {
    c: -80,
    d: -40,
    e: -25,
    f: -13,
    g: -5,
    h: 0,
    j: -2,
    k: 1,
    m: 6,
    n: 10,
    p: 15,
    r: 19,
    s: 23,
    t: 28,
    u: 34,
    v: 41,
    x: 50,
    y: 58,
    z: 65,
    za: 98,
    zb: 116,
    zc: 134,
  },
  "10-18": {
    c: -95,
    d: -50,
    e: -32,
    f: -16,
    g: -6,
    h: 0,
    j: -3,
    k: 1,
    m: 7,
    n: 12,
    p: 18,
    r: 23,
    s: 28,
    t: 33,
    u: 41,
    v: 49,
    x: 60,
    y: 69,
    z: 78,
    za: 118,
    zb: 140,
    zc: 162,
  },
  "18-30": {
    c: -110,
    d: -65,
    e: -40,
    f: -20,
    g: -7,
    h: 0,
    j: -4,
    k: 2,
    m: 8,
    n: 15,
    p: 22,
    r: 28,
    s: 35,
    t: 41,
    u: 48,
    v: 56,
    x: 75,
    y: 91,
    z: 108,
    za: 150,
    zb: 188,
    zc: 208,
  },
  "30-50": {
    c: -120,
    d: -80,
    e: -50,
    f: -25,
    g: -9,
    h: 0,
    j: -5,
    k: 2,
    m: 9,
    n: 17,
    p: 26,
    r: 34,
    s: 43,
    t: 48,
    u: 60,
    v: 68,
    x: 88,
    y: 108,
    z: 132,
    za: 177,
    zb: 222,
    zc: 252,
  },
  "50-80": {
    c: -130,
    d: -100,
    e: -60,
    f: -30,
    g: -10,
    h: 0,
    j: -7,
    k: 2,
    m: 11,
    n: 20,
    p: 32,
    r: 41,
    s: 53,
    t: 56,
    u: 73,
    v: 88,
    x: 105,
    y: 132,
    z: 184,
    za: 217,
    zb: 262,
    zc: 292,
  },
  "80-120": {
    c: -140,
    d: -120,
    e: -72,
    f: -36,
    g: -12,
    h: 0,
    j: -9,
    k: 3,
    m: 13,
    n: 23,
    p: 37,
    r: 48,
    s: 63,
    t: 66,
    u: 86,
    v: 105,
    x: 130,
    y: 184,
    z: 205,
    za: 242,
    zb: 297,
    zc: 327,
  },
  "120-180": {
    c: -150,
    d: -145,
    e: -85,
    f: -43,
    g: -14,
    h: 0,
    j: -11,
    k: 3,
    m: 15,
    n: 27,
    p: 43,
    r: 54,
    s: 72,
    t: 76,
    u: 100,
    v: 130,
    x: 160,
    y: 235,
    z: 250,
    za: 292,
    zb: 347,
    zc: 377,
  },
  "180-250": {
    c: -170,
    d: -170,
    e: -100,
    f: -50,
    g: -15,
    h: 0,
    j: -13,
    k: 4,
    m: 17,
    n: 31,
    p: 50,
    r: 60,
    s: 86,
    t: 96,
    u: 124,
    v: 160,
    x: 190,
    y: 280,
    z: 300,
    za: 347,
    zb: 412,
    zc: 447,
  },
  "250-315": {
    c: -190,
    d: -190,
    e: -110,
    f: -56,
    g: -17,
    h: 0,
    j: -16,
    k: 4,
    m: 20,
    n: 34,
    p: 56,
    r: 66,
    s: 98,
    t: 108,
    u: 144,
    v: 186,
    x: 222,
    y: 330,
    z: 362,
    za: 412,
    zb: 482,
    zc: 522,
  },
  "315-400": {
    c: -200,
    d: -210,
    e: -125,
    f: -62,
    g: -18,
    h: 0,
    j: -18,
    k: 4,
    m: 21,
    n: 37,
    p: 62,
    r: 72,
    s: 108,
    t: 122,
    u: 166,
    v: 210,
    x: 250,
    y: 390,
    z: 418,
    za: 482,
    zb: 562,
    zc: 612,
  },
  "400-500": {
    c: -210,
    d: -230,
    e: -135,
    f: -68,
    g: -20,
    h: 0,
    j: -20,
    k: 5,
    m: 23,
    n: 40,
    p: 68,
    r: 78,
    s: 120,
    t: 136,
    u: 190,
    v: 246,
    x: 294,
    y: 460,
    z: 488,
    za: 562,
    zb: 662,
    zc: 722,
  },
};

/**
 * Which limit of the tolerance zone each tabulated shaft deviation gives:
 * `'es'` the upper, `'ei'` the lower. See the note above — this drives which
 * limit is derived by adding the grade, so it is stated, not inferred.
 *
 * Table 5 explicitly labels the tabulated fundamental deviations for k to zc as
 * lower deviations (ei); Table 4 labels a to h as upper deviations (es). Do not
 * infer the basis from sign or letter family.
 */
const DEVIATION_BASIS: Readonly<Record<string, "es" | "ei">> = {
  c: "es",
  d: "es",
  e: "es",
  f: "es",
  g: "es",
  h: "es",
  k: "ei",
  m: "ei",
  n: "ei",
  p: "ei",
  r: "ei",
  s: "ei",
  t: "ei",
  u: "ei",
  v: "ei",
  x: "ei",
  y: "ei",
  z: "ei",
  za: "ei",
  zb: "ei",
  zc: "ei",
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
    6, 12, 15, 18, 18, 22, 22, 26, 26, 32, 32, 37, 37, 43, 43, 43, 50, 50, 50,
    56, 56, 62, 62, 68, 68,
  ],
  r: [
    10, 15, 19, 23, 23, 28, 28, 34, 34, 41, 43, 51, 54, 63, 65, 68, 77, 80, 84,
    94, 98, 108, 114, 126, 132,
  ],
  s: [
    14, 19, 23, 28, 28, 35, 35, 43, 43, 53, 59, 71, 79, 92, 100, 108, 122, 130,
    140, 158, 170, 190, 208, 232, 252,
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
    18, 23, 28, 33, 33, 41, 48, 60, 70, 87, 102, 124, 144, 170, 190, 210, 236,
    258, 284, 315, 350, 390, 435, 490, 540,
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
    20, 28, 34, 40, 45, 54, 64, 80, 97, 122, 146, 178, 210, 248, 280, 310, 350,
    385, 425, 475, 525, 590, 660, 740, 820,
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
    26, 35, 42, 50, 60, 73, 88, 112, 136, 172, 210, 258, 310, 365, 415, 465,
    520, 575, 640, 710, 790, 900, 1000, 1100, 1250,
  ],
  za: [
    32, 42, 52, 64, 77, 98, 118, 148, 180, 226, 274, 335, 400, 470, 535, 600,
    670, 740, 820, 920, 1000, 1150, 1300, 1450, 1600,
  ],
  zb: [
    40, 50, 67, 90, 108, 136, 160, 200, 242, 300, 360, 445, 525, 620, 700, 780,
    880, 960, 1050, 1200, 1300, 1500, 1650, 1850, 2100,
  ],
  zc: [
    60, 80, 97, 130, 150, 188, 218, 274, 325, 405, 480, 585, 690, 800, 900,
    1000, 1150, 1250, 1350, 1550, 1700, 1900, 2100, 2400, 2600,
  ],
};

/** ISO 286-1 Table 3 ∆ values, keyed to the standard's exact size steps. */
const DELTA_TABLE: ReadonlyArray<readonly [number, number, readonly number[]]> =
  [
    [0, 3, [1, 1.5, 1, 3, 4, 6]],
    [3, 6, [1, 1.5, 2, 3, 6, 7]],
    [6, 10, [1, 2, 3, 3, 7, 9]],
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

const DELTA_HOLE_LETTERS = new Set(["k", "m", "n"]);
const INTERFERENCE_HOLE_LETTERS = new Set([
  "p",
  "r",
  "s",
  "t",
  "u",
  "v",
  "x",
  "y",
  "z",
  "za",
  "zb",
  "zc",
]);

/** ISO 286-1 Table 4: j has grade-specific es values, not one fundamental deviation. */
const SHAFT_J_ES_UM: Readonly<Record<string, readonly [number, number][]>> = {
  "0-3": [
    [5, -2],
    [6, -2],
    [7, -4],
  ],
  "3-6": [
    [5, -2],
    [6, -2],
    [7, -4],
  ],
  "6-10": [
    [5, -2],
    [6, -2],
    [7, -5],
  ],
  "10-18": [
    [5, -3],
    [6, -3],
    [7, -6],
  ],
  "18-30": [
    [5, -4],
    [6, -4],
    [7, -8],
  ],
  "30-50": [
    [5, -5],
    [6, -5],
    [7, -10],
  ],
  "50-80": [
    [5, -7],
    [6, -7],
    [7, -12],
  ],
  "80-120": [
    [5, -9],
    [6, -9],
    [7, -15],
  ],
  "120-180": [
    [5, -11],
    [6, -11],
    [7, -18],
  ],
  "180-250": [
    [5, -13],
    [6, -13],
    [7, -21],
  ],
  "250-315": [
    [5, -16],
    [6, -16],
    [7, -26],
  ],
  "315-400": [
    [5, -18],
    [6, -18],
    [7, -28],
  ],
  "400-500": [
    [5, -20],
    [6, -20],
    [7, -32],
  ],
};

/** ISO 286-1 Table 2: hole J upper deviations ES for grades 6–8 (µm). */
const HOLE_J_ES_UM: Readonly<
  Record<string, readonly [number, number, number]>
> = {
  "0-3": [2, 4, 6],
  "3-6": [5, 6, 10],
  "6-10": [5, 8, 12],
  "10-18": [6, 10, 15],
  "18-30": [8, 12, 20],
  "30-50": [10, 14, 24],
  "50-80": [13, 18, 28],
  "80-120": [16, 22, 34],
  "120-180": [18, 26, 41],
  "180-250": [22, 30, 47],
  "250-315": [25, 36, 55],
  "315-400": [29, 39, 60],
  "400-500": [33, 43, 66],
};

const GRADE_COLUMNS = [
  "IT01",
  "IT0",
  "IT1",
  "IT2",
  "IT3",
  "IT4",
  "IT5",
  "IT6",
  "IT7",
  "IT8",
  "IT9",
  "IT10",
  "IT11",
  "IT12",
  "IT13",
  "IT14",
  "IT15",
  "IT16",
  "IT17",
  "IT18",
];

export type ItGrade = number;

export interface SizeStep {
  over: number;
  upTo: number;
  key: string;
}

export function sizeStep(nominal: number): SizeStep {
  if (!Number.isFinite(nominal) || nominal <= 0) {
    throw domainError(
      "invalid_size",
      "nominal size must be a positive number of millimetres",
    );
  }
  if (nominal > 500) {
    throw domainError(
      "unsupported_size",
      `nominal sizes above 500 mm are not implemented (asked for ${nominal} mm)`,
    );
  }
  for (const [over, upTo] of STEPS_UP_TO_500) {
    if (nominal > over && nominal <= upTo)
      return { over, upTo, key: `${over}-${upTo}` };
  }
  return { over: 0, upTo: 3, key: "0-3" };
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
  const label = grade === 0.1 ? "IT01" : grade === 0 ? "IT0" : `IT${grade}`;
  const column = GRADE_COLUMNS.indexOf(label);
  if (column < 0) {
    throw domainError(
      "unsupported_grade",
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

/**
 * Limits of size for one tolerance class, e.g. `40H7` or `40g6`.
 *
 * The hole basis is handled by its own Table 2/3 rules where deviations are not
 * simple mirrors, including ∆ corrections and the documented M6 exception.
 */
export function limitsOfSize(nominal: number, designation: string): Limits {
  const match = /^([A-Za-z]{1,2})\s?(\d{1,2})$/.exec(designation.trim());
  if (!match) {
    throw domainError(
      "invalid_designation",
      `'${designation}' is not a tolerance class: expected a deviation letter and a grade, such as H7 or g6`,
    );
  }
  const letter = match[1]!;
  const gradeToken = match[2]!;
  if (
    gradeToken !== "01" &&
    gradeToken.length > 1 &&
    gradeToken.startsWith("0")
  ) {
    throw domainError(
      "invalid_designation",
      `'IT${gradeToken}' is not a standard tolerance grade; use IT01 or IT0 explicitly`,
    );
  }
  const grade = gradeToken === "01" ? 0.1 : Number(gradeToken);
  const upperLetter = letter.toUpperCase();
  const hole = letter === upperLetter;
  if (letter !== letter.toLowerCase() && letter !== upperLetter) {
    throw domainError(
      "invalid_designation",
      `mixed-case deviation '${letter}' is invalid; use uppercase for a hole or lowercase for a shaft`,
    );
  }
  const step = sizeStep(nominal);
  const tolerance = itGrade(nominal, grade) / 1000;

  let upper: number;
  let lower: number;

  if (upperLetter === "H" && hole) {
    // Zero-deviation hole: the tolerance sits above the nominal.
    upper = tolerance;
    lower = 0;
  } else if (upperLetter === "JS" && hole) {
    upper = tolerance / 2;
    lower = -tolerance / 2;
  } else if (upperLetter === "J" && hole) {
    const values = HOLE_J_ES_UM[step.key];
    const gradeIndex = grade - 6;
    if (!values || gradeIndex < 0 || gradeIndex > 2) {
      throw domainError(
        "unsupported_deviation",
        `hole J is tabulated only for IT6–IT8 in ISO 286-1 Table 2; ${letter}${grade} is not covered`,
      );
    }
    upper = values[gradeIndex]! / 1000;
    lower = upper - tolerance;
  } else if (upperLetter === "H") {
    // Zero-deviation shaft: the tolerance sits below the nominal.
    upper = 0;
    lower = -tolerance;
  } else if (upperLetter === "JS") {
    upper = tolerance / 2;
    lower = -tolerance / 2;
  } else {
    const shaftKey = letter.toLowerCase();
    const table = SHAFT_DEVIATIONS[step.key]!;
    const subdivided = SUBDIVIDED_SHAFT_DEVIATIONS[shaftKey]?.find(
      ([over, upTo]) => nominal > over && nominal <= upTo,
    )?.[2];
    const table5Index = SHAFT_TABLE5_RANGES.findIndex(
      ([over, upTo]) => nominal > over && nominal <= upTo,
    );
    const table5Row = SHAFT_TABLE5[shaftKey]?.[table5Index];
    const jDeviation = SHAFT_J_ES_UM[step.key]?.find(
      ([jGrade]) => jGrade === grade,
    )?.[1];
    let tabulated = SHAFT_TABLE5[shaftKey]
      ? table5Row
      : SUBDIVIDED_SHAFT_DEVIATIONS[shaftKey]
        ? subdivided
        : table[shaftKey];
    if (shaftKey === "j" && !hole) tabulated = jDeviation;
    // For sizes above 3 through 500 mm, Table 5 gives a nonzero k deviation
    // only for IT4–IT7. The other grade column is zero.
    if (
      shaftKey === "k" &&
      nominal > 3 &&
      nominal <= 500 &&
      (grade <= 3 || grade > 7)
    ) {
      tabulated = 0;
    }

    if (
      hole &&
      (DELTA_HOLE_LETTERS.has(shaftKey) ||
        INTERFERENCE_HOLE_LETTERS.has(shaftKey))
    ) {
      if (tabulated === undefined || tabulated === null) {
        throw domainError(
          "unsupported_deviation",
          `hole deviation '${letter}' has no published Table 2/3 cell at ${nominal} mm`,
        );
      }
      const deltaApplies = DELTA_HOLE_LETTERS.has(shaftKey)
        ? grade <= 8
        : grade <= 7;
      let delta = 0;
      if (deltaApplies) {
        const deltaGrade = [3, 4, 5, 6, 7, 8].indexOf(grade);
        const deltaRow = DELTA_TABLE.find(
          ([over, upTo]) => nominal > over && nominal <= upTo,
        );
        if (deltaGrade < 0 || !deltaRow) {
          throw domainError(
            "unsupported_deviation",
            `ISO 286-1 Table 3 does not publish a ∆ correction for ${letter}${grade} at ${nominal} mm`,
          );
        }
        delta = deltaRow[2][deltaGrade]!;
      }
      let es = -tabulated + delta;
      // ISO 286-1 Table 2, footnote b: M6 has ES = −9 µm in (250, 315] mm.
      if (shaftKey === "m" && grade === 6 && nominal > 250 && nominal <= 315) {
        es = -9;
      }
      // Table 3 footnote b excludes N above IT8 for nominal sizes through 1 mm.
      if (shaftKey === "n" && grade > 8 && nominal <= 1) {
        throw domainError(
          "unsupported_deviation",
          "ISO 286-1 Table 3 excludes hole N above IT8 for nominal sizes up to 1 mm",
        );
      }
      upper = es / 1000;
      lower = upper - tolerance;
    } else {
      // j is grade-specific; its table value is not a general fundamental deviation.
      if (
        (shaftKey === "j" && (hole || jDeviation === undefined)) ||
        tabulated === undefined ||
        tabulated === null
      ) {
        if (shaftKey === "j") {
          throw domainError(
            "unsupported_deviation",
            "shaft j is tabulated only for IT5–IT7 in ISO 286-1 Table 4",
          );
        }
        throw domainError(
          "unsupported_deviation",
          `the shaft class '${letter}' is not supported for this size and grade. ` +
            `Only source-verified letter/size/grade combinations are returned. ` +
            `${Object.keys(DEVIATION_BASIS).join(
              ", ",
            )}; blank Table 5 cells remain unsupported`,
        );
      }
      if (shaftKey === "j" && !hole) {
        upper = jDeviation! / 1000;
        lower = upper - tolerance;
      } else {
        const basis = DEVIATION_BASIS[shaftKey]!;
        // A hole is the mirror of the same-letter shaft about the zero line: its upper
        // deviation is the negated shaft lower deviation.
        const shaftUpper =
          basis === "es" ? tabulated / 1000 : tabulated / 1000 + tolerance;
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
    unit: "mm",
    edition: ISO_286_EDITION,
  };
}

export interface FitResult {
  hole: Limits;
  shaft: Limits;
  type: "clearance" | "transition" | "interference";
  maximumClearance: number;
  minimumClearance: number;
  maximumInterference: number;
  minimumInterference: number;
  unit: string;
}

/** The resulting fit between a hole and a shaft at one nominal size. */
export function fit(
  nominal: number,
  holeDesignation: string,
  shaftDesignation: string,
): FitResult {
  const hole = limitsOfSize(nominal, holeDesignation);
  const shaft = limitsOfSize(nominal, shaftDesignation);
  if (!hole.hole || shaft.hole) {
    throw domainError(
      "invalid_fit_roles",
      "fit requires an uppercase hole class first and a lowercase shaft class second",
    );
  }
  const maximumClearance = hole.upperLimit - shaft.lowerLimit;
  const minimumClearance = hole.lowerLimit - shaft.upperLimit;
  const type =
    minimumClearance >= 0
      ? "clearance"
      : maximumClearance > 0
        ? "transition"
        : "interference";
  const round = (value: number) => Number(value.toFixed(6));
  return {
    hole,
    shaft,
    type,
    maximumClearance: round(maximumClearance),
    minimumClearance: round(minimumClearance),
    maximumInterference: round(Math.max(0, -minimumClearance)),
    minimumInterference: round(Math.max(0, -maximumClearance)),
    unit: "mm",
  };
}

/** The IT table as published, for callers that want the whole series. */
export function itTable() {
  return STEPS_UP_TO_500.map(([over, upTo]) => {
    const values = IT_TABLE[`${over}-${upTo}`]!;
    return {
      over,
      upTo,
      grades: Object.fromEntries(
        GRADE_COLUMNS.map((name, index) => [name, values[index]!]),
      ),
    };
  });
}
