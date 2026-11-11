import React, { useEffect, useState, useCallback } from 'react';
import { useI18n } from '../context/I18nContext';

interface TourStep {
  selector: string;
  title: string;
  description: string;
  placement: 'right' | 'bottom' | 'left' | 'center';
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onEnsureMenuOpen: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onComplete,
  onEnsureMenuOpen,
}) => {
  const { t, currentLanguage, openLanguageModal, steps } = useI18n();
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  const tourSteps: TourStep[] = [
    {
      selector: '.top-navigation',
      title: `👋 ${t.helpModalTitle}`,
      description: t.helpModalSubtitle,
      placement: 'right',
    },
    {
      selector: '.stepper-wrapper',
      title: `🧭 ${t.phaseStepperTitle}`,
      description: steps[0]?.description || '',
      placement: 'right',
    },
    {
      selector: '.canvas-container',
      title: `🕸️ ${t.crossPhaseSectionTitle}`,
      description: `${t.guidingQuestionHeader} · ${t.tabCode} · ${t.tabDiagram} · ${t.encyclopediaHeader}`,
      placement: 'center',
    },
    {
      selector: '.header-quick-actions',
      title: `${t.encyclopediaBtn}`,
      description: t.searchPlaceholder,
      placement: 'right',
    },
    {
      selector: '.canvas-toolbar',
      title: `🛠️ ${t.fullMapBtn} & ${t.legendTitle}`,
      description: `${t.tradeOffLinksOn} · ${t.helpBtnTitle}`,
      placement: 'bottom',
    },
  ];

  const currentStep = tourSteps[stepIndex] || tourSteps[0];

  const updateRect = useCallback(() => {
    if (!isOpen) return;
    const el = document.querySelector(currentStep.selector);
    if (!el || currentStep.placement === 'center') {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    const pad = 6;
    setRect({
      top: Math.max(4, r.top - pad),
      left: Math.max(4, r.left - pad),
      width: r.width + pad * 2,
      height: r.height + pad * 2,
    });
  }, [isOpen, currentStep.selector, currentStep.placement]);

  useEffect(() => {
    if (!isOpen) return;
    setStepIndex(0);
    onEnsureMenuOpen();
  }, [isOpen, onEnsureMenuOpen]);

  useEffect(() => {
    if (!isOpen) return;
    onEnsureMenuOpen();
    const timer = window.setTimeout(updateRect, 50);
    window.addEventListener('resize', updateRect);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
    };
  }, [isOpen, stepIndex, updateRect, onEnsureMenuOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onComplete();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (stepIndex < tourSteps.length - 1) {
          setStepIndex((prev) => prev + 1);
        } else {
          onComplete();
        }
      } else if (e.key === 'ArrowLeft' && stepIndex > 0) {
        setStepIndex((prev) => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, stepIndex, onComplete, tourSteps.length]);

  if (!isOpen) return null;

  const getCardStyle = (): React.CSSProperties => {
    if (!rect || window.innerWidth < 768) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    if (currentStep.placement === 'right') {
      return {
        top: `${Math.min(window.innerHeight - 280, Math.max(20, rect.top))}px`,
        left: `${Math.min(window.innerWidth - 380, rect.left + rect.width + 18)}px`,
      };
    }

    if (currentStep.placement === 'bottom') {
      return {
        top: `${Math.min(window.innerHeight - 280, rect.top + rect.height + 16)}px`,
        right: '20px',
      };
    }

    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  };

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true" aria-label="Welcome Tour">
      {rect ? (
        <div
          className="tour-spotlight"
          style={{
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
          }}
        />
      ) : (
        <div className="tour-backdrop-full" />
      )}

      <div className="tour-card fade-in" style={getCardStyle()}>
        <div className="tour-card-header">
          <span className="tour-step-badge">
            {t.tourStepLabel} {stepIndex + 1} / {tourSteps.length}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="lang-trigger-btn"
              onClick={openLanguageModal}
              title={t.selectLanguageTitle}
            >
              <span>{currentLanguage.flag}</span>
              <span>{currentLanguage.code.toUpperCase()}</span>
              <span>▾</span>
            </button>
            <button type="button" className="tour-skip-btn" onClick={onComplete}>
              {t.tourSkipBtn} ×
            </button>
          </div>
        </div>

        <h3 className="tour-card-title">{currentStep.title}</h3>
        <p className="tour-card-desc">{currentStep.description}</p>

        <div className="tour-card-footer">
          <div className="tour-dots">
            {tourSteps.map((_, idx) => (
              <span
                key={idx}
                className={`tour-dot ${idx === stepIndex ? 'active' : ''}`}
                onClick={() => setStepIndex(idx)}
              />
            ))}
          </div>

          <div className="tour-nav-btns">
            {stepIndex > 0 && (
              <button
                type="button"
                className="tour-btn secondary"
                onClick={() => setStepIndex((prev) => prev - 1)}
              >
                {t.tourBackBtn}
              </button>
            )}
            <button
              type="button"
              className="tour-btn primary"
              onClick={() => {
                if (stepIndex < tourSteps.length - 1) {
                  setStepIndex((prev) => prev + 1);
                } else {
                  onComplete();
                }
              }}
            >
              {stepIndex < tourSteps.length - 1 ? t.tourNextBtn : t.tourFinishBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
