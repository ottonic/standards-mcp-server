#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { pathToFileURL } from "node:url";
import { realpathSync } from "node:fs";
import pkg from "../package.json" with { type: "json" };
import { logEvent } from "./logging.js";
import { runTool } from "./tool-helper.js";
import { SERVER_NAME, PROTOCOL_VERSION, CACHE_TTL_MS } from "./identity.js";
import { TOOL_REGISTRY } from "./tools/registry.js";

export function createServer() {
  const server = new McpServer(
    { name: SERVER_NAME, version: pkg.version },
    {
      // Static tool set: no list-changed notifications. Cached catalogs help
      // clients and prompt caches (SEP-2549).
      capabilities: { tools: { listChanged: false } },
      instructions:
        "Reference standards for mechanical engineering: tolerance values, fits, and general tolerances. " +
        "Use list_standards to see what is covered before answering, limits_of_size to interpret a toleranced dimension such as 40H7, " +
        "fit to see what a hole and shaft pair does at one nominal size, it_grade for a tolerance value on its own, " +
        "general_tolerance for what a note such as ISO 2768-m implies for an unmarked dimension, and general_tolerance_complies to check a stated deviation against it. " +
        "All values are reference facts from published standards; whether a design is acceptable, whether a fit suits a joint, and whether a tolerance can be achieved stay with the caller. " +
        "Coverage is partial: where a value could not be verified against the standard it is refused with a reason rather than approximated.",
      cacheHints: {
        "server/discover": { ttlMs: CACHE_TTL_MS, cacheScope: "public" },
        "tools/list": { ttlMs: CACHE_TTL_MS, cacheScope: "public" },
      },
    },
  );

  for (const tool of TOOL_REGISTRY) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema,
      },
      // The registry intentionally contains heterogeneous tool schemas.
      // MCP validates each tool's input before this adapter runs.
      (args: unknown) => runTool(tool.name, () => tool.handler(args)),
    );
  }

  return server;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
) {
  // Serve the 2025-era handshake as well: stock MCP hosts negotiate
  // 2025-11-25, and the same factory serves both eras.
  const handle = serveStdio(createServer, { legacy: "serve" });
  logEvent("server.started", {
    tools: TOOL_REGISTRY.length,
    protocol: PROTOCOL_VERSION,
  });

  let closing: Promise<void> | undefined;
  const close = () => (closing ??= handle.close());
  process.once("SIGINT", () => void close());
  process.once("SIGTERM", () => void close());
  process.stdin.once("end", () => void close());
}
