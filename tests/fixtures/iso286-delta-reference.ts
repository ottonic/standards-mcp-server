/** Independent transcription of the IT3–IT8 Δ columns in ISO 286-1 Table 3. */
export const deltaReferenceRanges = [
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

/** Columns are IT3 through IT8; values are µm. */
export const deltaReferenceValuesUm = [
  [0, 0, 0, 0, 0, 0],
  [1, 1.5, 1, 3, 4, 6],
  [1, 1.5, 2, 3, 6, 7],
  [1, 2, 3, 3, 7, 9],
  [1.5, 2, 3, 4, 8, 12],
  [1.5, 3, 4, 5, 9, 14],
  [2, 3, 5, 6, 11, 16],
  [2, 4, 5, 7, 13, 19],
  [3, 4, 6, 7, 15, 23],
  [3, 4, 6, 9, 17, 26],
  [4, 4, 7, 9, 20, 29],
  [4, 5, 7, 11, 21, 32],
  [5, 5, 7, 13, 23, 34],
] as const;
