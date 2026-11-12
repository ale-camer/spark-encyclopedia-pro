import React, { useState } from 'react';
import type { SparkNode, ReferenceSection } from '../models/types';
import { SearchBar } from './SearchBar';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';

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
  visitedNodeIds: Set<string>;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNext: () => void;
  onPrev: () => void;
  onGoToStep: (index: number) => void;
  allNodes: SparkNode[];
  refSections: ReferenceSection[];
  onSearchResultClick: (nodeId: string) => void;
  onSearchReferenceClick: (section: ReferenceSection, entryId: string) => void;
  onOpenEncyclopedia: () => void;
  onOpenHelp: () => void;
}

export const NarrativePanel: React.FC<NarrativePanelProps> = ({
  steps,
  currentStep,
  phaseNode,
  childNodes,
  visitedNodeIds,
  isCollapsed,
  onToggleCollapse,
  onNext,
  onPrev,
  onGoToStep,
  allNodes,
  refSections,
  onSearchResultClick,
  onSearchReferenceClick,
  onOpenEncyclopedia,
  onOpenHelp,
}) => {
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const step = steps[currentStep];
  const { isLightMode, toggleTheme } = useTheme();
  const { currentLanguage, t, openLanguageModal } = useI18n();
  const [isStepperCompact, setIsStepperCompact] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= 768
  );
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);

  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    if (top > 28 && !isHeaderCompact) {
      setIsHeaderCompact(true);
      setIsStepperCompact(true);
    } else if (top <= 10 && isHeaderCompact) {
      setIsHeaderCompact(false);
    }
  };

  const totalTopics = refSections.reduce((acc, s) => acc + s.entries.length, 0);
  const visitedInStep = step.visibleNodeIds.filter((id) => visitedNodeIds.has(id)).length;

  if (isCollapsed) {
    return null;
  }

  return (
    <div className={`narrative-panel ${isHeaderCompact ? 'is-header-compact' : ''}`}>
      {/* Header & Search */}
      <div
        className="top-navigation"
        style={{
          padding: isHeaderCompact ? '10px 16px 8px 16px' : '20px 20px 12px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: isHeaderCompact ? '8px' : '14px',
          marginBottom: 0,
          transition: 'padding 0.22s ease, gap 0.22s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            gap: '6px',
          }}
        >
          <img
            src={isLightMode ? '/spark-logo.svg' : '/spark-logo-dark.svg'}
            alt="Apache Spark"
            style={{ height: '30px', transition: 'opacity 0.3s' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <button
              type="button"
              onClick={openLanguageModal}
              className="lang-trigger-btn"
              title={`${t.selectLanguageTitle} (${currentLanguage.nativeName})`}
              aria-label={t.selectLanguageTitle}
            >
              <span aria-hidden="true">{currentLanguage.flag}</span>
              <span>{currentLanguage.code.toUpperCase()}</span>
              <span className="lang-caret" aria-hidden="true">▾</span>
            </button>
            <button
              type="button"
              onClick={onOpenHelp}
              className="help-trigger-btn"
              title={t.helpBtnTitle}
              aria-label={t.helpBtnTitle}
            >
              ?
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={isLightMode ? t.themeLightTitle : t.themeDarkTitle}
            >
              {isLightMode ? '🌙' : '☀️'}
            </button>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="panel-collapse-btn"
              title={t.hideMenuTitle}
              aria-label={t.hideMenuTitle}
            >
              ◀
            </button>
          </div>
        </div>

        <div style={{ width: '100%' }}>
          <SearchBar
            nodes={allNodes}
            refSections={refSections}
            onResultClick={onSearchResultClick}
            onReferenceClick={onSearchReferenceClick}
            placeholder={t.searchPlaceholder}
            emptyText={t.noResultsFound}
          />
        </div>

        <div className="header-quick-actions">
          <button
            type="button"
            className="encyclopedia-launch-btn"
            onClick={onOpenEncyclopedia}
          >
            <span>{t.encyclopediaHeader}</span>
            <span className="encyclopedia-count-badge">
              {totalTopics} {t.topicsSuffix}
            </span>
          </button>
          <div
            className="visited-progress-pill"
            title={`${visitedNodeIds.size} / ${t.nodesVisitedSuffix}`}
          >
            ✓ {visitedNodeIds.size}/{allNodes.length}
          </div>
        </div>
      </div>

      {/* Smart Collapsible Stepper */}
      <div className="stepper-wrapper">
        <div className="stepper-header">
          <span className="stepper-header-title">
            {t.phaseStepperTitle} ({currentStep + 1}/{steps.length})
          </span>
          <button
            type="button"
            className="stepper-compact-toggle"
            onClick={() => setIsStepperCompact((prev) => !prev)}
          >
            {isStepperCompact ? t.expandBtn : t.compactBtn}
          </button>
        </div>

        {isStepperCompact ? (
          <nav className="stepper-pills" aria-label="Architecture phases compact">
            {steps.map((s, i) => (
              <button
                key={s.phaseId}
                type="button"
                className={`step-pill ${i === currentStep ? 'active' : ''} ${
                  i < currentStep ? 'done' : ''
                }`}
                onClick={() => onGoToStep(i)}
                title={`${i + 1}. ${s.label}`}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        ) : (
          <nav className="stepper" aria-label="Architecture phases">
            {steps.map((s, i) => {
              const stepVisitedCount = s.visibleNodeIds.filter((id) =>
                visitedNodeIds.has(id)
              ).length;
              return (
                <button
                  key={s.phaseId}
                  type="button"
                  className={`step-btn ${i === currentStep ? 'active' : ''} ${
                    i < currentStep ? 'done' : ''
                  }`}
                  onClick={() => onGoToStep(i)}
                >
                  <span className="step-number">{i + 1}</span>
                  <span className="step-label">{s.label}</span>
                  <span
                    className="step-node-progress"
                    title={`${stepVisitedCount} / ${s.visibleNodeIds.length}`}
                  >
                    {stepVisitedCount}/{s.visibleNodeIds.length}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Step content */}
      <div className="narrative-content" onScroll={handleContentScroll}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div className="phase-badge">
            {phaseNode ? t.nodeTypes[phaseNode.tipo] : 'OVERVIEW'}
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            ✓ {visitedInStep}/{step.visibleNodeIds.length}
          </span>
        </div>

        <h2 className="narrative-title">{step.label}</h2>
        <p className="narrative-description">{step.description}</p>

        {phaseNode?.pregunta_guia && (
          <div
            className="narrative-card question interactive-card"
            onClick={() => onSearchResultClick(phaseNode.id)}
            title={t.clickToInspectHint}
          >
            <div
              className="card-label"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{t.guidingQuestionHeader}</span>
              <span className="card-action-hint">{t.clickToInspectHint}</span>
            </div>
            <p>{phaseNode.pregunta_guia}</p>
          </div>
        )}

        {childNodes.length > 0 && (
          <div className="narrative-card items">
            <div className="card-label">
              {t.keySubDecisionsTitle} ({childNodes.length})
            </div>
            <div className="interactive-child-list">
              {childNodes.map((n) => {
                const isVisited = visitedNodeIds.has(n.id);
                const hasCode = Boolean(n.codigo_pyspark || n.salida_consola);
                const hasDiagram = Boolean(n.diagrama_mermaid);
                const hasRef = Boolean(n.reference_section_id);
                return (
                  <button
                    key={n.id}
                    type="button"
                    className={`interactive-child-btn ${n.tipo}`}
                    onClick={() => onSearchResultClick(n.id)}
                  >
                    <div className="interactive-child-main">
                      <span className="interactive-child-name">
                        {isVisited && (
                          <span className="child-visited-dot" title="Visited">
                            ✓{' '}
                          </span>
                        )}
                        {n.nombre}
                      </span>
                      <span className={`child-type-tag ${n.tipo}`}>
                        {t.nodeTypes[n.tipo]}
                      </span>
                    </div>
                    <div className="interactive-child-meta">
                      {hasCode && <span title="PySpark Code">💻</span>}
                      {hasDiagram && <span title="Diagram">📊</span>}
                      {hasRef && <span title="Encyclopedia Deep Dive">📚</span>}
                      <span className="child-open-arrow">→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="narrative-nav">
        <button className="nav-btn" onClick={onPrev} disabled={isFirst}>
          {t.prevBtn}
        </button>
        <div className="step-counter">
          {t.phaseProgressLabel} {currentStep + 1} / {steps.length}
        </div>
        <button className="nav-btn next" onClick={onNext} disabled={isLast}>
          {isLast ? t.completeBtn : t.nextPhaseBtn}
        </button>
      </div>
    </div>
  );
};
