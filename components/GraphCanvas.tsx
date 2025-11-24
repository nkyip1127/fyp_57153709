'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraphStore } from '@/lib/store';
import { Graph } from '@/lib/types';
import UndoRedoControls from './UndoRedoControls';

interface GraphCanvasProps {
  onNodeClick?: (nodeId: string) => void;
}

function GraphCanvasInner({ onNodeClick }: GraphCanvasProps) {
  const {
    graph,
    nodePositions,
    steps,
    currentStep,
    selectedVertices,
    selectedEdge,
    edgeCreationMode,
    addVertex,
    addEdge,
    removeVertex,
    removeEdge,
    updateEdgeWeight,
    updateNodePosition,
    setSelectedVertices,
    setSelectedEdge,
    toggleEdgeCreationMode,
  } = useGraphStore();

  // Get React Flow instance for fitView
  const { fitView } = useReactFlow();

  // Listen for tidy layout completion event
  useEffect(() => {
    const handleTidyLayoutComplete = () => {
      // Fit view to show entire graph after layout
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 400 });
      }, 50);
    };

    window.addEventListener('tidyLayoutComplete', handleTidyLayoutComplete);
    return () => {
      window.removeEventListener('tidyLayoutComplete', handleTidyLayoutComplete);
    };
  }, [fitView]);

  // Convert graph to React Flow format
  const { nodes, edges } = useMemo(() => {
    const flowNodes: Node[] = graph.vertices.map((vertex) => {
      // Use stored position, or default if not set
      const position = nodePositions[vertex] || { x: 300, y: 200 };
      
      // Determine node styling based on state
      const isSelectedForEdge = edgeCreationMode && selectedVertices.includes(vertex);
      const isSelectedNormally = !edgeCreationMode && selectedVertices.includes(vertex);
      
      // Yellow highlight for edge creation mode, blue highlight for normal selection
      let backgroundColor = '#3b82f6'; // Default blue
      let borderColor = '#1e40af';
      let borderWidth = '2px';
      
      if (isSelectedForEdge) {
        backgroundColor = '#FACC15'; // yellow-400 - prominent yellow for edge selection
        borderColor = '#EAB308'; // yellow-500 - darker yellow border
        borderWidth = '3px';
      } else if (isSelectedNormally) {
        backgroundColor = '#fbbf24'; // yellow-300 - lighter yellow for normal selection
        borderColor = '#F59E0B'; // amber-500
        borderWidth = '2px';
      }
      
      return {
        id: vertex,
        type: 'default',
        data: { label: vertex },
        position,
        style: {
          background: backgroundColor,
          color: '#fff',
          border: `${borderWidth} solid ${borderColor}`,
          borderRadius: '50%',
          width: 50,
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          boxShadow: isSelectedForEdge ? '0 0 10px rgba(250, 204, 21, 0.6)' : 'none',
          transition: 'all 0.2s ease-in-out',
        },
      };
    });

    // Get current graph state from step if available
    let currentGraph: Graph = graph;
    if (steps.length > 0 && currentStep < steps.length) {
      currentGraph = steps[currentStep].snapshot;
    }

    const flowEdges: Edge[] = currentGraph.edges.map((edge, index) => {
      const step = steps[currentStep];
      const isCurrentEdge =
        step &&
        step.type !== 'complete' &&
        ((step.edge.u === edge.u && step.edge.v === edge.v) ||
          (step.edge.u === edge.v && step.edge.v === edge.u));

      let edgeColor = '#64748b';
      let edgeWidth = 2;

      if (isCurrentEdge && step) {
        if (step.type === 'consider') {
          edgeColor = '#fbbf24'; // Yellow
          edgeWidth = 4;
        } else if (step.type === 'delete') {
          edgeColor = '#ef4444'; // Red
          edgeWidth = 3;
        } else if (step.type === 'keep') {
          edgeColor = '#22c55e'; // Green
          edgeWidth = 3;
        }
        // "complete" type doesn't highlight any edge
      }

      const isSelected = selectedEdge && (
        (selectedEdge.u === edge.u && selectedEdge.v === edge.v) ||
        (selectedEdge.u === edge.v && selectedEdge.v === edge.u)
      );

      return {
        id: `e${edge.u}-${edge.v}-${index}`,
        source: edge.u,
        target: edge.v,
        label: `${edge.w}`,
        type: 'default',
        animated: isCurrentEdge && step && step.type === 'consider',
        selected: isSelected || false,
        style: {
          stroke: isSelected ? '#8b5cf6' : edgeColor,
          strokeWidth: isSelected ? 4 : edgeWidth,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColor,
        },
        labelStyle: {
          fill: edgeColor,
          fontWeight: 'bold',
          fontSize: 14,
        },
        labelBgStyle: {
          fill: '#fff',
          fillOpacity: 0.8,
        },
      };
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [graph, nodePositions, steps, currentStep, selectedVertices, selectedEdge, edgeCreationMode]);

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  // Use ref to track React Flow nodes for position preservation (avoid infinite loop)
  const reactFlowNodesRef = React.useRef(reactFlowNodes);
  React.useEffect(() => {
    reactFlowNodesRef.current = reactFlowNodes;
  }, [reactFlowNodes]);

  // Track previous computed nodes to detect actual changes
  const prevComputedNodesRef = React.useRef(nodes);
  const prevComputedEdgesRef = React.useRef(edges);
  const prevNodePositionsRef = React.useRef(nodePositions);
  
  // Sync nodes to React Flow, preserving positions during drag
  React.useEffect(() => {
    // Check if node positions changed (e.g., from Tidy Layout)
    const positionsChanged = 
      Object.keys(nodePositions).length !== Object.keys(prevNodePositionsRef.current).length ||
      Object.keys(nodePositions).some((vertex) => {
        const newPos = nodePositions[vertex];
        const oldPos = prevNodePositionsRef.current[vertex];
        if (!oldPos || !newPos) return true;
        return newPos.x !== oldPos.x || newPos.y !== oldPos.y;
      });
    
    // Check if graph structure changed (new graph loaded)
    const graphStructureChanged = 
      prevComputedNodesRef.current.length !== nodes.length ||
      prevComputedNodesRef.current.some((node, i) => {
        const newNode = nodes[i];
        return !newNode || node.id !== newNode.id;
      });
    
    // Check if nodes or edges actually changed
    const nodesChanged = 
      graphStructureChanged ||
      positionsChanged ||
      prevComputedNodesRef.current.some((node, i) => {
        const newNode = nodes[i];
        if (!newNode || node.id !== newNode.id) return true;
        // Check if style changed (for highlighting)
        return JSON.stringify(node.style) !== JSON.stringify(newNode.style);
      });
    
    const edgesChanged = 
      prevComputedEdgesRef.current.length !== edges.length ||
      prevComputedEdgesRef.current.some((edge, i) => {
        const newEdge = edges[i];
        if (!newEdge || edge.id !== newEdge.id) return true;
        return JSON.stringify(edge.style) !== JSON.stringify(newEdge.style);
      });
    
    // If graph structure changed (new graph loaded), completely replace nodes
    if (graphStructureChanged) {
      // Completely replace nodes with new graph (don't preserve old positions)
      setNodes(nodes);
      setEdges(edges);
      prevComputedNodesRef.current = nodes;
      prevComputedEdgesRef.current = edges;
      prevNodePositionsRef.current = nodePositions;
      return;
    }
    
    // If positions changed (e.g., from Tidy Layout), force update with new positions
    if (positionsChanged) {
      // Create new node objects with updated positions to force React Flow re-render
      const nodesWithNewPositions = nodes.map((computedNode) => {
        const newPosition = nodePositions[computedNode.id];
        if (newPosition) {
          // Create new object with new position reference
          return {
            ...computedNode,
            position: { ...newPosition }, // New position object
          };
        }
        return computedNode;
      });
      
      // Force update with new node objects
      setNodes(nodesWithNewPositions);
      prevComputedNodesRef.current = nodes;
      prevNodePositionsRef.current = nodePositions;
      
      // Trigger fitView after positions are updated
      setTimeout(() => {
        const event = new CustomEvent('tidyLayoutComplete');
        window.dispatchEvent(event);
      }, 50);
      
      return;
    }
    
    // Only update if nodes or edges actually changed (for highlighting updates)
    if (nodesChanged) {
      // Map computed nodes to React Flow nodes, preserving positions during drag
      const nodesToSync = nodes.map((computedNode) => {
        // Find existing node in React Flow to preserve its position during drag
        const existingNode = reactFlowNodesRef.current.find(n => n.id === computedNode.id);
        if (existingNode) {
          // Preserve React Flow's position (important during drag for smooth movement)
          // But update style and other properties from computed node
          return {
            ...computedNode,
            position: existingNode.position,
          };
        }
        // New node - use computed position
        return computedNode;
      });
      
      // Only update if nodes actually differ to prevent infinite loops
      const nodesActuallyChanged = 
        reactFlowNodesRef.current.length !== nodesToSync.length ||
        nodesToSync.some((node) => {
          const existing = reactFlowNodesRef.current.find(n => n.id === node.id);
          if (!existing) return true;
          // Check if style or other properties changed
          return JSON.stringify(existing.style) !== JSON.stringify(node.style) ||
                 existing.data?.label !== node.data?.label;
        });
      
      if (nodesActuallyChanged) {
        setNodes(nodesToSync);
        prevComputedNodesRef.current = nodes;
      }
    } else {
      // Update ref even if we don't update nodes to track state
      prevComputedNodesRef.current = nodes;
    }
    
    if (edgesChanged) {
      // Check if edges actually differ before updating
      const edgesActuallyChanged = 
        reactFlowEdges.length !== edges.length ||
        edges.some((edge) => {
          const existing = reactFlowEdges.find(e => e.id === edge.id);
          if (!existing) return true;
          return JSON.stringify(existing.style) !== JSON.stringify(edge.style);
        });
      
      if (edgesActuallyChanged) {
        setEdges(edges);
      }
      prevComputedEdgesRef.current = edges;
    } else {
      prevComputedEdgesRef.current = edges;
    }
    
    // Update position ref
    prevNodePositionsRef.current = nodePositions;
  }, [nodes, edges, nodePositions, setNodes, setEdges]);

  // Handle node changes - let React Flow manage positions during drag for smooth movement
  // We only save to Zustand on drag end via onNodeDragStop
  const onNodesChangeHandler = useCallback(
    (changes: any) => {
      // Let React Flow handle all changes internally for smooth drag performance
      // Position updates are handled by onNodeDragStop to avoid lag
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        const weight = prompt('Enter edge weight:');
        if (weight && !isNaN(Number(weight))) {
          addEdge(params.source, params.target, Number(weight));
        }
      }
    },
    [addEdge]
  );

  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (edgeCreationMode) {
        // If clicking the same vertex again, deselect it
        if (selectedVertices.includes(node.id)) {
          setSelectedVertices(selectedVertices.filter((v) => v !== node.id));
          return;
        }

        // Add the vertex to selection
        const newSelected = [...selectedVertices, node.id];

        // If we have 2 vertices selected, prompt for weight
        if (newSelected.length === 2) {
          setSelectedVertices(newSelected); // Update UI first to show both selected
          
          const weight = prompt(`Enter edge weight for ${newSelected[0]}-${newSelected[1]}:`);
          
          if (weight && !isNaN(Number(weight)) && Number(weight) >= 0) {
            // Edge created successfully - reset selection and exit edge mode
            addEdge(newSelected[0], newSelected[1], Number(weight));
            setSelectedVertices([]);
            toggleEdgeCreationMode();
          } else {
            // User cancelled or entered invalid weight - clear selection but stay in edge mode
            setSelectedVertices([]);
          }
        } else {
          // First vertex selected - just update selection
          setSelectedVertices(newSelected);
        }
      } else if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [edgeCreationMode, selectedVertices, setSelectedVertices, addEdge, toggleEdgeCreationMode, onNodeClick]
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      const currentEdge = graph.edges.find(
        (e) =>
          (e.u === edge.source && e.v === edge.target) ||
          (e.u === edge.target && e.v === edge.source)
      );
      if (currentEdge) {
        setSelectedEdge({ u: currentEdge.u, v: currentEdge.v });
      }
    },
    [graph.edges, setSelectedEdge]
  );

  const onEdgeDoubleClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      const currentEdge = graph.edges.find(
        (e) =>
          (e.u === edge.source && e.v === edge.target) ||
          (e.u === edge.target && e.v === edge.source)
      );
      if (currentEdge) {
        const newWeight = prompt(`Enter new weight for edge ${currentEdge.u}-${currentEdge.v}:`, String(currentEdge.w));
        if (newWeight && !isNaN(Number(newWeight))) {
          updateEdgeWeight(currentEdge.u, currentEdge.v, Number(newWeight));
        }
      }
    },
    [graph.edges, updateEdgeWeight]
  );

  // Handle drag end - save final position to Zustand
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Save final position when drag ends and push to history
      const { pushToHistory } = useGraphStore.getState();
      pushToHistory();
      updateNodePosition(node.id, node.position, true);
    },
    [updateNodePosition]
  );

  const onPaneClick = useCallback(() => {
    if (edgeCreationMode) {
      // Clear vertex selection when clicking empty area in edge creation mode
      setSelectedVertices([]);
    }
    setSelectedEdge(null);
  }, [edgeCreationMode, setSelectedVertices, setSelectedEdge]);

  return (
    <div className="w-full h-full relative">
      {/* Undo/Redo Controls */}
      <UndoRedoControls />
      
      {/* Edge Creation Mode Indicator */}
      {edgeCreationMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg shadow-lg border-2 border-yellow-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Edge Creation Mode</span>
            <span className="text-sm">
              {selectedVertices.length === 0 && 'Click first vertex'}
              {selectedVertices.length === 1 && `Selected: ${selectedVertices[0]}. Click second vertex`}
              {selectedVertices.length === 2 && `Selected: ${selectedVertices.join(' - ')}. Enter weight`}
            </span>
          </div>
        </div>
      )}
      
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClickHandler}
        onNodeDragStop={onNodeDragStop}
        onEdgeClick={onEdgeClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onPaneClick={onPaneClick}
        fitView={false}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default function GraphCanvas(props: GraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

