import { create } from 'zustand';
import { Graph, Step, ValidationError, NodePosition, GraphHistoryEntry } from './types';
import { validateGraph } from './validation';
import { reverseDelete } from './reverseDelete';
import { cloneGraph, getNextVertexLabel } from './graph';
import { calculateTidyLayout } from './layout';

interface GraphStore {
  graph: Graph;
  nodePositions: Record<string, NodePosition>;
  steps: Step[];
  currentStep: number;
  isPlaying: boolean;
  playSpeed: 'slow' | 'normal' | 'fast';
  validationErrors: ValidationError[];
  selectedVertices: string[];
  selectedEdge: { u: string; v: string } | null;
  edgeCreationMode: boolean;
  history: GraphHistoryEntry[];
  future: GraphHistoryEntry[];

  // Actions
  setGraph: (graph: Graph, positions?: Record<string, NodePosition>, skipHistory?: boolean) => void;
  updateNodePosition: (nodeId: string, position: NodePosition, skipHistory?: boolean) => void;
  updateNodePositions: (positions: Record<string, NodePosition>, skipHistory?: boolean) => void;
  addVertex: (label?: string) => void;
  removeVertex: (label: string) => void;
  addEdge: (u: string, v: string, w: number) => void;
  updateEdgeWeight: (u: string, v: string, newWeight: number) => void;
  removeEdge: (u: string, v: string) => void;
  clearGraph: () => void;
  validate: () => void;
  runAlgorithm: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  resetSteps: () => void;
  togglePlay: () => void;
  setPlaySpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  setSelectedVertices: (vertices: string[]) => void;
  setSelectedEdge: (edge: { u: string; v: string } | null) => void;
  toggleEdgeCreationMode: () => void;
  applyTidyLayout: () => void;
  undo: () => void;
  redo: () => void;
  pushToHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const initialGraph: Graph = {
  vertices: [],
  edges: [],
};

export const useGraphStore = create<GraphStore>((set, get) => ({
  graph: initialGraph,
  nodePositions: {},
  steps: [],
  currentStep: 0,
  isPlaying: false,
  playSpeed: 'normal',
  validationErrors: [],
  selectedVertices: [],
  selectedEdge: null,
  edgeCreationMode: false,
  history: [],
  future: [],

  pushToHistory: () => {
    const { graph, nodePositions, steps } = get();
    // Don't push to history if algorithm is running
    if (steps.length > 0) {
      return;
    }
    const entry: GraphHistoryEntry = {
      graph: cloneGraph(graph),
      nodePositions: { ...nodePositions },
    };
    set((state) => ({
      history: [...state.history, entry],
      future: [], // Clear future when new action is performed
    }));
  },

  canUndo: () => {
    const { history, steps } = get();
    return history.length > 0 && steps.length === 0;
  },

  canRedo: () => {
    const { future, steps } = get();
    return future.length > 0 && steps.length === 0;
  },

  undo: () => {
    const { history, steps } = get();
    if (history.length === 0 || steps.length > 0) {
      return; // Can't undo during algorithm
    }
    
    const currentState: GraphHistoryEntry = {
      graph: cloneGraph(get().graph),
      nodePositions: { ...get().nodePositions },
    };
    
    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    
    set({
      graph: previousState.graph,
      nodePositions: previousState.nodePositions,
      history: newHistory,
      future: [currentState, ...get().future],
      steps: [],
      currentStep: 0,
      selectedVertices: [],
      selectedEdge: null,
    });
    get().validate();
  },

  redo: () => {
    const { future, steps } = get();
    if (future.length === 0 || steps.length > 0) {
      return; // Can't redo during algorithm
    }
    
    const currentState: GraphHistoryEntry = {
      graph: cloneGraph(get().graph),
      nodePositions: { ...get().nodePositions },
    };
    
    const nextState = future[0];
    const newFuture = future.slice(1);
    
    set({
      graph: nextState.graph,
      nodePositions: nextState.nodePositions,
      history: [...get().history, currentState],
      future: newFuture,
      steps: [],
      currentStep: 0,
      selectedVertices: [],
      selectedEdge: null,
    });
    get().validate();
  },

  setGraph: (graph, positions, skipHistory = false) => {
    // Completely clear previous graph state before loading new graph
    const newPositions: Record<string, NodePosition> = {};
    
    if (positions) {
      // Use provided positions from import/example
      Object.assign(newPositions, positions);
    } else {
      // Calculate default positions for new vertices
      graph.vertices.forEach((vertex, index) => {
        newPositions[vertex] = {
          x: 300 + (index % 4) * 200,
          y: 200 + Math.floor(index / 4) * 200,
        };
      });
    }
    
    // Completely replace graph state (don't preserve old data)
    set({ 
      graph: {
        vertices: [...graph.vertices],
        edges: [...graph.edges],
      },
      nodePositions: newPositions,
      steps: [], 
      currentStep: 0, 
      validationErrors: [],
      selectedVertices: [],
      selectedEdge: null,
      edgeCreationMode: false,
    });
    get().validate();
    if (!skipHistory) {
      get().pushToHistory();
    }
  },

  updateNodePosition: (nodeId, position, skipHistory = false) => {
    const { nodePositions } = get();
    set({
      nodePositions: {
        ...nodePositions,
        [nodeId]: position,
      },
    });
    if (!skipHistory) {
      // Only push to history on drag end, not during drag
      // This is handled by onNodeDragStop
    }
  },

  updateNodePositions: (positions, skipHistory = false) => {
    set({ nodePositions: positions });
    if (!skipHistory) {
      get().pushToHistory();
    }
  },

  addVertex: (label) => {
    const { graph, nodePositions } = get();
    const newLabel = label || getNextVertexLabel(graph);
    if (!graph.vertices.includes(newLabel)) {
      const newIndex = graph.vertices.length;
      set({
        graph: {
          ...graph,
          vertices: [...graph.vertices, newLabel],
        },
        nodePositions: {
          ...nodePositions,
          [newLabel]: {
            x: 300 + (newIndex % 4) * 200,
            y: 200 + Math.floor(newIndex / 4) * 200,
          },
        },
        steps: [],
        currentStep: 0,
      });
      get().validate();
    }
  },

  removeVertex: (label) => {
    const { graph, nodePositions } = get();
    get().pushToHistory();
    const newPositions = { ...nodePositions };
    delete newPositions[label];
    set({
      graph: {
        vertices: graph.vertices.filter((v) => v !== label),
        edges: graph.edges.filter((e) => e.u !== label && e.v !== label),
      },
      nodePositions: newPositions,
      steps: [],
      currentStep: 0,
      selectedVertices: [],
      selectedEdge: null,
    });
    get().validate();
  },

  addEdge: (u, v, w) => {
    const { graph } = get();
    // Check if edge already exists
    const exists = graph.edges.some(
      (e) => (e.u === u && e.v === v) || (e.u === v && e.v === u)
    );
    if (!exists && u !== v) {
      get().pushToHistory();
      set({
        graph: {
          ...graph,
          edges: [...graph.edges, { u, v, w }],
        },
        steps: [],
        currentStep: 0,
      });
      get().validate();
    }
  },

  updateEdgeWeight: (u, v, newWeight) => {
    const { graph } = get();
    get().pushToHistory();
    set({
      graph: {
        ...graph,
        edges: graph.edges.map((e) =>
          (e.u === u && e.v === v) || (e.u === v && e.v === u)
            ? { ...e, w: newWeight }
            : e
        ),
      },
      steps: [],
      currentStep: 0,
    });
    get().validate();
  },

  removeEdge: (u, v) => {
    const { graph } = get();
    get().pushToHistory();
    set({
      graph: {
        ...graph,
        edges: graph.edges.filter(
          (e) => !((e.u === u && e.v === v) || (e.u === v && e.v === u))
        ),
      },
      steps: [],
      currentStep: 0,
    });
    get().validate();
  },

  clearGraph: () => {
    set({
      graph: initialGraph,
      nodePositions: {},
      steps: [],
      currentStep: 0,
      validationErrors: [],
      selectedVertices: [],
      selectedEdge: null,
      edgeCreationMode: false,
      history: [],
      future: [],
    });
  },

  validate: () => {
    const { graph } = get();
    const errors = validateGraph(graph);
    set({ validationErrors: errors });
  },

  runAlgorithm: () => {
    const { graph, validationErrors } = get();
    if (validationErrors.length > 0) {
      return; // Don't run if graph is invalid
    }
    const steps = reverseDelete(graph);
    set({ steps, currentStep: 0, isPlaying: false });
  },

  nextStep: () => {
    const { currentStep, steps } = get();
    if (currentStep < steps.length - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },

  previousStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  goToStep: (step) => {
    const { steps } = get();
    if (step >= 0 && step < steps.length) {
      set({ currentStep: step, isPlaying: false });
    }
  },

  resetSteps: () => {
    set({ currentStep: 0, isPlaying: false });
  },

  togglePlay: () => {
    const { isPlaying } = get();
    set({ isPlaying: !isPlaying });
  },

  setPlaySpeed: (speed) => {
    set({ playSpeed: speed });
  },

  setSelectedVertices: (vertices) => {
    set({ selectedVertices: vertices });
  },

  setSelectedEdge: (edge) => {
    set({ selectedEdge: edge });
  },

  toggleEdgeCreationMode: () => {
    const { edgeCreationMode } = get();
    set({ edgeCreationMode: !edgeCreationMode, selectedVertices: [], selectedEdge: null });
  },

  applyTidyLayout: () => {
    const { graph } = get();
    if (graph.vertices.length === 0) {
      return; // No graph to layout
    }
    
    // Push current state to history before layout
    get().pushToHistory();
    
    // Calculate new positions using Dagre layout
    const newPositions = calculateTidyLayout(graph);
    
    // Update positions in store immediately
    set({ nodePositions: newPositions });
    
    // Trigger fitView after layout (handled by GraphCanvas)
    setTimeout(() => {
      const event = new CustomEvent('tidyLayoutComplete');
      window.dispatchEvent(event);
    }, 0);
  },
}));

