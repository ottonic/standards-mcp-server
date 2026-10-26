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
    // Annex B, Example 3: s6 is es +59 / ei +43 µm. Table 5 labels the
    // tabulated s value as ei; the former fixture incorrectly treated it as es.
    [36, "s6", 0.059, 0.043],
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
    expect(limitsOfSize(20, "H7").edition).toBe("iso286-1:2010+cor1:2013");
  });

  it("refuses classes whose tables and applicability are not implemented", () => {
    // Refusing beats approximating: a wrong interference fit reads as a real
    // answer, while a stated gap sends the caller to the standard.
    expect(() => limitsOfSize(40, "U6")).toThrowError(
      /grade- and size-specific/,
    );
    expect(() => limitsOfSize(20, "p6")).toThrowError(/not supported/);
    expect(() => limitsOfSize(20, "K7")).toThrowError(
      /grade- and size-specific/,
    );
    expect(() => limitsOfSize(60, "M6")).toThrowError(
      /grade- and size-specific/,
    );
    expect(() => limitsOfSize(20, "N6")).toThrowError(
      /grade- and size-specific/,
    );
    expect(() => limitsOfSize(36, "S6")).toThrowError(
      /grade- and size-specific/,
    );
    expect(() => limitsOfSize(45, "u6")).toThrowError(/not supported/);
    expect(() => limitsOfSize(30, "u6")).toThrowError(/not supported/);
    expect(() => limitsOfSize(20, "j6")).toThrowError(
      /no fundamental deviation/,
    );
  });

  it.each([
    [40, "c7", -0.12, -0.145],
    [50, "c7", -0.13, -0.155],
    [65, "c7", -0.14, -0.17],
    [80, "c7", -0.15, -0.18],
    [100, "c7", -0.17, -0.205],
    [120, "c7", -0.18, -0.215],
    [140, "c7", -0.2, -0.24],
    [160, "c7", -0.21, -0.25],
    [180, "c7", -0.23, -0.27],
    [200, "c7", -0.24, -0.286],
    [225, "c7", -0.26, -0.306],
    [250, "c7", -0.28, -0.326],
    [280, "c7", -0.3, -0.352],
    [315, "c7", -0.33, -0.382],
    [355, "c7", -0.36, -0.417],
    [400, "c7", -0.4, -0.457],
    [450, "c7", -0.44, -0.503],
    [500, "c7", -0.48, -0.543],
    [40, "s6", 0.059, 0.043],
    [50, "s6", 0.059, 0.043],
    [65, "s6", 0.072, 0.053],
    [80, "s6", 0.078, 0.059],
    [100, "s6", 0.093, 0.071],
    [120, "s6", 0.101, 0.079],
    [140, "s6", 0.117, 0.092],
    [160, "s6", 0.125, 0.1],
    [180, "s6", 0.133, 0.108],
    [200, "s6", 0.151, 0.122],
    [225, "s6", 0.159, 0.13],
    [250, "s6", 0.169, 0.14],
    [280, "s6", 0.19, 0.158],
    [315, "s6", 0.202, 0.17],
    [355, "s6", 0.226, 0.19],
    [400, "s6", 0.244, 0.208],
    [450, "s6", 0.272, 0.232],
    [500, "s6", 0.292, 0.252],
  ])(
    "uses the published subdivided deviation at %d mm for %s",
    (nominal, designation, upper, lower) => {
      const result = limitsOfSize(nominal, designation);
      expect(result.upperDeviation).toBeCloseTo(upper, 9);
      expect(result.lowerDeviation).toBeCloseTo(lower, 9);
    },
  );

  it("supports u only on the verified (30, 40] mm row", () => {
    const lowerInterior = limitsOfSize(30.001, "u6");
    expect(lowerInterior.lowerDeviation).toBe(0.06);
    const result = limitsOfSize(40, "u6");
    expect(result.upperDeviation).toBe(0.076);
    expect(result.lowerDeviation).toBe(0.06);
  });

  it.each([
    [20, 3, 0],
    [20, 4, 0.002],
    [20, 7, 0.002],
    [20, 8, 0],
  ])(
    "applies the k grade column at %d mm, IT%d",
    (nominal, grade, expectedEi) => {
      expect(limitsOfSize(nominal, `k${grade}`).lowerDeviation).toBeCloseTo(
        expectedEi,
        9,
      );
    },
  );

  it("rejects a malformed designation with an actionable message", () => {
    expect(() => limitsOfSize(20, "X")).toThrowError(
      /expected a deviation letter and a grade/,
    );
  });

  it("preserves the distinction between IT01 and IT1", () => {
    expect(limitsOfSize(20, "H01").designation).toBe("H01");
    expect(limitsOfSize(20, "H01").tolerance).toBe(0.0006);
    expect(limitsOfSize(20, "H1").tolerance).toBe(0.0015);
    expect(() => limitsOfSize(20, "H02")).toThrowError(
      /not a standard tolerance grade/,
    );
  });

  it("rejects mixed-case tolerance letters", () => {
    expect(() => limitsOfSize(20, "Js7")).toThrowError(/mixed-case/);
    expect(() => limitsOfSize(20, "jS7")).toThrowError(/mixed-case/);
  });

  it("preserves half-micrometre symmetric limits", () => {
    const result = limitsOfSize(20, "JS1");
    expect(result.upperDeviation).toBe(0.00075);
    expect(result.lowerDeviation).toBe(-0.00075);
    expect(result.upperDeviation - result.lowerDeviation).toBe(
      result.tolerance,
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

  it("reproduces the standard interference fit 36 H7/s6", () => {
    const result = fit(36, "H7", "s6");
    expect(result.type).toBe("interference");
    expect(result.maximumInterference).toBeCloseTo(0.059, 9);
    expect(result.minimumInterference).toBeCloseTo(0.018, 9);
  });

  it("computes the verified 40 H7/u6 press fit", () => {
    const result = fit(40, "H7", "u6");
    expect(result.type).toBe("interference");
    expect(result.minimumInterference).toBeCloseTo(0.035, 9);
    expect(result.maximumInterference).toBeCloseTo(0.076, 9);
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

  it("rejects hole/shaft arguments in the wrong roles", () => {
    expect(() => fit(20, "h7", "H6")).toThrowError(/uppercase hole class/);
  });
});
