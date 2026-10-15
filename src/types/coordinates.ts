export interface WorldCoord {
  x: number; // Easting in meters (0 to map width)
  y: number; // Northing in meters (0 to map height)
  z?: number; // Altitude / Elevation above sea level in meters (optional)
}

export interface ScreenCoord {
  x: number;
  y: number;
}

export interface ActiveMarker {
  id: 'mortar' | 'target';
  name: string;
  x: number;
  y: number;
  z: number;
}

export interface CalculationResult {
  horizontalDistance: number; // meters
  slantDistance: number;      // meters
  elevationDiff: number;      // target Z - mortar Z (meters)
  bearingDegrees: number;     // 0 - 359.99 degrees (0 = North, 90 = East)
  bearingMilsNato: number;    // 0 - 6399 mils (6400 mils circle)
  bearingMilsWarsaw: number;  // 0 - 5999 mils (6000 mils circle)
  isValid: boolean;
  warning?: string;
}

export type GridPrecision = '6-digit' | '8-digit' | 'meters';
