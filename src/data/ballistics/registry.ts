import { WeaponDataset } from '../../types/ballistics';
import { m252Mortar } from './m252';
import { podnos2b14Mortar } from './podnos2b14';
import { vasilek2b9Mortar } from './vasilek2b9';

export const PRIMARY_DATASETS: WeaponDataset[] = [
  m252Mortar,
  podnos2b14Mortar,
  vasilek2b9Mortar,
];

class BallisticsRegistry {
  private datasets: Map<string, WeaponDataset> = new Map();

  constructor() {
    this.initDefaultDatasets();
  }

  private initDefaultDatasets() {
    this.datasets.clear();
    for (const ds of PRIMARY_DATASETS) {
      this.datasets.set(ds.id, ds);
    }
  }

  public getAllDatasets(): WeaponDataset[] {
    return Array.from(this.datasets.values());
  }

  public getDataset(id: string): WeaponDataset {
    const ds = this.datasets.get(id);
    if (ds) return ds;
    return this.datasets.get('m252_81mm') || m252Mortar;
  }

  public registerCustomDataset(dataset: WeaponDataset): void {
    this.datasets.set(dataset.id, dataset);
  }

  public validateCustomDataset(raw: any): { valid: boolean; dataset?: WeaponDataset; error?: string } {
    if (!raw || typeof raw !== 'object') {
      return { valid: false, error: 'Dataset must be an object' };
    }
    if (!raw.id || typeof raw.id !== 'string') {
      return { valid: false, error: 'Dataset requires a unique "id" string' };
    }
    if (!raw.weaponName || typeof raw.weaponName !== 'string') {
      return { valid: false, error: 'Dataset requires "weaponName"' };
    }
    if (!Array.isArray(raw.charges) || raw.charges.length === 0) {
      return { valid: false, error: 'Dataset must include at least one charge in "charges"' };
    }

    for (const charge of raw.charges) {
      if (typeof charge.chargeNumber !== 'number' || !Array.isArray(charge.table) || charge.table.length < 2) {
        return { valid: false, error: `Charge ${charge.chargeNumber} table must have at least 2 range entries` };
      }
      for (const entry of charge.table) {
        if (typeof entry.range !== 'number' || typeof entry.elevationMils !== 'number' || typeof entry.tof !== 'number') {
          return { valid: false, error: `Invalid entry in charge ${charge.chargeNumber}: range, elevationMils, and tof required` };
        }
      }
    }

    const validated: WeaponDataset = {
      ...raw,
      verificationStatus: 'user_imported',
      gameVersion: raw.gameVersion || 'Custom User Dataset',
      dataSource: raw.dataSource || 'User Imported Ballistics Table',
    };

    return { valid: true, dataset: validated };
  }
}

export const ballisticsRegistry = new BallisticsRegistry();
