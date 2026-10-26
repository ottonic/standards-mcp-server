# ISO 286 discrepancy ledger

Scope: ISO 286-1:2010 Tables 2–5 and §4.3, as applied by the Standards MCP
server. Values below are deviations in micrometres unless stated otherwise.

| ID | Combination | Source result | Previous engine result | Resolution / regression |
|---|---|---|---|---|
| ISO286-001 | 36s6 | es +59, ei +43 (Annex B, Example 3) | Incorrectly treated Table 5 ei as es | Basis corrected; `iso286.test.ts` checks limits and `fit` |
| ISO286-002 | 20K8 | ES +10, EI −23 (Table 2 `−2 + Δ`; Table 3 Δ=12; IT8=33) | ES +12, EI −21 | Rejected the earlier audit's direct-Δ interpretation; apply `−ei + Δ`; domain and public-handler tests |
| ISO286-003 | 20K9 | No published cell at 20 mm (Table 2 above-IT8 cell is blank) | ES 0 | Refuse outside `(0,3]`; generated applicability and domain tests preserve the sole published zero interval |
| ISO286-004 | 20N9 | ES 0, EI −52 (Table 3, above IT8) | ES −15, EI −67 | Coarse N rule returns zero; domain and public-handler tests |
| ISO286-005 | 20K7 | ES +6, EI −15 (§4.3.2.5 Example 1) | Earlier mirror calculation was incorrect | Δ calculation retained; domain and public-handler tests |
| ISO286-006 | 60M6 | ES −5, EI −24 (§4.3.3 Example) | Earlier mirror calculation was incorrect | Δ calculation retained; domain test |
| ISO286-007 | 260M6 | ES −9, EI −41 (Table 2 footnote b) | Generic calculation gave −11/−43 | Explicit published exception; domain boundary tests |
| ISO286-008 | Table 5 shaft values | 25 size intervals; all published k–zc cells, including blanks | Duplicate coarse values had overridden/collided with fine Table 5 data | Removed duplicate c/j/h/p–zc coarse entries; independent Table 5 fixture now checks 375 cells and blank refusal |
| ISO286-009 | Table 4 d–g and grade-specific j/J | All 52 d–g values and 79 j/J values across supported intervals | Tests only sampled selected rows | Independent Table 4 and j/J fixtures compare every supported cell; c subdivision boundaries also have row-by-row expected checks |
| ISO286-010 | Table 1 IT values | All 260 IT01–IT18 cells through 500 mm | Only spot checks were retained in tests | Independent fixture compares every cell at each size endpoint and immediately above each lower boundary |
| ISO286-011 | Table 3 Δ values | All 78 IT3–IT8 values | Small-size rows had unresolved reconciliation status | Independent Δ fixture is exercised through K, M and P hole calculations across all 13 size steps |
| ISO286-012 | Table 3 N–ZC hole applicability | 13 hole classes across all 25 Table 5 size intervals and grades IT3–IT18 | Several blank shaft cells and grade transitions were not tested together | Grid qualification checks published EI cells, Δ formulas, N above-IT8 zero rule, mirror rules, and refusal of blank cells |
| ISO286-013 | Table 2 C–G, H and JS holes | Every Table 4 C–G size cell and IT1–IT18; H/JS across all coarse size steps and grades | Hole-side mirror calculation was previously inferred from shaft data without exhaustive checks | Independent Table 4 fixture verifies both hole deviations; H zero-basis and JS symmetric deviations checked against every IT grade |
| ISO286-014 | 20j6 | es +9, ei −4 (Table 4 j column is lower deviation ei; IT6=13) | es −4, ei −17 | Corrected the basis to ei and derived es = ei + IT; Grade-specific fixture now checks both limits; public-handler regression |
| ISO286-015 | 3K6 / 3M6 | K6 ES 0, EI −6; M6 ES −2, EI −8 (Table 3 Δ = 0 through 3 mm) | K6 ES +3, EI −3; M6 ES +1, EI −5 | Corrected the Δ table's first three rows, which had been shifted by one size step; all 78 Δ cells re-qualified |
| ISO286-016 | 3N9 | ES −4, EI −29 (Table 3 prints −4 in both N columns up to 3 mm) | ES 0, EI −25 | Added the size-dependent above-IT8 N rule; larger sizes remain 0, as published |

## Source references

- `/tmp/opencode/iso286-1.pdf`: Table 1, printed p. 20; Table 2, printed
  p. 21; Table 3, printed pp. 22–23; Table 4, printed p. 24; Table 5,
  printed p. 25; §4.3.2.5 Examples 1–2 and §4.3.3, printed p. 16; Annex B,
  Examples 1–3.
- ISO 286-1:2010/Cor 1:2013 is included in the API edition identifier. Its
  applicability to the relevant figures was reviewed separately; this ledger
  does not claim a complete transcription of the corrigendum or Part 2.
- [RoyMech hole limits](https://roymech.org/Useful_Tables/ISO_Tolerances/ISO_Hole_LIM_1.html)
  is a secondary cross-check only, not an authority or independent qualification
  source. Its K7/K8 values at 20 mm agree with the ISO transcription; its known
  ZC 65–80 mm discrepancy is resolved in favor of ISO Table 3.

This ledger records resolved findings, not a declaration that all advertised
letter/grade/size combinations are independently qualified. Tables 1–5 are now
transcribed and exercised for the advertised classes, but remaining work
includes checking the corrigendum and ISO 286-2 against these values, extending
past 500 mm, and deciding whether the unadvertised a/b/cd/ef/fg classes should
be implemented.
