import { z } from "zod";
import * as iso286 from "./iso286-tools.js";
import * as iso2768 from "./iso2768-tools.js";
import * as materials from "./material-tools.js";
import * as process from "./process-tools.js";

/**
 * What this server implements, and what it deliberately does not.
 *
 * The coverage list is part of the contract: a caller must be able to find out
 * that, say, an interference fit above `n` is refused, without discovering it from
 * a failure. `list_standards` is the tool that answers it.
 */

export interface ToolSpec {
  name: string;
  title: string;
  description: string;
  purpose: string;
  examples: readonly unknown[];
  inputSchema: z.ZodType;
  outputSchema: z.ZodType;
  handler: (args: unknown) => Promise<Record<string, unknown>>;
}

function defineTool<I>(tool: {
  name: string;
  title: string;
  description: string;
  purpose: string;
  examples: readonly unknown[];
  inputSchema: z.ZodType<I>;
  outputSchema: z.ZodType;
  handler: (args: I) => Promise<Record<string, unknown>>;
}): ToolSpec {
  return { ...tool, handler: (args: unknown) => tool.handler(args as I) };
}

const record = z.record(z.string(), z.unknown());

export const TOOL_REGISTRY: ToolSpec[] = [
  defineTool({
    name: "list_standards",
    title: "List Standards Coverage",
    description:
      "List the standards this server implements, and what within each one is not covered. Call this first when a question mentions a standard, so you know whether the value you need is available before you promise an answer. " +
      "Coverage is partial by design: unimplemented values are refused with a stated reason rather than approximated.",
    purpose: "Which standards are implemented, and their known gaps.",
    examples: [{}],
    inputSchema: iso286.tableSchema,
    outputSchema: record,
    handler: async () => ({
      standards: [
        {
          id: "iso286-1:2010+cor1:2013",
          title: "ISO code system for tolerances on linear sizes",
          covers: [
            "standard tolerance grades IT1 to IT18, sizes up to 500 mm",
            "verified limits of size for shaft deviation letters c, d, e, f, g, h, k, m, n and s, with their ISO-defined size ranges",
            "shaft u is supported only for nominal sizes above 30 mm through 40 mm",
            "verified hole classes C, D, E, F, G, H and JS",
            "hole deviations K, M, N and P to ZC are refused: their ISO grade/size rules are not yet implemented",
            "j is refused: its deviations are tabulated by grade rather than defined by a fundamental deviation",
          ],
          does_not_cover: [
            "shaft deviation letters p, r, t, v, x, y, z, za, zb, zc: table rows are not yet verified for every supported size and grade",
            "nominal sizes above 500 mm",
            "the inch counterparts (ANSI B4.2)",
          ],
        },
        {
          id: "iso2768-1:1989",
          title: "General tolerances for linear and angular dimensions",
          covers: [
            "Table 1 linear dimensions, classes f, m, c and v, sizes 0.5 to 4000 mm",
            "Table 2 broken edges (external radii and chamfer heights), classes f and c only",
            "Table 3 angular dimensions, classes f, c and v, keyed by the shorter side of the angle",
            "whether a stated deviation complies with a general-tolerance note",
          ],
          does_not_cover: [
            "ISO 2768-2:1989 geometrical tolerance classes H, K and L: that part was withdrawn and replaced by ISO 22081:2021, which has no such classes",
            "class m and v for broken edges, and class m for angular dimensions, which the standard does not tabulate",
          ],
        },
        {
          id: "materials (typical values)",
          title: "Indicative material properties, from an Apache-2.0 reference",
          covers: [
            `${materials.materialCoverage().grades} grades across ${materials.materialCoverage().families.length} families`,
            "density, yield and ultimate strength, Young's modulus, Poisson's ratio, elongation, thermal expansion, maximum service temperature",
            "all converted to SI, and every value tagged basis: typical",
          ],
          does_not_cover: [
            "design allowables: no A-basis or B-basis values, which is what a strength margin needs",
            "fatigue, creep, high-temperature or corrosion data",
            "material specifications or standards conformance",
            "any property not published in the source reference",
          ],
        },
        {
          id: "process limits (rules of thumb)",
          title:
            "Geometric feasibility limits for common manufacturing processes",
          covers: [
            "cnc-machining, sheet-metal, injection-molding and additive-sls",
            "minimum wall, hole-to-edge and hole-to-bend distances, internal corner radius, bend radius, draft angle, pocket depth-to-width",
            "limits expressed either as an absolute size or as a ratio of material thickness",
          ],
          does_not_cover: [
            "a specific shop's capability: no public dataset of that exists, so it has to come from the supplier",
            "achievable tolerance and surface finish per process",
            "cost, lead time, tooling, or production volume effects",
          ],
        },
      ],
      note: "Values come from the published tables, which are normative; the tolerance factor is used only as a cross-check because it diverges from the table at the smallest size step.",
    }),
  }),
  defineTool({
    name: "limits_of_size",
    title: "Limits of Size for a Tolerance Class",
    description:
      "Return the upper and lower deviations, and the resulting limits, for one tolerance class at one nominal size, such as 36H7 or 36g6. " +
      "Uppercase is a hole, lowercase a shaft. Values are millimetres and are deviations from the nominal size. " +
      "Use this to interpret a toleranced dimension; whether the resulting limits suit a joint is an engineering decision.",
    purpose: "Upper and lower deviations and limits for one tolerance class.",
    examples: iso286.limitsExamples,
    inputSchema: iso286.limitsSchema,
    outputSchema: record,
    handler: iso286.limitsHandler,
  }),
  defineTool({
    name: "fit",
    title: "Fit Between a Hole and a Shaft",
    description:
      "Return the resulting fit between one hole class and one shaft class at the same nominal size, such as 12 H7/h6: the type (clearance, transition or interference), the minimum and maximum clearance, and the maximum interference. " +
      "Values are millimetres. A negative minimum clearance means the fit can interfere. " +
      "This reports the geometry of the fit, not whether it is the right choice for a joint, which depends on function and is the caller's decision.",
    purpose: "Type, clearance and interference for a hole and shaft pair.",
    examples: iso286.fitExamples,
    inputSchema: iso286.fitSchema,
    outputSchema: record,
    handler: iso286.fitHandler,
  }),
  defineTool({
    name: "it_grade",
    title: "Standard Tolerance Grade Value",
    description:
      "Return the standard tolerance value for one IT grade at one nominal size, in micrometres and millimetres, with the size step it came from. " +
      "Use this when a drawing or a calculation needs the tolerance width itself, rather than the limits of a specific class.",
    purpose: "The tolerance value for one IT grade at one size.",
    examples: iso286.gradeExamples,
    inputSchema: iso286.gradeSchema,
    outputSchema: record,
    handler: iso286.gradeHandler,
  }),
  defineTool({
    name: "general_tolerance",
    title: "ISO 2768-1 General Tolerance",
    description:
      "Return the deviation that a general-tolerance note such as ISO 2768-m implies for one dimension, so an unmarked dimension can be checked. " +
      "The tables differ by what they cover: linear dimensions, broken edges (external radii and chamfer heights), and angular dimensions, which are keyed by the shorter side of the angle rather than the nominal size. " +
      "A general tolerance applies only where the drawing gives no individual tolerance, so check for one first.",
    purpose: "The deviation implied by an ISO 2768-1 class for one dimension.",
    examples: iso2768.generalExamples,
    inputSchema: iso2768.generalSchema,
    outputSchema: record,
    handler: iso2768.generalHandler,
  }),
  defineTool({
    name: "general_tolerance_complies",
    title: "Check a Deviation Against an ISO 2768-1 Note",
    description:
      "Compare a deviation the drawing states for one dimension against what the general-tolerance note permits, and report whether it complies. " +
      "Answers the common review question: is +/-0.1 on a 45 mm dimension acceptable under an ISO 2768-m note? " +
      "A tighter stated tolerance is always allowed, so a non-compliant result means the stated tolerance is looser than the note. " +
      "This compares the two numbers; whether the dimension can actually be produced to either value is not something this server knows.",
    purpose:
      "Whether a stated deviation is within the general-tolerance class.",
    examples: iso2768.complianceExamples,
    inputSchema: iso2768.complianceSchema,
    outputSchema: record,
    handler: iso2768.complianceHandler,
  }),
  defineTool({
    name: "material_properties",
    title: "Material Properties (Typical Values)",
    description:
      "Look up indicative material properties for a common metal or plastic by designation, such as 6061-T6, 304 or Ti-6Al-4V. " +
      "Returns density, yield and ultimate strength, Young's modulus, Poisson's ratio, elongation, thermal expansion and maximum service temperature, all in SI. " +
      "These are TYPICAL handbook values, not design allowables: every value is tagged basis: typical. " +
      "Use them to compare materials, estimate mass, or supply an indicative modulus to an analysis; obtain an allowable from a qualified source before relying on a strength margin. " +
      "An unmatched designation means this reference does not hold it, not that the material does not exist.",
    purpose:
      "Indicative SI properties for a common material, tagged as typical.",
    examples: materials.lookupExamples,
    inputSchema: materials.lookupSchema,
    outputSchema: record,
    handler: materials.lookupHandler,
  }),
  defineTool({
    name: "material_coverage",
    title: "What Material Data Is Held",
    description:
      "List what the material reference holds and what it does not. Call this when a material was not found, or before promising a property, so a gap is visible rather than assumed. " +
      "The reference is limited to typical values for common metals and plastics: it holds no design allowables, no fatigue data and no high-temperature data.",
    purpose: "The material reference's coverage and its known gaps.",
    examples: [{}],
    inputSchema: materials.propertiesSchema,
    outputSchema: record,
    handler: materials.propertiesHandler,
  }),
  defineTool({
    name: "process_limits",
    title: "Manufacturing Process Limits",
    description:
      "Describe what a manufacturing process can hold: minimum wall thickness, minimum hole-to-edge " +
      "and hole-to-bend distances, minimum internal corner radius, bend radius, draft angle, pocket depth-to-width ratio. " +
      "Call process_feasibility to test one measured feature against these. " +
      "These are published rules of thumb for geometric feasibility, not a specific shop's capability, and they say nothing about cost or lead time.",
    purpose: "Published feasibility limits for one manufacturing process.",
    examples: process.limitsExamples,
    inputSchema: process.limitsSchema,
    outputSchema: record,
    handler: process.limitsHandler,
  }),
  defineTool({
    name: "process_feasibility",
    title: "Check a Feature Against Process Limits",
    description:
      "Compare one measured feature against a manufacturing process's limits and report whether it is within, marginal, or beyond them. " +
      "Some limits are expressed as a ratio of material thickness rather than an absolute size — a 1 mm hole is fine in thin sheet and difficult in thick plate — so supply the thickness when the limit needs it. " +
      "A result inside the limits is not a promise that a shop can make the part, or an estimate of what it costs. " +
      "Pair this with a measured wall or hole size from a CAD server to answer whether a part suits a process.",
    purpose:
      "Whether a measured feature is within a process's published limits.",
    examples: process.checkExamples,
    inputSchema: process.checkSchema,
    outputSchema: record,
    handler: process.checkHandler,
  }),
  defineTool({
    name: "process_list",
    title: "List Manufacturing Processes",
    description:
      "List the manufacturing processes this server has limits for, and which features each one covers. " +
      "Call this first when a question names a process, so an unsupported process is visible before a check fails.",
    purpose: "Which processes and features are covered.",
    examples: [{}],
    inputSchema: process.listSchema,
    outputSchema: record,
    handler: process.listHandler,
  }),
];

export const PUBLIC_TOOL_NAMES = TOOL_REGISTRY.map((tool) => tool.name);
