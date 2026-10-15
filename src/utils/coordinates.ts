import { WorldCoord, CalculationResult } from '../types/coordinates';

/**
 * Calculates horizontal distance, slant distance, elevation difference,
 * and azimuth/bearing in degrees and military mils (NATO 6400 and Warsaw 6000).
 */
export function calculateGeometry(
  from: WorldCoord,
  to: WorldCoord
): CalculationResult {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = (to.z ?? 0) - (from.z ?? 0);

  const horizontalDistance = Math.hypot(dx, dy);
  const slantDistance = Math.hypot(dx, dy, dz);

  // If distance is near zero (identical positions)
  if (horizontalDistance < 0.001) {
    return {
      horizontalDistance: 0,
      slantDistance: Math.abs(dz),
      elevationDiff: dz,
      bearingDegrees: 0,
      bearingMilsNato: 0,
      bearingMilsWarsaw: 0,
      isValid: true,
      warning: 'Identical positions (mortar and target are coincident)',
    };
  }

  // Bearing: atan2(dx, dy) where dy is North and dx is East
  // Math.atan2(dx, dy) gives 0 for North (dy>0, dx=0), PI/2 for East (dx>0, dy=0)
  let rad = Math.atan2(dx, dy);
  if (rad < 0) {
    rad += 2 * Math.PI;
  }

  const bearingDegrees = (rad * 180) / Math.PI;
  // Normalize to [0, 360)
  const normalizedDeg = (bearingDegrees % 360 + 360) % 360;

  // Convert to Mils
  // NATO 6400 mils per 360 deg
  const bearingMilsNato = Math.round((normalizedDeg / 360) * 6400) % 6400;
  // Warsaw Pact 6000 mils per 360 deg
  const bearingMilsWarsaw = Math.round((normalizedDeg / 360) * 6000) % 6000;

  return {
    horizontalDistance: Math.round(horizontalDistance * 10) / 10,
    slantDistance: Math.round(slantDistance * 10) / 10,
    elevationDiff: Math.round(dz * 10) / 10,
    bearingDegrees: Math.round(normalizedDeg * 10) / 10,
    bearingMilsNato,
    bearingMilsWarsaw,
    isValid: true,
  };
}

/**
 * Formats world coordinate (X, Y) into standard 6-digit military grid (e.g. "045 089")
 * Each 1000m has a 2-digit major number, and the third digit is hundreds of meters (0-9).
 */
export function format6DigitGrid(coord: WorldCoord): string {
  const x = Math.max(0, Math.floor(coord.x));
  const y = Math.max(0, Math.floor(coord.y));

  // 100m resolution
  const eastingHundred = Math.floor(x / 100);
  const northingHundred = Math.floor(y / 100);

  // Take 3 least significant digits of hundreds (or pad to 3 digits)
  const eStr = (eastingHundred % 1000).toString().padStart(3, '0');
  const nStr = (northingHundred % 1000).toString().padStart(3, '0');

  return `${eStr} ${nStr}`;
}

/**
 * Formats world coordinate (X, Y) into standard 8-digit military grid (e.g. "0452 0894")
 * 10m resolution.
 */
export function format8DigitGrid(coord: WorldCoord): string {
  const x = Math.max(0, Math.floor(coord.x));
  const y = Math.max(0, Math.floor(coord.y));

  // 10m resolution
  const eastingTen = Math.floor(x / 10);
  const northingTen = Math.floor(y / 10);

  const eStr = (eastingTen % 10000).toString().padStart(4, '0');
  const nStr = (northingTen % 10000).toString().padStart(4, '0');

  return `${eStr} ${nStr}`;
}

/**
 * Parses grid reference string (supports "045 089", "045089", "0452 0894", "04520894")
 * Returns estimated world coordinate, or null if invalid.
 */
export function parseGridReference(input: string): { x: number; y: number } | null {
  const cleaned = input.trim().replace(/[\s\-_,]/g, '');

  // 6-digit grid: 3 digits Easting, 3 digits Northing
  if (/^\d{6}$/.test(cleaned)) {
    const e = parseInt(cleaned.slice(0, 3), 10);
    const n = parseInt(cleaned.slice(3, 6), 10);
    // 100m grid cell, place at center (+50m)
    return {
      x: e * 100 + 50,
      y: n * 100 + 50,
    };
  }

  // 8-digit grid: 4 digits Easting, 4 digits Northing
  if (/^\d{8}$/.test(cleaned)) {
    const e = parseInt(cleaned.slice(0, 4), 10);
    const n = parseInt(cleaned.slice(4, 8), 10);
    // 10m grid cell, place at center (+5m)
    return {
      x: e * 10 + 5,
      y: n * 10 + 5,
    };
  }

  return null;
}

/**
 * Formats bearing into NATO mils string (e.g. "1600" or "0450")
 */
export function formatMils(mils: number): string {
  return mils.toString().padStart(4, '0');
}

/**
 * Formats bearing in degrees (e.g. "045.2°")
 */
export function formatDegrees(deg: number): string {
  return `${deg.toFixed(1).padStart(5, '0')}°`;
}

/**
 * Formats distance with unit (e.g. "1,450 m" or "3.42 km")
 */
export function formatDistance(meters: number): string {
  if (meters >= 10000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters).toLocaleString()} m`;
}
