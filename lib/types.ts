export type Graph = {
  vertices: string[];
  edges: { u: string; v: string; w: number }[];
};

export type NodePosition = {
  x: number;
  y: number;
};

export type GraphWithPositions = {
  graph: Graph;
  positions: Record<string, NodePosition>;
};

export type Step = {
  type: "consider" | "keep" | "delete" | "complete";
  edge: { u: string; v: string; w: number };
  explanation: string;
  snapshot: Graph;
  stepNumber: number;
};

export type ValidationError = {
  type: "duplicate_edge" | "missing_weight" | "negative_weight" | "disconnected" | "self_loop" | "multi_edge";
  message: string;
  edge?: { u: string; v: string; w?: number };
  vertex?: string;
};

export type GraphState = {
  graph: Graph;
  steps: Step[];
  currentStep: number;
  isPlaying: boolean;
  playSpeed: "slow" | "normal" | "fast";
  validationErrors: ValidationError[];
};

export type GraphHistoryEntry = {
  graph: Graph;
  nodePositions: Record<string, NodePosition>;
};


