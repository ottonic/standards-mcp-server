import { z } from "zod";
import * as iso286 from "./iso286-tools.js";

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
          id: "iso286-1:2010",
          title: "ISO code system for tolerances on linear sizes",
          covers: [
            "standard tolerance grades IT1 to IT18, sizes up to 500 mm",
            "limits of size for deviation letters c, d, e, f, g, h",
            "j is not implemented: the standard gives it no fundamental deviation",
            "shaft letters k, m, n and their hole equivalents",
          ],
          does_not_cover: [
            "deviation letters p, r, t, u, v, x, y, z, za, zb, zc: the range rule for these could not be reproduced from the standard's worked examples, so they are refused",
            "nominal sizes above 500 mm",
            "the inch counterparts (ANSI B4.2)",
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
];

export const PUBLIC_TOOL_NAMES = TOOL_REGISTRY.map((tool) => tool.name);
