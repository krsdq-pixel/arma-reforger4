import React from 'react';
import { WeaponDataset, FiringSolution } from '../../types/ballistics';
import { TranslationKeys } from '../../localization/en';
import { formatMils, formatDegrees } from '../../utils/coordinates';
import { ShieldAlert, CheckCircle2, AlertTriangle, Crosshair } from 'lucide-react';

interface FiringSolutionCardProps {
  solution: FiringSolution;
  dataset: WeaponDataset;
  selectedCharge: number;
  onSelectCharge: (charge: number) => void;
  t: TranslationKeys;
}

export const FiringSolutionCard: React.FC<FiringSolutionCardProps> = ({
  solution,
  dataset,
  selectedCharge,
  onSelectCharge,
  t,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Weapon & Charge selector */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider">{t.calculator.charge}:</span>
          <span className="text-[11px] text-slate-500 font-mono">
            {dataset.weaponName.split(' ')[0]} {dataset.caliber}
          </span>
        </div>

        {/* Charge Buttons */}
        <div className="grid grid-cols-5 gap-1.5">
          {dataset.charges.map((c) => {
            const isSelected = c.chargeNumber === selectedCharge;
            const isAvailable = solution.availableCharges.includes(c.chargeNumber);
            const isRecommended = solution.recommendedCharge === c.chargeNumber;

            return (
              <button
                key={c.chargeNumber}
                onClick={() => onSelectCharge(c.chargeNumber)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded border transition-all text-center ${
                  isSelected
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/40'
                    : isAvailable
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750 hover:border-slate-600'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-600'
                }`}
              >
                {isRecommended && (
                  <span className="absolute -top-1.5 bg-amber-500 text-slate-950 font-black text-[8px] px-1 rounded-sm tracking-tighter">
                    REC
                  </span>
                )}
                <span className="text-xs font-bold font-mono">CH {c.chargeNumber}</span>
                <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                  {c.minRange}-{c.maxRange}m
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Fire Solution Readouts */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800 shadow-inner">
        {/* Quadrant Elevation */}
        <div className="flex flex-col items-center justify-center p-2 rounded bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
            {t.calculator.elevation}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-black font-mono tracking-tight ${solution.inRange ? 'text-emerald-400' : 'text-slate-500'}`}>
              {solution.elevationMils !== null ? formatMils(solution.elevationMils) : '----'}
            </span>
            <span className="text-[11px] text-slate-500 font-bold">{t.calculator.mils}</span>
          </div>
          {solution.elevationDegrees !== null && (
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
              ~{solution.elevationDegrees.toFixed(1)}°
            </span>
          )}
        </div>

        {/* Azimuth / Bearing */}
        <div className="flex flex-col items-center justify-center p-2 rounded bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
            {t.calculator.azimuth}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono tracking-tight text-amber-400">
              {formatMils(solution.bearingMils)}
            </span>
            <span className="text-[11px] text-slate-500 font-bold">{t.calculator.mils}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            {formatDegrees(solution.bearingDeg)}
          </span>
        </div>

        {/* Time of Flight */}
        <div className="flex flex-col items-center justify-center p-2 rounded bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
            {t.calculator.tof}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-black font-mono tracking-tight ${solution.inRange ? 'text-sky-400' : 'text-slate-500'}`}>
              {solution.tof !== null ? solution.tof.toFixed(1) : '--.-'}
            </span>
            <span className="text-[11px] text-slate-500 font-bold">{t.calculator.seconds}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
            ETA
          </span>
        </div>
      </div>

      {/* Geometry summary strip */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 rounded border border-slate-800/80 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">{t.calculator.distance}:</span>
          <span className="text-slate-100 font-bold">{Math.round(solution.distanceMeters)}m</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">{t.calculator.altDiff}:</span>
          <span className={`font-bold ${solution.heightDiffMeters >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {solution.heightDiffMeters >= 0 ? `+${solution.heightDiffMeters}m` : `${solution.heightDiffMeters}m`}
          </span>
        </div>
      </div>

      {/* Status Banner / Warning */}
      {solution.inRange ? (
        <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-lg text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{t.calculator.inRange}</span>
        </div>
      ) : (
        <div className="flex items-start gap-2 bg-amber-950/50 border border-amber-500/50 text-amber-200 px-3 py-2 rounded-lg text-xs font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold uppercase tracking-wider">{t.calculator.outOfRange}</p>
            <p className="text-amber-300/90 text-[11px] mt-0.5">{solution.warning}</p>
          </div>
        </div>
      )}
    </div>
  );
};
