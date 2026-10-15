import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { MapConfig } from '../../types/map';
import { WorldCoord } from '../../types/coordinates';
import { format8DigitGrid } from '../../utils/coordinates';
import { TranslationKeys } from '../../localization/en';

interface MapStatusProps {
  map: MapConfig;
  cursorCoord: WorldCoord | null;
  zoom: number;
  t: TranslationKeys;
}

export const MapStatus: React.FC<MapStatusProps> = ({
  map,
  cursorCoord,
  zoom,
  t,
}) => {
  // Compute scale bar distance (approx 100 screen pixels)
  // At zoom z, 1 screen pixel = 1 / z meters in world space
  const pixelsForScale = 80;
  const metersPerScreenPixel = 1 / Math.max(0.001, zoom);
  const rawMeters = pixelsForScale * metersPerScreenPixel;

  // Round scale bar to standard intervals (50, 100, 200, 500, 1000, 2000, 5000)
  const intervals = [50, 100, 200, 500, 1000, 2000, 5000];
  let scaleMeters = intervals[0];
  for (const interval of intervals) {
    if (rawMeters >= interval * 0.7) {
      scaleMeters = interval;
    }
  }
  const scaleBarWidthPixels = Math.round(scaleMeters / metersPerScreenPixel);

  return (
    <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
      {/* Map calibration & status badge */}
      <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-lg pointer-events-auto">
        <span className="text-xs font-bold text-slate-200 tracking-wider">
          {map.name.toUpperCase()}
        </span>
        <div className="h-3 w-px bg-slate-700" />
        {map.isCalibrated ? (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.maps.calibratedBadge}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t.maps.uncalibratedBadge}</span>
          </div>
        )}
      </div>

      {/* Cursor coordinates & scale bar */}
      <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-lg text-xs font-mono text-slate-300 pointer-events-auto">
        {cursorCoord ? (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">GRID:</span>
            <span className="text-emerald-400 font-bold tracking-wider">{format8DigitGrid(cursorCoord)}</span>
            <span className="text-slate-500 text-[10px]">
              (E:{Math.round(cursorCoord.x)} N:{Math.round(cursorCoord.y)})
            </span>
          </div>
        ) : (
          <span className="text-slate-400 text-[11px]">Hover/Touch Map for Grid</span>
        )}

        <div className="h-3 w-px bg-slate-700" />

        {/* Dynamic visual scale bar */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-between w-full text-[9px] text-slate-400 mb-0.5">
            <span>0</span>
            <span>{scaleMeters >= 1000 ? `${scaleMeters / 1000}km` : `${scaleMeters}m`}</span>
          </div>
          <div 
            className="h-1.5 bg-emerald-500/80 border border-slate-900 rounded-sm relative"
            style={{ width: `${Math.max(30, scaleBarWidthPixels)}px` }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
};
