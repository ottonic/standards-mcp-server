# Standards MCP Server — contributor instructions

- Keep the server a pure reference layer: no CAD file, no persisted state, no
  engineering verdict. It reports what a standard specifies and stops there.
- Values must come from the published tables and be attributable to an edition. A
  value with no revision is not a fact; refuse rather than approximate.
- Keep `list_standards` synchronized with the registry, so a caller can see what is
  covered and what is deliberately not.
- Every refusal carries a reason; unsupported combinations are stated, never
  guessed or interpolated.
- Advertised tool schemas must be self-contained: inline `$defs`, no external
  `$ref` that a client would have to dereference.
- Use strict TypeScript, ESM imports with `.js` extensions, single quotes, and the
  existing Prettier/oxlint conventions.
- Prefer the `just` recipes. `just check` is keyless and needs no data files.

See the [README](README.md) for the tool surface and coverage.
