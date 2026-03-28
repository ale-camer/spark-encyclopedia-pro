import React, { useState, useEffect } from 'react';
import type { SparkNode, ReferenceSection } from '../models/types';
import { SearchBar } from './SearchBar';

export interface PipelineStep {
  phaseId: string;
  label: string;
  description: string;
  visibleNodeIds: string[];
}

interface NarrativePanelProps {
  steps: PipelineStep[];
  currentStep: number;
  phaseNode: SparkNode | null;
  childNodes: SparkNode[];
  onNext: () => void;
  onPrev: () => void;
  onGoToStep: (index: number) => void;
  allNodes: SparkNode[];
  refSections: ReferenceSection[];
  onSearchResultClick: (nodeId: string) => void;
  onSearchReferenceClick: (section: ReferenceSection, entryId: string) => void;
}

export const NarrativePanel: React.FC<NarrativePanelProps> = ({
  steps,
  currentStep,
  phaseNode,
  childNodes,
  onNext,
  onPrev,
  onGoToStep,
  allNodes,
  refSections,
  onSearchResultClick,
  onSearchReferenceClick,
}) => {
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const step = steps[currentStep];

  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isLightMode]);

  return (
    <div className="narrative-panel">

      {/* Header & Search */}
      <div className="top-navigation" style={{ padding: '24px 24px 12px 24px', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/f/f3/Apache_Spark_logo.svg" 
            alt="Apache Spark" 
            style={{ height: '30px', filter: isLightMode ? 'none' : 'brightness(0) invert(1) opacity(0.9)', transition: 'filter 0.3s' }} 
          />
          <button 
            onClick={() => setIsLightMode(!isLightMode)}
            style={{ 
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', 
              color: 'var(--text-main)', borderRadius: '6px', padding: '6px 12px', 
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', transition: 'all 0.3s'
            }}
          >
            {isLightMode ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
        <div style={{ width: '100%', margin: '0 auto' }}>
          <SearchBar
            nodes={allNodes}
            refSections={refSections}
            onResultClick={onSearchResultClick}
            onReferenceClick={onSearchReferenceClick}
            placeholder="Search node or reference (e.g. lead)..."
            emptyText="No results found."
          />
        </div>
      </div>

      {/* Vertical stepper */}
      <nav className="stepper">
        {steps.map((s, i) => (
          <button
            key={s.phaseId}
            className={`step-btn ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'done' : ''}`}
            onClick={() => onGoToStep(i)}
          >
            <span className="step-number">{i + 1}</span>
            <span className="step-label">{s.label}</span>
          </button>
        ))}
      </nav>

      {/* Step content */}
      <div className="narrative-content">
        <div className="phase-badge">{phaseNode?.tipo?.toUpperCase() ?? 'INTRO'}</div>
        <h2 className="narrative-title">{step.label}</h2>
        <p className="narrative-description">{step.description}</p>

        {phaseNode?.pregunta_guia && (
          <div className="narrative-card question">
            <div className="card-label">Guiding Question</div>
            <p>{phaseNode.pregunta_guia}</p>
          </div>
        )}

        {childNodes.length > 0 && (
          <div className="narrative-card items">
            <div className="card-label">Sub-Decisions / Concepts</div>
            <ul>
              {childNodes.map(n => (
                <li key={n.id}>
                  <strong>{n.nombre}</strong>{' '}
                  <span style={{ opacity: 0.6, fontSize: '0.85em' }}>({n.tipo})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="narrative-nav">
        <button className="nav-btn" onClick={onPrev} disabled={isFirst}>← Previous</button>
        <div className="step-counter">Step {currentStep + 1} / {steps.length}</div>
        <button className="nav-btn next" onClick={onNext} disabled={isLast}>Next →</button>
      </div>
    </div>
  );
};
