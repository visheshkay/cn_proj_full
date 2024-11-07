import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';

const GraphVisualizer = ({ adjacencyMatrix }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Parse adjacency matrix into nodes and edges
    const nodes = [];
    const edges = [];
    const n = adjacencyMatrix.length;

    for (let i = 0; i < n; i++) {
      nodes.push({ id: i, label: `Router ${i + 1}` }); // Corrected label syntax
      for (let j = i + 1; j < n; j++) {
        if (adjacencyMatrix[i][j] !== 0) {
          edges.push({
            from: i,
            to: j,
            label: String(adjacencyMatrix[i][j]),
            color: '#848484',
            font: { align: 'top' },
          });
        }
      }
    }

    // Define the data for the graph
    const data = {
      nodes: nodes,
      edges: edges,
    };

    // Options for the network
    const options = {
      edges: {
        color: { color: '#848484' },
        font: { align: 'horizontal' },
      },
      nodes: {
        shape: 'circle',
        size: 20,
        color: { background: '#97C2FC', border: '#2B7CE9' },
        font: { color: '#343434' },
      },
      layout: {
        improvedLayout: true,
      },
      physics: {
        enabled: true,
      },
    };

    // Create a network
    const network = new Network(containerRef.current, data, options);

    // Cleanup on component unmount
    return () => {
      network.destroy();
    };
  }, [adjacencyMatrix]); // Ensure the graph updates when adjacencyMatrix changes

  return <div ref={containerRef} style={{ width: '100%', height: '600px' }} />;
};

export default GraphVisualizer;