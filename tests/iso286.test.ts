import { describe, expect, it } from "vitest";
import {
  fit,
  itGrade,
  itTable,
  limitsOfSize,
  toleranceFactor,
  sizeStep,
} from "../src/domain/iso286.js";

/**
 * Every expectation here is a value the standard itself publishes. The worked
 * examples are the important ones: they are what caught the deviation-basis and
 * delta-correction errors that made `n6`, `s6` and `H7/n6` silently wrong.
 */
describe("ISO 286 tolerance grades", () => {
  it("reproduces the published IT table for every size step", () => {
    const steps = itTable();
    expect(steps).toHaveLength(13);
    // Spot-check the corners of the table across the whole span, including the
    // smallest step, where the arithmetic and the table diverge.
    expect(itGrade(1.5, 7)).toBe(10);
    expect(itGrade(1.5, 18)).toBe(1400);
    expect(itGrade(20, 7)).toBe(21);
    expect(itGrade(36, 6)).toBe(16);
    expect(itGrade(450, 7)).toBe(63);
    expect(itGrade(450, 18)).toBe(9700);
  });

  it("reports the factor, which is a cross-check rather than the source", () => {
    // 10-18 mm: D = 13.42, i = 1.083 um, and IT7 = 16i computes to 17.3 um
    // against a published 18 um. The table is normative; this is the check.
    expect(toleranceFactor(sizeStep(14))).toBeCloseTo(1.083, 2);
    expect(itGrade(14, 7)).toBe(18);
  });

  it("refuses a grade outside the tabulated range instead of guessing", () => {
    expect(() => itGrade(20, 19)).toThrowError(
      /not a standard tolerance grade/,
    );
  });

  it("refuses sizes above the tabulated span", () => {
    expect(() => itGrade(600, 7)).toThrowError(/not implemented/);
  });
});

describe("ISO 286 limits of size", () => {
  const examples: Array<[number, string, number, number]> = [
    [36, "H7", 0.025, 0],
    [36, "n6", 0.033, 0.017],
    [36, "s6", 0.043, 0.027],
    [40, "f7", -0.025, -0.05],
    [40, "H8", 0.039, 0],
    [20, "H7", 0.021, 0],
    [12, "h6", 0, -0.011],
    [12, "g6", -0.006, -0.017],
    [12, "H7", 0.018, 0],
  ];

  it.each(examples)(
    "%d%s deviates %d/%d",
    (nominal, designation, upper, lower) => {
      const limits = limitsOfSize(nominal, designation);
      expect(limits.upperDeviation).toBeCloseTo(upper, 9);
      expect(limits.lowerDeviation).toBeCloseTo(lower, 9);
      expect(limits.upperLimit - limits.lowerLimit).toBeCloseTo(
        upper - lower,
        9,
      );
    },
  );

  it("treats a bare H as a hole and a bare h as a shaft", () => {
    const hole = limitsOfSize(12, "H7");
    const shaft = limitsOfSize(12, "h6");
    expect(hole.hole).toBe(true);
    expect(shaft.hole).toBe(false);
    expect(hole.lowerDeviation).toBe(0);
    expect(shaft.upperDeviation).toBe(0);
  });

  it("carries the edition, because a tolerance with no revision is not a fact", () => {
    expect(limitsOfSize(20, "H7").edition).toBe("iso286-1:2010");
  });

  it("refuses deviations whose range rule it cannot reproduce", () => {
    // Refusing beats approximating: a wrong interference fit reads as a real
    // answer, while a stated gap sends the caller to the standard.
    expect(() => limitsOfSize(40, "U6")).toThrowError(/not implemented/);
    expect(() => limitsOfSize(20, "p6")).toThrowError(/not implemented/);
    expect(() => limitsOfSize(20, "j6")).toThrowError(
      /no fundamental deviation/,
    );
  });

  it("rejects a malformed designation with an actionable message", () => {
    expect(() => limitsOfSize(20, "X")).toThrowError(
      /expected a deviation letter and a grade/,
    );
  });
});

describe("ISO 286 fits", () => {
  it("reproduces the standard transition fit 36 H7/n6", () => {
    const result = fit(36, "H7", "n6");
    expect(result.type).toBe("transition");
    // The standard gives a minimum clearance of +0.008 and an interference of 0.033.
    expect(result.maximumClearance).toBeCloseTo(0.008, 9);
    expect(result.maximumInterference).toBeCloseTo(0.033, 9);
    expect(result.minimumClearance).toBeLessThan(0);
  });

  it("classifies a hole-basis clearance fit", () => {
    const result = fit(12, "H7", "h6");
    expect(result.type).toBe("clearance");
    expect(result.minimumClearance).toBe(0);
    expect(result.maximumClearance).toBeCloseTo(0.029, 9);
    expect(result.maximumInterference).toBe(0);
  });

  it("classifies a locational clearance fit", () => {
    const result = fit(25, "H8", "f7");
    expect(result.type).toBe("clearance");
    expect(result.minimumClearance).toBeCloseTo(0.02, 9);
    expect(result.maximumClearance).toBeCloseTo(0.074, 9);
  });
});
