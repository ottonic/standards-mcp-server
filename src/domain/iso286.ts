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

export const ISO_286_EDITION = "iso286-1:2010";

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
 * Derived from the standard's own worked examples rather than from the sign of
 * the number: `n6` at 36 mm is es +33 / ei +17 with `n` tabulated as +17, so `n`
 * is an ei letter; `s6` there is es +43 / ei +27 with `s` tabulated as +43, so
 * `s` is an es letter; `p6` at 20 mm is es +35 / ei +22 with `p` tabulated as
 * +22, so `p` is an ei letter even though it sits above the zero line.
 */
const DEVIATION_BASIS: Readonly<Record<string, "es" | "ei">> = {
  c: "es",
  d: "es",
  e: "es",
  f: "es",
  g: "es",
  h: "es",
  j: "ei",
  k: "ei",
  m: "ei",
  n: "ei",
  p: "ei",
  r: "es",
  s: "es",
  t: "es",
  u: "es",
  v: "es",
  x: "es",
  y: "es",
  z: "es",
  za: "es",
  zb: "es",
  zc: "es",
};

/**
 * The delta correction, applied only where the standard's own worked examples
 * demand it.
 *
 * This is deliberately narrow. Measurement against those examples showed:
 *
 *   - `n6` at 36 mm is es +33 / ei +17, and the tabulated +17 is exactly the
 *     formula value `5·D^0.34 = 17.3`, so N needs **no** shift — applying one
 *     produced +38 instead of +33.
 *   - `s6` at 36 mm and `p6` at 20 mm likewise match with no shift.
 *   - `U6` at 40 mm is ES -55 / EI -71, which is the tabulated -60 shifted by
 *     -1..-6 depending on how the range is read.
 *
 * Because the U-family rule could not be reproduced reliably from the examples,
 * those letters are refused by `limitsOfSize` rather than approximated, and this
 * function stays a no-op until a verified source for their range is available.
 */
function deltaCorrection(): number {
  return 0;
}

/**
 * Letters whose tabulated value could not be reproduced from the standard's own
 * worked examples. Refusing is the honest answer: a wrong interference fit is
 * worse than a stated gap.
 */
const UNVERIFIED_LETTERS = new Set([
  "p",
  "r",
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
 * The fundamental deviation of a hole is the mirror of the same-letter shaft about
 * the zero line, which is why only shafts are tabulated above.
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
  const grade = Number.parseInt(match[2]!, 10);
  const upperLetter = letter.toUpperCase();
  const hole = letter === upperLetter;
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
    const tabulated = table[shaftKey];
    // j is checked first: it is present in the table for some steps but the
    // standard gives it no fundamental deviation and tabulates it per grade, so
    // the table value is not the deviation.
    if (
      shaftKey === "j" ||
      tabulated === undefined ||
      UNVERIFIED_LETTERS.has(shaftKey)
    ) {
      if (shaftKey === "j") {
        throw domainError(
          "unsupported_deviation",
          "'j' has no fundamental deviation or formula in the standard; it is tabulated " +
            "per grade and is not implemented here",
        );
      }
      throw domainError(
        "unsupported_deviation",
        `the fundamental deviation for '${letter}' is not implemented: its published ` +
          `range rule could not be reproduced from the standard's worked examples, and a ` +
          `wrong interference fit is worse than a stated gap. Implemented letters: ` +
          `${Object.keys(DEVIATION_BASIS)
            .filter((k) => !UNVERIFIED_LETTERS.has(k))
            .join(", ")}`,
      );
    }
    const basis = DEVIATION_BASIS[shaftKey]!;
    // A hole is the mirror of the same-letter shaft about the zero line: its upper
    // deviation is the negated shaft lower deviation.
    const shaftUpper =
      basis === "es" ? tabulated / 1000 : tabulated / 1000 + tolerance;
    const shaftLower = shaftUpper - tolerance;
    const delta = deltaCorrection();
    if (hole) {
      upper = -shaftLower + delta;
      lower = -shaftUpper;
    } else {
      upper = shaftUpper + delta;
      lower = shaftLower;
    }
  }

  const round = (value: number) => Number(value.toFixed(4));
  return {
    nominal,
    designation: `${letter}${grade}`,
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
  const maximumClearance = hole.upperLimit - shaft.lowerLimit;
  const minimumClearance = hole.lowerLimit - shaft.upperLimit;
  const type =
    minimumClearance >= 0
      ? "clearance"
      : maximumClearance > 0
        ? "transition"
        : "interference";
  const round = (value: number) => Number(value.toFixed(4));
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
