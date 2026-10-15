import { AppSettings, SavedPosition } from '../types/settings';

const STORAGE_KEY = 'arma_reforger_mortar_cmd_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  version: 1,
  language: 'en',
  theme: 'tactical-dark',
  milSystem: 'nato_6400',
  gridPrecision: '8-digit',
  selectedMapId: 'everon',
  selectedDatasetId: 'm252_81mm',
  showGrid: true,
  showConnectingLine: true,
  showRangeRings: true,
  showMarkerLabels: true,
  showLandmarks: true,
  soundEnabled: true,
  savedPositions: [
    {
      id: 'default-everon-mortar',
      name: 'St. Philippe Base Mortar',
      mapId: 'everon',
      type: 'mortar',
      x: 3840,
      y: 6920,
      z: 85,
      createdAt: Date.now(),
      notes: 'Main FOB artillery pit',
    },
    {
      id: 'default-everon-target',
      name: 'Morton Crossroads Target',
      mapId: 'everon',
      type: 'target',
      x: 4950,
      y: 8120,
      z: 110,
      createdAt: Date.now(),
      notes: 'Observed enemy vehicle convoy',
    },
    {
      id: 'default-arland-mortar',
      name: 'Airfield Revetment',
      mapId: 'arland',
      type: 'mortar',
      x: 1820,
      y: 1950,
      z: 22,
      createdAt: Date.now(),
    },
    {
      id: 'default-arland-target',
      name: 'Radio Hill Tower',
      mapId: 'arland',
      type: 'target',
      x: 2750,
      y: 2880,
      z: 180,
      createdAt: Date.now(),
    },
  ],
  customMaps: {},
  customDatasets: {},
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_SETTINGS;

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      savedPositions: Array.isArray(parsed.savedPositions) ? parsed.savedPositions : DEFAULT_SETTINGS.savedPositions,
    };
  } catch (err) {
    console.error('Failed to parse stored settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (err) {
    console.error('Failed to save settings:', err);
    return false;
  }
}

export function exportSettingsAsJson(settings: AppSettings): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(settings, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `reforger-mortar-data-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function validateImportedData(raw: any): { valid: boolean; data?: AppSettings; error?: string } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Invalid JSON structure: must be an object' };
  }
  if (!raw.version || typeof raw.version !== 'number') {
    return { valid: false, error: 'Missing or invalid data schema version' };
  }
  if (!Array.isArray(raw.savedPositions)) {
    return { valid: false, error: 'Invalid savedPositions field: expected an array' };
  }

  // Validate saved positions
  for (const pos of raw.savedPositions) {
    if (typeof pos.id !== 'string' || typeof pos.name !== 'string' || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
      return { valid: false, error: `Invalid position entry: ${JSON.stringify(pos)}` };
    }
  }

  const sanitized: AppSettings = {
    ...DEFAULT_SETTINGS,
    ...raw,
  };

  return { valid: true, data: sanitized };
}
