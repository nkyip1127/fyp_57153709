# Interactive MST Visualizer - Reverse-Delete Algorithm

An interactive web-based visualization and learning platform for Minimum Spanning Tree algorithms using the Reverse-Delete method.

## Features

- **Graph Editor**: Draw undirected weighted graphs with drag-and-drop vertices
- **Validation Engine**: Comprehensive graph validation with detailed error messages
- **Reverse-Delete Algorithm**: Step-by-step visualization of the algorithm
- **Interactive Stepper**: Navigate through algorithm steps with play/pause controls
- **Save/Load**: Export and import graphs as JSON
- **Example Graphs**: Pre-loaded example graphs for quick testing

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: TailwindCSS
- **Graph Visualization**: React Flow
- **State Management**: Zustand
- **Data Visualization**: D3.js (available for future enhancements)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating a Graph

1. **Add Vertices**: Click "Add Vertex" in the left sidebar to create new vertices (auto-labeled A, B, C, ...)
2. **Add Edges**: 
   - Click "Add Edge" button
   - Click two vertices to connect them
   - Enter the edge weight when prompted
3. **Edit Edge Weight**: Double-click any edge to modify its weight
4. **Remove Elements**: 
   - Select a vertex by clicking it, then click "Remove Selected"
   - Or use the delete functionality (to be enhanced)

### Running the Algorithm

1. Ensure your graph is valid (no validation errors shown in the sidebar)
2. Click "Run Reverse-Delete" in the bottom control bar
3. Use the controls to navigate:
   - **Previous/Next**: Step through manually
   - **Play/Pause**: Auto-play through steps
   - **Speed**: Adjust playback speed (slow/normal/fast)
   - **Reset**: Return to the first step

### Understanding the Visualization

- **Yellow edges**: Currently being considered
- **Red edges**: Deleted (not part of MST)
- **Green edges**: Kept (part of MST)
- **Explanation Panel**: Right sidebar shows detailed explanation for each step

### Save/Load Graphs

- **Export**: Click "Export JSON" to download your graph
- **Import**: Click "Import JSON" to load a saved graph
- **Examples**: Click any example graph name to load it instantly

## Project Structure

```
/app
  /api          # API routes (for future backend features)
  layout.tsx    # Root layout
  page.tsx      # Main page
  globals.css   # Global styles

/components
  GraphCanvas.tsx      # React Flow graph visualization
  Sidebar.tsx          # Left sidebar with graph tools
  Stepper.tsx          # Bottom control bar
  ExplanationPanel.tsx # Right explanation panel

/lib
  types.ts          # TypeScript type definitions
  graph.ts          # Graph utility functions
  validation.ts     # Graph validation logic
  reverseDelete.ts  # Reverse-Delete algorithm implementation
  examples.ts       # Example graphs
  store.ts          # Zustand state management
```

## Algorithm Details

The Reverse-Delete algorithm works as follows:

1. Sort all edges in descending order of weight
2. For each edge (starting with the heaviest):
   - Consider removing it
   - If the graph remains connected without it, delete it
   - Otherwise, keep it (it's part of the MST)
3. The remaining edges form the Minimum Spanning Tree

## Future Enhancements

- Comparison with Kruskal's and Prim's algorithms
- MST weight calculation and display
- Detection if a graph is already an MST
- More example graphs
- Undo/redo functionality
- Graph statistics and analysis

## License

This project is part of a Final Year Project.


