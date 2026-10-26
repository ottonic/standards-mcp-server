#!/usr/bin/env python3
"""Generate the material data module from the Apache-2.0 source files.

The data is embedded rather than fetched so the server stays all-inclusive and
keyless: no network at runtime, no data file to install. Re-run this script to
pick up an upstream change.
"""
import json
import subprocess
from pathlib import Path

SOURCE = Path("/tmp/opencode/kittycad")
OUT = Path("/home/mattm/Code/cad-tools/mcp/standards/src/data/materials.generated.ts")

FAMILIES = [
    "aluminum", "carbonsteel", "castiron", "copper", "lowalloysteel",
    "nickelalloys", "stainlesssteel", "titanium", "3dprinting",
]

# Only the properties the server publishes; the source's 3D-printing temperatures
# are process settings rather than material properties and are dropped.
KEEP = {"den", "yield_str", "ult_str", "moe", "pr", "elongation", "coef_thermal_exp", "max_service_temp"}

blocks = []
for family in FAMILIES:
    raw = json.loads((SOURCE / f"{family}.json").read_text())
    trimmed = {
        alloy: {
            temper: {k: {"val": v["val"]} for k, v in props.items() if k in KEEP}
            for temper, props in tempers.items()
        }
        for alloy, tempers in raw.items()
    }
    blocks.append((family, trimmed))

header = '''/**
 * Generated material data. Do not edit by hand.
 *
 * Source: KittyCAD/material-properties (Apache-2.0), values converted to SI by
 * `scripts/generate_materials.py`. Regenerate with that script rather than editing
 * here, so an upstream change is a diff rather than a merge.
 */

import type { MaterialGrade } from '../domain/material-conversion.js';
import { buildGrades } from '../domain/material-conversion.js';

/* eslint-disable */
'''

parts = [header]
for family, data in blocks:
    compact = json.dumps(data, separators=(",", ":"))
    parts.append(f"const {family.upper().replace('3DPRINTING', 'PRINTING')}: Record<string, Record<string, Record<string, {{ val: number }}>>> = {compact};\n")

parts.append("""
/** Every grade the source publishes, in SI, tagged as typical handbook values. */
export const MATERIAL_GRADES: MaterialGrade[] = [
""")
for family, _ in blocks:
    const_name = family.upper().replace("3DPRINTING", "PRINTING")
    parts.append(f"  ...buildGrades('{family}', {const_name}),\n")
parts.append("];\n")

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text("".join(parts))
print(f"wrote {OUT} ({OUT.stat().st_size} bytes, {sum(len(v) for _, v in blocks)} families)")
