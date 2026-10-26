# Standards MCP Server

Reference standards for mechanical engineering, as data an assistant can query:
tolerance grades, limits of size, and fits. Nothing here is derived from a CAD
file; it is the reference layer that a measurement or a measurement-plus-drawing
question needs in order to mean anything.

## Tools

| Tool              | Returns                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `list_standards`  | Which standards are implemented, and what within each is **not** covered.                                                        |
| `limits_of_size`  | Upper and lower deviations and limits for one tolerance class at one nominal size, e.g. `36H7`.                                   |
| `fit`             | Fit type, clearance and interference for a hole and shaft pair at one nominal size, e.g. `12 H7/h6`.                              |
| `it_grade`        | The standard tolerance value for one IT grade at one size, in micrometres and millimetres.                                        |

## Coverage, and the way it is reported

This server would rather refuse than approximate. Values that could not be
verified against the published standard are refused with a stated reason, and
`list_standards` says so up front, so a caller never has to discover a gap from a
failure.

**ISO 286-1:2010, with Cor 1:2013 applied** provides standard tolerance grades
IT1 to IT18 for nominal sizes up to 500 mm. Limits of size are supported only for verified shaft classes
`c, d, e, f, g, h, k, m, n, s` and hole classes `C, D, E, F, G, H, JS`.
Shaft `u` is additionally supported only for nominal sizes in `(30, 40] mm`.

Not covered, and refused rather than guessed:

- hole classes `K, M, N` and `P` to `ZC`, whose grade- and size-specific rules
  are not yet implemented.
- shaft deviation letters `p, r, t, v, x, y, z, za, zb, zc` until their
  table cells and applicability are verified.
- `j` and `J`, which are tabulated by grade rather than defined by a fundamental
  deviation.
- nominal sizes above 500 mm.
- the inch counterparts (ANSI B4.2).

## A note on how the values are produced

The values are the **published tables**, which are normative. The earlier editions
of the standard also define the tolerance factor `i = 0.45·∛D + 0.001·D` and give
the grades as multiples of it; that arithmetic reproduces the table at 18 mm and
above but diverges at the smallest size step, where the published IT18 is 1400 µm
against 2500i = 1355 µm. `toleranceFactor()` is kept as a documented cross-check,
and the tests assert both the table and the divergence.

Every response carries the edition it came from. A tolerance with no revision is
not a fact.

## What this server does not do

It reports what a standard specifies. It does not decide whether a design is
acceptable, whether a fit suits a joint, or whether a part can be made — those are
engineering judgements and they stay with the caller. Approval, compliance and
certification are out of scope.

## Install and run

```sh
npm install
npm run build
node dist/src/index.js        # serves MCP over stdio
```

Point an MCP host at `dist/src/index.js`.

## Development

```sh
just check          # fmt-check, lint, typecheck, test
just build
just test
```

`just check` is keyless and needs no data files: the values are in the source.
