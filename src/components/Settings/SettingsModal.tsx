import React, { useState, useRef } from 'react';
import { AppSettings, Language, MilSystem, GridPrecision, Theme } from '../../types/settings';
import { MapConfig } from '../../types/map';
import { WeaponDataset } from '../../types/ballistics';
import { TranslationKeys } from '../../localization/en';
import { soundManager } from '../../utils/audio';
import { 
  X, 
  Settings as SettingsIcon, 
  Globe, 
  Map as MapIcon, 
  Crosshair, 
  Database, 
  Upload, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  FileCheck,
  Volume2,
  VolumeX,
  Layers
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  currentMap: MapConfig;
  onUpdateMapCalibration: (updates: Partial<MapConfig>) => void;
  availableMaps: MapConfig[];
  availableDatasets: WeaponDataset[];
  onExportData: () => void;
  onImportData: (data: AppSettings) => void;
  onResetDefaults: () => void;
  t: TranslationKeys;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  currentMap,
  onUpdateMapCalibration,
  availableMaps,
  availableDatasets,
  onExportData,
  onImportData,
  onResetDefaults,
  t,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'map' | 'ballistics' | 'data' | 'assets'>('general');
  const [confirmReset, setConfirmReset] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapImageInputRef = useRef<HTMLInputElement>(null);

  // Asset calibration state
  const [imagePreview, setImagePreview] = useState<string | null>(currentMap.customImageUrl || null);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(
    currentMap.customImageDimensions || null
  );

  if (!isOpen) return null;

  // Handle JSON file import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        onImportData(json);
        setImportError(null);
        alert(t.settings.importSuccess);
      } catch (err: any) {
        setImportError(err.message || t.settings.importError);
      }
    };
    reader.readAsText(file);
  };

  // Handle custom map image upload
  const handleMapImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const url = evt.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setImagePreview(url);
        setImgDimensions({ width: img.width, height: img.height });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const applyCustomMapImage = () => {
    if (!imagePreview || !imgDimensions) return;
    const metersPerPixel = currentMap.widthMeters / imgDimensions.width;
    onUpdateMapCalibration({
      customImageUrl: imagePreview,
      customImageDimensions: imgDimensions,
      assetStatus: 'custom_image',
      calibration: {
        ...currentMap.calibration,
        metersPerPixel,
      },
    });
    alert(t.assetManager.saveCalibration);
  };

  const revertToVectorMap = () => {
    setImagePreview(null);
    setImgDimensions(null);
    onUpdateMapCalibration({
      customImageUrl: undefined,
      customImageDimensions: undefined,
      assetStatus: 'verified_vector',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              {t.settings.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'general' ? 'border-emerald-500 text-emerald-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t.settings.general}</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2.5 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'map' ? 'border-emerald-500 text-emerald-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{t.settings.map}</span>
          </button>

          <button
            onClick={() => setActiveTab('ballistics')}
            className={`px-4 py-2.5 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'ballistics' ? 'border-emerald-500 text-emerald-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{t.settings.ballistics}</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2.5 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'data' ? 'border-emerald-500 text-emerald-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{t.settings.savedData}</span>
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`px-4 py-2.5 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'assets' ? 'border-emerald-500 text-emerald-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.settings.advanced}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-200">
          {activeTab === 'general' && (
            <div className="flex flex-col gap-4">
              {/* Language */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-300 uppercase">{t.settings.language}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateSettings({ language: 'en' })}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold transition ${
                      settings.language === 'en'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    English (LTR)
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ language: 'ar' })}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold font-arabic transition ${
                      settings.language === 'ar'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    العربية (RTL)
                  </button>
                </div>
              </div>

              {/* Mil System standard */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-300 uppercase">{t.settings.milSystem}</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onUpdateSettings({ milSystem: 'nato_6400' })}
                    className={`py-2 px-2.5 rounded-lg border text-center font-mono font-medium transition ${
                      settings.milSystem === 'nato_6400'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400'
                    }`}
                  >
                    {t.settings.nato6400}
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ milSystem: 'warsaw_6000' })}
                    className={`py-2 px-2.5 rounded-lg border text-center font-mono font-medium transition ${
                      settings.milSystem === 'warsaw_6000'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400'
                    }`}
                  >
                    {t.settings.warsaw6000}
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ milSystem: 'degrees' })}
                    className={`py-2 px-2.5 rounded-lg border text-center font-mono font-medium transition ${
                      settings.milSystem === 'degrees'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400'
                    }`}
                  >
                    {t.settings.degrees}
                  </button>
                </div>
              </div>

              {/* Sound effects */}
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  )}
                  <div>
                    <p className="font-bold text-slate-200">{t.settings.sound}</p>
                    <p className="text-[11px] text-slate-500">Audio pips for round out & impact splash countdown</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    onUpdateSettings({ soundEnabled: enabled });
                    soundManager.enabled = enabled;
                  }}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-300 uppercase">Map Display Layers</label>
                
                <label className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer">
                  <span>{t.maps.toggleGrid}</span>
                  <input
                    type="checkbox"
                    checked={settings.showGrid}
                    onChange={(e) => onUpdateSettings({ showGrid: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer">
                  <span>{t.maps.toggleLine}</span>
                  <input
                    type="checkbox"
                    checked={settings.showConnectingLine}
                    onChange={(e) => onUpdateSettings({ showConnectingLine: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer">
                  <span>{t.maps.toggleRings}</span>
                  <input
                    type="checkbox"
                    checked={settings.showRangeRings}
                    onChange={(e) => onUpdateSettings({ showRangeRings: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer">
                  <span>{t.maps.toggleLabels}</span>
                  <input
                    type="checkbox"
                    checked={settings.showMarkerLabels}
                    onChange={(e) => onUpdateSettings({ showMarkerLabels: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500"
                  />
                </label>
              </div>

              {/* Map bounds info */}
              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400">
                <p className="text-slate-200 font-bold mb-1">Active Map Calibration Info</p>
                <p>Map ID: {currentMap.id}</p>
                <p>World Dimensions: {currentMap.widthMeters}m × {currentMap.heightMeters}m</p>
                <p>Grid: {currentMap.gridIntervalMajor}m Major / {currentMap.gridIntervalMinor}m Minor</p>
                <p>Status: {currentMap.assetStatus.toUpperCase()}</p>
                <p>Source: {currentMap.sourceAttribution}</p>
              </div>
            </div>
          )}

          {activeTab === 'ballistics' && (
            <div className="flex flex-col gap-3">
              <label className="font-bold text-slate-300 uppercase">{t.calculator.dataset}</label>
              <div className="flex flex-col gap-2">
                {availableDatasets.map((ds) => {
                  const isSelected = ds.id === settings.selectedDatasetId;
                  return (
                    <div
                      key={ds.id}
                      onClick={() => onUpdateSettings({ selectedDatasetId: ds.id })}
                      className={`p-3 rounded-lg border cursor-pointer transition ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/30 text-emerald-200'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{ds.weaponName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {ds.verificationStatus.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{ds.ammoType} • Max Range: {ds.maxEffectiveRange}m</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Source: {ds.dataSource}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col gap-2.5">
                <p className="font-bold text-slate-200">Backup & Restore</p>
                <p className="text-[11px] text-slate-400">
                  Export all your saved mortar firing points, target library, and settings to a JSON file.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={onExportData}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-md font-semibold text-xs transition"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.settings.exportData}</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-md font-semibold text-xs transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    <span>{t.settings.importData}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {importError && (
                  <p className="text-rose-400 text-[11px]">{importError}</p>
                )}
              </div>

              {/* Reset to defaults */}
              <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg flex flex-col gap-2">
                <p className="font-bold text-rose-300">{t.settings.resetDefaults}</p>
                <p className="text-[11px] text-rose-300/80">
                  Resets all settings and saved positions back to default installation state.
                </p>

                {confirmReset ? (
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => {
                        onResetDefaults();
                        setConfirmReset(false);
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-xs"
                    >
                      Confirm Reset
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmReset(true)}
                    className="self-start px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded border border-rose-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.settings.resetDefaults}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="flex flex-col gap-3">
              <p className="font-bold text-slate-200">{t.assetManager.title}</p>
              <p className="text-[11px] text-slate-400">{t.assetManager.instructions}</p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => mapImageInputRef.current?.click()}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t.assetManager.uploadImage}</span>
                </button>
                <input
                  ref={mapImageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleMapImageUpload}
                  className="hidden"
                />

                {currentMap.customImageUrl && (
                  <button
                    onClick={revertToVectorMap}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs transition"
                  >
                    {t.assetManager.resetMap}
                  </button>
                )}
              </div>

              {imgDimensions && (
                <div className="p-3 bg-slate-950/80 rounded border border-slate-800 font-mono text-[11px] text-slate-300 flex flex-col gap-1">
                  <p>Resolution: {imgDimensions.width}px × {imgDimensions.height}px</p>
                  <p>Calculated Scale: {(currentMap.widthMeters / imgDimensions.width).toFixed(3)} meters/pixel</p>
                  <button
                    onClick={applyCustomMapImage}
                    className="mt-2 self-start px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-semibold text-xs"
                  >
                    {t.assetManager.saveCalibration}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
