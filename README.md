# Ottoref — Standards MCP Server

Reference standards for mechanical engineering, as data an assistant can query:
ISO 286 limits and fits, ISO 2768 general tolerances, indicative material
properties, and published process feasibility limits. Nothing here comes from a
CAD file — it is the reference layer that turns a measurement, or a
measurement-plus-drawing question, into an answer you can cite.

Every value is taken from the published tables, carries the edition it came from,
and is checked against independent fixtures. Anything the server cannot verify, it
**refuses with a reason** rather than approximating — so a number from this server
is one you can put your name to.

## Tools

| Tool                         | Returns                                                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `list_standards`             | Which standards are implemented, and what within each is covered.                                                     |
| `limits_of_size`             | Upper and lower deviations and limits for one ISO 286 class at one nominal size, e.g. `36H7`.                         |
| `iso286_applicability`       | Exact size intervals where one ISO 286 tolerance class is supported, e.g. `H7`, `j5` or `N9`.                         |
| `fit`                        | Fit type, clearance and interference for a hole and shaft pair at one nominal size, e.g. `12 H7/h6`.                  |
| `it_grade`                   | The standard tolerance value for one IT grade at one size, in micrometres and millimetres (`IT01`, `IT0`, `IT1`–`IT18`). |
| `general_tolerance`          | The ISO 2768-1 general tolerance for a class: linear, broken-edge, or angular.                                         |
| `general_tolerance_complies` | Whether a stated deviation complies with a general-tolerance note.                                                     |
| `material_properties`        | Typical SI properties for one material designation.                                                                   |
| `material_coverage`          | Which material grades and families are covered.                                                                        |
| `process_limits`             | Published geometric feasibility limits for a process.                                                                 |
| `process_feasibility`        | A check of a stated value against those process limits.                                                               |
| `process_list`               | Which processes are covered.                                                                                           |

## What it covers

**ISO 286-1:2010, with Cor 1:2013 applied** provides standard tolerance grades
IT01, IT0 and IT1 to IT18 for nominal sizes up to 500 mm. Shaft limits cover
`c`–`h`, `k`, `m`, `n`, `p`, `r`–`v`, `x`–`z`, and `za`–`zc` where Table 4/5
publishes a cell, using its exact size intervals and grade rules. Verified hole
classes `C, D, E, F, G, H, JS, K, M, N, P, R, S, T, U, V, X, Y, Z, ZA, ZB, ZC` use
the Table 2/3 ∆ corrections and the M6 exception, and grade-specific shaft
`j5`–`j7` (and `j8` up to 3 mm) and hole `J6`–`J8` use their own table values.
`iso286_applicability` reports the exact supported size intervals for a class; gaps
are stated, never interpolated.

**ISO 2768-1:1989** provides general tolerances for linear dimensions (classes
`f`, `m`, `c`, `v`), broken edges (classes `f` and `c`), and angular dimensions
(classes `f`, `c`, `v`), plus a compliance check for a stated deviation.

**Materials** are indicative typical values for common metals and plastics, from
an Apache-2.0 reference, tagged `basis: typical`. **Process limits** are published
rules of thumb for cnc-machining, sheet-metal, injection-molding, and additive-sls.

Out of scope, and refused rather than guessed: nominal sizes above 500 mm and the
inch counterparts (ANSI B4.2); IT01–IT2 K/M/N/P–ZC combinations and sparse Table 2/3
cells with no published ∆ value; design allowables, fatigue, and high-temperature
data; and a specific shop's capability, achievable tolerance, cost, or lead time.

## How the values are produced

The values are the **published tables**, which are normative. The earlier editions
also define the tolerance factor `i = 0.45·∛D + 0.001·D` and give the grades as
multiples of it; that arithmetic reproduces the table at 18 mm and above but
diverges at the smallest size step, where the published IT18 is 1400 µm against
2500i = 1355 µm. `toleranceFactor()` is kept as a documented cross-check, and the
tests assert both the table and the divergence.

## What it does not do

It reports what a standard specifies. It does not decide whether a design is
acceptable, whether a fit suits a joint, or whether a part can be made — those are
engineering judgements and they stay with you. Approval, compliance, and
certification are out of scope.

## Install and run

```sh
npm install
npm run build
node dist/src/index.js        # serves MCP over stdio
```

Point an MCP host at `dist/src/index.js`. The server serves both protocol eras:
the `2025-11-25` handshake that stock MCP hosts negotiate, and the `2026-07-28`
envelope through `server/discover`.

## Development

```sh
just check          # fmt-check, lint, typecheck, test
just build
just test
```

`just check` is keyless and needs no data files: the values are in the source.

## Packaging

`npm pack` builds first and includes the compiled server and this README; tests
and source maps are excluded. Install the tarball to check the
`standards-mcp-server` executable with a compatible MCP client.

## License

MIT. Third-party notices: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
