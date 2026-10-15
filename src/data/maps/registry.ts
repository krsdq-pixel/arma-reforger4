import { MapConfig } from '../../types/map';
import { everonMap } from './everon';
import { arlandMap } from './arland';
import { kolguyevMap } from './kolguyev';

export const PRIMARY_MAPS: MapConfig[] = [
  everonMap,
  arlandMap,
  kolguyevMap,
];

class MapRegistry {
  private maps: Map<string, MapConfig> = new Map();

  constructor() {
    this.initDefaultMaps();
  }

  private initDefaultMaps() {
    this.maps.clear();
    for (const map of PRIMARY_MAPS) {
      this.maps.set(map.id, map);
    }
  }

  public getAllMaps(): MapConfig[] {
    return Array.from(this.maps.values());
  }

  public getMap(id: string): MapConfig {
    const map = this.maps.get(id);
    if (map) return map;
    // Fallback to Everon
    return this.maps.get('everon') || everonMap;
  }

  public registerCustomMap(map: MapConfig): void {
    this.maps.set(map.id, map);
  }

  public removeCustomMap(id: string): boolean {
    if (PRIMARY_MAPS.some((m) => m.id === id)) {
      // Primary maps cannot be removed
      return false;
    }
    return this.maps.delete(id);
  }

  public updateMapCalibration(mapId: string, updates: Partial<MapConfig>): boolean {
    const existing = this.maps.get(mapId);
    if (!existing) return false;
    this.maps.set(mapId, {
      ...existing,
      ...updates,
    });
    return true;
  }
}

export const mapRegistry = new MapRegistry();
