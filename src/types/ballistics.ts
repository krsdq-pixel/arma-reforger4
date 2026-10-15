export interface BallisticEntry {
  range: number;        // Range in meters
  elevationMils: number; // Mortar quadrant elevation in Mils (higher elevation = shorter range in high-angle fire)
  tof: number;          // Time of Flight in seconds
  dElev_per_100m_dAlt?: number; // Delta elevation in mils for +100m target altitude difference
}

export interface ChargeData {
  chargeNumber: number;
  name: string;
  minRange: number;
  maxRange: number;
  propellantDesc: string;
  table: BallisticEntry[];
}

export interface WeaponDataset {
  id: string;
  weaponName: string;
  weaponNameAr: string;
  caliber: string;
  ammoType: string;
  dataSource: string;
  sourceDate?: string;
  gameVersion: string;
  verificationStatus: 'verified' | 'estimated' | 'user_imported';
  milStandard: 'nato_6400' | 'warsaw_6000';
  minSafeDistance: number;
  maxEffectiveRange: number;
  charges: ChargeData[];
  notes?: string;
}

export interface FiringSolution {
  inRange: boolean;
  recommendedCharge: number | null;
  availableCharges: number[];
  selectedCharge: number;
  elevationMils: number | null;
  elevationDegrees: number | null;
  tof: number | null;
  bearingDeg: number;
  bearingMils: number;
  distanceMeters: number;
  heightDiffMeters: number;
  warning?: string;
  isStale?: boolean;
}
