/**
 * Unit conversion for the material data.
 *
 * Kept separate from `materials.ts` because the generated data calls into the
 * conversion at module-initialisation time while `materials.ts` re-exports that
 * data: in one module that is a circular initialisation and the conversion's lookup
 * table is still uninitialised when the data is built.
 */

export type PropertyName =
  | 'density'
  | 'yield_strength'
  | 'ultimate_strength'
  | 'youngs_modulus'
  | 'poissons_ratio'
  | 'elongation_at_break'
  | 'thermal_expansion'
  | 'max_service_temperature';

export interface PropertyValue {
  value: number;
  unit: string;
  basis: 'typical';
}

export interface MaterialGrade {
  alloy: string;
  temper: string;
  designation: string;
  properties: Partial<Record<PropertyName, PropertyValue>>;
}

/** Exact conversion factors from the units the source publishes in. */
const PSI_TO_MPA = 0.006894757293168361;
const LB_PER_IN3_TO_KG_PER_M3 = 27679.904710203122;
/** millionths of an inch per inch per degree Fahrenheit -> micrometres per metre per kelvin */
const UIN_PER_IN_F_TO_UM_PER_M_K = 1.8;

/** Source key -> published name, unit and scale. */
const PROPERTY_MAP: Readonly<
  Record<string, { name: PropertyName; unit: string; scale: number; fahrenheit?: boolean }>
> = {
  den: { name: 'density', unit: 'kg/m3', scale: LB_PER_IN3_TO_KG_PER_M3 },
  yield_str: { name: 'yield_strength', unit: 'MPa', scale: PSI_TO_MPA },
  ult_str: { name: 'ultimate_strength', unit: 'MPa', scale: PSI_TO_MPA },
  moe: { name: 'youngs_modulus', unit: 'MPa', scale: PSI_TO_MPA },
  pr: { name: 'poissons_ratio', unit: '1', scale: 1 },
  elongation: { name: 'elongation_at_break', unit: 'percent', scale: 1 },
  coef_thermal_exp: {
    name: 'thermal_expansion',
    unit: 'um/m/K',
    scale: UIN_PER_IN_F_TO_UM_PER_M_K,
  },
  max_service_temp: {
    name: 'max_service_temperature',
    unit: 'degC',
    scale: 1,
    fahrenheit: true,
  },
};

export interface RawProperty {
  val: number;
}

/** One published property, converted to SI. Unpublished keys are dropped. */
export function convertProperty(
  key: string,
  raw: RawProperty,
): [PropertyName, PropertyValue] | undefined {
  const mapping = PROPERTY_MAP[key];
  if (!mapping || typeof raw.val !== 'number') return undefined;
  const scaled = raw.val * mapping.scale;
  const value = mapping.fahrenheit ? ((scaled - 32) * 5) / 9 : scaled;
  return [
    mapping.name,
    {
      value: Number(value.toPrecision(6)),
      unit: mapping.unit,
      basis: 'typical',
    },
  ];
}

/** Convert one source family file into grades with SI properties. */
export function buildGrades(
  family: string,
  raw: Record<string, Record<string, Record<string, RawProperty>>>,
): MaterialGrade[] {
  const grades: MaterialGrade[] = [];
  for (const [alloy, tempers] of Object.entries(raw)) {
    for (const [temper, properties] of Object.entries(tempers)) {
      const converted: Partial<Record<PropertyName, PropertyValue>> = {};
      for (const [key, property] of Object.entries(properties)) {
        const entry = convertProperty(key, property);
        if (entry) converted[entry[0]] = entry[1];
      }
      grades.push({
        alloy,
        temper,
        designation: `${alloy} ${temper} (${family})`,
        properties: converted,
      });
    }
  }
  return grades;
}
