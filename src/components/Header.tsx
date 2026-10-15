import React from 'react';
import { MapConfig } from '../types/map';
import { Language } from '../types/settings';
import { TranslationKeys } from '../localization/en';
import { 
  Crosshair, 
  Map as MapIcon, 
  Languages, 
  Settings as SettingsIcon, 
  Maximize, 
  Minimize, 
  Bookmark,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface HeaderProps {
  currentMap: MapConfig;
  availableMaps: MapConfig[];
  onSelectMap: (mapId: string) => void;
  language: Language;
  onToggleLanguage: () => void;
  onOpenSettings: () => void;
  onOpenSavedLocations: () => void;
  savedPositionsCount: number;
  t: TranslationKeys;
}

export const Header: React.FC<HeaderProps> = ({
  currentMap,
  availableMaps,
  onSelectMap,
  language,
  onToggleLanguage,
  onOpenSettings,
  onOpenSavedLocations,
  savedPositionsCount,
  t,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800/90 px-3 md:px-5 flex items-center justify-between z-40 select-none shadow-md">
      {/* Brand logo & title */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-inner">
          <Crosshair className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xs md:text-sm font-black tracking-wider text-slate-100 uppercase flex items-center gap-1.5">
            <span>ARMA REFORGER</span>
            <span className="text-emerald-400 font-extrabold text-[10px] md:text-xs bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
              MORTAR CC
            </span>
          </h1>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            {t.appSubtitle}
          </span>
        </div>
      </div>

      {/* Center / Action bar */}
      <div className="flex items-center gap-2">
        {/* Map selector dropdown */}
        <div className="relative flex items-center bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 shadow-sm">
          <MapIcon className="w-4 h-4 text-emerald-400 shrink-0 mr-1.5" />
          <select
            value={currentMap.id}
            onChange={(e) => onSelectMap(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            {availableMaps.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                {language === 'ar' ? m.displayName.ar : m.displayName.en}
              </option>
            ))}
          </select>
          {currentMap.isCalibrated ? (
            <span title={t.maps.calibratedBadge} className="flex items-center ml-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </span>
          ) : (
            <span title={t.maps.uncalibratedBadge} className="flex items-center ml-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </span>
          )}
        </div>

        {/* Saved locations library button */}
        <button
          onClick={onOpenSavedLocations}
          title={t.savedPositions.title}
          className="relative flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-200 text-xs font-semibold transition active:scale-95"
        >
          <Bookmark className="w-4 h-4 text-amber-400" />
          <span className="hidden md:inline">{t.savedPositions.title.split(' ')[0]}</span>
          {savedPositionsCount > 0 && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-1 rounded-full">
              {savedPositionsCount}
            </span>
          )}
        </button>

        {/* Language switch button */}
        <button
          onClick={onToggleLanguage}
          title={language === 'en' ? 'تبديل إلى العربية' : 'Switch to English'}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-200 text-xs font-bold transition active:scale-95"
        >
          <Languages className="w-4 h-4 text-sky-400" />
          <span className="font-mono uppercase">{language === 'en' ? 'AR' : 'EN'}</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title={t.settings.title}
          className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 hover:text-slate-100 transition active:scale-95"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? t.maps.exitFullscreen : t.maps.fullscreen}
          className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 hover:text-slate-100 transition active:scale-95 hidden sm:block"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
