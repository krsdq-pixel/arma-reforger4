import React, { useState, useEffect } from 'react';
import { ActiveMarker } from '../../types/coordinates';
import { TranslationKeys } from '../../localization/en';
import { format6DigitGrid, format8DigitGrid, parseGridReference } from '../../utils/coordinates';
import { Crosshair, Target, BookmarkPlus, Check, ArrowRight } from 'lucide-react';

interface ManualCoordinateInputProps {
  marker: ActiveMarker;
  type: 'mortar' | 'target';
  onUpdate: (updates: Partial<ActiveMarker>) => void;
  onSaveToLibrary: (marker: ActiveMarker) => void;
  t: TranslationKeys;
}

export const ManualCoordinateInput: React.FC<ManualCoordinateInputProps> = ({
  marker,
  type,
  onUpdate,
  onSaveToLibrary,
  t,
}) => {
  const isMortar = type === 'mortar';
  const colorClass = isMortar ? 'text-sky-400 border-sky-500/40' : 'text-amber-400 border-amber-500/40';
  const bgAccent = isMortar ? 'bg-sky-950/30' : 'bg-amber-950/30';

  // Local input states
  const [easting, setEasting] = useState(marker.x.toString());
  const [northing, setNorthing] = useState(marker.y.toString());
  const [altitude, setAltitude] = useState(marker.z.toString());
  const [gridInput, setGridInput] = useState('');
  const [gridError, setGridError] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setEasting(marker.x.toString());
    setNorthing(marker.y.toString());
    setAltitude(marker.z.toString());
  }, [marker.x, marker.y, marker.z]);

  const handleApplyMeters = () => {
    const x = parseFloat(easting);
    const y = parseFloat(northing);
    const z = parseFloat(altitude);
    if (!isNaN(x) && !isNaN(y)) {
      onUpdate({
        x: Math.round(x),
        y: Math.round(y),
        z: isNaN(z) ? 0 : Math.round(z),
      });
    }
  };

  const handleApplyGrid = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseGridReference(gridInput);
    if (parsed) {
      onUpdate({
        x: Math.round(parsed.x),
        y: Math.round(parsed.y),
      });
      setGridError(false);
      setGridInput('');
    } else {
      setGridError(true);
    }
  };

  const handleSave = () => {
    onSaveToLibrary(marker);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className={`p-3 rounded-lg border ${colorClass} ${bgAccent} flex flex-col gap-2.5`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMortar ? <Crosshair className="w-4 h-4 text-sky-400" /> : <Target className="w-4 h-4 text-amber-400" />}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {isMortar ? t.markers.mortar : t.markers.target}
          </span>
        </div>

        <button
          onClick={handleSave}
          title={t.markers.saveLocation}
          className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700"
        >
          {savedSuccess ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Saved</span>
            </>
          ) : (
            <>
              <BookmarkPlus className="w-3 h-3" />
              <span>{t.markers.saveLocation}</span>
            </>
          )}
        </button>
      </div>

      {/* Current Grid badges */}
      <div className="flex items-center justify-between text-xs font-mono bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-800">
        <div className="flex items-center gap-1">
          <span className="text-slate-500">6-DIGIT:</span>
          <span className="text-slate-200 font-bold">{format6DigitGrid(marker)}</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1">
          <span className="text-slate-500">8-DIGIT:</span>
          <span className="text-emerald-400 font-bold">{format8DigitGrid(marker)}</span>
        </div>
      </div>

      {/* Fast Grid paste / manual input */}
      <form onSubmit={handleApplyGrid} className="flex gap-1.5">
        <input
          type="text"
          value={gridInput}
          onChange={(e) => {
            setGridInput(e.target.value);
            setGridError(false);
          }}
          placeholder={t.coordinates.pasteHint}
          className={`flex-1 bg-slate-900 border rounded px-2 py-1 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 ${
            gridError ? 'border-rose-500' : 'border-slate-700'
          }`}
        />
        <button
          type="submit"
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded text-xs text-slate-200 flex items-center gap-1 font-semibold transition"
        >
          <span>{t.coordinates.apply}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </form>

      {/* Detailed meters and altitude inputs */}
      <div className="grid grid-cols-3 gap-1.5 text-xs">
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
            {t.coordinates.easting}
          </label>
          <input
            type="number"
            value={easting}
            onChange={(e) => setEasting(e.target.value)}
            onBlur={handleApplyMeters}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
            {t.coordinates.northing}
          </label>
          <input
            type="number"
            value={northing}
            onChange={(e) => setNorthing(e.target.value)}
            onBlur={handleApplyMeters}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
            {t.markers.elevationM}
          </label>
          <input
            type="number"
            value={altitude}
            onChange={(e) => setAltitude(e.target.value)}
            onBlur={handleApplyMeters}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>
    </div>
  );
};
