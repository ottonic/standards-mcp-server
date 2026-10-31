/** Independent j/J transcription from ISO 286-1:2010 Tables 2 and 4. */
export const jHoleShaftRanges = [
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
] as const;

/**
 * Table 4's j columns are labelled "Lower deviation, ei". j5 and j6 share a
 * column; j8 is published only at the first size step.
 */
export const shaftJLowerDeviationUm: Record<number, readonly (number | null)[]> = {
  5: [-2, -2, -2, -3, -4, -5, -7, -9, -11, -13, -16, -18, -20],
  6: [-2, -2, -2, -3, -4, -5, -7, -9, -11, -13, -16, -18, -20],
  7: [-4, -4, -5, -6, -8, -10, -12, -15, -18, -21, -26, -28, -32],
  8: [-6, null, null, null, null, null, null, null, null, null, null, null, null],
};

/** Table 2's J columns are upper deviations ES. */
export const holeJUpperDeviationUm = {
  6: [2, 5, 5, 6, 8, 10, 13, 16, 18, 22, 25, 29, 33],
  7: [4, 6, 8, 10, 12, 14, 18, 22, 26, 30, 36, 39, 43],
  8: [6, 10, 12, 15, 20, 24, 28, 34, 41, 47, 55, 60, 66],
} as const;
