import type { PipelineStep } from '../components/NarrativePanel';
import graphDataRaw from '../../spark_pipeline_architecture.json';
import type { SparkPipelineGraph } from '../models/types';

const baseGraph = graphDataRaw as unknown as SparkPipelineGraph;

export const BASE_STEPS: PipelineStep[] = [
  {
    phaseId: 'overview',
    label: 'The Complete Journey (Full Overview)',
    description:
      'Complete 49-node architecture map across all 6 design phases. Use Fit View [ ] or zoom into any cluster to inspect decisions and cross-phase trade-offs.',
    visibleNodeIds: baseGraph.nodos.map((n) => n.id),
  },
  {
    phaseId: 'infraestructura_cluster',
    label: 'Infrastructure & Memory',
    description:
      'Phase 0: Define the cluster manager and memory allocation strategy before running any code. This defines the operational limits.',
    visibleNodeIds: ['infraestructura_cluster', 'infra_yarn', 'infra_k8s', 'gestion_memoria'],
  },
  {
    phaseId: 'contexto',
    label: 'Problem Context',
    description:
      'Understand the business problem first. Data arrival rate, latency SLAs, and processing mode condition all subsequent Spark decisions.',
    visibleNodeIds: [
      'contexto',
      'modo_procesamiento',
      'slas_latencia',
      'modo_streaming',
      'trade_latency_throughput',
      'manejo_estado',
      'watermarking',
      'modos_salida_streaming',
    ],
  },
  {
    phaseId: 'datos',
    label: 'Data Characteristics',
    description:
      'Dataset size, distribution (skew), storage format, and governance (Catalogs & ACLs) determine physical execution strategies.',
    visibleNodeIds: [
      'datos',
      'tamano_datos',
      'distribucion_datos',
      'formato_datos',
      'candidato_broadcast',
      'data_skew',
      'pushdown_lectura',
      'gobernanza_datos',
      'sistema_catalogo',
      'control_acceso',
    ],
  },
  {
    phaseId: 'transformaciones',
    label: 'Transformation Types',
    description:
      'Joins, GroupBys, and complex datatypes (Arrays, JSON) define the structural layout and shuffle cost of the pipeline.',
    visibleNodeIds: [
      'transformaciones',
      'diseno_joins',
      'agregaciones',
      'operaciones_ventana',
      'estrategia_fisica_join',
      'hash_vs_sort_aggregate',
      'particionado_ventana',
      'tipos_complejos',
      'manejo_arrays',
      'extraccion_json',
    ],
  },
  {
    phaseId: 'ejecucion',
    label: 'Execution Implications',
    description:
      'Analyze the DAG, shuffle impact, and task performance (speculative execution) to understand where the real bottlenecks are.',
    visibleNodeIds: [
      'ejecucion',
      'impacto_shuffle',
      'analisis_dag',
      'config_particiones_shuffle',
      'recomputo_dataframe',
      'manejo_rezagados',
    ],
  },
  {
    phaseId: 'optimization',
    label: 'Optimization Strategies',
    description:
      'Final tuning: partition management, caching, AQE runtime adaptation, and manual hints/tuning.',
    visibleNodeIds: [
      'optimization',
      'control_particiones',
      'persistencia',
      'aqe',
      'repartition_vs_coalesce',
      'cache_vs_checkpoint',
      'capacidades_aqe',
      'optimizacion_avanzada',
      'hints_sql',
      'max_partition_bytes',
    ],
  },
];
