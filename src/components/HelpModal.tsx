import React, { useEffect, useState } from 'react';
import { EDGE_RELATION_COLORS } from '../models/types';
import type { EdgeRelationType } from '../models/types';
import { useI18n } from '../context/I18nContext';

interface GlossaryItem {
  term: string;
  category: 'Architecture' | 'Execution' | 'Transformations' | 'Optimization' | 'Streaming';
  definition: string;
  relatedNodeId?: string;
}

const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: 'Driver',
    category: 'Architecture',
    definition:
      'Central coordinator process that runs your main() function, builds the logical/physical plan via Catalyst, schedules tasks across Executors, and collects results.',
    relatedNodeId: 'infraestructura_cluster',
  },
  {
    term: 'Executor',
    category: 'Architecture',
    definition:
      'Distributed worker JVM process launched on cluster nodes that executes Tasks on data partitions and stores cached DataFrames in memory/disk.',
    relatedNodeId: 'gestion_memoria',
  },
  {
    term: 'Cluster Manager',
    category: 'Architecture',
    definition:
      'External resource orchestrator (Hadoop YARN, Kubernetes, or Standalone) that allocates CPU cores and RAM containers for Spark Drivers and Executors.',
    relatedNodeId: 'infraestructura_cluster',
  },
  {
    term: 'Unified Memory Manager',
    category: 'Architecture',
    definition:
      'Spark memory model where Execution memory (shuffles, joins, sorts) and Storage memory (cached blocks) share a unified region with dynamic borrowing; Execution can evict Storage, but not vice-versa.',
    relatedNodeId: 'gestion_memoria',
  },
  {
    term: 'DAG (Directed Acyclic Graph)',
    category: 'Execution',
    definition:
      'Graph of computation operations recorded lazily as transformations are called on a DataFrame. Materialized into physical Stages and Tasks only when an Action is triggered.',
    relatedNodeId: 'analisis_dag',
  },
  {
    term: 'Job, Stage & Task',
    category: 'Execution',
    definition:
      '1 Action = 1+ Jobs. Each Job is split into Stages at every wide dependency (Shuffle boundary). Each Stage runs N parallel Tasks (1 Task per Partition).',
    relatedNodeId: 'analisis_dag',
  },
  {
    term: 'Narrow vs Wide Transformation',
    category: 'Execution',
    definition:
      'Narrow transformations (filter, select, withColumn, union) process each partition independently in memory (pipelined in 1 stage). Wide transformations (groupBy, join, orderBy, repartition) require a network Shuffle across stages.',
    relatedNodeId: 'impacto_shuffle',
  },
  {
    term: 'Shuffle',
    category: 'Execution',
    definition:
      'Physical redistribution of data across the network between Executors so records sharing a key land in the same partition. Involves disk serialization, network I/O, and deserialization.',
    relatedNodeId: 'impacto_shuffle',
  },
  {
    term: 'Partition',
    category: 'Execution',
    definition:
      'Logical chunk of a distributed DataFrame processed by a single Task on one CPU core. Ideal post-shuffle size is typically 128 MB – 200 MB.',
    relatedNodeId: 'config_particiones_shuffle',
  },
  {
    term: 'Data Skew',
    category: 'Optimization',
    definition:
      'Uneven distribution of records across partition keys where a few "hot" keys concentrate massive data volume, causing straggler tasks, disk spill, and OOM errors.',
    relatedNodeId: 'data_skew',
  },
  {
    term: 'Broadcast Hash Join (BHJ)',
    category: 'Transformations',
    definition:
      'Join strategy where the smaller DataFrame (< spark.sql.autoBroadcastJoinThreshold, default 10MB) is sent to all Executors, avoiding a full Shuffle of the large table.',
    relatedNodeId: 'candidato_broadcast',
  },
  {
    term: 'Sort Merge Join (SMJ)',
    category: 'Transformations',
    definition:
      'Default scalable join strategy for two large datasets: both sides are shuffled by the join key, sorted within each partition, and merged in a single pass.',
    relatedNodeId: 'estrategia_fisica_join',
  },
  {
    term: 'HashAggregate vs SortAggregate',
    category: 'Transformations',
    definition:
      'HashAggregate uses a fast in-memory UnsafeRow hash map (when aggregation buffer types are fixed-width mutable primitives). SortAggregate sorts rows first and falls back when types are complex or memory is tight.',
    relatedNodeId: 'hash_vs_sort_aggregate',
  },
  {
    term: 'Window Functions',
    category: 'Transformations',
    definition:
      'Calculations across a sliding or partitioned group of rows (ROW_NUMBER, RANK, LAG, LEAD, rolling sums) that preserve the original row granularity unlike groupBy.',
    relatedNodeId: 'operaciones_ventana',
  },
  {
    term: 'Predicate Pushdown & Column Pruning',
    category: 'Optimization',
    definition:
      'Storage optimizations where Spark pushes filter conditions (WHERE) and selected columns down into columnar file readers (Parquet/Delta/ORC), skipping irrelevant row groups and columns on disk.',
    relatedNodeId: 'pushdown_lectura',
  },
  {
    term: 'AQE (Adaptive Query Execution)',
    category: 'Optimization',
    definition:
      'Spark 3.x runtime re-optimization framework that uses real shuffle file statistics to coalesce small partitions, switch Sort Merge Join to Broadcast Join dynamically, and split skewed partitions.',
    relatedNodeId: 'capacidades_aqe',
  },
  {
    term: 'repartition() vs coalesce()',
    category: 'Optimization',
    definition:
      'repartition(N) performs a full hash/round-robin Shuffle to increase or evenly balance partitions. coalesce(N) merges existing partitions locally without a full Shuffle (ideal before writing files).',
    relatedNodeId: 'repartition_vs_coalesce',
  },
  {
    term: 'Cache / Persist vs Checkpoint',
    category: 'Optimization',
    definition:
      'cache()/persist() materializes a DataFrame in Executor memory/disk while preserving its DAG lineage. checkpoint() saves it to reliable storage (HDFS/S3) and truncates the lineage graph completely.',
    relatedNodeId: 'cache_vs_checkpoint',
  },
  {
    term: 'Watermarking',
    category: 'Streaming',
    definition:
      'Event-time threshold in Structured Streaming (withWatermark) that tells Spark how long to wait for late-arriving data before finalizing window aggregations and purging old state from memory.',
    relatedNodeId: 'watermarking',
  },
  {
    term: 'Speculative Execution',
    category: 'Execution',
    definition:
      'Mechanism (spark.speculation=true) that detects abnormally slow straggler tasks and launches a duplicate backup copy on another Executor, taking whichever finishes first.',
    relatedNodeId: 'manejo_rezagados',
  },
];

const EDGE_EXPLANATIONS: Array<{ type: EdgeRelationType; desc: string }> = [
  {
    type: 'cause_effect',
    desc: 'Node A directly produces or triggers the runtime phenomenon in Node B (e.g., Joins/Aggregations → Shuffle).',
  },
  {
    type: 'determinant',
    desc: 'The metric or choice in Node A dictates the configuration value of Node B (e.g., Dataset Size → Broadcast Candidate).',
  },
  {
    type: 'enabler',
    desc: 'Node A is a prerequisite condition that unlocks the capability in Node B (e.g., Columnar Formats → Read Pushdown).',
  },
  {
    type: 'restriction',
    desc: 'Node A constrains or rules out options in Node B (e.g., Strict Latency SLAs → Disk Checkpointing).',
  },
  {
    type: 'execution_risk',
    desc: 'Node A can severely degrade runtime performance of Node B (e.g., Data Skew → Sort Merge Join stragglers).',
  },
  {
    type: 'mitigation',
    desc: 'Node A reduces or resolves the negative impact of Node B (e.g., AQE Skew Join → Data Skew).',
  },
  {
    type: 'trigger',
    desc: 'The presence of Node A activates the need to evaluate Node B (e.g., DataFrame Recomputation → Persistence).',
  },
];

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
  visitedCount: number;
  totalNodes: number;
  onResetVisited: () => void;
  onStartTour: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  onSelectNode,
  visitedCount,
  totalNodes,
  onResetVisited,
  onStartTour,
}) => {
  const { t, graphData, currentLanguage, openLanguageModal } = useI18n();
  const [activeTab, setActiveTab] = useState<'guide' | 'conventions' | 'glossary' | 'shortcuts'>(
    'guide'
  );
  const [glossaryQuery, setGlossaryQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredGlossary = GLOSSARY_ITEMS.filter((item) => {
    const q = glossaryQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      item.term.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.definition.toLowerCase().includes(q)
    );
  });

  const getNodeLabel = (id: string) =>
    graphData.nodos.find((n) => n.id === id)?.nombre ?? id;

  return (
    <div
      className="modal-overlay ref-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t.helpModalTitle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ref-modal help-modal">
        {/* Header */}
        <div className="ref-modal-header">
          <div className="ref-modal-title-area">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span className="ref-section-badge">{t.helpModalTitle}</span>
              <span className="ref-topic-count-pill">
                ✓ {visitedCount} / {totalNodes}
              </span>
              <button
                type="button"
                className="lang-trigger-btn"
                onClick={openLanguageModal}
                title={t.selectLanguageTitle}
              >
                <span>{currentLanguage.flag}</span>
                <span>{currentLanguage.nativeName}</span>
                <span>▾</span>
              </button>
            </div>
            <button className="modal-close" onClick={onClose} aria-label={t.closeLabel}>
              ×
            </button>
          </div>

          <div className="modal-tabs help-tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
              onClick={() => setActiveTab('guide')}
            >
              {t.helpTabHowTo}
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'conventions' ? 'active' : ''}`}
              onClick={() => setActiveTab('conventions')}
            >
              {t.helpTabVisual}
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'glossary' ? 'active' : ''}`}
              onClick={() => setActiveTab('glossary')}
            >
              {t.helpTabGlossary}
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'shortcuts' ? 'active' : ''}`}
              onClick={() => setActiveTab('shortcuts')}
            >
              {t.helpTabShortcuts}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="ref-tab-content help-modal-body">
          {activeTab === 'guide' && (
            <div className="tab-pane fade-in">
              <div className="ref-block">
                <h3>{t.helpModalTitle}</h3>
                <p>{t.helpModalSubtitle}</p>
                <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="deep-dive-btn"
                    onClick={() => {
                      onClose();
                      onStartTour();
                    }}
                  >
                    {t.replayTourBtn}
                  </button>
                  <button
                    type="button"
                    className="canvas-tool-btn"
                    onClick={openLanguageModal}
                  >
                    🌐 {t.selectLanguageTitle} ({currentLanguage.nativeName})
                  </button>
                </div>
              </div>

              <div className="help-steps-grid">
                <div className="help-step-card">
                  <div className="help-step-num">1</div>
                  <h4>{t.phaseStepperTitle}</h4>
                  <p>
                    <strong>Step 1 (Full Overview)</strong> displays all 49 nodes in a 3×2 cluster
                    grid so you can see the entire architecture at once. Steps 2 to 7 focus on one
                    design phase at a time.
                  </p>
                </div>

                <div className="help-step-card">
                  <div className="help-step-num">2</div>
                  <h4>{t.guidingQuestionsTitle}</h4>
                  <p>
                    Click any card in the graph (or in the left menu) to open its detail modal:
                    <code> {t.tabCode}</code>, <code>{t.tabDiagram}</code>, and{' '}
                    <code>{t.encyclopediaHeader}</code>.
                  </p>
                </div>

                <div className="help-step-card">
                  <div className="help-step-num">3</div>
                  <h4>{t.crossPhaseSectionTitle}</h4>
                  <p>
                    Decisions in early phases condition physical execution later. Click any{' '}
                    <strong>dashed colored line</strong> on the canvas—or inspect the{' '}
                    <em>{t.crossPhaseSectionTitle}</em> section inside a node modal—to jump across
                    phases.
                  </p>
                </div>

                <div className="help-step-card">
                  <div className="help-step-num">4</div>
                  <h4>{t.encyclopediaHeader} &amp; Search (/)</h4>
                  <p>
                    Press <kbd>/</kbd> or <kbd>Ctrl+K</kbd> anytime to search by concept, SQL
                    syntax, or tag (<code>#oom</code>, <code>#salting</code>, <code>#spill</code>),
                    or open the full 13-section catalog.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'conventions' && (
            <div className="tab-pane fade-in">
              <div className="ref-block">
                <h3>{t.nodeTypesHeader}</h3>
                <div className="help-conventions-list">
                  <div className="help-conv-item">
                    <span className="legend-dot phase" />
                    <div>
                      <strong>{t.nodeTypes.phase}</strong> — {t.level1Desc}
                    </div>
                  </div>
                  <div className="help-conv-item">
                    <span className="legend-dot decision" />
                    <div>
                      <strong>{t.nodeTypes.decision}</strong> — {t.level23Desc}
                    </div>
                  </div>
                  <div className="help-conv-item">
                    <span className="legend-dot problem" />
                    <div>
                      <strong>{t.nodeTypes.problem}</strong> — Bottleneck / Risk / Constraint
                    </div>
                  </div>
                  <div className="help-conv-item">
                    <span className="legend-dot concept" />
                    <div>
                      <strong>{t.nodeTypes.concept}</strong> — Spark Execution Mechanism
                    </div>
                  </div>
                  <div className="help-conv-item">
                    <span className="legend-dot optimization" />
                    <div>
                      <strong>{t.nodeTypes.optimization}</strong> — {t.level4Desc}
                    </div>
                  </div>
                </div>
              </div>

              <div className="ref-block">
                <h3>{t.crossPhaseSectionTitle}</h3>
                <div className="help-conventions-list">
                  {EDGE_EXPLANATIONS.map((item) => {
                    const color = EDGE_RELATION_COLORS[item.type];
                    return (
                      <div key={item.type} className="help-conv-item">
                        <span
                          className="transversal-type-pill"
                          style={{
                            backgroundColor: `${color}22`,
                            color,
                            borderColor: `${color}55`,
                            minWidth: '140px',
                            textAlign: 'center',
                          }}
                        >
                          {t.edgeRelations[item.type]}
                        </span>
                        <div>{item.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'glossary' && (
            <div className="tab-pane fade-in">
              <div className="glossary-search-bar">
                <input
                  type="text"
                  className="glossary-search-input"
                  placeholder={t.glossarySearchPlaceholder}
                  value={glossaryQuery}
                  onChange={(e) => setGlossaryQuery(e.target.value)}
                />
                {glossaryQuery && (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={() => setGlossaryQuery('')}
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="glossary-grid">
                {filteredGlossary.map((item) => (
                  <div key={item.term} className="glossary-card">
                    <div className="glossary-card-header">
                      <h4>{item.term}</h4>
                      <span className="glossary-cat-badge">{item.category}</span>
                    </div>
                    <p>{item.definition}</p>
                    {item.relatedNodeId && (
                      <button
                        type="button"
                        className="transversal-node-link"
                        style={{ alignSelf: 'flex-start', marginTop: '8px' }}
                        onClick={() => {
                          onClose();
                          onSelectNode(item.relatedNodeId!);
                        }}
                      >
                        {t.inspectNodePrefix}: {getNodeLabel(item.relatedNodeId)} →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="tab-pane fade-in">
              <div className="ref-block">
                <h3>{t.helpTabShortcuts}</h3>
                <div className="shortcuts-table">
                  <div className="shortcut-row">
                    <span className="shortcut-keys">
                      <kbd>/</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd>
                    </span>
                    <span>{t.searchPlaceholder}</span>
                  </div>
                  <div className="shortcut-row">
                    <span className="shortcut-keys">
                      <kbd>←</kbd> / <kbd>→</kbd>
                    </span>
                    <span>
                      {t.prevBtn} / {t.nextPhaseBtn}
                    </span>
                  </div>
                  <div className="shortcut-row">
                    <span className="shortcut-keys">
                      <kbd>?</kbd>
                    </span>
                    <span>{t.helpBtnTitle}</span>
                  </div>
                  <div className="shortcut-row">
                    <span className="shortcut-keys">
                      <kbd>Esc</kbd>
                    </span>
                    <span>{t.closeLabel}</span>
                  </div>
                </div>
              </div>

              <div className="ref-block highlight-block">
                <h3>✓ {visitedCount} / {totalNodes} {t.nodesVisitedSuffix}</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                  <button
                    type="button"
                    className="canvas-tool-btn"
                    onClick={onResetVisited}
                  >
                    {t.resetProgressBtn} ({visitedCount}/{totalNodes})
                  </button>
                  <button
                    type="button"
                    className="deep-dive-btn"
                    style={{ marginTop: 0 }}
                    onClick={() => {
                      onClose();
                      onStartTour();
                    }}
                  >
                    {t.replayTourBtn}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
