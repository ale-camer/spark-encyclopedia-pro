import React, { useEffect, useState } from 'react';
import type { SparkPipelineGraph } from '../models/types';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';

SyntaxHighlighter.registerLanguage('python', python);

interface NodeModalProps {
  nodeId: string | null;
  graphData: SparkPipelineGraph;
  onClose: () => void;
  onOpenReference?: (sectionId: string) => void;
}

const MermaidChart = ({ chart }: { chart: string }) => {
  useEffect(() => {
    mermaid.initialize({ startOnLoad: true, theme: 'dark', securityLevel: 'loose' });
    mermaid.contentLoaded();
  }, [chart]);
  return (
    <div className="mermaid-container">
      <div className="mermaid">{chart}</div>
    </div>
  );
};

export const NodeModal: React.FC<NodeModalProps> = ({ nodeId, graphData, onClose, onOpenReference }) => {
  const [activeTab, setActiveTab] = useState<'strategy' | 'code' | 'architecture'>('strategy');

  useEffect(() => { setActiveTab('strategy'); }, [nodeId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (nodeId) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodeId, onClose]);

  if (!nodeId) return null;
  const node = graphData.nodos.find(n => n.id === nodeId);
  if (!node) return null;

  const getNames = (ids: string[]) => ids.map(id => graphData.nodos.find(n => n.id === id)?.nombre ?? id);
  const subs = getNames(node.subdecisiones || []);
  const deps = getNames(node.dependencias || []);
  const hasCode = !!node.codigo_pyspark || !!node.salida_consola;
  const hasDiagram = !!node.diagrama_mermaid;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal-content ${node.tipo}`}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>

        <div className="modal-header">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="modal-badge">TYPE {node.tipo} · L{node.nivel}</span>
            <h2>{node.nombre}</h2>
            {node.reference_section_id && onOpenReference && (
              <button 
                className="deep-dive-btn"
                onClick={() => onOpenReference(node.reference_section_id!)}
              >
                📚 Deep Dive into Joins Reference →
              </button>
            )}
          </div>
          <div className="modal-tabs">
            <button className={`tab-btn ${activeTab === 'strategy' ? 'active' : ''}`} onClick={() => setActiveTab('strategy')}>Strategy</button>
            {hasCode && <button className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`} onClick={() => setActiveTab('code')}>PySpark Code</button>}
            {hasDiagram && <button className={`tab-btn ${activeTab === 'architecture' ? 'active' : ''}`} onClick={() => setActiveTab('architecture')}>Under the Hood</button>}
          </div>
        </div>

        <div className="modal-body">
          {activeTab === 'strategy' && (
            <div className="tab-pane fade-in">
              {node.pregunta_guia && (
                <div className="modal-section guide-question">
                  <h3>Guiding Question</h3>
                  <p>{node.pregunta_guia}</p>
                </div>
              )}
              {subs.length > 0 && (
                <div className="modal-section child-nodes">
                  <h3>Sub-Decisions or Child Concepts</h3>
                  <ul className="modal-list">{subs.map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
              )}
              {deps.length > 0 && (
                <div className="modal-section dependencies">
                  <h3>Previous Dependencies</h3>
                  <p className="modal-context">These decisions must be evaluated before this one.</p>
                  <ul className="modal-list warning">{deps.map((d, i) => <li key={i}>{d}</li>)}</ul>
                </div>
              )}
            </div>
          )}
          {activeTab === 'code' && (
            <div className="tab-pane fade-in code-pane">
              {node.codigo_pyspark && (
                <div className="modal-section">
                  <h3>PySpark Implementation</h3>
                  <SyntaxHighlighter language="python" style={vscDarkPlus} className="code-block" showLineNumbers>
                    {node.codigo_pyspark}
                  </SyntaxHighlighter>
                </div>
              )}
              {node.salida_consola && (
                <div className="modal-section terminal-section">
                  <h3>Simulated Output (Console / Explain)</h3>
                  <pre className="terminal-output"><code>{node.salida_consola}</code></pre>
                </div>
              )}
            </div>
          )}
          {activeTab === 'architecture' && node.diagrama_mermaid && (
            <div className="tab-pane fade-in">
              <div className="modal-section">
                <h3>Memory / Object Architecture</h3>
                <p className="modal-context">Visual representation of internal data flow at runtime.</p>
                <MermaidChart chart={node.diagrama_mermaid} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
