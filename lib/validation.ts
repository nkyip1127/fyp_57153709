import { Graph, ValidationError } from './types';
import { edgesEqual, isConnected } from './graph';

/**
 * Validate a graph and return a list of errors
 */
export function validateGraph(graph: Graph): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check for empty graph
  if (graph.vertices.length === 0) {
    errors.push({
      type: "disconnected",
      message: "Graph must have at least one vertex",
    });
    return errors;
  }

  // Check for duplicate edges
  const seenEdges = new Set<string>();
  for (let i = 0; i < graph.edges.length; i++) {
    const edge = graph.edges[i];
    const edgeKey1 = `${edge.u}-${edge.v}`;
    const edgeKey2 = `${edge.v}-${edge.u}`;

    if (seenEdges.has(edgeKey1) || seenEdges.has(edgeKey2)) {
      errors.push({
        type: "duplicate_edge",
        message: `Duplicate edge found: ${edge.u}-${edge.v}`,
        edge,
      });
    } else {
      seenEdges.add(edgeKey1);
      seenEdges.add(edgeKey2);
    }
  }

  // Check for self-loops
  for (const edge of graph.edges) {
    if (edge.u === edge.v) {
      errors.push({
        type: "self_loop",
        message: `Self-loop detected at vertex ${edge.u}`,
        edge,
      });
    }
  }

  // Check for missing or invalid weights
  for (const edge of graph.edges) {
    if (edge.w === undefined || edge.w === null || isNaN(edge.w)) {
      errors.push({
        type: "missing_weight",
        message: `Missing weight for edge ${edge.u}-${edge.v}`,
        edge,
      });
    } else if (edge.w < 0) {
      errors.push({
        type: "negative_weight",
        message: `Negative weight found for edge ${edge.u}-${edge.v}: ${edge.w}`,
        edge,
      });
    }
  }

  // Check for edges with invalid vertices
  for (const edge of graph.edges) {
    if (!graph.vertices.includes(edge.u)) {
      errors.push({
        type: "multi_edge",
        message: `Edge references non-existent vertex: ${edge.u}`,
        edge,
      });
    }
    if (!graph.vertices.includes(edge.v)) {
      errors.push({
        type: "multi_edge",
        message: `Edge references non-existent vertex: ${edge.v}`,
        edge,
      });
    }
  }

  // Check if graph is connected (only if no other critical errors)
  if (errors.length === 0 && !isConnected(graph)) {
    errors.push({
      type: "disconnected",
      message: "Graph is not connected. All vertices must be reachable from each other.",
    });
  }

  return errors;
}

/**
 * Check if graph is valid (no errors)
 */
export function isValidGraph(graph: Graph): boolean {
  return validateGraph(graph).length === 0;
}


