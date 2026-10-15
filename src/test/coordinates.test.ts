import { describe, it, expect } from 'vitest';
import { 
  calculateGeometry, 
  format6DigitGrid, 
  format8DigitGrid, 
  parseGridReference,
  formatMils,
  formatDegrees,
  formatDistance
} from '../utils/coordinates';

describe('Coordinate Mathematics & Geometry', () => {
  it('handles identical positions safely without division by zero', () => {
    const pos = { x: 5000, y: 5000, z: 100 };
    const res = calculateGeometry(pos, pos);
    expect(res.horizontalDistance).toBe(0);
    expect(res.elevationDiff).toBe(0);
    expect(res.bearingDegrees).toBe(0);
    expect(res.bearingMilsNato).toBe(0);
    expect(res.isValid).toBe(true);
  });

  it('calculates cardinal direction: Due North', () => {
    const from = { x: 5000, y: 5000 };
    const to = { x: 5000, y: 6000 }; // 1000m North
    const res = calculateGeometry(from, to);
    expect(res.horizontalDistance).toBe(1000);
    expect(res.bearingDegrees).toBe(0);
    expect(res.bearingMilsNato).toBe(0);
    expect(res.bearingMilsWarsaw).toBe(0);
  });

  it('calculates cardinal direction: Due East', () => {
    const from = { x: 5000, y: 5000 };
    const to = { x: 6000, y: 5000 }; // 1000m East
    const res = calculateGeometry(from, to);
    expect(res.horizontalDistance).toBe(1000);
    expect(res.bearingDegrees).toBe(90);
    expect(res.bearingMilsNato).toBe(1600); // 90/360 * 6400 = 1600
    expect(res.bearingMilsWarsaw).toBe(1500); // 90/360 * 6000 = 1500
  });

  it('calculates cardinal direction: Due South', () => {
    const from = { x: 5000, y: 5000 };
    const to = { x: 5000, y: 4000 }; // 1000m South
    const res = calculateGeometry(from, to);
    expect(res.horizontalDistance).toBe(1000);
    expect(res.bearingDegrees).toBe(180);
    expect(res.bearingMilsNato).toBe(3200);
    expect(res.bearingMilsWarsaw).toBe(3000);
  });

  it('calculates cardinal direction: Due West', () => {
    const from = { x: 5000, y: 5000 };
    const to = { x: 4000, y: 5000 }; // 1000m West
    const res = calculateGeometry(from, to);
    expect(res.horizontalDistance).toBe(1000);
    expect(res.bearingDegrees).toBe(270);
    expect(res.bearingMilsNato).toBe(4800);
    expect(res.bearingMilsWarsaw).toBe(4500);
  });

  it('calculates diagonal directions (NE 45° and SW 225°)', () => {
    const from = { x: 1000, y: 1000 };
    const toNE = { x: 2000, y: 2000 };
    const resNE = calculateGeometry(from, toNE);
    expect(resNE.bearingDegrees).toBe(45);
    expect(resNE.bearingMilsNato).toBe(800);

    const toSW = { x: 0, y: 0 };
    const resSW = calculateGeometry(from, toSW);
    expect(resSW.bearingDegrees).toBe(225);
    expect(resSW.bearingMilsNato).toBe(4000);
  });

  it('computes 3D slant range with elevation difference', () => {
    const from = { x: 0, y: 0, z: 100 };
    const to = { x: 300, y: 400, z: 200 }; // dx=300, dy=400, dz=100
    const res = calculateGeometry(from, to);
    expect(res.horizontalDistance).toBe(500); // 3-4-5 triangle
    expect(res.elevationDiff).toBe(100);
    // Slant: sqrt(500^2 + 100^2) = sqrt(260000) ~= 509.9m
    expect(res.slantDistance).toBeCloseTo(509.9, 1);
  });

  it('formats 6-digit military grid reference accurately', () => {
    const coord = { x: 4520, y: 8940 };
    // 4520 / 100 = 45 -> "045", 8940 / 100 = 89 -> "089"
    expect(format6DigitGrid(coord)).toBe('045 089');
  });

  it('formats 8-digit military grid reference accurately', () => {
    const coord = { x: 4520, y: 8940 };
    // 4520 / 10 = 452 -> "0452", 8940 / 10 = 894 -> "0894"
    expect(format8DigitGrid(coord)).toBe('0452 0894');
  });

  it('parses 6-digit and 8-digit grid inputs', () => {
    const p6 = parseGridReference('045 089');
    expect(p6).not.toBeNull();
    expect(p6?.x).toBe(4550); // center of cell
    expect(p6?.y).toBe(8950);

    const p8 = parseGridReference('0452 0894');
    expect(p8).not.toBeNull();
    expect(p8?.x).toBe(4525);
    expect(p8?.y).toBe(8945);

    expect(parseGridReference('invalid')).toBeNull();
  });
});
