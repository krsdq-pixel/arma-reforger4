import React, { useState } from 'react';
import { ActiveMarker } from '../../types/coordinates';
import { WeaponDataset, FiringSolution } from '../../types/ballistics';
import { TranslationKeys } from '../../localization/en';
import { FiringSolutionCard } from './FiringSolutionCard';
import { ManualCoordinateInput } from './ManualCoordinateInput';
import { SplashCountdown } from './SplashCountdown';
import { ChevronUp, ChevronDown, Calculator, ShieldAlert } from 'lucide-react';
import { formatMils, formatDegrees } from '../../utils/coordinates';

interface CalculatorPanelProps {
  mortar: ActiveMarker;
  target: ActiveMarker;
  solution: FiringSolution;
  activeDataset: WeaponDataset;
  selectedCharge: number;
  isMapCalibrated: boolean;
  onSelectCharge: (charge: number) => void;
  onUpdateMortar: (updates: Partial<ActiveMarker>) => void;
  onUpdateTarget: (updates: Partial<ActiveMarker>) => void;
  onSaveToLibrary: (marker: ActiveMarker) => void;
  t: TranslationKeys;
}

export const CalculatorPanel: React.FC<CalculatorPanelProps> = ({
  mortar,
  target,
  solution,
  activeDataset,
  selectedCharge,
  isMapCalibrated,
  onSelectCharge,
  onUpdateMortar,
  onUpdateTarget,
  onSaveToLibrary,
  t,
}) => {
  // Mobile expand/collapse state: default expanded on desktop, compact on small mobile screens
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'solution' | 'coordinates'>('solution');

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 transition-all duration-300 ease-in-out md:static md:w-96 md:h-full md:border-l md:border-slate-800 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 shadow-2xl flex flex-col ${
        isExpanded ? 'h-[85vh]' : 'h-auto max-h-[85vh]'
      }`}
    >
      {/* Mobile drag handle / mini summary strip */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex md:hidden items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 cursor-pointer active:bg-slate-800"
      >
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {t.calculator.title}
          </span>
        </div>

        {/* Compact summary chip when collapsed */}
        {!isExpanded && (
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-[10px]">ELEV:</span>
              <span className="font-bold text-emerald-400">
                {solution.elevationMils !== null ? formatMils(solution.elevationMils) : '---'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-[10px]">AZ:</span>
              <span className="font-bold text-amber-400">
                {formatMils(solution.bearingMils)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-[10px]">DIST:</span>
              <span className="font-bold text-slate-200">
                {Math.round(solution.distanceMeters)}m
              </span>
            </div>
          </div>
        )}

        <button className="text-slate-400 p-1">
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </div>

      {/* Uncalibrated map warning strip */}
      {!isMapCalibrated && (
        <div className="bg-amber-950/70 border-b border-amber-500/40 px-3 py-1.5 flex items-center gap-2 text-amber-300 text-[11px]">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{t.calculator.uncalibratedWarning}</span>
        </div>
      )}

      {/* Tab navigation (Solution vs Coordinates) */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 shrink-0">
        <button
          onClick={() => setActiveTab('solution')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
            activeTab === 'solution'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/80'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.calculator.title}
        </button>
        <button
          onClick={() => setActiveTab('coordinates')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
            activeTab === 'coordinates'
              ? 'border-sky-500 text-sky-400 bg-slate-900/80'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.markers.setCoords}
        </button>
      </div>

      {/* Main content body (scrollable) */}
      <div
        className={`flex-1 overflow-y-auto p-4 flex flex-col gap-4 ${
          !isExpanded ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeTab === 'solution' ? (
          <>
            <FiringSolutionCard
              solution={solution}
              dataset={activeDataset}
              selectedCharge={selectedCharge}
              onSelectCharge={onSelectCharge}
              t={t}
            />

            {/* Fire round & splash timer */}
            <SplashCountdown tofSeconds={solution.tof} t={t} />

            {/* Dataset metadata badge */}
            <div className="text-[10px] text-slate-500 bg-slate-900/50 p-2 rounded border border-slate-800/80 font-mono">
              <p className="font-semibold text-slate-400">{activeDataset.weaponName}</p>
              <p>Source: {activeDataset.dataSource}</p>
              <p>Status: {activeDataset.verificationStatus.toUpperCase()}</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <ManualCoordinateInput
              marker={mortar}
              type="mortar"
              onUpdate={onUpdateMortar}
              onSaveToLibrary={onSaveToLibrary}
              t={t}
            />

            <ManualCoordinateInput
              marker={target}
              type="target"
              onUpdate={onUpdateTarget}
              onSaveToLibrary={onSaveToLibrary}
              t={t}
            />
          </div>
        )}
      </div>
    </div>
  );
};
