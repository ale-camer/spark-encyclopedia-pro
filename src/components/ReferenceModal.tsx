import React, { useEffect, useState } from 'react';
import type { ReferenceEntry, ReferenceSection } from '../models/types';
import { MermaidChart } from './MermaidChart';
import { CodeBlock } from './CodeBlock';
import { useI18n } from '../context/I18nContext';

const OFFICIAL_SPARK_DOCS_BY_SECTION: Record<string, string> = {
  joins: 'https://spark.apache.org/docs/3.5.0/sql-performance-tuning.html#join-strategy-hints-for-sql-queries',
  window_functions: 'https://spark.apache.org/docs/3.5.0/sql-ref-syntax-qry-select-window.html',
  aggregations: 'https://spark.apache.org/docs/3.5.0/sql-ref-syntax-qry-select-groupby.html',
  storage_pushdown: 'https://spark.apache.org/docs/3.5.0/sql-data-sources-parquet.html',
  persistence_caching: 'https://spark.apache.org/docs/3.5.0/rdd-programming-guide.html#rdd-persistence',
  core_optimization_aqe: 'https://spark.apache.org/docs/3.5.0/sql-performance-tuning.html#adaptive-query-execution',
  cluster_infrastructure: 'https://spark.apache.org/docs/3.5.0/cluster-overview.html',
  memory_management: 'https://spark.apache.org/docs/3.5.0/tuning.html#memory-management-overview',
  streaming_advanced: 'https://spark.apache.org/docs/3.5.0/structured-streaming-programming-guide.html',
  data_governance: 'https://spark.apache.org/docs/3.5.0/sql-ref-syntax-ddl.html',
  complex_types: 'https://spark.apache.org/docs/3.5.0/api/python/reference/pyspark.sql/functions.html',
  execution_shuffle: 'https://spark.apache.org/docs/3.5.0/rdd-programming-guide.html#shuffle-operations',
  advanced_optimization: 'https://spark.apache.org/docs/3.5.0/sql-performance-tuning.html',
};

interface ReferenceModalProps {
  section: ReferenceSection | null;
  allSections?: ReferenceSection[];
  initialEntryId?: string | null;
  onSelectSection?: (section: ReferenceSection) => void;
  onClose: () => void;
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({
  section,
  allSections = [],
  initialEntryId,
  onSelectSection,
  onClose,
}) => {
  const { t } = useI18n();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'diagram'>('overview');

  useEffect(() => {
    if (!section) return;
    const entry = initialEntryId
      ? section.entries.find((e) => e.id === initialEntryId) ?? section.entries[0]
      : section.entries[0];
    setSelectedEntryId(entry?.id ?? null);
    setActiveTab('overview');
  }, [section?.id, initialEntryId]);

  useEffect(() => {
    setActiveTab('overview');
  }, [selectedEntryId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (section) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [section, onClose]);

  if (!section) return null;

  const selectedEntry: ReferenceEntry =
    section.entries.find((e) => e.id === selectedEntryId) ?? section.entries[0];

  if (!selectedEntry) return null;

  const hasCode = !!selectedEntry.codigo_pyspark;
  const hasDiagram = !!selectedEntry.diagrama_mermaid;
  const sectionsList = allSections.length > 0 ? allSections : [section];
  const totalTopics = sectionsList.reduce((acc, s) => acc + s.entries.length, 0);
  const officialUrl =
    OFFICIAL_SPARK_DOCS_BY_SECTION[section.id] ||
    'https://spark.apache.org/docs/3.5.0/api/python/index.html';

  return (
    <div
      className="modal-overlay ref-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${t.encyclopediaHeader}: ${section.title}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ref-modal">
        {/* Header */}
        <div className="ref-modal-header">
          <div className="ref-modal-title-area">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span className="ref-section-badge">
                {t.encyclopediaHeader} · {section.icon} {section.title}
              </span>
              <span className="ref-topic-count-pill">{t.sectionsCatalogSubtitle}</span>
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="official-docs-link"
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: '#38bdf8',
                  textDecoration: 'none',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  background: 'rgba(56, 189, 248, 0.1)',
                }}
              >
                {t.officialDocsBtn}
              </a>
            </div>
            <button className="modal-close" onClick={onClose} aria-label={t.closeLabel}>
              ×
            </button>
          </div>
        </div>

        <div className="ref-modal-body">
          {/* Left sidebar: full encyclopedia section & entry tree */}
          <aside className="ref-sidebar">
            <div className="ref-sidebar-title">
              {t.encyclopediaHeader} ({totalTopics})
            </div>
            <div className="ref-catalog-list">
              {sectionsList.map((sec) => {
                const isCurrentSection = sec.id === section.id;
                return (
                  <div
                    key={sec.id}
                    className={`ref-catalog-section ${isCurrentSection ? 'expanded' : ''}`}
                  >
                    <button
                      type="button"
                      className={`ref-catalog-section-btn ${isCurrentSection ? 'active' : ''}`}
                      onClick={() => {
                        if (onSelectSection && sec.id !== section.id) {
                          onSelectSection(sec);
                        }
                      }}
                    >
                      <span className="ref-catalog-sec-title">
                        <span>{sec.icon}</span>
                        <span>{sec.title}</span>
                      </span>
                      <span className="ref-catalog-sec-count">{sec.entries.length}</span>
                    </button>

                    {isCurrentSection && (
                      <ul className="ref-entry-list">
                        {sec.entries.map((entry) => (
                          <li
                            key={entry.id}
                            className={`ref-entry-item ${
                              selectedEntry.id === entry.id ? 'active' : ''
                            }`}
                            onClick={() => setSelectedEntryId(entry.id)}
                          >
                            <span className="ref-entry-title">{entry.title}</span>
                            <span className="ref-entry-subtitle">{entry.subtitle}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Right content panel */}
          <div className="ref-content">
            <div className="ref-entry-header">
              <h2 className="ref-entry-name">{selectedEntry.title}</h2>
              <p className="ref-entry-subtitle-large">{selectedEntry.subtitle}</p>
              <code className="ref-syntax-badge">{selectedEntry.syntax}</code>
            </div>

            {/* Tabs */}
            <div className="modal-tabs ref-tabs">
              <button
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                {t.tabStrategy}
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
                  className={`tab-btn ${activeTab === 'diagram' ? 'active' : ''}`}
                  onClick={() => setActiveTab('diagram')}
                >
                  {t.tabDiagram}
                </button>
              )}
            </div>

            <div className="ref-tab-content">
              {activeTab === 'overview' && (
                <div className="tab-pane fade-in">
                  <div className="ref-block">
                    <h3>{selectedEntry.title}</h3>
                    <p>{selectedEntry.description}</p>
                  </div>

                  <div className="ref-block highlight-block">
                    <h3>{t.whenToUseHeader}</h3>
                    <p>{selectedEntry.when_to_use}</p>
                  </div>

                  {selectedEntry.edge_cases && selectedEntry.edge_cases.length > 0 && (
                    <div className="ref-block warning-block">
                      <h3>{t.edgeCasesHeader}</h3>
                      <ul className="ref-edge-cases">
                        {selectedEntry.edge_cases.map((ec, i) => (
                          <li key={i}>{ec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedEntry.tags && (
                    <div className="ref-tags">
                      {selectedEntry.tags.map((tag) => (
                        <span key={tag} className="ref-tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'code' && hasCode && (
                <div className="tab-pane fade-in">
                  <CodeBlock code={selectedEntry.codigo_pyspark} />

                  {selectedEntry.salida_consola && (
                    <div style={{ marginTop: '24px' }}>
                      <h3
                        style={{
                          color: '#94a3b8',
                          fontSize: '0.85rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          marginBottom: '12px',
                        }}
                      >
                        {t.consoleExecutionOutputHeader}
                      </h3>
                      <pre className="terminal-output">
                        <code>{selectedEntry.salida_consola}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'diagram' && hasDiagram && (
                <div className="tab-pane fade-in">
                  <MermaidChart chart={selectedEntry.diagrama_mermaid!} id={selectedEntry.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
