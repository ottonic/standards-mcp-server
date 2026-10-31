import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { GRADES, MATERIALS_SOURCE, buildGrades, convertProperty } from '../src/domain/materials.js';
import { lookupHandler, materialCoverage, propertiesHandler } from '../src/tools/material-tools.js';

/**
 * The conversions are the part worth testing: the source publishes in English
 * units, and a wrong factor is invisible in the output — 6061-T6 would simply have
 * the density of a different material.
 */
describe('material unit conversion', () => {
  it('converts psi to MPa exactly', () => {
    // 1 psi = 0.00689476 MPa
    expect(convertProperty('yield_str', { val: 1000 })?.[1].value).toBeCloseTo(6.89476, 4);
    expect(convertProperty('yield_str', { val: 1000 })?.[1].unit).toBe('MPa');
  });

  it('converts pounds per cubic inch to kilograms per cubic metre', () => {
    // 1 lb/in3 = 27679.9 kg/m3
    expect(convertProperty('den', { val: 1 })?.[1].value).toBeCloseTo(27679.9, 0);
  });

  it('converts millionths of an inch per inch per degree F to um/m/K', () => {
    // 1 uin/in/F = 1.8 um/m/K
    expect(convertProperty('coef_thermal_exp', { val: 1 })?.[1].value).toBeCloseTo(1.8, 6);
  });

  it('converts a service temperature from Fahrenheit to Celsius', () => {
    expect(convertProperty('max_service_temp', { val: 212 })?.[1].value).toBeCloseTo(100, 6);
    expect(convertProperty('max_service_temp', { val: 32 })?.[1].value).toBeCloseTo(0, 6);
  });

  it('passes through dimensionless properties unchanged', () => {
    expect(convertProperty('pr', { val: 0.33 })?.[1].value).toBe(0.33);
    expect(convertProperty('pr', { val: 0.33 })?.[1].unit).toBe('1');
    // Upstream README's units table declares elongation as "% (unitless)".
    expect(convertProperty('elongation', { val: 12 })?.[1].unit).toBe('percent');
  });

  it('drops properties it does not publish rather than passing them through', () => {
    // The source carries 3D-printing process temperatures, which are settings
    // rather than material properties.
    expect(convertProperty('max_extrude_temp', { val: 500 })).toBeUndefined();
    expect(convertProperty('unknown_key', { val: 1 })).toBeUndefined();
  });

  it('tags every converted value as typical', () => {
    expect(convertProperty('yield_str', { val: 1000 })?.[1].basis).toBe('typical');
    expect(MATERIALS_SOURCE.basis).toBe('typical');
  });

  it('carries the source and its licence', () => {
    expect(MATERIALS_SOURCE.name).toBe('KittyCAD/material-properties');
    expect(MATERIALS_SOURCE.license).toBe('Apache-2.0');
    expect(MATERIALS_SOURCE.revision).toBe(
      `sha256:${createHash('sha256').update(JSON.stringify(GRADES)).digest('hex')}`,
    );
    expect(MATERIALS_SOURCE.revision_note).toMatch(/not an upstream release/i);
  });
});

describe('material data', () => {
  it('holds the whole published set', () => {
    expect(GRADES.length).toBe(119);
    expect(materialCoverage().families.length).toBeGreaterThanOrEqual(9);
  });

  it('finds 6061-T6 with properties that are physically plausible', () => {
    const grade = GRADES.find((g) => g.alloy === '6061' && g.temper === 'T6');
    expect(grade).toBeDefined();
    const density = grade!.properties.density!;
    // Aluminium is about 2700 kg/m3.
    expect(density.value).toBeGreaterThan(2600);
    expect(density.value).toBeLessThan(2800);
    const modulus = grade!.properties.youngs_modulus!;
    // Aluminium is about 69 GPa.
    expect(modulus.value / 1000).toBeGreaterThan(60);
    expect(modulus.value / 1000).toBeLessThan(80);
  });

  it('gives every grade a density, which is what mass estimates need', () => {
    for (const grade of GRADES) {
      expect(grade.properties.density, `${grade.designation} has no density`).toBeDefined();
    }
  });

  it('builds grades from a family file', () => {
    const grades = buildGrades('test', {
      X: { T1: { den: { val: 1 }, yield_str: { val: 1000 } } },
    });
    expect(grades).toHaveLength(1);
    expect(grades[0]!.designation).toBe('X T1 (test)');
    expect(grades[0]!.properties.yield_strength!.value).toBeCloseTo(6.89476, 4);
  });
});

describe('material tools', () => {
  it('looks up an exact designation', async () => {
    const result = await lookupHandler({ material: '6061-T6' });
    expect(result.found).toBe(true);
    expect(result.exact).toBe(true);
    expect(result.source).toMatchObject({
      name: MATERIALS_SOURCE.name,
      revision: MATERIALS_SOURCE.revision,
    });
    const first = (result.matches as Array<{ alloy: string }>)[0]!;
    expect(first.alloy).toBe('6061');
  });

  it('restricts the answer to one property when asked', async () => {
    const result = await lookupHandler({
      material: '6061-T6',
      property: 'yield_strength',
    });
    const first = (result.matches as Array<Record<string, unknown>>)[0]!;
    expect(first.properties).toBeUndefined();
    expect(first.property).toBeDefined();
    expect((first.property as { unit: string }).unit).toBe('MPa');
  });

  it('says a miss is a gap in the reference, not a missing material', async () => {
    const result = await lookupHandler({ material: 'unobtainium-9000' });
    expect(result.found).toBe(false);
    expect(result.note).toMatch(/not that the material does not exist/);
  });

  it('states the typical-values caveat on every successful lookup', async () => {
    const result = await lookupHandler({ material: '304' });
    expect(result.note).toMatch(/not design allowables/i);
    expect(result.note).toMatch(/qualified source/i);
  });

  it('reports its own gaps through the coverage tool', async () => {
    const result = await propertiesHandler();
    expect(result.grades).toBe(119);
    expect(result.note).toMatch(/no design allowables/i);
    expect(result.note).toMatch(/no fatigue data/i);
  });
});
