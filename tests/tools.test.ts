import { describe, expect, it } from "vitest";
import { TOOL_REGISTRY, PUBLIC_TOOL_NAMES } from "../src/tools/registry.js";
import {
  fitHandler,
  gradeHandler,
  limitsHandler,
  tableHandler,
} from "../src/tools/iso286-tools.js";
import {
  complianceHandler,
  generalHandler,
  tableHandler as iso2768TableHandler,
} from "../src/tools/iso2768-tools.js";

/**
 * The tool layer is a contract with a caller that cannot read the source: a
 * wrong field name or a missing refusal is the difference between a usable
 * answer and a plausible-looking one.
 */
describe("tool registry", () => {
  it("exposes eleven uniquely named tools", () => {
    expect(PUBLIC_TOOL_NAMES).toEqual([
      "list_standards",
      "limits_of_size",
      "fit",
      "it_grade",
      "general_tolerance",
      "general_tolerance_complies",
      "material_properties",
      "material_coverage",
      "process_limits",
      "process_feasibility",
      "process_list",
    ]);
    expect(new Set(PUBLIC_TOOL_NAMES).size).toBe(PUBLIC_TOOL_NAMES.length);
  });

  it("gives every tool a declared output schema and at least one example", () => {
    for (const tool of TOOL_REGISTRY) {
      expect(tool.outputSchema).toBeDefined();
      expect(tool.examples.length).toBeGreaterThan(0);
      expect(tool.description.length).toBeGreaterThan(50);
    }
  });

  it("states the limits and the non-verdict boundary in the descriptions", () => {
    // The eval grades whether the caller distinguishes facts from judgements, so
    // the tool text has to make that distinction itself.
    const fit = TOOL_REGISTRY.find((tool) => tool.name === "fit")!;
    expect(fit.description).toMatch(/not whether it is the right choice/i);
    const limits = TOOL_REGISTRY.find(
      (tool) => tool.name === "limits_of_size",
    )!;
    expect(limits.description).toMatch(/engineering decision/i);
    const list = TOOL_REGISTRY.find((tool) => tool.name === "list_standards")!;
    expect(list.description).toMatch(/refused/i);
  });
});

describe("tool handlers", () => {
  it("reports deviations and limits for a hole", async () => {
    const result = await limitsHandler({ nominal: 36, designation: "H7" });
    expect(result.upper_deviation).toBe(0.025);
    expect(result.lower_deviation).toBe(0);
    expect(result.lower_limit).toBe(36);
    expect(result.upper_limit).toBe(36.025);
    expect(result.hole).toBe(true);
    expect(result.standard).toBe("iso286-1:2010+cor1:2013");
  });

  it("reports the standard transition fit", async () => {
    const result = await fitHandler({ nominal: 36, hole: "H7", shaft: "n6" });
    expect(result.type).toBe("transition");
    expect(result.maximum_clearance).toBeCloseTo(0.008, 9);
    expect(result.maximum_interference).toBeCloseTo(0.033, 9);
    expect(result.limits.hole).toEqual({
      upper_deviation: 0.025,
      lower_deviation: 0,
    });
    expect(result.minimum_interference).toBe(0);
  });

  it("returns both interference bounds for a fully interfering fit", async () => {
    const result = await fitHandler({ nominal: 36, hole: "H7", shaft: "s6" });
    expect(result.type).toBe("interference");
    expect(result.minimum_interference).toBeCloseTo(0.018, 9);
    expect(result.maximum_interference).toBeCloseTo(0.059, 9);
  });

  it("exposes the source-bounded 40 H7/u6 fit through the MCP handler", async () => {
    const result = await fitHandler({ nominal: 40, hole: "H7", shaft: "u6" });
    expect(result.type).toBe("interference");
    expect(result.minimum_interference).toBeCloseTo(0.035, 9);
    expect(result.maximum_interference).toBeCloseTo(0.076, 9);
    expect(result.standard).toBe("iso286-1:2010+cor1:2013");
  });

  it("reports a grade in both units with the size step it came from", async () => {
    const result = await gradeHandler({ nominal: 20, grade: 7 });
    expect(result.grade).toBe("IT7");
    expect(result.tolerance_micrometres).toBe(21);
    expect(result.tolerance_mm).toBe(0.021);
    expect(result.size_step_mm).toEqual({ over: 18, up_to: 30 });
  });

  it("lists the whole published grade table", async () => {
    const result = await tableHandler();
    const steps = result.steps as Array<{ grades: Record<string, number> }>;
    expect(steps).toHaveLength(13);
    expect(steps[0]!.grades.IT7).toBe(10);
    expect(steps[12]!.grades.IT18).toBe(9700);
  });
});

describe("ISO 2768 tool handlers", () => {
  it("answers the common review question: +/-0.1 on a 45 mm dimension under ISO 2768-m", async () => {
    const result = await complianceHandler({
      nominal: 45,
      tolerance_class: "m",
      stated_deviation: 0.1,
    });
    expect(result.permitted_deviation).toBe(0.3);
    expect(result.complies).toBe(true);
    expect(result.unit).toBe("mm");
  });

  it("reads the class out of a drawing-style note", async () => {
    const result = await generalHandler({
      nominal: 45,
      tolerance_class: "ISO 2768-m",
    });
    expect(result.deviation).toBe(0.3);
    expect(result.kind).toBe("linear");
    expect(result.applies_to).toBe("linear dimensions except broken edges");
  });

  it("routes broken edges and angles to their own tables", async () => {
    const edge = await generalHandler({
      nominal: 45,
      tolerance_class: "f",
      kind: "broken-edge",
    });
    expect(edge.deviation).toBe(1);
    expect(edge.applies_to).toBe("external radii and chamfer heights");
    const angle = await generalHandler({
      nominal: 45,
      tolerance_class: "f",
      kind: "angular",
    });
    expect(angle.unit).toBe("deg");
  });

  it("names the withdrawn ISO 2768-2 in its table listing", async () => {
    const result = await iso2768TableHandler();
    expect(result.standard).toBe("iso2768-1:1989");
    expect(String(result.note)).toMatch(/ISO 22081:2021/);
    expect(result.steps).toHaveLength(8);
  });
});
