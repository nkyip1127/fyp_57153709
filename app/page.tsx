'use client';

import GraphCanvas from '@/components/GraphCanvas';
import Sidebar from '@/components/Sidebar';
import Stepper from '@/components/Stepper';
import ExplanationPanel from '@/components/ExplanationPanel';

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">
          Interactive MST Visualizer - Reverse-Delete Algorithm
        </h1>
        <p className="text-sm text-blue-100 mt-1">
          Draw, validate, and visualize the Reverse-Delete algorithm step-by-step
        </p>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Graph Canvas */}
        <div className="flex-1 relative">
          <GraphCanvas />
        </div>

        {/* Right Explanation Panel */}
        <ExplanationPanel />
      </div>

      {/* Bottom Stepper Controls */}
      <Stepper />
    </div>
  );
}


