/**
 * Generated material data. Do not edit by hand.
 *
 * Source: KittyCAD/material-properties (Apache-2.0), values converted to SI by
 * `scripts/generate_materials.py`. Regenerate with that script rather than editing
 * here, so an upstream change is a diff rather than a merge.
 */

import type { MaterialGrade } from '../domain/material-conversion.js';
import { buildGrades } from '../domain/material-conversion.js';

/* eslint-disable */
const ALUMINUM: Record<string, Record<string, Record<string, { val: number }>>> = {
  '2014': {
    T6: {
      den: { val: 0.101 },
      yield_str: { val: 59000 },
      ult_str: { val: 67000 },
      elongation: { val: 0.07 },
      moe: { val: 10500000 },
      pr: { val: 0.33 },
    },
    T651: {
      den: { val: 0.101 },
      yield_str: { val: 59000 },
      ult_str: { val: 67000 },
      elongation: { val: 0.07 },
      moe: { val: 10500000 },
      pr: { val: 0.33 },
    },
  },
  '2024': {
    T4: {
      den: { val: 0.1 },
      yield_str: { val: 40000 },
      ult_str: { val: 62000 },
      elongation: { val: 0.1 },
      moe: { val: 10500000 },
      pr: { val: 0.33 },
    },
  },
  '5052': {
    H32: {
      den: { val: 0.097 },
      yield_str: { val: 23000 },
      ult_str: { val: 38000 },
      elongation: { val: 0.09 },
      moe: { val: 10100000 },
      pr: { val: 0.33 },
    },
  },
  '5083': {
    H116: {
      den: { val: 0.096 },
      yield_str: { val: 31000 },
      ult_str: { val: 44000 },
      elongation: { val: 0.1 },
      moe: { val: 10300000 },
      pr: { val: 0.33 },
    },
    H321: {
      den: { val: 0.096 },
      yield_str: { val: 31000 },
      ult_str: { val: 44000 },
      elongation: { val: 0.1 },
      moe: { val: 10300000 },
      pr: { val: 0.33 },
    },
    H32: {
      den: { val: 0.096 },
      yield_str: { val: 31000 },
      ult_str: { val: 56000 },
      elongation: { val: 0.12 },
      moe: { val: 10300000 },
      pr: { val: 0.33 },
    },
  },
  '6061': {
    T4: {
      den: { val: 0.098 },
      yield_str: { val: 16000 },
      ult_str: { val: 26000 },
      elongation: { val: 0.16 },
      moe: { val: 9900000 },
      pr: { val: 0.33 },
    },
    T6: {
      den: { val: 0.098 },
      yield_str: { val: 35000 },
      ult_str: { val: 38000 },
      elongation: { val: 0.08 },
      moe: { val: 10300000 },
      pr: { val: 0.33 },
    },
  },
  '7075': {
    T6: {
      den: { val: 0.101 },
      yield_str: { val: 68000 },
      ult_str: { val: 78000 },
      elongation: { val: 0.06 },
      moe: { val: 10300000 },
      pr: { val: 0.33 },
    },
    T651: {
      den: { val: 0.101 },
      yield_str: { val: 68000 },
      ult_str: { val: 78000 },
      elongation: { val: 0.06 },
      moe: { val: 10300000 },
      pr: { val: 0.33 },
    },
  },
};
const CARBONSTEEL: Record<string, Record<string, Record<string, { val: number }>>> = {
  AISI_1020: {
    Hot: {
      den: { val: 0.283 },
      yield_str: { val: 32000 },
      ult_str: { val: 50000 },
      elongation: { val: 0.25 },
      moe: { val: 29000000 },
      pr: { val: 0.32 },
    },
    Cold: {
      den: { val: 0.283 },
      yield_str: { val: 60000 },
      ult_str: { val: 70000 },
      elongation: { val: 0.05 },
      moe: { val: 29000000 },
      pr: { val: 0.32 },
    },
    Stress_rel: {
      den: { val: 0.283 },
      yield_str: { val: 50000 },
      ult_str: { val: 65000 },
      elongation: { val: 0.1 },
      moe: { val: 29000000 },
      pr: { val: 0.32 },
    },
    Annealed: {
      den: { val: 0.283 },
      yield_str: { val: 28000 },
      ult_str: { val: 48000 },
      elongation: { val: 0.3 },
      moe: { val: 29000000 },
      pr: { val: 0.32 },
    },
    Norm: {
      den: { val: 0.283 },
      yield_str: { val: 34000 },
      ult_str: { val: 55000 },
      elongation: { val: 0.22 },
      moe: { val: 29000000 },
      pr: { val: 0.33 },
    },
  },
  ANSI_1045: {
    Hot: {
      den: { val: 0.283 },
      yield_str: { val: 45000 },
      ult_str: { val: 75000 },
      elongation: { val: 0.15 },
      moe: { val: 29000000 },
      pr: { val: 0.32 },
    },
    Cold: {
      den: { val: 0.283 },
      yield_str: { val: 80000 },
      ult_str: { val: 90000 },
      elongation: { val: 0.05 },
      moe: { val: 29000000 },
      pr: { val: 0.33 },
    },
    Stress_rel: {
      den: { val: 0.283 },
      yield_str: { val: 70000 },
      ult_str: { val: 80000 },
      elongation: { val: 0.08 },
      moe: { val: 29000000 },
      pr: { val: 0.33 },
    },
    Annealed: {
      den: { val: 0.283 },
      yield_str: { val: 35000 },
      ult_str: { val: 65000 },
      elongation: { val: 0.2 },
      moe: { val: 29000000 },
      pr: { val: 0.33 },
    },
    Norm: {
      den: { val: 0.283 },
      yield_str: { val: 48000 },
      ult_str: { val: 75000 },
      elongation: { val: 0.15 },
      moe: { val: 29000000 },
      pr: { val: 0.33 },
    },
  },
  ASTM_A36: {
    Default: {
      den: { val: 0.283 },
      yield_str: { val: 36000 },
      ult_str: { val: 58000 },
      elongation: { val: 0.21 },
      moe: { val: 29000000 },
      pr: { val: 0.3 },
    },
  },
  ASTM_A516: {
    Default: {
      den: { val: 0.283 },
      yield_str: { val: 38000 },
      ult_str: { val: 70000 },
      elongation: { val: 0.17 },
      moe: { val: 29000000 },
      pr: { val: 0.3 },
    },
  },
};
const CASTIRON: Record<string, Record<string, Record<string, { val: number }>>> = {
  ASTM_A159: {
    G1800: {
      den: { val: 0.264 },
      ult_str: { val: 18000 },
      moe: { val: 11800000 },
      pr: { val: 0.26 },
    },
    G2500: {
      den: { val: 0.264 },
      ult_str: { val: 25000 },
      moe: { val: 11800000 },
      pr: { val: 0.26 },
    },
    G3000: {
      den: { val: 0.264 },
      ult_str: { val: 30000 },
      moe: { val: 11800000 },
      pr: { val: 0.26 },
    },
    G3500: {
      den: { val: 0.264 },
      ult_str: { val: 35000 },
      moe: { val: 11800000 },
      pr: { val: 0.26 },
    },
    G4000: {
      den: { val: 0.264 },
      ult_str: { val: 40000 },
      moe: { val: 11800000 },
      pr: { val: 0.26 },
    },
  },
  ASTM_A536: {
    'Grade_60-40-18': {
      den: { val: 0.256 },
      yield_str: { val: 45000 },
      ult_str: { val: 60000 },
      elongation: { val: 0.18 },
      moe: { val: 2450000 },
      pr: { val: 0.29 },
    },
    'Grade_65-45-12': {
      den: { val: 0.256 },
      yield_str: { val: 45000 },
      ult_str: { val: 65000 },
      elongation: { val: 0.12 },
      moe: { val: 2450000 },
      pr: { val: 0.3 },
    },
    'Grade_80-55-06': {
      den: { val: 0.256 },
      yield_str: { val: 55000 },
      ult_str: { val: 80000 },
      elongation: { val: 0.06 },
      moe: { val: 2450000 },
      pr: { val: 0.31 },
    },
    'Grade_100-70-03': {
      den: { val: 0.256 },
      yield_str: { val: 70000 },
      ult_str: { val: 100000 },
      elongation: { val: 0.03 },
      moe: { val: 2450000 },
      pr: { val: 0.3 },
    },
    'Grade_120-90-02': {
      den: { val: 0.256 },
      yield_str: { val: 90000 },
      ult_str: { val: 120000 },
      elongation: { val: 0.02 },
      moe: { val: 2450000 },
      pr: { val: 0.28 },
    },
  },
};
const COPPER: Record<string, Record<string, Record<string, { val: number }>>> = {
  '70_30_Copper-Nickel': {
    Annealed: {
      den: { val: 0.323 },
      yield_str: { val: 18000 },
      ult_str: { val: 45000 },
      elongation: { val: 0.3 },
      moe: { val: 21800000 },
      pr: { val: 0.3 },
    },
    Cold_worked: {
      den: { val: 0.323 },
      yield_str: { val: 50000 },
      ult_str: { val: 65000 },
      elongation: { val: 0.1 },
      moe: { val: 21800000 },
      pr: { val: 0.3 },
    },
  },
  '90_10_Copper-Nickel': {
    Annealed: {
      den: { val: 0.323 },
      yield_str: { val: 15000 },
      ult_str: { val: 380000 },
      elongation: { val: 0.3 },
      moe: { val: 20300000 },
      pr: { val: 0.3 },
    },
    Cold_worked: {
      den: { val: 0.323 },
      yield_str: { val: 30000 },
      ult_str: { val: 50000 },
      elongation: { val: 0.15 },
      moe: { val: 20300000 },
      pr: { val: 0.3 },
    },
  },
  Aluminum_Bronze: {
    Default: {
      den: { val: 0.269 },
      yield_str: { val: 32000 },
      ult_str: { val: 85000 },
      elongation: { val: 0.12 },
      moe: { val: 15500000 },
      pr: { val: 0.316 },
    },
  },
  Beryllium_Copper: {
    Heat_treated: {
      den: { val: 0.298 },
      yield_str: { val: 75000 },
      ult_str: { val: 85000 },
      elongation: { val: 0.08 },
      moe: { val: 18500000 },
      pr: { val: 0.27 },
    },
    Precipiation_heat_treated: {
      den: { val: 0.298 },
      yield_str: { val: 140000 },
      ult_str: { val: 165000 },
      elongation: { val: 0.03 },
      moe: { val: 18500000 },
      pr: { val: 0.27 },
    },
  },
  Nickel_Aluminum_Bronze_632: {
    Annealed: {
      den: { val: 0.274 },
      yield_str: { val: 34000 },
      ult_str: { val: 90000 },
      elongation: { val: 0.1 },
      moe: { val: 16700000 },
      pr: { val: 0.32 },
    },
    Quenched_Hardened: {
      den: { val: 0.274 },
      yield_str: { val: 50000 },
      ult_str: { val: 90000 },
      elongation: { val: 0.15 },
      moe: { val: 16700000 },
      pr: { val: 0.32 },
    },
  },
};
const LOWALLOYSTEEL: Record<string, Record<string, Record<string, { val: number }>>> = {
  AISI_4130: {
    Hot: {
      den: { val: 0.283 },
      yield_str: { val: 70000 },
      ult_str: { val: 90000 },
      elongation: { val: 0.2 },
      moe: { val: 29000000 },
      pr: { val: 0.32 },
    },
    Stress_rel: {
      den: { val: 0.283 },
      yield_str: { val: 85000 },
      ult_str: { val: 105000 },
      elongation: { val: 0.1 },
      moe: { val: 29000000 },
      pr: { val: 0.32 },
    },
    Annealed: {
      den: { val: 0.283 },
      yield_str: { val: 55000 },
      ult_str: { val: 75000 },
      elongation: { val: 0.3 },
      moe: { val: 29000000 },
      pr: { val: 0.32 },
    },
    Norm: {
      den: { val: 0.283 },
      yield_str: { val: 60000 },
      ult_str: { val: 90000 },
      elongation: { val: 0.2 },
      moe: { val: 29000000 },
      pr: { val: 0.32 },
    },
  },
  AISI_4140: {
    Hot: {
      den: { val: 0.283 },
      yield_str: { val: 90000 },
      ult_str: { val: 120000 },
      elongation: { val: 0.15 },
      moe: { val: 29700000 },
      pr: { val: 0.32 },
    },
    Stress_rel: {
      den: { val: 0.283 },
      yield_str: { val: 100000 },
      ult_str: { val: 120000 },
      elongation: { val: 0.1 },
      moe: { val: 29700000 },
      pr: { val: 0.32 },
    },
    Annealed: {
      den: { val: 0.283 },
      yield_str: { val: 60000 },
      ult_str: { val: 80000 },
      elongation: { val: 0.25 },
      moe: { val: 29700000 },
      pr: { val: 0.32 },
    },
    Norm: {
      den: { val: 0.283 },
      yield_str: { val: 90000 },
      ult_str: { val: 120000 },
      elongation: { val: 0.2 },
      moe: { val: 29700000 },
      pr: { val: 0.32 },
    },
  },
  ASTM_A242: {
    Default: {
      den: { val: 0.282 },
      yield_str: { val: 46000 },
      ult_str: { val: 67000 },
      elongation: { val: 0.18 },
      moe: { val: 30000000 },
      pr: { val: 0.3 },
    },
  },
  ASTM_A302: {
    Grade_A: {
      den: { val: 0.282 },
      yield_str: { val: 45000 },
      ult_str: { val: 75000 },
      elongation: { val: 0.15 },
      moe: { val: 29000000 },
      pr: { val: 0.29 },
    },
    Grade_B: {
      den: { val: 0.282 },
      yield_str: { val: 50000 },
      ult_str: { val: 80000 },
      elongation: { val: 0.17 },
      moe: { val: 29600000 },
      pr: { val: 0.29 },
    },
  },
  ASTM_A514: {
    Tempered: {
      den: { val: 0.283 },
      yield_str: { val: 100000 },
      ult_str: { val: 110000 },
      elongation: { val: 0.18 },
      moe: { val: 29600000 },
      pr: { val: 0.3 },
    },
  },
  ASTM_A517: {
    Grade_F: {
      den: { val: 0.28 },
      yield_str: { val: 100000 },
      ult_str: { val: 115000 },
      elongation: { val: 0.16 },
      moe: { val: 29600000 },
      pr: { val: 0.29 },
    },
  },
  ASTM_A533: {
    Class_1: {
      den: { val: 0.282 },
      yield_str: { val: 50000 },
      ult_str: { val: 80000 },
      elongation: { val: 0.18 },
      moe: { val: 29600000 },
      pr: { val: 0.29 },
    },
    Class_2: {
      den: { val: 0.282 },
      yield_str: { val: 70000 },
      ult_str: { val: 90000 },
      elongation: { val: 0.16 },
      moe: { val: 29600000 },
      pr: { val: 0.29 },
    },
    Class_3: {
      den: { val: 0.282 },
      yield_str: { val: 83000 },
      ult_str: { val: 10000 },
      elongation: { val: 0.16 },
      moe: { val: 29600000 },
      pr: { val: 0.29 },
    },
  },
  ASTM_A572: {
    Grade_50: {
      den: { val: 0.283 },
      yield_str: { val: 50000 },
      ult_str: { val: 65000 },
      elongation: { val: 0.18 },
      moe: { val: 30000000 },
      pr: { val: 0.3 },
    },
  },
  ASTM_A588: {
    default: {
      den: { val: 0.28 },
      yield_str: { val: 50000 },
      ult_str: { val: 70000 },
      elongation: { val: 0.18 },
      moe: { val: 29700000 },
      pr: { val: 0.28 },
    },
  },
  ASTM_A633: {
    Grade_E: {
      den: { val: 0.28 },
      yield_str: { val: 55000 },
      ult_str: { val: 75000 },
      elongation: { val: 0.18 },
      moe: { val: 29700000 },
      pr: { val: 0.28 },
    },
  },
  ASTM_A656: {
    Grade_50: {
      den: { val: 0.282 },
      yield_str: { val: 50000 },
      ult_str: { val: 60000 },
      elongation: { val: 0.2 },
      moe: { val: 29000000 },
      pr: { val: 0.29 },
    },
    Grade_60: {
      den: { val: 0.282 },
      yield_str: { val: 60000 },
      ult_str: { val: 70000 },
      elongation: { val: 0.17 },
      moe: { val: 29000000 },
      pr: { val: 0.29 },
    },
    Grade_70: {
      den: { val: 0.282 },
      yield_str: { val: 70000 },
      ult_str: { val: 80000 },
      elongation: { val: 0.14 },
      moe: { val: 29000000 },
      pr: { val: 0.29 },
    },
    Grade_80: {
      den: { val: 0.282 },
      yield_str: { val: 80000 },
      ult_str: { val: 90000 },
      elongation: { val: 0.12 },
      moe: { val: 29000000 },
      pr: { val: 0.29 },
    },
    Grade_100: {
      den: { val: 0.282 },
      yield_str: { val: 100000 },
      ult_str: { val: 110000 },
      elongation: { val: 0.12 },
      moe: { val: 29000000 },
      pr: { val: 0.29 },
    },
  },
  ASTM_A710: {
    Grade_A: {
      den: { val: 0.28 },
      yield_str: { val: 80000 },
      ult_str: { val: 85000 },
      elongation: { val: 0.2 },
      moe: { val: 29700000 },
      pr: { val: 0.3 },
    },
  },
  'HY-80': {
    Default: {
      den: { val: 0.28 },
      yield_str: { val: 80000 },
      elongation: { val: 0.18 },
      moe: { val: 2970000 },
      pr: { val: 0.29 },
    },
  },
  'HY-100': {
    Default: {
      den: { val: 0.284 },
      yield_str: { val: 100000 },
      elongation: { val: 0.15 },
      moe: { val: 29700000 },
      pr: { val: 0.29 },
    },
  },
};
const NICKELALLOYS: Record<string, Record<string, Record<string, { val: number }>>> = {
  'Hastelloy_C-276': {
    Annealed: {
      den: { val: 0.321 },
      yield_str: { val: 41000 },
      ult_str: { val: 100000 },
      elongation: { val: 0.4 },
      moe: { val: 29800000 },
      pr: { val: 0.28 },
    },
  },
  Inconel_625: {
    Grade_1: {
      den: { val: 0.305 },
      yield_str: { val: 55000 },
      ult_str: { val: 110000 },
      elongation: { val: 0.3 },
      moe: { val: 29800000 },
      pr: { val: 0.28 },
    },
    Grade_2: {
      den: { val: 0.305 },
      yield_str: { val: 40000 },
      ult_str: { val: 100000 },
      elongation: { val: 0.3 },
      moe: { val: 29800000 },
      pr: { val: 0.28 },
    },
  },
  Inconel_686: {
    Grade_1: {
      den: { val: 0.315 },
      yield_str: { val: 85000 },
      ult_str: { val: 120000 },
      elongation: { val: 0.2 },
      moe: { val: 29800000 },
      pr: { val: 0.28 },
    },
    Grade_2: {
      den: { val: 0.315 },
      yield_str: { val: 125000 },
      ult_str: { val: 135000 },
      elongation: { val: 0.2 },
      moe: { val: 29800000 },
      pr: { val: 0.28 },
    },
    Grade_3: {
      den: { val: 0.315 },
      yield_str: { val: 150000 },
      ult_str: { val: 160000 },
      elongation: { val: 0.2 },
      moe: { val: 29800000 },
      pr: { val: 0.28 },
    },
  },
  Inconel_718: {
    Annealed_aged: {
      den: { val: 0.297 },
      yield_str: { val: 120000 },
      ult_str: { val: 150000 },
      elongation: { val: 0.2 },
      moe: { val: 29400000 },
      pr: { val: 0.29 },
    },
    Heat_treated: {
      den: { val: 0.297 },
      yield_str: { val: 150000 },
      ult_str: { val: 180000 },
      elongation: { val: 0.1 },
      moe: { val: 29400000 },
      pr: { val: 0.29 },
    },
  },
  Inconel_725: {
    Annealed: {
      den: { val: 0.3 },
      yield_str: { val: 40000 },
      ult_str: { val: 75000 },
      elongation: { val: 0.45 },
      moe: { val: 29600000 },
      pr: { val: 0.31 },
    },
    Annealed_aged: {
      den: { val: 0.3 },
      yield_str: { val: 120000 },
      ult_str: { val: 150000 },
      elongation: { val: 0.2 },
      moe: { val: 29600000 },
      pr: { val: 0.31 },
    },
  },
  Monel_400: {
    Annealed: {
      den: { val: 0.319 },
      yield_str: { val: 25000 },
      ult_str: { val: 75000 },
      elongation: { val: 0.35 },
      moe: { val: 26000000 },
      pr: { val: 0.32 },
    },
    Hot: {
      den: { val: 0.319 },
      yield_str: { val: 40000 },
      ult_str: { val: 75000 },
      elongation: { val: 0.3 },
      moe: { val: 26000000 },
      pr: { val: 0.32 },
    },
    Cold_worked: {
      den: { val: 0.319 },
      yield_str: { val: 50000 },
      ult_str: { val: 80000 },
      elongation: { val: 0.2 },
      moe: { val: 26000000 },
      pr: { val: 0.32 },
    },
    Stress_rel: {
      den: { val: 0.319 },
      yield_str: { val: 50000 },
      ult_str: { val: 80000 },
      elongation: { val: 0.2 },
      moe: { val: 26000000 },
      pr: { val: 0.32 },
    },
  },
  'Monel_K-500': {
    Annealed_aged: {
      den: { val: 0.306 },
      yield_str: { val: 85000 },
      ult_str: { val: 130000 },
      elongation: { val: 0.2 },
      moe: { val: 26000000 },
      pr: { val: 0.32 },
    },
    Cold_worked_aged: {
      den: { val: 0.306 },
      yield_str: { val: 100000 },
      ult_str: { val: 140000 },
      elongation: { val: 0.15 },
      moe: { val: 26000000 },
      pr: { val: 0.32 },
    },
  },
};
const STAINLESSSTEEL: Record<string, Record<string, Record<string, { val: number }>>> = {
  AISI_201: {
    Default: {
      den: { val: 0.289 },
      yield_str: { val: 40000 },
      ult_str: { val: 75000 },
      elongation: { val: 0.4 },
      moe: { val: 28000000 },
      pr: { val: 0.27 },
    },
  },
  AISI_202: {
    Default: {
      den: { val: 0.289 },
      yield_str: { val: 40000 },
      ult_str: { val: 75000 },
      elongation: { val: 0.4 },
      moe: { val: 28000000 },
      pr: { val: 0.27 },
    },
  },
  AISI_302: {
    Default: {
      den: { val: 0.289 },
      yield_str: { val: 30000 },
      ult_str: { val: 75000 },
      elongation: { val: 0.4 },
      moe: { val: 28000000 },
      pr: { val: 0.27 },
    },
  },
  AISI_304: {
    Default: {
      den: { val: 0.289 },
      yield_str: { val: 30000 },
      ult_str: { val: 75000 },
      elongation: { val: 0.4 },
      moe: { val: 28000000 },
      pr: { val: 0.29 },
    },
  },
  AISI_304L: {
    Default: {
      den: { val: 0.289 },
      yield_str: { val: 25000 },
      ult_str: { val: 70000 },
      elongation: { val: 0.4 },
      moe: { val: 28000000 },
      pr: { val: 0.28 },
    },
  },
  AISI_316: {
    Default: {
      den: { val: 0.289 },
      yield_str: { val: 30000 },
      ult_str: { val: 75000 },
      elongation: { val: 0.4 },
      moe: { val: 28000000 },
      pr: { val: 0.26 },
    },
  },
  AISI_316L: {
    Default: {
      den: { val: 0.289 },
      yield_str: { val: 25000 },
      ult_str: { val: 70000 },
      elongation: { val: 0.4 },
      moe: { val: 28000000 },
      pr: { val: 0.26 },
    },
  },
  AISI_405: {
    Default: {
      den: { val: 0.289 },
      yield_str: { val: 25000 },
      ult_str: { val: 60000 },
      elongation: { val: 0.2 },
      moe: { val: 29000000 },
      pr: { val: 0.28 },
    },
  },
  AISI_410: {
    Annealed: {
      den: { val: 0.282 },
      yield_str: { val: 40000 },
      ult_str: { val: 70000 },
      elongation: { val: 0.16 },
      moe: { val: 29000000 },
      pr: { val: 0.28 },
    },
    Tempered: {
      den: { val: 0.282 },
      yield_str: { val: 80000 },
      ult_str: { val: 100000 },
      elongation: { val: 0.12 },
      moe: { val: 29000000 },
      pr: { val: 0.28 },
    },
  },
  AISI_430: {
    Default: {
      den: { val: 0.282 },
      yield_str: { val: 30000 },
      ult_str: { val: 60000 },
      elongation: { val: 0.2 },
      moe: { val: 29000000 },
      pr: { val: 0.28 },
    },
  },
  AISI_446: {
    Default: {
      den: { val: 0.282 },
      yield_str: { val: 40000 },
      ult_str: { val: 65000 },
      elongation: { val: 0.16 },
      moe: { val: 29000000 },
      pr: { val: 0.28 },
    },
  },
  '15-5PH': {
    H900: {
      den: { val: 0.283 },
      yield_str: { val: 170000 },
      ult_str: { val: 190000 },
      elongation: { val: 0.1 },
      moe: { val: 28500000 },
      pr: { val: 0.27 },
    },
    H1025: {
      den: { val: 0.283 },
      yield_str: { val: 145000 },
      ult_str: { val: 155000 },
      elongation: { val: 0.12 },
      moe: { val: 28500000 },
      pr: { val: 0.27 },
    },
    H1150: {
      den: { val: 0.283 },
      yield_str: { val: 105000 },
      ult_str: { val: 135000 },
      elongation: { val: 0.16 },
      moe: { val: 28500000 },
      pr: { val: 0.27 },
    },
  },
  '17-4PH': {
    H900: {
      den: { val: 0.282 },
      yield_str: { val: 170000 },
      ult_str: { val: 190000 },
      elongation: { val: 0.1 },
      moe: { val: 28500000 },
      pr: { val: 0.27 },
    },
    H1025: {
      den: { val: 0.282 },
      yield_str: { val: 145000 },
      ult_str: { val: 155000 },
      elongation: { val: 0.12 },
      moe: { val: 28500000 },
      pr: { val: 0.27 },
    },
    H1150: {
      den: { val: 0.282 },
      yield_str: { val: 105000 },
      ult_str: { val: 135000 },
      elongation: { val: 0.16 },
      moe: { val: 28500000 },
      pr: { val: 0.27 },
    },
  },
  '17-7PH': {
    TH1050: {
      den: { val: 0.276 },
      yield_str: { val: 150000 },
      ult_str: { val: 177000 },
      elongation: { val: 0.06 },
      moe: { val: 29000000 },
      pr: { val: 0.28 },
    },
  },
  'A-286': {
    Default: {
      den: { val: 0.287 },
      yield_str: { val: 95000 },
      ult_str: { val: 140000 },
      elongation: { val: 0.15 },
      moe: { val: 29100000 },
      pr: { val: 0.31 },
    },
  },
  Alloy_2205: {
    Default: {
      den: { val: 0.287 },
      yield_str: { val: 65000 },
      ult_str: { val: 95000 },
      elongation: { val: 0.25 },
      moe: { val: 28500000 },
      pr: { val: 0.27 },
    },
  },
  Ferrallium_225: {
    Default: {
      den: { val: 0.287 },
      yield_str: { val: 80000 },
      ult_str: { val: 110000 },
      elongation: { val: 0.15 },
      moe: { val: 28500000 },
      pr: { val: 0.27 },
    },
  },
};
const TITANIUM: Record<string, Record<string, Record<string, { val: number }>>> = {
  Pure: {
    Grade_2: {
      den: { val: 0.163 },
      yield_str: { val: 40000 },
      ult_str: { val: 50000 },
      elongation: { val: 0.2 },
      moe: { val: 14800000 },
      pr: { val: 0.34 },
    },
  },
  'Ti-5Al-2_5Sn': {
    Annealed: {
      den: { val: 0.162 },
      yield_str: { val: 110000 },
      ult_str: { val: 115000 },
      elongation: { val: 0.1 },
      moe: { val: 15500000 },
      pr: { val: 0.31 },
    },
  },
  'Ti-6Al-4V': {
    Grade_5: {
      den: { val: 0.16 },
      yield_str: { val: 120000 },
      ult_str: { val: 130000 },
      elongation: { val: 0.1 },
      moe: { val: 16000000 },
      pr: { val: 0.31 },
    },
  },
  'Ti-6Al-4V_ELI': {
    Grade_23: {
      den: { val: 0.16 },
      yield_str: { val: 110000 },
      ult_str: { val: 120000 },
      elongation: { val: 0.1 },
      moe: { val: 16500000 },
      pr: { val: 0.31 },
    },
  },
  'Ti-5-1-1-1': {
    Grade_32: {
      den: { val: 0.16 },
      yield_str: { val: 85000 },
      ult_str: { val: 100000 },
      elongation: { val: 0.1 },
      moe: { val: 16000000 },
      pr: { val: 0.31 },
    },
  },
};
const PRINTING: Record<string, Record<string, Record<string, { val: number }>>> = {
  ABS: {
    Default: {
      ult_str: { val: 5801 },
      max_service_temp: { val: 208 },
      coef_thermal_exp: { val: 50 },
      den: { val: 0.038 },
    },
  },
  PLA: {
    Default: {
      ult_str: { val: 9427 },
      max_service_temp: { val: 126 },
      coef_thermal_exp: { val: 37.8 },
      den: { val: 0.045 },
      elongation: { val: 0.06 },
    },
  },
  HIPS: {
    Default: {
      ult_str: { val: 4641 },
      max_service_temp: { val: 212 },
      coef_thermal_exp: { val: 33 },
      den: { val: 0.038 },
    },
  },
  Nylon: {
    Default: {
      ult_str: { val: 9065 },
      max_service_temp: { val: 203 },
      coef_thermal_exp: { val: 53 },
      den: { val: 0.04 },
    },
  },
  PETG: {
    Default: {
      ult_str: { val: 7687 },
      max_service_temp: { val: 163 },
      coef_thermal_exp: { val: 33 },
      den: { val: 0.044 },
    },
  },
  ASA: {
    Default: {
      ult_str: { val: 7977 },
      max_service_temp: { val: 203 },
      coef_thermal_exp: { val: 54 },
      den: { val: 0.039 },
    },
  },
  Polycarbonate: {
    Default: {
      ult_str: { val: 10442 },
      max_service_temp: { val: 250 },
      coef_thermal_exp: { val: 38 },
      den: { val: 0.043 },
    },
  },
};

/** Every grade the source publishes, in SI, tagged as typical handbook values. */
export const MATERIAL_GRADES: MaterialGrade[] = [
  ...buildGrades('aluminum', ALUMINUM),
  ...buildGrades('carbonsteel', CARBONSTEEL),
  ...buildGrades('castiron', CASTIRON),
  ...buildGrades('copper', COPPER),
  ...buildGrades('lowalloysteel', LOWALLOYSTEEL),
  ...buildGrades('nickelalloys', NICKELALLOYS),
  ...buildGrades('stainlesssteel', STAINLESSSTEEL),
  ...buildGrades('titanium', TITANIUM),
  ...buildGrades('3dprinting', PRINTING),
];
