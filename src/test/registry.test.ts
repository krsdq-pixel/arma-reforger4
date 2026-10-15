import { describe, it, expect } from 'vitest';
import { mapRegistry } from '../data/maps/registry';
import { ballisticsRegistry } from '../data/ballistics/registry';

describe('Map and Ballistics Registry', () => {
  it('contains the three required primary maps: Everon, Arland, and Kolguyev', () => {
    const maps = mapRegistry.getAllMaps();
    const mapIds = maps.map((m) => m.id);

    expect(mapIds).toContain('everon');
    expect(mapIds).toContain('arland');
    expect(mapIds).toContain('kolguyev');
  });

  it('validates that each primary map has valid calibration, tiles, and default markers', () => {
    for (const id of ['everon', 'arland', 'kolguyev']) {
      const map = mapRegistry.getMap(id);
      expect(map).toBeDefined();
      expect(map.widthMeters).toBeGreaterThan(0);
      expect(map.heightMeters).toBeGreaterThan(0);
      expect(map.isCalibrated).toBe(true);
      expect(map.calibration.metersPerPixel).toBeGreaterThan(0);
      expect(map.tileUrlTemplate).toBeDefined();
      expect(map.tileUrlTemplate).toContain('{z}/{x}/{y}');
      expect(map.previewImageUrl).toBeDefined();
      expect(map.defaultMortar).toBeDefined();
      expect(map.defaultTarget).toBeDefined();
      expect(map.landmarks.length).toBeGreaterThan(5);
    }
  });

  it('validates the weapon ballistics registry contains primary weapons', () => {
    const datasets = ballisticsRegistry.getAllDatasets();
    const dsIds = datasets.map((d) => d.id);

    expect(dsIds).toContain('m252_81mm');
    expect(dsIds).toContain('2b14_82mm');
    expect(dsIds).toContain('2b9_vasilek');
  });

  it('validates custom dataset importer rejects invalid structure', () => {
    const invalid = { id: 'test' }; // missing charges
    const res = ballisticsRegistry.validateCustomDataset(invalid);
    expect(res.valid).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('validates custom dataset importer accepts well-formed data', () => {
    const valid = {
      id: 'custom_mortar',
      weaponName: 'Custom 60mm Commando',
      charges: [
        {
          chargeNumber: 0,
          minRange: 50,
          maxRange: 500,
          table: [
            { range: 50, elevationMils: 1500, tof: 8 },
            { range: 500, elevationMils: 1000, tof: 16 },
          ],
        },
      ],
    };
    const res = ballisticsRegistry.validateCustomDataset(valid);
    expect(res.valid).toBe(true);
    expect(res.dataset?.weaponName).toBe('Custom 60mm Commando');
  });
});
