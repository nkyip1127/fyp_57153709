import dagre from 'dagre';
import { Graph, NodePosition } from './types';

/**
 * Calculate optimal node positions using Dagre layout algorithm
 * This creates a clean, hierarchical layout that minimizes edge crossings
 */
export function calculateTidyLayout(graph: Graph): Record<string, NodePosition> {
  if (graph.vertices.length === 0) {
    return {};
  }

  // Create a new dagre graph
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: 'TB', // Top to bottom layout
    nodesep: 100,  // Minimum horizontal spacing between nodes
    ranksep: 150,  // Minimum vertical spacing between ranks
    marginx: 50,   // Horizontal margin
    marginy: 50,   // Vertical margin
  });

  // Add nodes to dagre graph
  graph.vertices.forEach((vertex) => {
    dagreGraph.setNode(vertex, {
      width: 50,  // Node width (matches our node size)
      height: 50, // Node height (matches our node size)
    });
  });

  // Add edges to dagre graph
  graph.edges.forEach((edge) => {
    dagreGraph.setEdge(edge.u, edge.v);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Extract positions from dagre graph
  const positions: Record<string, NodePosition> = {};
  dagreGraph.nodes().forEach((nodeId) => {
    const node = dagreGraph.node(nodeId);
    positions[nodeId] = {
      x: node.x,
      y: node.y,
    };
  });

  return positions;
}

/**
 * Alternative: Simple force-directed layout using D3
 * This creates a more organic, natural-looking layout
 */
export function calculateForceLayout(graph: Graph): Record<string, NodePosition> {
  if (graph.vertices.length === 0) {
    return {};
  }

  // For now, use a simple circular layout as fallback
  // A full force-directed implementation would require d3-force
  const positions: Record<string, NodePosition> = {};
  const centerX = 400;
  const centerY = 300;
  const radius = Math.max(150, graph.vertices.length * 30);

  graph.vertices.forEach((vertex, index) => {
    const angle = (2 * Math.PI * index) / graph.vertices.length;
    positions[vertex] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  return positions;
}



