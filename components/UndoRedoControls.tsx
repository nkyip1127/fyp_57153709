'use client';

import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { useGraphStore } from '@/lib/store';

export default function UndoRedoControls() {
  const { canUndo, canRedo, undo, redo, steps } = useGraphStore();

  // Hide during algorithm execution
  if (steps.length > 0) {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-4 z-10 flex gap-2">
      <button
        onClick={undo}
        disabled={!canUndo()}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 transition disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={20} className={canUndo() ? 'text-gray-700' : 'text-gray-400'} />
        <span className="text-sm font-medium text-gray-700">Undo</span>
      </button>
      <button
        onClick={redo}
        disabled={!canRedo()}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 transition disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
        title="Redo (Ctrl+Y)"
      >
        <Redo2 size={20} className={canRedo() ? 'text-gray-700' : 'text-gray-400'} />
        <span className="text-sm font-medium text-gray-700">Redo</span>
      </button>
    </div>
  );
}

