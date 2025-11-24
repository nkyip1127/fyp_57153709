'use client';

import React, { useRef, useEffect } from 'react';
import { useGraphStore } from '@/lib/store';
import { getTotalWeight } from '@/lib/reverseDelete';

export default function ExplanationPanel() {
  const { steps, currentStep, graph, goToStep } = useGraphStore();
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const currentStepData = steps[currentStep];
  const mstWeight = currentStepData
    ? getTotalWeight(currentStepData.snapshot)
    : null;

  // Auto-scroll to current step when it changes - ensure full visibility
  useEffect(() => {
    if (steps.length > 0 && currentStep >= 0 && currentStep < steps.length) {
      const stepElement = stepRefs.current[currentStep];
      if (stepElement) {
        // Use setTimeout to ensure DOM is updated and styles are applied
        setTimeout(() => {
          // Get the scroll container (parent with overflow)
          const scrollContainer = stepElement.closest('.overflow-y-auto');
          
          if (scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = stepElement.getBoundingClientRect();
            
            // Calculate if element is fully visible
            const isFullyVisible = 
              elementRect.top >= containerRect.top &&
              elementRect.bottom <= containerRect.bottom;
            
            if (!isFullyVisible) {
              // Use scrollIntoView with 'nearest' to ensure full visibility
              // This will scroll the minimum amount needed to show the element
              stepElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
              });
              
              // Additional adjustment: ensure padding at top/bottom for large blocks
              setTimeout(() => {
                const newElementRect = stepElement.getBoundingClientRect();
                const newContainerRect = scrollContainer.getBoundingClientRect();
                
                // If still not fully visible, adjust scroll position
                if (newElementRect.top < newContainerRect.top) {
                  scrollContainer.scrollTop -= (newContainerRect.top - newElementRect.top) + 8; // 8px padding
                } else if (newElementRect.bottom > newContainerRect.bottom) {
                  scrollContainer.scrollTop += (newElementRect.bottom - newContainerRect.bottom) + 8; // 8px padding
                }
              }, 300); // Wait for smooth scroll to complete
            }
          } else {
            // Fallback: use scrollIntoView if container not found
            stepElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'nearest',
            });
          }
        }, 50);
      }
    }
  }, [currentStep, steps.length]);

  // Reset refs array when steps change
  useEffect(() => {
    stepRefs.current = stepRefs.current.slice(0, steps.length);
  }, [steps.length]);

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 flex flex-col overflow-y-auto overflow-x-visible">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Explanation</h2>

      {steps.length === 0 ? (
        <div className="text-gray-600">
          <p className="mb-4">
            Welcome! Build your graph using the tools on the left, then click
            "Run Reverse-Delete" to see the algorithm in action.
          </p>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">How to use:</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Click "Add Vertex" to create vertices</li>
              <li>Click "Add Edge" then select two vertices</li>
              <li>Double-click an edge to edit its weight</li>
              <li>Click a vertex to select it, then "Remove Selected"</li>
              <li>Load an example graph to get started quickly</li>
            </ul>
          </div>
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold text-gray-700">Reverse-Delete Algorithm:</h3>
            <p className="text-sm">
              The Reverse-Delete algorithm finds the Minimum Spanning Tree by:
            </p>
            <ol className="list-decimal list-inside text-sm space-y-1 mt-2">
              <li>Sorting all edges by weight (descending)</li>
              <li>For each edge (heaviest first):</li>
              <li className="ml-4">
                - If removing it keeps the graph connected, delete it
              </li>
              <li className="ml-4">
                - Otherwise, keep it (it's part of the MST)
              </li>
            </ol>
          </div>
        </div>
      ) : currentStepData ? (
        <div className="space-y-4">
          <div className={`p-3 rounded-lg border ${
            currentStepData.type === 'complete'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  currentStepData.type === 'consider'
                    ? 'bg-yellow-400 text-gray-900'
                    : currentStepData.type === 'delete'
                    ? 'bg-red-400 text-white'
                    : currentStepData.type === 'keep'
                    ? 'bg-green-400 text-white'
                    : 'bg-blue-400 text-white' // complete
                }`}
              >
                {currentStepData.type.toUpperCase()}
              </span>
              {currentStepData.type !== 'complete' && (
                <span className="text-sm font-semibold text-gray-700">
                  Edge: {currentStepData.edge.u} - {currentStepData.edge.v} (weight: {currentStepData.edge.w})
                </span>
              )}
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {currentStepData.explanation}
            </p>
          </div>

          {mstWeight !== null && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Current MST State:</h3>
              <p className="text-sm text-gray-600">
                Edges: {currentStepData.snapshot.edges.length}
              </p>
              <p className="text-sm text-gray-600">
                Total Weight: {mstWeight}
              </p>
            </div>
          )}

          <div className="mt-4 flex-1 flex flex-col min-h-0">
            <h3 className="font-semibold text-gray-700 mb-2">Step-by-Step Progress:</h3>
            <div 
              className="space-y-1 flex-1 overflow-y-auto overflow-x-visible max-h-96 scroll-smooth"
              style={{ 
                scrollPaddingTop: '8px', 
                scrollPaddingBottom: '8px',
                paddingLeft: '0',
                paddingRight: '4px', // Small padding for scrollbar, but don't clip content
              }}
            >
              {steps.map((step, index) => (
                <button
                  key={index}
                  ref={(el) => {
                    stepRefs.current[index] = el;
                  }}
                  onClick={() => goToStep(index)}
                  className={`w-full min-w-full text-left rounded text-xs transition-all duration-200 box-border ${
                    index === currentStep
                      ? 'bg-blue-100 border-2 border-blue-500 font-semibold shadow-sm px-3 py-2'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2 py-2'
                  }`}
                  style={{
                    scrollMarginTop: '8px',
                    scrollMarginBottom: '8px',
                    scrollMarginLeft: '0',
                    scrollMarginRight: '0',
                    display: 'block',
                    width: '100%',
                    minWidth: '100%',
                    boxSizing: 'border-box',
                    marginLeft: '0',
                    marginRight: '0',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        step.type === 'consider'
                          ? 'bg-yellow-400'
                          : step.type === 'delete'
                          ? 'bg-red-400'
                          : step.type === 'keep'
                          ? 'bg-green-400'
                          : 'bg-blue-400' // complete
                      }`}
                    />
                    <span className={`flex-1 ${index === currentStep ? 'text-blue-900' : 'text-gray-700'}`}>
                      {step.type === 'complete' 
                        ? 'Algorithm Complete'
                        : `${step.edge.u}-${step.edge.v} (${step.edge.w})`
                      }
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-600">No step data available</div>
      )}
    </div>
  );
}

