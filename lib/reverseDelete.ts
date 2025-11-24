import { Graph, Step } from './types';
import { cloneGraph, removeEdge, isConnected, edgesEqual } from './graph';

/**
 * Reverse-Delete Algorithm for Minimum Spanning Tree
 * 
 * Algorithm:
 * 1. Sort all edges in descending order of weight
 * 2. For each edge (in descending order):
 *    - If removing the edge keeps the graph connected, delete it
 *    - Otherwise, keep it (it's part of the MST)
 * 
 * Returns a list of steps for visualization
 */
export function reverseDelete(graph: Graph): Step[] {
  const steps: Step[] = [];
  let currentGraph = cloneGraph(graph);
  let stepNumber = 0;

  // Sort edges in descending order of weight
  const sortedEdges = [...graph.edges].sort((a, b) => b.w - a.w);

  if (sortedEdges.length === 0) {
    return steps;
  }

  // Initial state
  steps.push({
    type: "consider",
    edge: sortedEdges[0],
    explanation: `Starting Reverse-Delete algorithm. We'll process edges in descending order of weight.`,
    snapshot: cloneGraph(currentGraph),
    stepNumber: stepNumber++,
  });

  // Process each edge
  for (let i = 0; i < sortedEdges.length; i++) {
    const edge = sortedEdges[i];
    
    // Check if this edge still exists in current graph
    const edgeExists = currentGraph.edges.some((e) => edgesEqual(e, edge));
    if (!edgeExists) {
      continue; // Edge was already removed
    }

    // Step 1: Always CONSIDER this edge first (even for the last edge)
    steps.push({
      type: "consider",
      edge,
      explanation: `Considering edge ${edge.u}-${edge.v} with weight ${edge.w} (heaviest remaining).`,
      snapshot: cloneGraph(currentGraph),
      stepNumber: stepNumber++,
    });

    // Step 2: Try removing it to check connectivity
    const graphWithoutEdge = removeEdge(currentGraph, edge);
    const removalWouldDisconnect = !isConnected(graphWithoutEdge);

    // Step 3: Decide keep or delete
    if (removalWouldDisconnect) {
      // Must keep - part of MST
      steps.push({
        type: "keep",
        edge,
        explanation: `Keeping edge ${edge.u}-${edge.v} (weight ${edge.w}). Removing it would disconnect the graph, so it's part of the MST.`,
        snapshot: cloneGraph(currentGraph),
        stepNumber: stepNumber++,
      });
    } else {
      // Can remove - not needed for MST
      currentGraph = graphWithoutEdge;
      steps.push({
        type: "delete",
        edge,
        explanation: `Removing edge ${edge.u}-${edge.v} (weight ${edge.w}). Graph remains connected, so this edge is not needed for the MST.`,
        snapshot: cloneGraph(currentGraph),
        stepNumber: stepNumber++,
      });
    }
  }

  // Final completion step
  const mstWeight = currentGraph.edges.reduce((sum, e) => sum + e.w, 0);
  steps.push({
    type: "complete",
    edge: sortedEdges[sortedEdges.length - 1], // Use last edge for reference, but won't highlight
    explanation: `Algorithm complete! The MST has ${currentGraph.edges.length} edges with total weight ${mstWeight}.`,
    snapshot: cloneGraph(currentGraph),
    stepNumber: stepNumber++,
  });

  return steps;
}

/**
 * Calculate total weight of a graph
 */
export function getTotalWeight(graph: Graph): number {
  return graph.edges.reduce((sum, edge) => sum + edge.w, 0);
}


