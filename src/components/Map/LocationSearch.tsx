import React, { useState, useRef, useEffect } from 'react';
import { MapLandmark } from '../../types/map';
import { TranslationKeys } from '../../localization/en';
import { Search, MapPin, X, Mountain, Shield, Plane, Anchor } from 'lucide-react';

interface LocationSearchProps {
  landmarks: MapLandmark[];
  onSelectLocation: (landmark: MapLandmark) => void;
  language: 'en' | 'ar';
  t: TranslationKeys;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  landmarks,
  onSelectLocation,
  language,
  t,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? landmarks.filter((lm) => {
        const q = query.toLowerCase();
        return (
          lm.name.toLowerCase().includes(q) ||
          (lm.nameAr && lm.nameAr.toLowerCase().includes(q))
        );
      })
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'military':
        return <Shield className="w-3.5 h-3.5 text-sky-400" />;
      case 'hill':
        return <Mountain className="w-3.5 h-3.5 text-emerald-400" />;
      case 'airfield':
        return <Plane className="w-3.5 h-3.5 text-purple-400" />;
      case 'coastal':
        return <Anchor className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div ref={containerRef} className="absolute top-4 left-4 z-[400] w-64 md:w-80">
      <div className="relative flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-xl overflow-hidden">
        <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          placeholder={t.maps.searchLocation}
          className="w-full bg-transparent px-2.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute left-0 right-0 mt-1.5 bg-slate-900/95 backdrop-blur-lg border border-slate-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((lm, idx) => (
              <button
                key={`${lm.name}-${idx}`}
                onClick={() => {
                  onSelectLocation(lm);
                  setQuery(language === 'ar' && lm.nameAr ? lm.nameAr : lm.name);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-800/80 transition flex items-center justify-between border-b border-slate-800/50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  {getIcon(lm.type)}
                  <span className="text-xs font-semibold text-slate-200">
                    {language === 'ar' && lm.nameAr ? lm.nameAr : lm.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                  <span>{lm.elevation}m</span>
                  <span className="text-slate-600">
                    ({Math.round(lm.x)}, {Math.round(lm.y)})
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-3 text-center text-xs text-slate-500">
              {t.maps.noLocationsFound}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
