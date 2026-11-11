import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import type { Edge, Node, ReactFlowInstance } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { getLayoutedElements } from '../core/layoutHelper';
import { SparkNodeUI } from './SparkNodeUI';
import { NarrativePanel } from './NarrativePanel';
import { NodeModal } from './NodeModal';
import { ReferenceModal } from './ReferenceModal';
import { CanvasLegend } from './CanvasLegend';
import { HelpModal } from './HelpModal';
import { OnboardingTour } from './OnboardingTour';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { BASE_STEPS } from '../data/steps.structure';

import { EDGE_RELATION_COLORS } from '../models/types';
import type { SparkPipelineGraph, ReferenceSection, TransversalLink } from '../models/types';

const nodeTypes = { sparkNode: SparkNodeUI };

export const SparkFlow: React.FC = () => {
  const { isLightMode } = useTheme();
  const {
    lang,
    currentLanguage,
    t,
    graphData,
    referenceData,
    steps,
    openLanguageModal,
  } = useI18n();

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const userMovedCanvasRef = useRef(false);
  const isPopStateRef = useRef(false);

  const [currentStep, setCurrentStep] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const phaseParam = params.get('phase');
    if (phaseParam) {
      const idx = BASE_STEPS.findIndex((s) => s.phaseId === phaseParam);
      if (idx !== -1) return idx;
    }
    try {
      const savedPhase = window.localStorage.getItem('spark_last_phase');
      if (savedPhase) {
        const idx = BASE_STEPS.findIndex((s) => s.phaseId === savedPhase);
        if (idx !== -1) return idx;
      }
    } catch {
      // ignore storage errors
    }
    return 0;
  });

  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isFullMapView, setIsFullMapView] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'full';
  });
  const [showTransversalEdges, setShowTransversalEdges] = useState(true);
  const [selectedEdge, setSelectedEdge] = useState<TransversalLink | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const nodeParam = params.get('node');
    return nodeParam && graphData.nodos.some((n) => n.id === nodeParam) ? nodeParam : null;
  });
  const [visitedNodeIds, setVisitedNodeIds] = useState<Set<string>>(() => {
    try {
      const raw = window.localStorage.getItem('spark_visited_nodes');
      return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Reference Modal state (store section ID so it automatically reflects language changes)
  const [openRefSectionId, setOpenRefSectionId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    return refParam && referenceData.sections.some((s) => s.id === refParam) ? refParam : null;
  });
  const openRefSection: ReferenceSection | null = openRefSectionId
    ? referenceData.sections.find((s) => s.id === openRefSectionId) ?? null
    : null;

  const [initialEntryId, setInitialEntryId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('entry');
  });
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(() => {
    try {
      return !window.localStorage.getItem('spark_onboarding_completed');
    } catch {
      return false;
    }
  });

  const handleCompleteTour = useCallback(() => {
    setIsTourOpen(false);
    try {
      window.localStorage.setItem('spark_onboarding_completed', 'true');
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleEnsureMenuOpen = useCallback(() => {
    setIsPanelCollapsed(false);
  }, []);

  const handleResetVisited = useCallback(() => {
    setVisitedNodeIds(new Set());
    try {
      window.localStorage.removeItem('spark_visited_nodes');
    } catch {
      // ignore storage errors
    }
  }, []);

  const triggerAutoFitView = useCallback(
    (force = false) => {
      if (!rfInstance) return;
      if (force) {
        userMovedCanvasRef.current = false;
      }
      if (userMovedCanvasRef.current) return;
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          if (!userMovedCanvasRef.current) {
            rfInstance.fitView({ padding: 0.12, duration: 320 });
          }
        }, 40);
        window.setTimeout(() => {
          if (!userMovedCanvasRef.current) {
            rfInstance.fitView({ padding: 0.12, duration: 280 });
          }
        }, 180);
      });
    },
    [rfInstance]
  );

  // Listen to browser Back / Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      isPopStateRef.current = true;
      const params = new URLSearchParams(window.location.search);
      const phaseParam = params.get('phase');
      if (phaseParam) {
        const idx = BASE_STEPS.findIndex((s) => s.phaseId === phaseParam);
        if (idx !== -1) setCurrentStep(idx);
      } else {
        setCurrentStep(0);
      }
      setIsFullMapView(params.get('view') === 'full');
      const nodeParam = params.get('node');
      setSelectedNodeId(
        nodeParam && graphData.nodos.some((n) => n.id === nodeParam) ? nodeParam : null
      );
      const refParam = params.get('ref');
      setOpenRefSectionId(
        refParam && referenceData.sections.some((s) => s.id === refParam) ? refParam : null
      );
      setInitialEntryId(params.get('entry'));
      userMovedCanvasRef.current = false;
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [graphData.nodos, referenceData.sections]);

  // Sync navigation state to URL and localStorage
  useEffect(() => {
    const step = steps[currentStep];
    try {
      window.localStorage.setItem('spark_last_phase', step.phaseId);
    } catch {
      // ignore storage errors
    }

    if (isPopStateRef.current) {
      isPopStateRef.current = false;
      return;
    }

    const params = new URLSearchParams(window.location.search);
    params.set('phase', step.phaseId);
    if (lang !== 'en') {
      params.set('lang', lang);
    } else {
      params.delete('lang');
    }
    if (isFullMapView) {
      params.set('view', 'full');
    } else {
      params.delete('view');
    }
    if (selectedNodeId) {
      params.set('node', selectedNodeId);
    } else {
      params.delete('node');
    }
    if (openRefSectionId) {
      params.set('ref', openRefSectionId);
      if (initialEntryId) {
        params.set('entry', initialEntryId);
      } else {
        params.delete('entry');
      }
    } else {
      params.delete('ref');
      params.delete('entry');
    }

    const nextSearch = `?${params.toString()}`;
    if (window.location.search !== nextSearch) {
      window.history.pushState(null, '', nextSearch);
    }
  }, [currentStep, lang, isFullMapView, selectedNodeId, openRefSectionId, initialEntryId, steps]);

  const handleSelectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    if (nodeId) {
      setVisitedNodeIds((prev) => {
        if (prev.has(nodeId)) return prev;
        const next = new Set(prev);
        next.add(nodeId);
        try {
          window.localStorage.setItem('spark_visited_nodes', JSON.stringify(Array.from(next)));
        } catch {
          // ignore storage errors
        }
        return next;
      });
    }
  }, []);

  const handleNavigateToNode = useCallback(
    (nodeId: string) => {
      const step = steps[currentStep];
      if (!isFullMapView && !step.visibleNodeIds.includes(nodeId)) {
        const targetStepIndex = steps.findIndex(
          (s, idx) => idx > 0 && s.visibleNodeIds.includes(nodeId)
        );
        if (targetStepIndex !== -1) {
          userMovedCanvasRef.current = false;
          setCurrentStep(targetStepIndex);
        }
      }
      handleSelectNode(nodeId);
    },
    [currentStep, isFullMapView, handleSelectNode, steps]
  );

  // Auto-reset manual move flag & center diagram when step or full-map view changes
  useEffect(() => {
    triggerAutoFitView(true);
  }, [currentStep, isFullMapView, triggerAutoFitView]);

  // Auto-center diagram on menu collapse/expand or window resize ONLY if user hasn't manually panned/zoomed
  useEffect(() => {
    triggerAutoFitView(false);
  }, [isPanelCollapsed, showTransversalEdges, triggerAutoFitView]);

  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      triggerAutoFitView(false);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerAutoFitView]);

  useEffect(() => {
    const step = steps[currentStep];
    const showAll = isFullMapView || step.phaseId === 'overview';
    const visibleIds = showAll ? graphData.nodos.map((n) => n.id) : step.visibleNodeIds;
    const currentNodes = graphData.nodos.filter((n) => visibleIds.includes(n.id));
    const currentEdges = graphData.enlaces_transversales.filter(
      (e) => visibleIds.includes(e.origen) && visibleIds.includes(e.destino)
    );
    const stepGraphData: SparkPipelineGraph = {
      ...graphData,
      nodos: currentNodes,
      enlaces_transversales: currentEdges,
    };
    const { nodes: ln, edges: le } = getLayoutedElements(stepGraphData, {
      allTransversalLinks: graphData.enlaces_transversales,
      visitedNodeIds,
      selectedNodeId,
      activePhaseId: showAll ? null : step.phaseId,
      showTransversalEdges,
      edgeRelationLabels: t.edgeRelations,
    });
    setNodes(ln);
    setEdges(le);
  }, [
    currentStep,
    isFullMapView,
    showTransversalEdges,
    visitedNodeIds,
    selectedNodeId,
    graphData,
    steps,
    t.edgeRelations,
    setNodes,
    setEdges,
  ]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedEdge(null);
      handleSelectNode(node.id);
    },
    [handleSelectNode]
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      if (edge.data?.isTransversal) {
        const link = graphData.enlaces_transversales.find((l) => l.id === edge.data?.id);
        if (link) {
          setSelectedEdge(link);
        }
      }
    },
    [graphData.enlaces_transversales]
  );

  const onNext = useCallback(() => {
    setIsFullMapView(false);
    setSelectedEdge(null);
    setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
  }, [steps.length]);
  const onPrev = useCallback(() => {
    setIsFullMapView(false);
    setSelectedEdge(null);
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);
  const handleGoToStep = (index: number) => {
    setIsFullMapView(false);
    setSelectedEdge(null);
    setCurrentStep(index);
  };

  // Global keyboard shortcuts: ArrowLeft / ArrowRight for steps, '/' or Ctrl+K when collapsed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (
        isPanelCollapsed &&
        (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') ||
          (!isInputFocused && e.key === '/'))
      ) {
        setIsPanelCollapsed(false);
        return;
      }

      if (!isInputFocused && e.key === '?') {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      if (isInputFocused || selectedNodeId || openRefSection || isHelpOpen) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelCollapsed, selectedNodeId, openRefSection, isHelpOpen, onNext, onPrev]);

  const currentStepDef = steps[currentStep];
  const phaseNode =
    currentStepDef.phaseId === 'overview'
      ? graphData.nodos.find((n) => n.id === 'root') || null
      : graphData.nodos.find((n) => n.id === currentStepDef.phaseId) || null;

  const childNodes = phaseNode
    ? graphData.nodos.filter((n) => (phaseNode.subdecisiones || []).includes(n.id))
    : [];

  const handleOpenReference = (sectionId: string) => {
    if (referenceData.sections.some((s) => s.id === sectionId)) {
      setOpenRefSectionId(sectionId);
      setInitialEntryId(null);
    }
  };

  const handleSearchReference = (section: ReferenceSection, entryId: string) => {
    setOpenRefSectionId(section.id);
    setInitialEntryId(entryId);
  };

  const activeEdgePopup = selectedEdge
    ? graphData.enlaces_transversales.find((l) => l.id === selectedEdge.id) || selectedEdge
    : null;

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="app-layout">
        <NarrativePanel
          steps={steps}
          currentStep={currentStep}
          phaseNode={phaseNode}
          childNodes={childNodes}
          visitedNodeIds={visitedNodeIds}
          isCollapsed={isPanelCollapsed}
          onToggleCollapse={() => setIsPanelCollapsed((prev) => !prev)}
          onNext={onNext}
          onPrev={onPrev}
          onGoToStep={handleGoToStep}
          allNodes={graphData.nodos}
          refSections={referenceData.sections}
          onSearchResultClick={handleNavigateToNode}
          onSearchReferenceClick={handleSearchReference}
          onOpenEncyclopedia={() => {
            setOpenRefSectionId(referenceData.sections[0].id);
            setInitialEntryId(null);
          }}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
        <div className="canvas-container" ref={canvasContainerRef}>
          {isPanelCollapsed && (
            <div className="collapsed-menu-dock fade-in">
              <button
                type="button"
                className="dock-expand-btn"
                onClick={() => setIsPanelCollapsed(false)}
                title={t.showMenuBtn}
              >
                <img
                  src="/spark-icon.svg"
                  alt="Spark"
                  style={{ width: '20px', height: '20px', borderRadius: '4px' }}
                />
                <span>▶ {t.showMenuBtn}</span>
              </button>
              <div className="dock-step-controls">
                <button
                  type="button"
                  className="dock-step-arrow"
                  onClick={onPrev}
                  disabled={currentStep === 0}
                  title={t.prevBtn}
                >
                  ‹
                </button>
                <span className="dock-step-label">
                  {t.phaseProgressLabel} {currentStep + 1}/{steps.length}:{' '}
                  <strong>{currentStepDef.label}</strong>
                </span>
                <button
                  type="button"
                  className="dock-step-arrow"
                  onClick={onNext}
                  disabled={currentStep === steps.length - 1}
                  title={t.nextPhaseBtn}
                >
                  ›
                </button>
              </div>
              <button
                type="button"
                className="dock-encyclopedia-btn"
                onClick={() => {
                  setOpenRefSectionId(referenceData.sections[0].id);
                  setInitialEntryId(null);
                }}
                title={t.encyclopediaHeader}
              >
                {t.encyclopediaHeader}
              </button>
              <button
                type="button"
                onClick={openLanguageModal}
                className="lang-trigger-btn"
                title={`${t.selectLanguageTitle} (${currentLanguage.nativeName})`}
              >
                <span aria-hidden="true">{currentLanguage.flag}</span>
                <span>{currentLanguage.code.toUpperCase()}</span>
                <span className="lang-caret" aria-hidden="true">▾</span>
              </button>
              <button
                type="button"
                className="help-trigger-btn"
                onClick={() => setIsHelpOpen(true)}
                title={t.helpBtnTitle}
              >
                ?
              </button>
            </div>
          )}

          <div className="canvas-toolbar">
            <button
              type="button"
              className={`canvas-tool-btn ${isFullMapView ? 'active' : ''}`}
              onClick={() => {
                setSelectedEdge(null);
                setIsFullMapView((prev) => !prev);
              }}
            >
              {isFullMapView ? t.phaseViewBtn : t.fullMapBtn}
            </button>
            <button
              type="button"
              className={`canvas-tool-btn ${showTransversalEdges ? 'active' : ''}`}
              onClick={() => {
                setSelectedEdge(null);
                setShowTransversalEdges((prev) => !prev);
              }}
            >
              {showTransversalEdges ? t.tradeOffLinksOn : t.tradeOffLinksOff}
            </button>
          </div>

          {activeEdgePopup && (
            <div
              className="edge-popover fade-in"
              style={{ borderLeftColor: EDGE_RELATION_COLORS[activeEdgePopup.tipo] }}
            >
              <div className="edge-popover-header">
                <span
                  className="transversal-type-pill"
                  style={{
                    backgroundColor: `${EDGE_RELATION_COLORS[activeEdgePopup.tipo]}22`,
                    color: EDGE_RELATION_COLORS[activeEdgePopup.tipo],
                    borderColor: `${EDGE_RELATION_COLORS[activeEdgePopup.tipo]}55`,
                  }}
                >
                  {t.edgeRelations[activeEdgePopup.tipo]}
                </span>
                <button
                  type="button"
                  className="edge-popover-close"
                  onClick={() => setSelectedEdge(null)}
                  aria-label={t.closeLabel}
                >
                  ×
                </button>
              </div>
              <div className="edge-popover-nodes">
                <button
                  type="button"
                  className="transversal-node-link"
                  onClick={() => handleNavigateToNode(activeEdgePopup.origen)}
                >
                  {graphData.nodos.find((n) => n.id === activeEdgePopup.origen)?.nombre ??
                    activeEdgePopup.origen}
                </button>
                <span className="edge-popover-arrow">→</span>
                <button
                  type="button"
                  className="transversal-node-link"
                  onClick={() => handleNavigateToNode(activeEdgePopup.destino)}
                >
                  {graphData.nodos.find((n) => n.id === activeEdgePopup.destino)?.nombre ??
                    activeEdgePopup.destino}
                </button>
              </div>
              <p className="edge-popover-desc">{activeEdgePopup.descripcion}</p>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onInit={setRfInstance}
            onMoveStart={(event) => {
              if (event) {
                userMovedCanvasRef.current = true;
              }
            }}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={() => setSelectedEdge(null)}
            minZoom={0.05}
            maxZoom={2.2}
            fitView
            fitViewOptions={{ padding: 0.12 }}
            nodesDraggable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              color={isLightMode ? '#94a3b8' : 'rgba(255, 255, 255, 0.22)'}
              gap={16}
              size={1.2}
            />
            <Controls className="dark-controls" showInteractive={false} />
          </ReactFlow>
          <CanvasLegend />
        </div>
      </div>
      <NodeModal
        nodeId={selectedNodeId}
        onClose={() => handleSelectNode(null)}
        graphData={graphData}
        refSections={referenceData.sections}
        onOpenReference={handleOpenReference}
        onSelectNode={handleNavigateToNode}
      />
      <ReferenceModal
        section={openRefSection}
        allSections={referenceData.sections}
        initialEntryId={initialEntryId}
        onSelectSection={(sec) => {
          setOpenRefSectionId(sec.id);
          setInitialEntryId(null);
        }}
        onClose={() => {
          setOpenRefSectionId(null);
          setInitialEntryId(null);
        }}
      />
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onSelectNode={handleNavigateToNode}
        visitedCount={visitedNodeIds.size}
        totalNodes={graphData.nodos.length}
        onResetVisited={handleResetVisited}
        onStartTour={() => setIsTourOpen(true)}
      />
      <OnboardingTour
        isOpen={isTourOpen}
        onComplete={handleCompleteTour}
        onEnsureMenuOpen={handleEnsureMenuOpen}
      />
    </div>
  );
};
