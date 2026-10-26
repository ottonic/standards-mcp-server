import { describe, expect, it } from "vitest";
import {
  PROCESS_LIMITS,
  PROCESS_SOURCE,
  checkLimit,
  processLimits,
  processProfile,
} from "../src/domain/process.js";
import {
  checkHandler,
  limitsHandler,
  listHandler,
} from "../src/tools/process-tools.js";

/**
 * The ratio form of a limit is the part worth testing: a 1 mm hole is fine in
 * 0.5 mm sheet and impossible in 6 mm plate, so a check that ignores thickness is
 * wrong in a way the number alone does not show.
 */
describe("process limits", () => {
  it("covers the processes a first pass needs", () => {
    expect(Object.keys(PROCESS_LIMITS)).toEqual([
      "cnc-machining",
      "sheet-metal",
      "injection-molding",
      "additive-sls",
    ]);
  });

  it("describes a process with its limits, conditions and source", () => {
    const profile = processProfile("cnc-machining");
    expect(profile.title).toMatch(/CNC machining/);
    expect(profile.appliesTo).toMatch(/metal and plastic/);
    expect(profile.limits.length).toBeGreaterThan(2);
    expect(profile.source).toBeTruthy();
    expect(profile.basis).toBe("advisory");
  });

  it("refuses an unknown process with the list of what it knows", () => {
    expect(() => processLimits("forging")).toThrowError(
      /not a process this server knows/,
    );
    expect(() => processLimits("forging")).toThrowError(/cnc-machining/);
  });

  it("marks every limit as advisory rather than normative", () => {
    expect(PROCESS_SOURCE.basis).toBe("advisory");
    expect(PROCESS_SOURCE.caveat).toMatch(/not shop capability/i);
  });
});

describe("feasibility checks", () => {
  it("passes a wall comfortably above the recommended minimum", () => {
    const result = checkLimit("cnc-machining", "wall_thickness", 3);
    expect(result.verdict).toBe("within");
    expect(result.thresholdApplied.kind).toBe("absolute");
  });

  it("warns between the hard limit and the recommendation", () => {
    // 0.5 mm is the hard limit, 0.8 mm the recommendation.
    const result = checkLimit("cnc-machining", "wall_thickness", 0.7);
    expect(result.verdict).toBe("warning");
    expect(result.limit).toBe(0.8);
  });

  it("reports a wall below the hard limit as beyond it", () => {
    const result = checkLimit("cnc-machining", "wall_thickness", 0.3);
    expect(result.verdict).toBe("exceeds");
    expect(result.note).toMatch(/design change or a different process/);
  });

  it("scales a ratio limit by the material thickness", () => {
    // Sheet metal hole-to-edge is 0.5x thickness at the hard limit, 1x recommended.
    // At 2 mm thickness the hard limit is 0.5x = 1 mm and the recommendation is
    // 1x = 2 mm, so a 1.5 mm ligament is makeable but below the recommendation.
    const thin = checkLimit("sheet-metal", "hole_to_edge", 1.5, {
      thickness: 2,
    });
    expect(thin.thresholdApplied.kind).toBe("thickness-ratio");
    expect(thin.limit).toBe(2);
    expect(thin.verdict).toBe("warning");

    const tooClose = checkLimit("sheet-metal", "hole_to_edge", 0.6, {
      thickness: 2,
    });
    expect(tooClose.verdict).toBe("exceeds");

    const thick = checkLimit("sheet-metal", "hole_to_edge", 0.6, {
      thickness: 0.5,
    });
    expect(thick.limit).toBe(0.25);
    expect(thick.verdict).toBe("within");
  });

  it("refuses a ratio limit when no thickness was supplied, and says why", () => {
    expect(() => checkLimit("sheet-metal", "hole_to_edge", 1)).toThrowError(
      /ratio of material thickness/,
    );
    expect(() => checkLimit("sheet-metal", "hole_to_edge", 1)).toThrowError(
      /thickness must be supplied/,
    );
  });

  it("accepts an override, so a specific shop's numbers can replace the default", () => {
    const result = checkLimit("sheet-metal", "hole_to_edge", 0.4, {
      thickness: 1,
      overrides: {
        hole_to_edge: { error: { min: { value: 0.3, unit: "mm" } } },
      },
    });
    expect(result.thresholdApplied.kind).toBe("absolute");
    expect(result.verdict).toBe("within");
  });

  it("refuses an unknown feature with the list for that process", () => {
    expect(() => checkLimit("cnc-machining", "draft_angle", 1)).toThrowError(
      /not a limit for cnc-machining/,
    );
  });

  it("refuses a non-positive measurement", () => {
    expect(() => checkLimit("cnc-machining", "wall_thickness", 0)).toThrowError(
      /positive number/,
    );
  });
});

describe("process tools", () => {
  it("lists every process so an unsupported one is visible up front", async () => {
    const result = await listHandler();
    const processes = result.processes as Array<{ process: string }>;
    expect(processes.map((p) => p.process)).toContain("sheet-metal");
    expect(result.note).toMatch(/not a shop's capability/i);
  });

  it("returns a process profile through the tool", async () => {
    const result = await limitsHandler({ process: "injection-molding" });
    expect(result.unit_note).toMatch(/draft_angle, which is degrees/);
    expect(result.notes as string[]).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/degrees, not millimetres/),
      ]),
    );
  });

  it("returns a structured verdict through the tool", async () => {
    const result = await checkHandler({
      process: "cnc-machining",
      feature: "wall_thickness",
      measured: 2.5,
    });
    expect(result.verdict).toBe("within");
    expect(result.basis).toBe("advisory");
    expect(result.source).toBeTruthy();
  });

  it("passes the thickness through for a ratio limit", async () => {
    const result = await checkHandler({
      process: "sheet-metal",
      feature: "hole_to_edge",
      measured: 1.2,
      thickness: 2,
    });
    expect(result.threshold_kind).toBe("thickness-ratio");
    expect(result.limit).toBe(2);
  });
});
