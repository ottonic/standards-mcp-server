# Third-Party Notices

Standards MCP Server is MIT licensed; see [LICENSE](LICENSE).

## Dependencies

- `@modelcontextprotocol/server` 2.3.1 — Apache-2.0
- `pino` — MIT
- `zod` — MIT

## Data sources

- **Material property values** are derived from
  [`KittyCAD/material-properties`](https://github.com/KittyCAD/material-properties),
  licensed under the Apache License 2.0. The values are transcribed into
  `src/domain/materials.ts`; the source's license and attribution are reproduced
  here as that license requires.
- **Process feasibility data** follows the shape of
  [`open-mrp/dfm`](https://github.com/open-mrp/dfm) (Apache-2.0), with the
  published limits drawn from commonly published DFM guidance.

ISO 286 and ISO 2768 values are the published tables, which are normative; they
are not third-party source code, and every response carries the edition it came
from.
