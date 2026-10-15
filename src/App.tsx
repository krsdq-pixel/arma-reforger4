import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { TacticalMap } from './components/Map/TacticalMap';
import { CalculatorPanel } from './components/Calculator/CalculatorPanel';
import { SavedLocationsModal } from './components/SavedLocations/SavedLocationsModal';
import { SettingsModal } from './components/Settings/SettingsModal';

import { ActiveMarker } from './types/coordinates';
import { MapConfig } from './types/map';
import { AppSettings, SavedPosition, Language } from './types/settings';
import { WeaponDataset } from './types/ballistics';

import { mapRegistry } from './data/maps/registry';
import { ballisticsRegistry } from './data/ballistics/registry';
import { calculateGeometry } from './utils/coordinates';
import { calculateFiringSolution } from './utils/ballistics';
import { loadSettings, saveSettings, exportSettingsAsJson, DEFAULT_SETTINGS } from './utils/storage';
import { getTranslation } from './localization';
import { soundManager } from './utils/audio';

export default function App() {
  // Application settings from localStorage
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // Active Map
  const [currentMap, setCurrentMap] = useState<MapConfig>(() =>
    mapRegistry.getMap(settings.selectedMapId || 'everon')
  );

  // EXACTLY TWO ACTIVE MARKERS:
  // 1. Mortar Marker
  const [mortar, setMortar] = useState<ActiveMarker>(() => ({
    id: 'mortar',
    name: currentMap.defaultMortar.name,
    x: currentMap.defaultMortar.x,
    y: currentMap.defaultMortar.y,
    z: currentMap.defaultMortar.z,
  }));

  // 2. Target Marker
  const [target, setTarget] = useState<ActiveMarker>(() => ({
    id: 'target',
    name: currentMap.defaultTarget.name,
    x: currentMap.defaultTarget.x,
    y: currentMap.defaultTarget.y,
    z: currentMap.defaultTarget.z,
  }));

  // Active Ballistic Weapon Dataset
  const [activeDataset, setActiveDataset] = useState<WeaponDataset>(() =>
    ballisticsRegistry.getDataset(settings.selectedDatasetId || 'm252_81mm')
  );

  // Selected propellant charge
  const [selectedCharge, setSelectedCharge] = useState<number>(0);

  // Modal open states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavedLocationsOpen, setIsSavedLocationsOpen] = useState(false);

  // Sync sound manager enabled state
  useEffect(() => {
    soundManager.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Set HTML RTL attribute when language changes
  useEffect(() => {
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  // Save settings on update
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Map switching handler
  const handleSelectMap = useCallback((mapId: string) => {
    const newMap = mapRegistry.getMap(mapId);
    setCurrentMap(newMap);
    setSettings((prev) => ({ ...prev, selectedMapId: mapId }));

    // Reset markers to that map's default positions
    setMortar({
      id: 'mortar',
      name: newMap.defaultMortar.name,
      x: newMap.defaultMortar.x,
      y: newMap.defaultMortar.y,
      z: newMap.defaultMortar.z,
    });
    setTarget({
      id: 'target',
      name: newMap.defaultTarget.name,
      x: newMap.defaultTarget.x,
      y: newMap.defaultTarget.y,
      z: newMap.defaultTarget.z,
    });
  }, []);

  // Update mortar marker
  const handleUpdateMortar = useCallback((updates: Partial<ActiveMarker>) => {
    setMortar((prev) => ({ ...prev, ...updates }));
  }, []);

  // Update target marker
  const handleUpdateTarget = useCallback((updates: Partial<ActiveMarker>) => {
    setTarget((prev) => ({ ...prev, ...updates }));
  }, []);

  // Calculate Geometry (Distance, Bearing, Elevation delta)
  const geometry = useMemo(() => {
    return calculateGeometry(mortar, target);
  }, [mortar, target]);

  // Calculate Firing Solution
  const solution = useMemo(() => {
    return calculateFiringSolution(activeDataset, geometry, selectedCharge);
  }, [activeDataset, geometry, selectedCharge]);

  // Auto-switch to recommended charge if out of range and a recommended charge exists
  useEffect(() => {
    if (!solution.inRange && solution.recommendedCharge !== null && solution.recommendedCharge !== selectedCharge) {
      setSelectedCharge(solution.recommendedCharge);
    }
  }, [solution.inRange, solution.recommendedCharge, selectedCharge]);

  // Toggle Language
  const handleToggleLanguage = () => {
    const nextLang: Language = settings.language === 'en' ? 'ar' : 'en';
    setSettings((prev) => ({ ...prev, language: nextLang }));
  };

  // Saved location management
  const handleSaveToLibrary = (marker: ActiveMarker) => {
    const newPos: SavedPosition = {
      id: `pos-${Date.now()}`,
      name: marker.name || (marker.id === 'mortar' ? 'Firing Pit' : 'Target Point'),
      mapId: currentMap.id,
      type: marker.id,
      x: marker.x,
      y: marker.y,
      z: marker.z,
      createdAt: Date.now(),
    };
    setSettings((prev) => ({
      ...prev,
      savedPositions: [newPos, ...prev.savedPositions],
    }));
  };

  const handleLoadAsMortar = (pos: SavedPosition) => {
    setMortar({
      id: 'mortar',
      name: pos.name,
      x: pos.x,
      y: pos.y,
      z: pos.z,
    });
  };

  const handleLoadAsTarget = (pos: SavedPosition) => {
    setTarget({
      id: 'target',
      name: pos.name,
      x: pos.x,
      y: pos.y,
      z: pos.z,
    });
  };

  const handleDeleteSavedPosition = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      savedPositions: prev.savedPositions.filter((p) => p.id !== id),
    }));
  };

  const handleRenameSavedPosition = (id: string, newName: string) => {
    setSettings((prev) => ({
      ...prev,
      savedPositions: prev.savedPositions.map((p) =>
        p.id === id ? { ...p, name: newName } : p
      ),
    }));
  };

  // Reset to default settings
  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    handleSelectMap('everon');
  };

  // Translations
  const t = getTranslation(settings.language);

  // Available map and dataset lists
  const availableMaps = mapRegistry.getAllMaps();
  const availableDatasets = ballisticsRegistry.getAllDatasets();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080b10] text-slate-100 font-sans">
      {/* Top Application Header */}
      <Header
        currentMap={currentMap}
        availableMaps={availableMaps}
        onSelectMap={handleSelectMap}
        language={settings.language}
        onToggleLanguage={handleToggleLanguage}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSavedLocations={() => setIsSavedLocationsOpen(true)}
        savedPositionsCount={settings.savedPositions.filter((p) => p.mapId === currentMap.id).length}
        t={t}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {/* Interactive Tactical Map */}
        <div className="flex-1 h-full w-full relative">
          <TacticalMap
            map={currentMap}
            mortar={mortar}
            target={target}
            activeDataset={activeDataset}
            selectedCharge={selectedCharge}
            onUpdateMortar={handleUpdateMortar}
            onUpdateTarget={handleUpdateTarget}
            showGrid={settings.showGrid}
            showConnectingLine={settings.showConnectingLine}
            showRangeRings={settings.showRangeRings}
            showMarkerLabels={settings.showMarkerLabels}
            onOpenAssetManager={() => {
              setIsSettingsOpen(true);
            }}
            onToggleGrid={() => setSettings((s) => ({ ...s, showGrid: !s.showGrid }))}
            onToggleLine={() => setSettings((s) => ({ ...s, showConnectingLine: !s.showConnectingLine }))}
            onToggleRings={() => setSettings((s) => ({ ...s, showRangeRings: !s.showRangeRings }))}
            onToggleLabels={() => setSettings((s) => ({ ...s, showMarkerLabels: !s.showMarkerLabels }))}
            language={settings.language}
            t={t}
          />
        </div>

        {/* Firing Solution & Coordinate Calculator Panel */}
        <CalculatorPanel
          mortar={mortar}
          target={target}
          solution={solution}
          activeDataset={activeDataset}
          selectedCharge={selectedCharge}
          isMapCalibrated={currentMap.isCalibrated}
          onSelectCharge={setSelectedCharge}
          onUpdateMortar={handleUpdateMortar}
          onUpdateTarget={handleUpdateTarget}
          onSaveToLibrary={handleSaveToLibrary}
          t={t}
        />
      </div>

      {/* Saved Positions Library Modal */}
      <SavedLocationsModal
        isOpen={isSavedLocationsOpen}
        onClose={() => setIsSavedLocationsOpen(false)}
        savedPositions={settings.savedPositions}
        currentMapId={currentMap.id}
        onLoadAsMortar={handleLoadAsMortar}
        onLoadAsTarget={handleLoadAsTarget}
        onDeletePosition={handleDeleteSavedPosition}
        onRenamePosition={handleRenameSavedPosition}
        t={t}
      />

      {/* Settings & Asset Manager Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(updates) => setSettings((s) => ({ ...s, ...updates }))}
        currentMap={currentMap}
        onUpdateMapCalibration={(updates) => {
          mapRegistry.updateMapCalibration(currentMap.id, updates);
          setCurrentMap((m) => ({ ...m, ...updates }));
        }}
        availableMaps={availableMaps}
        availableDatasets={availableDatasets}
        onExportData={() => exportSettingsAsJson(settings)}
        onImportData={(data) => setSettings(data)}
        onResetDefaults={handleResetDefaults}
        t={t}
      />
    </div>
  );
}
