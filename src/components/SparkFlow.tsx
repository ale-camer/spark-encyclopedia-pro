import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { getLayoutedElements } from '../core/layoutHelper';
import { SparkNodeUI } from './SparkNodeUI';
import { NarrativePanel } from './NarrativePanel';
import type { PipelineStep } from './NarrativePanel';
import { NodeModal } from './NodeModal';
import { ReferenceModal } from './ReferenceModal';

import graphDataRaw from '../../spark_pipeline_architecture.json';
import referenceDataRaw from '../../spark_reference.json';
import type { SparkPipelineGraph, ReferenceLibrary, ReferenceSection } from '../models/types';

const graphData = graphDataRaw as unknown as SparkPipelineGraph;
const referenceData = referenceDataRaw as unknown as ReferenceLibrary;

const nodeTypes = { sparkNode: SparkNodeUI };

const STEPS: PipelineStep[] = [
  {
    phaseId: 'overview',
    label: 'The Complete Journey',
    description: 'A Spark pipeline goes through 6 design phases. Each phase depends on the previous ones. Traverse them from left to right to understand the full reasoning.',
    visibleNodeIds: ['root', 'infraestructura_cluster', 'contexto', 'datos', 'transformaciones', 'ejecucion', 'optimization'],
  },
  {
    phaseId: 'infraestructura_cluster',
    label: 'Infrastructure & Memory',
    description: 'Phase 0: Define the cluster manager and memory allocation strategy before running any code. This defines the operational limits.',
    visibleNodeIds: ['infraestructura_cluster', 'infra_yarn', 'infra_k8s', 'gestion_memoria'],
  },
  {
    phaseId: 'contexto',
    label: 'Problem Context',
    description: 'Understand the business problem first. Data arrival rate, latency SLAs, and processing mode condition all subsequent Spark decisions.',
    visibleNodeIds: ['contexto', 'modo_procesamiento', 'slas_latencia', 'modo_streaming', 'trade_latency_throughput', 'manejo_estado', 'watermarking', 'modos_salida_streaming'],
  },
  {
    phaseId: 'datos',
    label: 'Data Characteristics',
    description: 'Dataset size, distribution (skew), storage format, and governance (Catalogs & ACLs) determine physical execution strategies.',
    visibleNodeIds: ['datos', 'tamano_datos', 'distribucion_datos', 'formato_datos', 'candidato_broadcast', 'data_skew', 'pushdown_lectura', 'gobernanza_datos', 'sistema_catalogo', 'control_acceso'],
  },
  {
    phaseId: 'transformaciones',
    label: 'Transformation Types',
    description: 'Joins, GroupBys, and complex datatypes (Arrays, JSON) define the structural layout and shuffle cost of the pipeline.',
    visibleNodeIds: ['transformaciones', 'diseno_joins', 'agregaciones', 'operaciones_ventana', 'estrategia_fisica_join', 'hash_vs_sort_aggregate', 'particionado_ventana', 'tipos_complejos', 'manejo_arrays', 'extraccion_json'],
  },
  {
    phaseId: 'ejecucion',
    label: 'Execution Implications',
    description: 'Analyze the DAG, shuffle impact, and task performance (speculative execution) to understand where the real bottlenecks are.',
    visibleNodeIds: ['ejecucion', 'impacto_shuffle', 'analisis_dag', 'config_particiones_shuffle', 'recomputo_dataframe', 'manejo_rezagados'],
  },
  {
    phaseId: 'optimization',
    label: 'Optimization Strategies',
    description: 'Final tuning: partition management, caching, AQE runtime adaptation, and manual hints/tuning.',
    visibleNodeIds: ['optimization', 'control_particiones', 'persistencia', 'aqe', 'repartition_vs_coalesce', 'cache_vs_checkpoint', 'capacidades_aqe', 'optimizacion_avanzada', 'hints_sql', 'max_partition_bytes'],
  },
];

export const SparkFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Reference Modal state
  const [openRefSection, setOpenRefSection] = useState<ReferenceSection | null>(null);
  const [initialEntryId, setInitialEntryId] = useState<string | null>(null);

  useEffect(() => {
    const step = STEPS[currentStep];
    const visibleIds = step.visibleNodeIds;
    const currentNodes = graphData.nodos.filter(n => visibleIds.includes(n.id));
    const currentEdges = graphData.enlaces_transversales.filter(
      e => visibleIds.includes(e.origen) && visibleIds.includes(e.destino)
    );
    const stepGraphData: SparkPipelineGraph = { ...graphData, nodos: currentNodes, enlaces_transversales: currentEdges };
    const { nodes: ln, edges: le } = getLayoutedElements(stepGraphData);
    setNodes(ln);
    setEdges(le);
  }, [currentStep]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onNext = () => { if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1); };
  const onPrev = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const currentStepDef = STEPS[currentStep];
  const phaseNode = currentStepDef.phaseId === 'overview' 
    ? null 
    : graphData.nodos.find(n => n.id === currentStepDef.phaseId) || null;

  const childNodes = phaseNode
    ? graphData.nodos.filter(n => (phaseNode.subdecisiones || []).includes(n.id))
    : [];

  const handleOpenReference = (sectionId: string) => {
    const section = referenceData.sections.find(s => s.id === sectionId);
    if (section) {
      setOpenRefSection(section);
      setInitialEntryId(null);
    }
  };

  const handleSearchReference = (section: ReferenceSection, entryId: string) => {
    setOpenRefSection(section);
    setInitialEntryId(entryId);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="app-layout">
        <NarrativePanel
          steps={STEPS}
          currentStep={currentStep}
          phaseNode={phaseNode}
          childNodes={childNodes}
          onNext={onNext}
          onPrev={onPrev}
          onGoToStep={setCurrentStep}
          allNodes={graphData.nodos}
          refSections={referenceData.sections}
          onSearchResultClick={(id) => setSelectedNodeId(id)}
          onSearchReferenceClick={handleSearchReference}
        />
        <div className="canvas-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodesDraggable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#ffffff" gap={16} size={1} />
            <Controls className="dark-controls" />
          </ReactFlow>
        </div>
      </div>
      <NodeModal
        nodeId={selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
        graphData={graphData}
        onOpenReference={handleOpenReference}
      />
      <ReferenceModal
        section={openRefSection}
        initialEntryId={initialEntryId}
        onClose={() => {
          setOpenRefSection(null);
          setInitialEntryId(null);
        }}
      />
    </div>
  );
};
