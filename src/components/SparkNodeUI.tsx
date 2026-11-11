import { Handle, Position } from '@xyflow/react';
import type { SparkNode } from '../models/types';
import { useI18n } from '../context/I18nContext';

export interface SparkNodeData extends SparkNode {
  isActivePhase?: boolean;
  isVisited?: boolean;
  isSelected?: boolean;
  transversalCount?: number;
}

/**
 * SparkNodeUI — Visual representation of a single node in the React Flow canvas.
 */
export const SparkNodeUI = ({ data }: { data: SparkNodeData }) => {
  const { t } = useI18n();
  const hasCode = Boolean(data.codigo_pyspark || data.salida_consola);
  const hasDiagram = Boolean(data.diagrama_mermaid);
  const hasReference = Boolean(data.reference_section_id);
  const transversalCount = data.transversalCount ?? 0;
  const hasBadges = hasCode || hasDiagram || hasReference || transversalCount > 0;

  return (
    <div
      className={[
        'spark-node',
        data.tipo,
        data.isActivePhase ? 'active-phase-node' : '',
        data.isSelected ? 'selected-node' : '',
        data.isVisited ? 'visited-node' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Handle type="target" position={Position.Top} className="handle-top" />

      <div className="node-header">
        <span>{t.nodeTypes[data.tipo] ?? data.tipo.toUpperCase()}</span>
        <div className="node-header-right">
          {data.isVisited && (
            <span className="node-visited-check" title={t.visitedNodeLabel}>
              ✓
            </span>
          )}
          <span className="node-level-badge">L{data.nivel}</span>
        </div>
      </div>

      <div className="node-title">{data.nombre}</div>

      {hasBadges && (
        <div className="node-footer-badges">
          {hasCode && (
            <span className="node-meta-badge code" title={t.tabCode}>
              {t.tabCode}
            </span>
          )}
          {hasDiagram && (
            <span className="node-meta-badge diagram" title={t.tabDiagram}>
              📊
            </span>
          )}
          {hasReference && (
            <span className="node-meta-badge ref" title={t.encyclopediaHeader}>
              📚
            </span>
          )}
          {transversalCount > 0 && (
            <span
              className="node-meta-badge link"
              title={`${transversalCount} ${t.crossPhaseSectionTitle}`}
            >
              🔗 {transversalCount}
            </span>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="handle-bottom" />
    </div>
  );
};
