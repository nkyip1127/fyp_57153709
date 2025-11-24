'use client';

import React, { useEffect, useRef } from 'react';
import { Play, Square, Undo2, Redo2 } from 'lucide-react';
import { useGraphStore } from '@/lib/store';

export default function Stepper() {
  const {
    steps,
    currentStep,
    isPlaying,
    playSpeed,
    nextStep,
    previousStep,
    goToStep,
    resetSteps,
    togglePlay,
    setPlaySpeed,
    runAlgorithm,
    validationErrors,
  } = useGraphStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      const speedMap = {
        slow: 2000,
        normal: 1000,
        fast: 500,
      };

      intervalRef.current = setInterval(() => {
        if (currentStep < steps.length - 1) {
          nextStep();
        } else {
          togglePlay(); // Stop at the end
        }
      }, speedMap[playSpeed]);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, steps.length, playSpeed, nextStep, togglePlay]);

  const canRun = validationErrors.length === 0 && steps.length === 0;
  const hasSteps = steps.length > 0;
  const canGoNext = currentStep < steps.length - 1;
  const canGoPrev = currentStep > 0;

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center justify-between gap-4">
        {/* Run Algorithm Button */}
        <button
          onClick={runAlgorithm}
          disabled={!canRun}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
        >
          <Play size={20} />
          <span>Run Reverse-Delete</span>
        </button>

        {/* Step Navigation */}
        {hasSteps && (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={resetSteps}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition flex items-center gap-2"
              >
                <Square size={18} />
                <span>Reset</span>
              </button>
              <button
                onClick={previousStep}
                disabled={!canGoPrev}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Undo2 size={18} />
                <span>Previous</span>
              </button>
              <button
                onClick={togglePlay}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <Square size={18} />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    <span>Play</span>
                  </>
                )}
              </button>
              <button
                onClick={nextStep}
                disabled={!canGoNext}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Redo2 size={18} />
                <span>Next</span>
              </button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Speed:</span>
              {(['slow', 'normal', 'fast'] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaySpeed(speed)}
                  className={`px-3 py-1 text-sm rounded ${
                    playSpeed === speed
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>

            {/* Step Counter */}
            <div className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </div>
          </>
        )}

        {/* Progress Bar */}
        {hasSteps && (
          <div className="flex-1 max-w-md">
            <input
              type="range"
              min="0"
              max={steps.length - 1}
              value={currentStep}
              onChange={(e) => goToStep(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}


