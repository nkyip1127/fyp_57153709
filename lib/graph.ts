import { Graph } from './types';

/**
 * Check if two edges are the same (order-independent)
 */
export function edgesEqual(
  e1: { u: string; v: string; w: number },
  e2: { u: string; v: string; w: number }
): boolean {
  return (
    (e1.u === e2.u && e1.v === e2.v) ||
    (e1.u === e2.v && e1.v === e2.u)
  );
}

/**
 * Get all edges connected to a vertex
 */
export function getEdgesForVertex(graph: Graph, vertex: string): { u: string; v: string; w: number }[] {
  return graph.edges.filter(
    (e) => e.u === vertex || e.v === vertex
  );
}

/**
 * Check if graph is connected using DFS
 */
export function isConnected(graph: Graph): boolean {
  if (graph.vertices.length === 0) return true;
  if (graph.vertices.length === 1) return true;

  const visited = new Set<string>();
  const adjList = new Map<string, string[]>();

  // Build adjacency list
  graph.vertices.forEach((v) => adjList.set(v, []));
  graph.edges.forEach(({ u, v }) => {
    adjList.get(u)?.push(v);
    adjList.get(v)?.push(u);
  });

  // DFS from first vertex
  function dfs(vertex: string) {
    visited.add(vertex);
    const neighbors = adjList.get(vertex) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
  }

  dfs(graph.vertices[0]);
  return visited.size === graph.vertices.length;
}

/**
 * Get the next vertex label (A, B, C, ...)
 */
export function getNextVertexLabel(graph: Graph): string {
  const labels = graph.vertices.sort();
  if (labels.length === 0) return 'A';
  
  const lastLabel = labels[labels.length - 1];
  if (lastLabel.length === 1) {
    const nextChar = String.fromCharCode(lastLabel.charCodeAt(0) + 1);
    if (nextChar <= 'Z') return nextChar;
  }
  
  // If we've exhausted A-Z, use A1, A2, etc.
  return `A${labels.length}`;
}

/**
 * Create a copy of a graph
 */
export function cloneGraph(graph: Graph): Graph {
  return {
    vertices: [...graph.vertices],
    edges: graph.edges.map((e) => ({ ...e })),
  };
}

/**
 * Remove an edge from the graph
 */
export function removeEdge(graph: Graph, edge: { u: string; v: string; w: number }): Graph {
  return {
    ...graph,
    edges: graph.edges.filter((e) => !edgesEqual(e, edge)),
  };
}

/**
 * Add an edge to the graph
 */
export function addEdge(graph: Graph, edge: { u: string; v: string; w: number }): Graph {
  return {
    ...graph,
    edges: [...graph.edges, edge],
  };
}


