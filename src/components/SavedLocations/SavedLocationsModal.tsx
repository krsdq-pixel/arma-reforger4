import React, { useState } from 'react';
import { SavedPosition } from '../../types/settings';
import { TranslationKeys } from '../../localization/en';
import { format8DigitGrid } from '../../utils/coordinates';
import { X, Crosshair, Target, Trash2, Edit2, Check, BookmarkCheck } from 'lucide-react';

interface SavedLocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPositions: SavedPosition[];
  currentMapId: string;
  onLoadAsMortar: (pos: SavedPosition) => void;
  onLoadAsTarget: (pos: SavedPosition) => void;
  onDeletePosition: (id: string) => void;
  onRenamePosition: (id: string, newName: string) => void;
  t: TranslationKeys;
}

export const SavedLocationsModal: React.FC<SavedLocationsModalProps> = ({
  isOpen,
  onClose,
  savedPositions,
  currentMapId,
  onLoadAsMortar,
  onLoadAsTarget,
  onDeletePosition,
  onRenamePosition,
  t,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter positions for current map (or all)
  const mapPositions = savedPositions.filter((p) => p.mapId === currentMapId);
  const mortarPositions = mapPositions.filter((p) => p.type === 'mortar');
  const targetPositions = mapPositions.filter((p) => p.type === 'target');

  const startRename = (pos: SavedPosition) => {
    setEditingId(pos.id);
    setEditingName(pos.name);
  };

  const saveRename = (id: string) => {
    if (editingName.trim()) {
      onRenamePosition(id, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <BookmarkCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              {t.savedPositions.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {mapPositions.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              <p>{t.savedPositions.empty}</p>
            </div>
          ) : (
            <>
              {/* Mortar Firing Points */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                  <Crosshair className="w-4 h-4" />
                  <span>{t.savedPositions.mortarList} ({mortarPositions.length})</span>
                </div>

                <div className="flex flex-col gap-2">
                  {mortarPositions.map((pos) => (
                    <div
                      key={pos.id}
                      className="flex items-center justify-between p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 hover:border-slate-700 transition"
                    >
                      <div className="flex-1">
                        {editingId === pos.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="bg-slate-800 border border-slate-600 rounded px-2 py-0.5 text-xs text-slate-100 font-medium"
                              autoFocus
                            />
                            <button
                              onClick={() => saveRename(pos.id)}
                              className="p-1 text-emerald-400 hover:bg-slate-800 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200">{pos.name}</span>
                            <button
                              onClick={() => startRename(pos)}
                              className="text-slate-500 hover:text-slate-300 p-0.5"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-1">
                          <span className="text-emerald-400">{format8DigitGrid(pos)}</span>
                          <span>(E:{pos.x} N:{pos.y})</span>
                          <span>Alt: {pos.z}m</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 ml-3">
                        <button
                          onClick={() => {
                            onLoadAsMortar(pos);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 bg-sky-950/70 hover:bg-sky-900 border border-sky-500/40 text-sky-300 rounded text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Crosshair className="w-3.5 h-3.5" />
                          <span>{t.savedPositions.loadAsMortar}</span>
                        </button>

                        {confirmDeleteId === pos.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onDeletePosition(pos.id)}
                              className="px-2 py-1 bg-rose-600 text-white rounded text-[11px] font-bold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(pos.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Reference Points */}
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Target className="w-4 h-4" />
                  <span>{t.savedPositions.targetList} ({targetPositions.length})</span>
                </div>

                <div className="flex flex-col gap-2">
                  {targetPositions.map((pos) => (
                    <div
                      key={pos.id}
                      className="flex items-center justify-between p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 hover:border-slate-700 transition"
                    >
                      <div className="flex-1">
                        {editingId === pos.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="bg-slate-800 border border-slate-600 rounded px-2 py-0.5 text-xs text-slate-100 font-medium"
                              autoFocus
                            />
                            <button
                              onClick={() => saveRename(pos.id)}
                              className="p-1 text-emerald-400 hover:bg-slate-800 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200">{pos.name}</span>
                            <button
                              onClick={() => startRename(pos)}
                              className="text-slate-500 hover:text-slate-300 p-0.5"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-1">
                          <span className="text-amber-400">{format8DigitGrid(pos)}</span>
                          <span>(E:{pos.x} N:{pos.y})</span>
                          <span>Alt: {pos.z}m</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 ml-3">
                        <button
                          onClick={() => {
                            onLoadAsTarget(pos);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/40 text-amber-300 rounded text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Target className="w-3.5 h-3.5" />
                          <span>{t.savedPositions.loadAsTarget}</span>
                        </button>

                        {confirmDeleteId === pos.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onDeletePosition(pos.id)}
                              className="px-2 py-1 bg-rose-600 text-white rounded text-[11px] font-bold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(pos.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
