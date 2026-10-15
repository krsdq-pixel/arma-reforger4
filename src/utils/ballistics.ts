import { WeaponDataset, ChargeData, FiringSolution, BallisticEntry } from '../types/ballistics';
import { CalculationResult } from '../types/coordinates';

/**
 * Linearly interpolates elevation and time of flight for a given range within a charge table.
 */
export function interpolateBallistics(
  table: BallisticEntry[],
  distance: number,
  heightDiff: number
): { elevationMils: number; tof: number; dElev_per_100m?: number } | null {
  if (!table || table.length === 0) return null;

  // Ensure table is sorted by range ascending
  const sorted = [...table].sort((a, b) => a.range - b.range);
  const minEntry = sorted[0];
  const maxEntry = sorted[sorted.length - 1];

  if (distance < minEntry.range || distance > maxEntry.range) {
    return null;
  }

  // Exact match
  const exact = sorted.find((e) => Math.abs(e.range - distance) < 0.1);
  if (exact) {
    let elev = exact.elevationMils;
    const correctionRate = exact.dElev_per_100m_dAlt ?? 20;
    elev += (heightDiff / 100) * correctionRate;
    return {
      elevationMils: Math.round(elev),
      tof: Math.round(exact.tof * 10) / 10,
      dElev_per_100m: correctionRate,
    };
  }

  // Find surrounding interval
  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i];
    const p2 = sorted[i + 1];

    if (distance >= p1.range && distance <= p2.range) {
      const fraction = (distance - p1.range) / (p2.range - p1.range);
      let elev = p1.elevationMils + fraction * (p2.elevationMils - p1.elevationMils);
      const tof = p1.tof + fraction * (p2.tof - p1.tof);

      const correctionRate = (p1.dElev_per_100m_dAlt ?? 20) + 
        fraction * ((p2.dElev_per_100m_dAlt ?? 20) - (p1.dElev_per_100m_dAlt ?? 20));

      // Height difference adjustment
      elev += (heightDiff / 100) * correctionRate;

      return {
        elevationMils: Math.round(elev),
        tof: Math.round(tof * 10) / 10,
        dElev_per_100m: correctionRate,
      };
    }
  }

  return null;
}

/**
 * Calculates complete firing solution for the active weapon dataset, geometry, and charge selection.
 */
export function calculateFiringSolution(
  dataset: WeaponDataset,
  geometry: CalculationResult,
  preferredCharge?: number
): FiringSolution {
  const distance = geometry.horizontalDistance;
  const heightDiff = geometry.elevationDiff;

  // Identify all charges that can physically engage this range
  const capableCharges: ChargeData[] = [];
  for (const c of dataset.charges) {
    if (distance >= c.minRange && distance <= c.maxRange) {
      capableCharges.push(c);
    }
  }

  const availableChargeNumbers = capableCharges.map((c) => c.chargeNumber);

  // Determine active charge
  let activeChargeNumber: number;
  let recommendedCharge: number | null = null;

  if (capableCharges.length > 0) {
    // Standard tactical recommendation: prefer lowest adequate charge for highest steep trajectory (less dead zones behind hills),
    // or middle charge for balanced flight time.
    recommendedCharge = capableCharges[0].chargeNumber;

    if (preferredCharge !== undefined && availableChargeNumbers.includes(preferredCharge)) {
      activeChargeNumber = preferredCharge;
    } else {
      activeChargeNumber = recommendedCharge;
    }
  } else {
    // Target is out of range for all charges
    activeChargeNumber = preferredCharge !== undefined ? preferredCharge : dataset.charges[0].chargeNumber;
  }

  // Active charge dataset
  const activeChargeData = dataset.charges.find((c) => c.chargeNumber === activeChargeNumber) || dataset.charges[0];
  const ballistics = interpolateBallistics(activeChargeData.table, distance, heightDiff);

  const bearingDeg = geometry.bearingDegrees;
  const bearingMils = dataset.milStandard === 'warsaw_6000' 
    ? geometry.bearingMilsWarsaw 
    : geometry.bearingMilsNato;

  if (distance < dataset.minSafeDistance) {
    return {
      inRange: false,
      recommendedCharge: null,
      availableCharges: availableChargeNumbers,
      selectedCharge: activeChargeNumber,
      elevationMils: null,
      elevationDegrees: null,
      tof: null,
      bearingDeg,
      bearingMils,
      distanceMeters: distance,
      heightDiffMeters: heightDiff,
      warning: `Danger Close: Target distance (${Math.round(distance)}m) is below minimum safe range (${dataset.minSafeDistance}m).`,
    };
  }

  if (!ballistics) {
    let warning = `Target range (${Math.round(distance)}m) is outside Charge ${activeChargeNumber} envelope (${activeChargeData.minRange}m - ${activeChargeData.maxRange}m).`;
    if (capableCharges.length > 0) {
      warning += ` Switch to Charge ${capableCharges.map((c) => c.chargeNumber).join(', ')}.`;
    } else if (distance > dataset.maxEffectiveRange) {
      warning += ` Exceeds maximum weapon range (${dataset.maxEffectiveRange}m).`;
    }

    return {
      inRange: false,
      recommendedCharge,
      availableCharges: availableChargeNumbers,
      selectedCharge: activeChargeNumber,
      elevationMils: null,
      elevationDegrees: null,
      tof: null,
      bearingDeg,
      bearingMils,
      distanceMeters: distance,
      heightDiffMeters: heightDiff,
      warning,
    };
  }

  // Convert elevation in mils to approximate degrees for reference
  // 1 mil NATO = 360 / 6400 deg = 0.05625 deg
  const milFactor = dataset.milStandard === 'warsaw_6000' ? (360 / 6000) : (360 / 6400);
  const elevationDegrees = Math.round(ballistics.elevationMils * milFactor * 10) / 10;

  return {
    inRange: true,
    recommendedCharge,
    availableCharges: availableChargeNumbers,
    selectedCharge: activeChargeNumber,
    elevationMils: ballistics.elevationMils,
    elevationDegrees,
    tof: ballistics.tof,
    bearingDeg,
    bearingMils,
    distanceMeters: distance,
    heightDiffMeters: heightDiff,
  };
}
