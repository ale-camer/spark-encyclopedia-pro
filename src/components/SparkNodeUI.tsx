import { Handle, Position } from '@xyflow/react';
import type { SparkNode } from '../models/types';

/**
 * SparkNodeUI — Visual representation of a single node in the React Flow canvas.
 *
 * Props:
 *   data: SparkNode extended with `isActivePhase` (true when this node belongs to the current step).
 *
 * Design philosophy:
 *   Nodes are compact (title + type badge only). All narrative content lives in the
 *   NarrativePanel on the left — the canvas is a visual map, not a data dump.
 */
export const SparkNodeUI = ({ data }: { data: SparkNode & { isActivePhase?: boolean } }) => {
  return (
    <div className={`spark-node ${data.tipo} ${data.isActivePhase ? 'active-phase-node' : ''}`}>
      <Handle type="target" position={Position.Top} className="handle-top" />

      <div className="node-header">
        <span>{data.tipo.toUpperCase()}</span>
        <span>L{data.nivel}</span>
      </div>

      <div className="node-title">{data.nombre}</div>

      <Handle type="source" position={Position.Bottom} className="handle-bottom" />
    </div>
  );
};
