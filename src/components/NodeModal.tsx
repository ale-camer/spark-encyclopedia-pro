import React, { useEffect, useState } from 'react';
import { EDGE_RELATION_COLORS } from '../models/types';
import type { SparkPipelineGraph, ReferenceSection } from '../models/types';
import { MermaidChart } from './MermaidChart';
import { CodeBlock } from './CodeBlock';
import { useI18n } from '../context/I18nContext';

interface NodeModalProps {
  nodeId: string | null;
  graphData: SparkPipelineGraph;
  refSections?: ReferenceSection[];
  onClose: () => void;
  onOpenReference?: (sectionId: string) => void;
  onSelectNode?: (nodeId: string) => void;
}

export const NodeModal: React.FC<NodeModalProps> = ({
  nodeId,
  graphData,
  refSections,
  onClose,
  onOpenReference,
  onSelectNode,
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'strategy' | 'code' | 'architecture'>('strategy');

  useEffect(() => {
    setActiveTab('strategy');
  }, [nodeId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (nodeId) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodeId, onClose]);

  if (!nodeId) return null;
  const node = graphData.nodos.find((n) => n.id === nodeId);
  if (!node) return null;

  const linkedSection = node.reference_section_id
    ? refSections?.find((s) => s.id === node.reference_section_id)
    : undefined;

  const getNode = (id: string) => graphData.nodos.find((n) => n.id === id);
  const getNodeName = (id: string) => getNode(id)?.nombre ?? id;
  const subs = (node.subdecisiones || []).map((id) => {
    const target = getNode(id);
    return { id, name: target?.nombre ?? id, tipo: target?.tipo ?? 'decision' };
  });
  const deps = (node.dependencias || []).map((id) => {
    const target = getNode(id);
    return { id, name: target?.nombre ?? id, tipo: target?.tipo ?? 'decision' };
  });

  const outgoingLinks = graphData.enlaces_transversales.filter((e) => e.origen === node.id);
  const incomingLinks = graphData.enlaces_transversales.filter((e) => e.destino === node.id);
  const hasTransversal = outgoingLinks.length > 0 || incomingLinks.length > 0;

  const hasCode = !!node.codigo_pyspark || !!node.salida_consola;
  const hasDiagram = !!node.diagrama_mermaid;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={node.nombre}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`modal-content ${node.tipo}`}>
        <button className="modal-close" onClick={onClose} aria-label={t.closeLabel}>
          ×
        </button>

        <div className="modal-header">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="modal-badge">
              {t.nodeTypes[node.tipo] ?? node.tipo.toUpperCase()} · L{node.nivel}
            </span>
            <h2>{node.nombre}</h2>
            {node.reference_section_id && onOpenReference && (
              <button
                className="deep-dive-btn"
                title={linkedSection?.description}
                onClick={() => onOpenReference(node.reference_section_id!)}
              >
                {linkedSection
                  ? `${linkedSection.icon} ${t.deepDivePrefix}: ${linkedSection.title} (${linkedSection.entries.length} ${t.topicsSuffix}) →`
                  : `📚 ${t.deepDivePrefix} →`}
              </button>
            )}
          </div>
          <div className="modal-tabs">
            <button
              className={`tab-btn ${activeTab === 'strategy' ? 'active' : ''}`}
              onClick={() => setActiveTab('strategy')}
            >
              {t.tabStrategy}{' '}
              {hasTransversal ? `(${outgoingLinks.length + incomingLinks.length})` : ''}
            </button>
            {hasCode && (
              <button
                className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
                onClick={() => setActiveTab('code')}
              >
                {t.tabCode}
              </button>
            )}
            {hasDiagram && (
              <button
                className={`tab-btn ${activeTab === 'architecture' ? 'active' : ''}`}
                onClick={() => setActiveTab('architecture')}
              >
                {t.tabDiagram}
              </button>
            )}
          </div>
        </div>

        <div className="modal-body">
          {activeTab === 'strategy' && (
            <div className="tab-pane fade-in">
              {node.pregunta_guia && (
                <div className="modal-section guide-question">
                  <h3>{t.guidingQuestionHeader}</h3>
                  <p>{node.pregunta_guia}</p>
                </div>
              )}
              {subs.length > 0 && (
                <div className="modal-section child-nodes">
                  <h3>
                    {t.subDecisionsHeader} ({subs.length})
                  </h3>
                  <ul className="modal-list">
                    {subs.map((s) => (
                      <li key={s.id} className="modal-list-interactive-item">
                        {onSelectNode ? (
                          <button
                            type="button"
                            className="modal-node-jump-btn"
                            onClick={() => onSelectNode(s.id)}
                          >
                            <span className="modal-node-jump-name">{s.name}</span>
                            <span className="modal-node-jump-meta">
                              <span className={`child-type-tag ${s.tipo}`}>
                                {t.nodeTypes[s.tipo] ?? s.tipo}
                              </span>
                              <span className="child-open-arrow">→</span>
                            </span>
                          </button>
                        ) : (
                          <span>{s.name}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {deps.length > 0 && (
                <div className="modal-section dependencies">
                  <h3>
                    {t.prevDependenciesHeader} ({deps.length})
                  </h3>
                  <ul className="modal-list warning">
                    {deps.map((d) => (
                      <li key={d.id} className="modal-list-interactive-item">
                        {onSelectNode ? (
                          <button
                            type="button"
                            className="modal-node-jump-btn"
                            onClick={() => onSelectNode(d.id)}
                          >
                            <span className="modal-node-jump-name">{d.name}</span>
                            <span className="modal-node-jump-meta">
                              <span className={`child-type-tag ${d.tipo}`}>
                                {t.nodeTypes[d.tipo] ?? d.tipo}
                              </span>
                              <span className="child-open-arrow">→</span>
                            </span>
                          </button>
                        ) : (
                          <span>{d.name}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {hasTransversal && (
                <div className="modal-section transversal-relations">
                  <h3>
                    {t.crossPhaseSectionTitle} ({outgoingLinks.length + incomingLinks.length})
                  </h3>
                  <div className="transversal-list">
                    {outgoingLinks.map((link) => {
                      const color = EDGE_RELATION_COLORS[link.tipo];
                      const targetName = getNodeName(link.destino);
                      return (
                        <div
                          key={link.id}
                          className="transversal-card"
                          style={{ borderLeftColor: color }}
                        >
                          <div className="transversal-card-header">
                            <span className="transversal-dir">{t.impactsOutboundLabel}</span>
                            <span
                              className="transversal-type-pill"
                              style={{
                                backgroundColor: `${color}22`,
                                color,
                                borderColor: `${color}55`,
                              }}
                            >
                              {t.edgeRelations[link.tipo]}
                            </span>
                            {onSelectNode ? (
                              <button
                                type="button"
                                className="transversal-node-link"
                                onClick={() => onSelectNode(link.destino)}
                              >
                                {targetName} →
                              </button>
                            ) : (
                              <strong>{targetName}</strong>
                            )}
                          </div>
                          <p className="transversal-desc">{link.descripcion}</p>
                        </div>
                      );
                    })}
                    {incomingLinks.map((link) => {
                      const color = EDGE_RELATION_COLORS[link.tipo];
                      const sourceName = getNodeName(link.origen);
                      return (
                        <div
                          key={link.id}
                          className="transversal-card"
                          style={{ borderLeftColor: color }}
                        >
                          <div className="transversal-card-header">
                            <span className="transversal-dir">
                              {t.conditionedByInboundLabel}
                            </span>
                            <span
                              className="transversal-type-pill"
                              style={{
                                backgroundColor: `${color}22`,
                                color,
                                borderColor: `${color}55`,
                              }}
                            >
                              {t.edgeRelations[link.tipo]}
                            </span>
                            {onSelectNode ? (
                              <button
                                type="button"
                                className="transversal-node-link"
                                onClick={() => onSelectNode(link.origen)}
                              >
                                ← {sourceName}
                              </button>
                            ) : (
                              <strong>{sourceName}</strong>
                            )}
                          </div>
                          <p className="transversal-desc">{link.descripcion}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'code' && (
            <div className="tab-pane fade-in code-pane">
              {node.codigo_pyspark && (
                <div className="modal-section">
                  <h3>{t.codeImplementationHeader}</h3>
                  <CodeBlock code={node.codigo_pyspark} />
                </div>
              )}
              {node.salida_consola && (
                <div className="modal-section terminal-section">
                  <h3>{t.consolePlanOutputHeader}</h3>
                  <pre className="terminal-output">
                    <code>{node.salida_consola}</code>
                  </pre>
                </div>
              )}
            </div>
          )}
          {activeTab === 'architecture' && node.diagrama_mermaid && (
            <div className="tab-pane fade-in">
              <div className="modal-section">
                <h3>{t.underTheHoodHeader}</h3>
                <MermaidChart chart={node.diagrama_mermaid} id={node.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
