'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Pencil, Scan } from 'lucide-react';
import { useGraphStore } from '@/lib/store';
import { exampleGraphs, loadExampleGraph } from '@/lib/examples';

export default function Sidebar() {
  const {
    graph,
    nodePositions,
    validationErrors,
    selectedEdge,
    selectedVertices,
    addVertex,
    removeVertex,
    removeEdge,
    clearGraph,
    setGraph,
    setSelectedEdge,
    setSelectedVertices,
    edgeCreationMode,
    toggleEdgeCreationMode,
    applyTidyLayout,
  } = useGraphStore();

  const [selectedVertex, setSelectedVertex] = useState<string | null>(null);

  const handleAddVertex = () => {
    addVertex(); // Will auto-generate label
  };

  const handleRemoveVertex = () => {
    if (selectedVertex) {
      removeVertex(selectedVertex);
      setSelectedVertex(null);
    }
  };

  const handleLoadExample = (exampleName: string) => {
    const exampleData = loadExampleGraph(exampleName);
    if (exampleData) {
      setGraph(exampleData.graph, exampleData.positions);
    }
  };

  const handleExport = () => {
    const exportData = {
      graph,
      positions: nodePositions,
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'graph.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target?.result as string);
            // Support both old format (just graph) and new format (graph + positions)
            if (importedData.graph) {
              setGraph(importedData.graph, importedData.positions);
            } else if (importedData.vertices && importedData.edges) {
              // Old format - just graph
              setGraph(importedData, importedData.positions);
            } else {
              alert('Invalid graph format');
            }
          } catch (error) {
            alert('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-800">Graph Tools</h2>

      {/* Vertex Operations */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700">Vertices</h3>
        <button
          onClick={handleAddVertex}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          <span>Add Vertex</span>
        </button>
        <button
          onClick={handleRemoveVertex}
          disabled={!selectedVertex}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Trash2 size={20} />
          <span>Remove Selected</span>
        </button>
        {graph.vertices.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-1">Click to select:</p>
            <div className="flex flex-wrap gap-2">
              {graph.vertices.map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVertex(v === selectedVertex ? null : v)}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedVertex === v
                      ? 'bg-yellow-400 text-gray-900'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edge Operations */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700">Edges</h3>
        <button
          onClick={() => {
            toggleEdgeCreationMode();
            // Clear selection when toggling edge mode
            setSelectedVertices([]);
          }}
          className={`w-full px-4 py-2 rounded transition ${
            edgeCreationMode
              ? 'bg-yellow-500 text-white hover:bg-yellow-600 font-semibold'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {edgeCreationMode ? 'Cancel Edge Mode' : 'Add Edge'}
        </button>
        {edgeCreationMode && (
          <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
            <p className="text-xs text-yellow-800 font-semibold mb-1">
              Edge Creation Mode Active
            </p>
            <p className="text-xs text-yellow-700">
              Click two vertices to create an edge. Selected vertices will be highlighted in yellow.
            </p>
            {selectedVertices.length > 0 && (
              <p className="text-xs text-yellow-700 mt-1">
                Selected: {selectedVertices.join(', ')} ({selectedVertices.length}/2)
              </p>
            )}
          </div>
        )}
        {selectedEdge && (
          <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
            <p className="text-sm text-gray-700 mb-2">
              Selected: {selectedEdge.u} - {selectedEdge.v}
            </p>
            <button
              onClick={() => {
                removeEdge(selectedEdge.u, selectedEdge.v);
                setSelectedEdge(null);
              }}
              className="w-full px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              <span>Delete Edge</span>
            </button>
            <button
              onClick={() => setSelectedEdge(null)}
              className="w-full mt-1 px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 transition"
            >
              Deselect
            </button>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <Pencil size={12} />
          <span>Click edge to select, double-click to edit weight</span>
        </p>
      </div>

      {/* Graph Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700">Graph Info</h3>
        <div className="text-sm text-gray-600">
          <p>Vertices: {graph.vertices.length}</p>
          <p>Edges: {graph.edges.length}</p>
        </div>
        <button
          onClick={() => {
            applyTidyLayout();
            // fitView will be triggered automatically by GraphCanvas when positions update
          }}
          disabled={graph.vertices.length === 0}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold mt-2 flex items-center justify-center gap-2"
        >
          <Scan size={20} />
          <span>Tidy Graph</span>
        </button>
        <p className="text-xs text-gray-500 mt-1">
          Automatically arrange graph for better readability
        </p>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-red-700">Validation Errors</h3>
          <div className="text-xs text-red-600 space-y-1 max-h-40 overflow-y-auto">
            {validationErrors.map((error, index) => (
              <div key={index} className="p-2 bg-red-50 rounded">
                {error.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examples */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700">Examples</h3>
        <div className="space-y-1">
          {exampleGraphs.map((example) => (
            <button
              key={example.name}
              onClick={() => handleLoadExample(example.name)}
              className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-left"
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      {/* Import/Export */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700">Save/Load</h3>
        <button
          onClick={handleExport}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
        >
          Export JSON
        </button>
        <button
          onClick={handleImport}
          className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
        >
          Import JSON
        </button>
      </div>

      {/* Clear */}
      <button
        onClick={clearGraph}
        className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
      >
        Clear All
      </button>
    </div>
  );
}

