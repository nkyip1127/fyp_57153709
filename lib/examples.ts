import { Graph, NodePosition } from './types';

export type ExampleGraph = {
  name: string;
  graph: Graph;
  positions: Record<string, NodePosition>;
};

export const exampleGraphs: ExampleGraph[] = [
  {
    name: "Triangle",
    graph: {
      vertices: ["A", "B", "C"],
      edges: [
        { u: "A", v: "B", w: 3 },
        { u: "B", v: "C", w: 4 },
        { u: "A", v: "C", w: 5 },
      ],
    },
    positions: {
      A: { x: 400, y: 100 },
      B: { x: 200, y: 300 },
      C: { x: 600, y: 300 },
    },
  },
  {
    name: "Square",
    graph: {
      vertices: ["A", "B", "C", "D"],
      edges: [
        { u: "A", v: "B", w: 1 },
        { u: "B", v: "C", w: 2 },
        { u: "C", v: "D", w: 3 },
        { u: "D", v: "A", w: 4 },
        { u: "A", v: "C", w: 5 },
      ],
    },
    positions: {
      A: { x: 300, y: 100 },
      B: { x: 500, y: 100 },
      C: { x: 500, y: 300 },
      D: { x: 300, y: 300 },
    },
  },
  {
    name: "Weighted Grid (3x3)",
    graph: {
      vertices: ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
      edges: [
        { u: "A", v: "B", w: 4 },
        { u: "B", v: "C", w: 8 },
        { u: "A", v: "D", w: 4 },
        { u: "B", v: "E", w: 11 },
        { u: "C", v: "F", w: 2 },
        { u: "D", v: "E", w: 8 },
        { u: "E", v: "F", w: 7 },
        { u: "D", v: "G", w: 1 },
        { u: "E", v: "H", w: 2 },
        { u: "F", v: "I", w: 6 },
        { u: "G", v: "H", w: 7 },
        { u: "H", v: "I", w: 1 },
      ],
    },
    positions: {
      A: { x: 200, y: 100 },
      B: { x: 400, y: 100 },
      C: { x: 600, y: 100 },
      D: { x: 200, y: 250 },
      E: { x: 400, y: 250 },
      F: { x: 600, y: 250 },
      G: { x: 200, y: 400 },
      H: { x: 400, y: 400 },
      I: { x: 600, y: 400 },
    },
  },
  {
    name: "Simple Path",
    graph: {
      vertices: ["A", "B", "C", "D"],
      edges: [
        { u: "A", v: "B", w: 1 },
        { u: "B", v: "C", w: 2 },
        { u: "C", v: "D", w: 3 },
      ],
    },
    positions: {
      A: { x: 200, y: 200 },
      B: { x: 400, y: 200 },
      C: { x: 600, y: 200 },
      D: { x: 800, y: 200 },
    },
  },
  {
    name: "Star Graph",
    graph: {
      vertices: ["A", "B", "C", "D", "E"],
      edges: [
        { u: "A", v: "B", w: 5 },
        { u: "A", v: "C", w: 3 },
        { u: "A", v: "D", w: 7 },
        { u: "A", v: "E", w: 2 },
      ],
    },
    positions: {
      A: { x: 400, y: 250 }, // Center
      B: { x: 400, y: 100 }, // Top
      C: { x: 600, y: 300 }, // Right
      D: { x: 400, y: 400 }, // Bottom
      E: { x: 200, y: 300 }, // Left
    },
  },
];

export function loadExampleGraph(name: string): { graph: Graph; positions: Record<string, NodePosition> } | null {
  const example = exampleGraphs.find((eg) => eg.name === name);
  return example ? { graph: example.graph, positions: example.positions } : null;
}


