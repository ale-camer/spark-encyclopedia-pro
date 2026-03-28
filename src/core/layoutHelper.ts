import dagre from 'dagre';
import { Position } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import type { SparkPipelineGraph, SparkNode } from '../models/types';

const nodeWidth = 230;
const nodeHeight = 80;

/**
 * getLayoutedElements — Runs the Dagre layout algorithm on a filtered subset of the pipeline graph.
 *
 * Layout direction: TB (top-to-bottom), which works naturally for the step detail views.
 * Only structural edges (parent → child via subdecisiones) are registered with Dagre
 * to avoid cross-rank distortions from dependency or transversal edges.
 *
 * Transversal trade-off edges are included in the returned edge list but start as `hidden: true`.
 * SparkFlow reveals them automatically in the NarrativePanel as text warnings — they are
 * also drawn on the canvas for visual context, but only when both endpoints are visible.
 *
 * @param graphData - The filtered SparkPipelineGraph for the current step.
 */
export const getLayoutedElements = (
  graphData: SparkPipelineGraph
): { nodes: Node[]; edges: Edge[] } => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: 'TB',
    ranker: 'network-simplex',
    nodesep: 70,
    edgesep: 20,
    ranksep: 110,
  });

  const visibleIds = new Set(graphData.nodos.map(n => n.id));

  // ── Build React Flow nodes ──
  const initialNodes: Node[] = graphData.nodos.map((node: SparkNode) => ({
    id: node.id,
    type: 'sparkNode',
    position: { x: 0, y: 0 },
    data: { ...node },
  }));

  const initialEdges: Edge[] = [];

  // ── Structural edges (subdecisiones: parent → child) ──
  graphData.nodos.forEach((node) => {
    node.subdecisiones.forEach((subId) => {
      if (!visibleIds.has(subId)) return; // skip if child not in current step
      initialEdges.push({
        id: `e-${node.id}-${subId}`,
        source: node.id,
        target: subId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#a8c7fa', strokeWidth: 2 },
      });
    });
  });

  // ── Transversal trade-off edges (always rendered but initially visible) ──
  // Both endpoints must be in the current visible set.
  graphData.enlaces_transversales.forEach((link) => {
    if (!visibleIds.has(link.origen) || !visibleIds.has(link.destino)) return;
    initialEdges.push({
      id: `trans-${link.id}`,
      source: link.origen,
      target: link.destino,
      type: 'straight',
      animated: false,
      label: link.tipo,
      labelStyle: { fill: '#fff', fontWeight: 700, fontSize: 10 },
      labelBgStyle: { fill: '#e74c3c', fillOpacity: 0.85 },
      labelBgPadding: [4, 2],
      style: { stroke: '#e74c3c', strokeWidth: 2, strokeDasharray: '4,4' },
      data: {
        tipo: link.tipo,
        descripcion: link.descripcion,
        isTransversal: true,
      },
    });
  });

  // ── Register only structural edges with Dagre (avoids layout distortion) ──
  initialNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  initialEdges.forEach((edge) => {
    if (edge.id.startsWith('e-')) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  const finalNodes = initialNodes.map((node) => {
    const pos = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - nodeWidth / 2,
        y: pos.y - nodeHeight / 2,
      },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
    } as Node;
  });

  return { nodes: finalNodes, edges: initialEdges };
};
