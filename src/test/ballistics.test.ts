import { describe, it, expect } from 'vitest';
import { interpolateBallistics, calculateFiringSolution } from '../utils/ballistics';
import { m252Mortar } from '../data/ballistics/m252';
import { calculateGeometry } from '../utils/coordinates';

describe('Ballistics & Firing Solutions', () => {
  it('interpolates elevation and TOF accurately between table entries', () => {
    const charge0 = m252Mortar.charges[0];
    // Entry 100m is 1495 mils (tof 11.6), Entry 150m is 1460 mils (tof 12.2)
    const mid = interpolateBallistics(charge0.table, 125, 0);
    expect(mid).not.toBeNull();
    // Midpoint: (1495 + 1460) / 2 = 1477.5 -> rounded 1478 mils
    expect(mid?.elevationMils).toBe(1478);
    // TOF midpoint: (11.6 + 12.2) / 2 = 11.9s
    expect(mid?.tof).toBe(11.9);
  });

  it('adjusts elevation for target height difference', () => {
    const charge0 = m252Mortar.charges[0];
    // At 100m, elevation is 1495 mils with +23 mils per 100m height delta
    const resLevel = interpolateBallistics(charge0.table, 100, 0);
    const resHigh = interpolateBallistics(charge0.table, 100, 100); // Target is 100m higher

    expect(resLevel?.elevationMils).toBe(1495);
    expect(resHigh?.elevationMils).toBe(1495 + 23);
  });

  it('computes full firing solution for valid distance', () => {
    const mortarPos = { x: 3000, y: 3000, z: 50 };
    const targetPos = { x: 3000, y: 4000, z: 50 }; // 1000m Due North
    const geom = calculateGeometry(mortarPos, targetPos);

    const solution = calculateFiringSolution(m252Mortar, geom, 1);
    expect(solution.inRange).toBe(true);
    expect(solution.bearingDeg).toBe(0);
    expect(solution.bearingMils).toBe(0);
    expect(solution.elevationMils).toBe(1282); // M252 Charge 1 at 1000m
    expect(solution.tof).toBe(23.7);
  });

  it('detects out-of-range targets and provides appropriate warnings', () => {
    const mortarPos = { x: 1000, y: 1000, z: 0 };
    const targetFar = { x: 1000, y: 9000, z: 0 }; // 8000m range (exceeds max 5650m)
    const geom = calculateGeometry(mortarPos, targetFar);

    const solution = calculateFiringSolution(m252Mortar, geom, 4);
    expect(solution.inRange).toBe(false);
    expect(solution.warning).toContain('Exceeds maximum weapon range');
  });

  it('detects danger close targets below weapon minimum range', () => {
    const mortarPos = { x: 1000, y: 1000, z: 0 };
    const targetClose = { x: 1000, y: 1040, z: 0 }; // 40m range (below min 80m)
    const geom = calculateGeometry(mortarPos, targetClose);

    const solution = calculateFiringSolution(m252Mortar, geom);
    expect(solution.inRange).toBe(false);
    expect(solution.warning).toContain('Danger Close');
  });
});
