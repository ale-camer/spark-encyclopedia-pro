import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';

export const CanvasLegend: React.FC = () => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return false;
    }
    return true;
  });

  return (
    <div className={`canvas-legend ${isOpen ? 'open' : 'collapsed'}`}>
      <button
        type="button"
        className="canvas-legend-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{t.legendTitle}</span>
        <span className="legend-chevron">{isOpen ? '▾' : '▴'}</span>
      </button>

      {isOpen && (
        <div className="canvas-legend-body fade-in">
          <div className="legend-group">
            <div className="legend-group-title">{t.nodeTypesHeader}</div>
            <div className="legend-items-grid">
              <span className="legend-item">
                <span className="legend-dot phase" /> {t.nodeTypes.phase}
              </span>
              <span className="legend-item">
                <span className="legend-dot decision" /> {t.nodeTypes.decision}
              </span>
              <span className="legend-item">
                <span className="legend-dot problem" /> {t.nodeTypes.problem}
              </span>
              <span className="legend-item">
                <span className="legend-dot concept" /> {t.nodeTypes.concept}
              </span>
              <span className="legend-item">
                <span className="legend-dot optimization" /> {t.nodeTypes.optimization}
              </span>
            </div>
          </div>

          <div className="legend-group">
            <div className="legend-group-title">{t.hierarchyHeader}</div>
            <div className="legend-row">
              <span className="legend-line solid" />
              <span>{t.parentChildEdge} (L1 → L4)</span>
            </div>
            <div className="legend-row">
              <span className="legend-line dashed" />
              <span>{t.crossPhaseEdge}</span>
            </div>
          </div>

          <div className="legend-group">
            <div className="legend-group-title">{t.edgesBadgesHeader}</div>
            <div className="legend-badges-row">
              <span>{t.tabCode}</span>
              <span>{t.tabDiagram}</span>
              <span>📚</span>
              <span>🔗</span>
              <span>✓ {t.visitedNodeLabel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
