import React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Crosshair, 
  Target, 
  Grid3X3, 
  Share2, 
  CircleDot,
  Tag,
  Layers
} from 'lucide-react';
import { TranslationKeys } from '../../localization/en';

interface MapControlsProps {
  t: TranslationKeys;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onCenterMortar: () => void;
  onCenterTarget: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showConnectingLine: boolean;
  onToggleLine: () => void;
  showRangeRings: boolean;
  onToggleRings: () => void;
  showMarkerLabels: boolean;
  onToggleLabels: () => void;
  viewMode: 'satellite' | 'topo' | 'hybrid';
  onCycleViewMode: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  t,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onCenterMortar,
  onCenterTarget,
  showGrid,
  onToggleGrid,
  showConnectingLine,
  onToggleLine,
  showRangeRings,
  onToggleRings,
  showMarkerLabels,
  onToggleLabels,
  viewMode,
  onCycleViewMode,
}) => {
  const viewModeLabel = 
    viewMode === 'satellite' ? t.maps.viewModeSatellite :
    viewMode === 'topo' ? t.maps.viewModeTopo :
    t.maps.viewModeHybrid;

  return (
    <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
      {/* View Mode switcher (Satellite / Topo / Hybrid) */}
      <div className="flex bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-xl overflow-hidden">
        <button
          onClick={onCycleViewMode}
          title={`Map View: ${viewModeLabel}`}
          aria-label={`Map View: ${viewModeLabel}`}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-200 hover:text-emerald-400 hover:bg-slate-800 transition active:scale-95"
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline uppercase tracking-wider">{viewModeLabel}</span>
        </button>
      </div>

      {/* Zoom controls */}
      <div className="flex flex-col bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-xl overflow-hidden">
        <button
          onClick={onZoomIn}
          title={t.maps.zoomIn}
          aria-label={t.maps.zoomIn}
          className="p-2.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition active:scale-95 border-b border-slate-800"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={onZoomOut}
          title={t.maps.zoomOut}
          aria-label={t.maps.zoomOut}
          className="p-2.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition active:scale-95 border-b border-slate-800"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={onResetZoom}
          title={t.maps.resetZoom}
          aria-label={t.maps.resetZoom}
          className="p-2.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Center shortcuts */}
      <div className="flex flex-col bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-xl overflow-hidden">
        <button
          onClick={onCenterMortar}
          title={t.maps.centerMortar}
          aria-label={t.maps.centerMortar}
          className="p-2.5 text-cyan-400 hover:bg-cyan-950/40 transition active:scale-95 border-b border-slate-800"
        >
          <Crosshair className="w-5 h-5" />
        </button>
        <button
          onClick={onCenterTarget}
          title={t.maps.centerTarget}
          aria-label={t.maps.centerTarget}
          className="p-2.5 text-amber-400 hover:bg-amber-950/40 transition active:scale-95"
        >
          <Target className="w-5 h-5" />
        </button>
      </div>

      {/* Layer toggles */}
      <div className="flex flex-col bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-xl overflow-hidden">
        <button
          onClick={onToggleGrid}
          title={t.maps.toggleGrid}
          aria-label={t.maps.toggleGrid}
          className={`p-2.5 transition active:scale-95 border-b border-slate-800 ${
            showGrid ? 'text-emerald-400 bg-emerald-950/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid3X3 className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleLine}
          title={t.maps.toggleLine}
          aria-label={t.maps.toggleLine}
          className={`p-2.5 transition active:scale-95 border-b border-slate-800 ${
            showConnectingLine ? 'text-amber-400 bg-amber-950/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleRings}
          title={t.maps.toggleRings}
          aria-label={t.maps.toggleRings}
          className={`p-2.5 transition active:scale-95 border-b border-slate-800 ${
            showRangeRings ? 'text-emerald-400 bg-emerald-950/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CircleDot className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleLabels}
          title={t.maps.toggleLabels}
          aria-label={t.maps.toggleLabels}
          className={`p-2.5 transition active:scale-95 ${
            showMarkerLabels ? 'text-slate-100 bg-slate-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
