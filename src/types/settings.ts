import { GridPrecision } from './coordinates';
export type { GridPrecision };

export type MilSystem = 'nato_6400' | 'warsaw_6000' | 'degrees';
export type Language = 'en' | 'ar';
export type Theme = 'tactical-dark' | 'tactical-green' | 'oled';

export interface SavedPosition {
  id: string;
  name: string;
  mapId: string;
  type: 'mortar' | 'target';
  x: number;
  y: number;
  z: number;
  createdAt: number;
  notes?: string;
}

export interface AppSettings {
  version: number;
  language: Language;
  theme: Theme;
  milSystem: MilSystem;
  gridPrecision: GridPrecision;
  selectedMapId: string;
  selectedDatasetId: string;
  showGrid: boolean;
  showConnectingLine: boolean;
  showRangeRings: boolean;
  showMarkerLabels: boolean;
  showLandmarks: boolean;
  soundEnabled: boolean;
  savedPositions: SavedPosition[];
  customMaps: Record<string, any>;
  customDatasets: Record<string, any>;
}
