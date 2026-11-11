import dagre from 'dagre';
import { Position } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import { EDGE_RELATION_LABELS, EDGE_RELATION_COLORS } from '../models/types';
import type { SparkPipelineGraph, SparkNode, TransversalLink } from '../models/types';

const nodeWidth = 248;
const nodeHeight = 110;

const PHASE_ORDER = [
  'infraestructura_cluster',
  'contexto',
  'datos',
  'transformaciones',
  'ejecucion',
  'optimization',
];

export interface LayoutOptions {
  allTransversalLinks?: TransversalLink[];
  visitedNodeIds?: Set<string>;
  selectedNodeId?: string | null;
  activePhaseId?: string | null;
  showTransversalEdges?: boolean;
  edgeRelationLabels?: Record<string, string>;
}

/**
 * Collects all descendant node IDs reachable via `subdecisiones` from a given phase root.
 */
const collectSubtreeIds = (rootId: string, nodeMap: Map<string, SparkNode>): Set<string> => {
  const collected = new Set<string>();
  const queue = [rootId];
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (collected.has(currentId)) continue;
    const node = nodeMap.get(currentId);
    if (!node) continue;
    collected.add(currentId);
    for (const childId of node.subdecisiones || []) {
      if (!collected.has(childId)) {
        queue.push(childId);
      }
    }
  }
  return collected;
};

/**
 * Runs Dagre TB layout on a subset of nodes and returns their local positions and bounding box.
 */
const layoutSubgraph = (
  subNodes: SparkNode[],
  nodesep = 55,
  ranksep = 105
): { positions: Map<string, { x: number; y: number }>; width: number; height: number } => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'TB',
    ranker: 'network-simplex',
    nodesep,
    edgesep: 20,
    ranksep,
  });

  const subIds = new Set(subNodes.map(n => n.id));
  subNodes.forEach(n => {
    g.setNode(n.id, { width: nodeWidth, height: nodeHeight });
  });

  subNodes.forEach(n => {
    (n.subdecisiones || []).forEach(childId => {
      if (subIds.has(childId)) {
        g.setEdge(n.id, childId);
      }
    });
  });

  dagre.layout(g);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const rawPositions = new Map<string, { x: number; y: number }>();
  subNodes.forEach(n => {
    const pos = g.node(n.id);
    const x = pos.x - nodeWidth / 2;
    const y = pos.y - nodeHeight / 2;
    rawPositions.set(n.id, { x, y });
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + nodeWidth > maxX) maxX = x + nodeWidth;
    if (y + nodeHeight > maxY) maxY = y + nodeHeight;
  });

  if (!isFinite(minX)) {
    return { positions: new Map(), width: 0, height: 0 };
  }

  // Normalize top-left to (0, 0)
  const positions = new Map<string, { x: number; y: number }>();
  rawPositions.forEach((p, id) => {
    positions.set(id, { x: p.x - minX, y: p.y - minY });
  });

  return {
    positions,
    width: maxX - minX,
    height: maxY - minY,
  };
};

/**
 * getLayoutedElements — Runs the layout algorithm on a filtered subset of the pipeline graph.
 *
 * When displaying the full architecture (> 15 nodes), it arranges the 6 phase subtrees in a
 * balanced 3x2 grid below `root` so `fitView` frames all 49 nodes cleanly on a widescreen monitor.
 */
export const getLayoutedElements = (
  graphData: SparkPipelineGraph,
  options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } => {
  const visibleIds = new Set(graphData.nodos.map(n => n.id));
  const linksForCount = options.allTransversalLinks ?? graphData.enlaces_transversales;
  const nodeMap = new Map(graphData.nodos.map(n => [n.id, n]));

  // ── Build React Flow nodes ──
  const initialNodes: Node[] = graphData.nodos.map((node: SparkNode) => {
    const transversalCount = linksForCount.filter(
      l => l.origen === node.id || l.destino === node.id
    ).length;

    return {
      id: node.id,
      type: 'sparkNode',
      position: { x: 0, y: 0 },
      data: {
        ...node,
        isActivePhase: options.activePhaseId === node.id,
        isVisited: options.visitedNodeIds?.has(node.id) ?? false,
        isSelected: options.selectedNodeId === node.id,
        transversalCount,
      },
    };
  });

  const initialEdges: Edge[] = [];

  // ── Structural edges (subdecisiones: parent → child) ──
  graphData.nodos.forEach((node) => {
    node.subdecisiones.forEach((subId) => {
      if (!visibleIds.has(subId)) return;
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

  // ── Transversal trade-off edges ──
  if (options.showTransversalEdges !== false) {
    graphData.enlaces_transversales.forEach((link) => {
      if (!visibleIds.has(link.origen) || !visibleIds.has(link.destino)) return;
      const edgeColor = EDGE_RELATION_COLORS[link.tipo] ?? '#e74c3c';
      initialEdges.push({
        id: `trans-${link.id}`,
        source: link.origen,
        target: link.destino,
        type: 'straight',
        animated: false,
        label: options.edgeRelationLabels?.[link.tipo] ?? EDGE_RELATION_LABELS[link.tipo] ?? link.tipo,
        labelStyle: { fill: '#fff', fontWeight: 700, fontSize: 10, cursor: 'pointer' },
        labelBgStyle: { fill: edgeColor, fillOpacity: 0.9 },
        labelBgPadding: [6, 3],
        labelBgBorderRadius: 4,
        style: { stroke: edgeColor, strokeWidth: 2.2, strokeDasharray: '5,4', cursor: 'pointer' },
        data: {
          id: link.id,
          origen: link.origen,
          destino: link.destino,
          tipo: link.tipo,
          descripcion: link.descripcion,
          isTransversal: true,
        },
      });
    });
  }

  // ── Full Architecture Overview: 3x2 Balanced Phase Cluster Grid ──
  const isFullOverview = graphData.nodos.length > 15 && PHASE_ORDER.every(pid => visibleIds.has(pid));

  if (isFullOverview) {
    const finalPositions = new Map<string, { x: number; y: number }>();
    const assignedIds = new Set<string>();

    const phaseBlocks = PHASE_ORDER.map(phaseId => {
      const treeIds = collectSubtreeIds(phaseId, nodeMap);
      const subNodes = graphData.nodos.filter(n => treeIds.has(n.id) && !assignedIds.has(n.id));
      subNodes.forEach(n => assignedIds.add(n.id));
      const layout = layoutSubgraph(subNodes, 40, 95);
      return { phaseId, ...layout };
    });

    const cols = 3;
    const colGap = 140;
    const rowGap = 150;
    const rootTopHeight = visibleIds.has('root') ? nodeHeight + 130 : 0;

    // Compute column widths and row heights
    const colWidths = [0, 0, 0];
    const rowHeights = [0, 0];

    phaseBlocks.forEach((block, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      if (block.width > colWidths[col]) colWidths[col] = block.width;
      if (block.height > rowHeights[row]) rowHeights[row] = block.height;
    });

    const totalGridWidth = colWidths.reduce((a, b) => a + b, 0) + colGap * (cols - 1);

    // Position root centered at the top
    if (visibleIds.has('root')) {
      finalPositions.set('root', {
        x: totalGridWidth / 2 - nodeWidth / 2,
        y: 0,
      });
    }

    // Position each phase subtree in its grid cell (centered horizontally within its column)
    phaseBlocks.forEach((block, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      const cellLeft = colWidths.slice(0, col).reduce((a, b) => a + b, 0) + col * colGap;
      const cellTop = rootTopHeight + rowHeights.slice(0, row).reduce((a, b) => a + b, 0) + row * rowGap;
      const offsetX = cellLeft + (colWidths[col] - block.width) / 2;

      block.positions.forEach((pos, nodeId) => {
        finalPositions.set(nodeId, {
          x: offsetX + pos.x,
          y: cellTop + pos.y,
        });
      });
    });

    const finalNodes = initialNodes.map((node) => {
      const pos = finalPositions.get(node.id) ?? { x: 0, y: 0 };
      return {
        ...node,
        position: pos,
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
      } as Node;
    });

    return { nodes: finalNodes, edges: initialEdges };
  }

  // ── Standard Phase View: Single Dagre TB Tree ──
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: 'TB',
    ranker: 'network-simplex',
    nodesep: 75,
    edgesep: 24,
    ranksep: 120,
  });

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
