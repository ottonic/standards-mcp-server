# Security

## Posture

The server is a pure reference layer. It holds published standard values and
returns them; it has no file access, no persistence, and no state between calls,
so the attack surface is the tool arguments themselves.

## Current local mode

Assumptions:

- The operator runs the server on their own machine or a controlled environment.
- Callers supply selection arguments only (standard, size range, grade, material,
  process). There is no artifact to read.
- No network access is required by any operation.

Guardrails already implemented:

- **No file access and no persistence.** The server never opens a file and writes
  nothing. `just check` is keyless and needs no data files; the values are in the
  source.
- **Declared input schemas.** Every tool declares a Zod input schema that the MCP
  SDK enforces before the handler runs (`src/tools/registry.ts`).
- **No shell, no arbitrary code.** No child processes, no `eval`, and no lookup
  built from unvalidated input.
- **No inference.** A value with no attributable revision is refused rather than
  approximated, and every refusal carries a reason, so a caller cannot receive a
  fabricated number.
- **Secrets.** No credentials are read or logged, and `.env` is not auto-loaded.
  Structured logs go to stderr as pino JSON.

## Hosted or composed mode

If the server is hosted, or a remote capability reaches it:

- authenticate and authorize callers before the server is reachable;
- keep the package and its dependency tree patched;
- do not attach user data to the process; the server needs none.

A domain server must not infer consent from being connected through an MCP host;
the host must show users which capabilities receive their data and whether
processing is local or remote.

## Report language

Values are what a standard specifies, attributable to an edition. They are not
design allowables, manufacturing approval, or compliance. An unsupported
combination is stated, never interpolated, and a missing value is not evidence of
absence.
