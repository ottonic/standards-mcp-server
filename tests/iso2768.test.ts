import { describe, expect, it } from 'vitest';
import {
  compliesWithGeneralTolerance,
  generalTolerance,
  linearStep,
  linearTable,
} from '../src/domain/iso2768.js';

/**
 * The values are the published ISO 2768-1 tables, cross-checked against
 * independent reproductions. The scope conditions are tested as carefully as the
 * numbers: returning 0.1 mm without saying it excludes broken edges would be
 * worse than returning nothing.
 */
describe('ISO 2768-1 linear tolerances', () => {
  const table: Array<[number, string, number]> = [
    [2, 'f', 0.05],
    [2, 'm', 0.1],
    [2, 'c', 0.2],
    [5, 'm', 0.1],
    [20, 'm', 0.2],
    [50, 'f', 0.15],
    [50, 'm', 0.3],
    [50, 'c', 0.8],
    [50, 'v', 1.5],
    [200, 'm', 0.5],
    [600, 'm', 0.8],
    [1500, 'm', 1.2],
    [3000, 'm', 2],
    [3000, 'c', 4],
    [3000, 'v', 8],
  ];

  it.each(table)('%d mm at class %s deviates %d mm', (nominal, toleranceClass, expected) => {
    expect(generalTolerance(nominal, toleranceClass).deviation).toBe(expected);
  });

  it('selects the step the standard defines, by (over, up to]', () => {
    expect(linearStep(0.5)).toBe('0.5-3');
    expect(linearStep(3)).toBe('0.5-3');
    expect(linearStep(3.1)).toBe('3-6');
    expect(linearStep(30)).toBe('6-30');
    expect(linearStep(31)).toBe('30-120');
    expect(linearStep(4000)).toBe('2000-4000');
  });

  it('refuses a class the standard leaves unspecified rather than returning null', () => {
    // Table 1 leaves f and v blank for the smallest and largest steps.
    expect(() => generalTolerance(1, 'v')).toThrowError(/leaves the 'v' class unspecified/);
    expect(() => generalTolerance(3000, 'f')).toThrowError(/leaves the 'f' class unspecified/);
  });

  it('refuses a class that is not f, m, c or v', () => {
    expect(() => generalTolerance(20, 'x')).toThrowError(/not an ISO 2768-1 tolerance class/);
  });

  it('accepts a drawing-style note as well as the bare letter', () => {
    expect(generalTolerance(20, 'ISO 2768-m').deviation).toBe(0.2);
    expect(generalTolerance(20, 'm').deviation).toBe(0.2);
  });

  it('states that it applies to linear dimensions and excludes broken edges', () => {
    const result = generalTolerance(20, 'm');
    expect(result.appliesTo).toBe('linear dimensions except broken edges');
    expect(result.kind).toBe('linear');
    expect(result.standard).toBe('iso2768-1:1989');
  });
});

describe('ISO 2768-1 scope conditions', () => {
  it('uses Table 2 for broken edges, which differ from Table 1', () => {
    // 20 mm at class m is 0.2 mm linearly, but broken edges are not tabulated
    // for m at all, and f is 1 mm rather than 0.1 mm.
    expect(generalTolerance(20, 'f', 'broken-edge').deviation).toBe(1);
    expect(() => generalTolerance(20, 'm', 'broken-edge')).toThrowError(
      /only f and c are tabulated/,
    );
  });

  it('keys angular deviations off the shorter side of the angle', () => {
    expect(generalTolerance(5, 'f', 'angular').deviation).toBeCloseTo(1, 9);
    expect(generalTolerance(30, 'f', 'angular').deviation).toBeCloseTo(0.5, 9);
    expect(generalTolerance(100, 'f', 'angular').deviation).toBeCloseTo(1 / 3, 9);
    expect(generalTolerance(100, 'v', 'angular').deviation).toBeCloseTo(1, 9);
    expect(generalTolerance(100, 'f', 'angular').unit).toBe('deg');
  });
});

describe('ISO 2768-1 conformance', () => {
  it('accepts a stated deviation at or below the permitted one', () => {
    // The question this exists to answer: is +/-0.1 on a 45 mm dimension
    // compliant with an ISO 2768-m note? Permitted there is +/-0.3.
    const result = compliesWithGeneralTolerance(45, 'm', 0.1);
    expect(result.permitted).toBe(0.3);
    expect(result.stated).toBe(0.1);
    expect(result.complies).toBe(true);
  });

  it('rejects a stated deviation looser than the note allows', () => {
    const result = compliesWithGeneralTolerance(45, 'm', 0.5);
    expect(result.complies).toBe(false);
    expect(result.note).toMatch(/numerical comparison only/i);
    expect(result.note).toMatch(/no individual tolerance/i);
  });

  it('treats the deviations as symmetric', () => {
    // A negative stated deviation is the same magnitude; the tables are +/-.
    expect(compliesWithGeneralTolerance(45, 'm', -0.1).complies).toBe(true);
    expect(generalTolerance(45, 'm').symmetric).toBe(true);
  });
});

describe('ISO 2768-1 table', () => {
  it('returns the whole published series', () => {
    const rows = linearTable();
    expect(rows).toHaveLength(8);
    expect(rows[0]).toMatchObject({ over: 0.5, upTo: 3 });
    expect(rows[0]!.classes.m).toBe(0.1);
    expect(rows[0]!.classes.v).toBeNull();
    expect(rows[7]!.classes.m).toBe(2);
  });
});
