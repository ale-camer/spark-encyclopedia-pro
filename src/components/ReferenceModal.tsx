import React, { useEffect, useState } from 'react';
import type { ReferenceEntry, ReferenceSection } from '../models/types';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';

SyntaxHighlighter.registerLanguage('python', python);

const MermaidChart = ({ chart, id }: { chart: string; id: string }) => {
  useEffect(() => {
    mermaid.initialize({ startOnLoad: true, theme: 'dark', securityLevel: 'loose' });
    mermaid.contentLoaded();
  }, [chart]);
  return (
    <div className="mermaid-container">
      <div className="mermaid" key={id}>{chart}</div>
    </div>
  );
};

interface ReferenceModalProps {
  section: ReferenceSection | null;
  initialEntryId?: string | null;
  onClose: () => void;
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({ section, initialEntryId, onClose }) => {
  const [selectedEntry, setSelectedEntry] = useState<ReferenceEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'diagram'>('overview');

  useEffect(() => {
    if (!section) return;
    const entry = initialEntryId
      ? section.entries.find(e => e.id === initialEntryId) ?? section.entries[0]
      : section.entries[0];
    setSelectedEntry(entry);
    setActiveTab('overview');
  }, [section, initialEntryId]);

  useEffect(() => {
    setActiveTab('overview');
  }, [selectedEntry?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (section) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [section, onClose]);

  if (!section || !selectedEntry) return null;

  const hasCode = !!selectedEntry.codigo_pyspark;
  const hasDiagram = !!selectedEntry.diagrama_mermaid;

  return (
    <div className="modal-overlay ref-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ref-modal">
        {/* Header */}
        <div className="ref-modal-header">
          <div className="ref-modal-title-area">
            <span className="ref-section-badge">{section.icon} {section.title}</span>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="ref-modal-body">
          {/* Left sidebar: entry list */}
          <aside className="ref-sidebar">
            <div className="ref-sidebar-title">Topics ({section.entries.length})</div>
            <ul className="ref-entry-list">
              {section.entries.map(entry => (
                <li
                  key={entry.id}
                  className={`ref-entry-item ${selectedEntry.id === entry.id ? 'active' : ''}`}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <span className="ref-entry-title">{entry.title}</span>
                  <span className="ref-entry-subtitle">{entry.subtitle}</span>
                </li>
              ))}
            </ul>
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
              <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
              {hasCode && <button className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`} onClick={() => setActiveTab('code')}>PySpark Code</button>}
              {hasDiagram && <button className={`tab-btn ${activeTab === 'diagram' ? 'active' : ''}`} onClick={() => setActiveTab('diagram')}>Diagram</button>}
            </div>

            <div className="ref-tab-content">
              {activeTab === 'overview' && (
                <div className="tab-pane fade-in">
                  <div className="ref-block">
                    <h3>Description</h3>
                    <p>{selectedEntry.description}</p>
                  </div>

                  <div className="ref-block highlight-block">
                    <h3>⚡ When to Use</h3>
                    <p>{selectedEntry.when_to_use}</p>
                  </div>

                  {selectedEntry.edge_cases && selectedEntry.edge_cases.length > 0 && (
                    <div className="ref-block warning-block">
                      <h3>⚠️ Edge Cases &amp; Gotchas</h3>
                      <ul className="ref-edge-cases">
                        {selectedEntry.edge_cases.map((ec, i) => (
                          <li key={i}>{ec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedEntry.tags && (
                    <div className="ref-tags">
                      {selectedEntry.tags.map(tag => (
                        <span key={tag} className="ref-tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'code' && hasCode && (
                <div className="tab-pane fade-in">
                  <SyntaxHighlighter language="python" style={vscDarkPlus} showLineNumbers className="code-block">
                    {selectedEntry.codigo_pyspark}
                  </SyntaxHighlighter>

                  {selectedEntry.salida_consola && (
                    <div style={{ marginTop: '24px' }}>
                      <h3 style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Output</h3>
                      <pre className="terminal-output"><code>{selectedEntry.salida_consola}</code></pre>
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
