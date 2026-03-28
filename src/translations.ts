export type Language = 'es' | 'en';

export const translations = {
  es: {
    sidebarTitle: 'Fases de Arquitectura',
    step: 'Paso',
    overviewTitle: 'Vista Global de la Arquitectura',
    overviewDesc: 'Este mapa completo muestra todas las decisiones, problemas y conceptos de diseño que componen un pipeline de procesamiento robusto en Apache Spark.',
    btnPrev: '← Anterior',
    btnNext: 'Siguiente →',
    searchPlaceholder: 'Buscar concepto (ej. broadcast)...',
    searchEmpty: 'No se encontraron resultados.',
    tabStrategy: 'Estrategia',
    tabCode: 'Código PySpark',
    tabHood: 'Bajo el Capó',
    modalType: 'TIPO',
    modalLvl: 'N',
    modalGuideQ: 'Pregunta Guía',
    modalSubDecisions: 'Sub-Decisiones o Conceptos Hijos',
    modalDepsPre: 'Dependencias Previas',
    modalDepsContext: 'Estas decisiones deben evaluarse antes que esta.',
    modalPySparkImpl: 'Implementación PySpark',
    modalOutputSim: 'Salida Simulada (Consola / Explain)',
    modalArchMem: 'Arquitectura de Memoria / Objetos',
    modalArchContext: 'Representación visual del flujo de datos en ejecución.',
    steps: [
      {
        phaseId: 'overview',
        label: 'El recorrido completo',
        description: 'Un pipeline en Spark pasa por 5 fases de diseño en orden. Cada fase depende de las anteriores. Recórrelas de izquierda a derecha para entender el razonamiento completo.',
        visibleNodeIds: ['root', 'contexto', 'datos', 'transformaciones', 'ejecucion', 'optimizacion'],
      },
      {
        phaseId: 'contexto',
        label: 'Contexto del problema',
        description: 'Antes de escribir una sola línea de Spark, hay que entender el problema. ¿Los datos llegan en lotes o como flujo continuo? ¿Qué latencia máxima es aceptable? Estas respuestas condicionan TODAS las decisiones posteriores.',
        visibleNodeIds: ['contexto', 'modo_procesamiento', 'slas_latencia', 'modo_streaming', 'trade_latency_throughput'],
      },
      {
        phaseId: 'datos',
        label: 'Características de los datos',
        description: 'El tamaño, la distribución y el formato del dataset determinan si podés hacer un Broadcast Join, si vas a sufrir Data Skew, y qué tan eficiente va a ser tu lectura desde disco.',
        visibleNodeIds: ['datos', 'tamano_datos', 'distribucion_datos', 'formato_datos', 'candidato_broadcast', 'data_skew', 'pushdown_lectura'],
      },
      {
        phaseId: 'transformaciones',
        label: 'Tipo de transformaciones',
        description: 'Joins, GroupBys y Window Functions son las operaciones que más impactan el rendimiento. Cada una tiene una estrategia física óptima dependiendo de lo que definiste en las fases anteriores.',
        visibleNodeIds: ['transformaciones', 'diseno_joins', 'agregaciones', 'operaciones_ventana', 'estrategia_fisica_join', 'hash_vs_sort_aggregate', 'particionado_ventana'],
      },
      {
        phaseId: 'ejecucion',
        label: 'Implicaciones en ejecución',
        description: 'El motor de Spark materializa las transformaciones en un DAG de stages. Acá entendés cuánto shuffle genera tu pipeline y dónde se crean cuellos de botella reales.',
        visibleNodeIds: ['ejecucion', 'impacto_shuffle', 'analisis_dag', 'config_particiones_shuffle', 'recomputo_dataframe'],
      },
      {
        phaseId: 'optimizacion',
        label: 'Estrategias de optimización',
        description: 'Con un diagnóstico claro del DAG, podés aplicar técnicas concretas: controlar el número de particiones, decidir cuándo cachear un DataFrame, y aprovechar AQE para que Spark se adapte automáticamente en runtime.',
        visibleNodeIds: ['optimizacion', 'control_particiones', 'persistencia', 'aqe', 'repartition_vs_coalesce', 'cache_vs_checkpoint', 'capacidades_aqe'],
      }
    ]
  },
  en: {
    sidebarTitle: 'Architecture Phases',
    step: 'Step',
    overviewTitle: 'Global Architecture Overview',
    overviewDesc: 'This complete map shows all design decisions, problems, and concepts that make up a robust processing pipeline in Apache Spark.',
    btnPrev: '← Previous',
    btnNext: 'Next →',
    searchPlaceholder: 'Search concept (e.g. broadcast)...',
    searchEmpty: 'No results found.',
    tabStrategy: 'Strategy',
    tabCode: 'PySpark Code',
    tabHood: 'Under the Hood',
    modalType: 'TYPE',
    modalLvl: 'L',
    modalGuideQ: 'Guiding Question',
    modalSubDecisions: 'Sub-Decisions or Child Concepts',
    modalDepsPre: 'Previous Dependencies',
    modalDepsContext: 'These decisions must be evaluated before this one.',
    modalPySparkImpl: 'PySpark Implementation',
    modalOutputSim: 'Simulated Output (Console / Explain)',
    modalArchMem: 'Memory / Object Architecture',
    modalArchContext: 'Visual representation of internal data flow at runtime.',
    steps: [
      {
         phaseId: 'overview',
         label: 'The Complete Journey',
         description: 'A Spark pipeline goes through 5 design phases in order. Each phase depends on the previous ones. Traverse them from left to right to understand the full reasoning.',
         visibleNodeIds: ['root', 'contexto', 'datos', 'transformaciones', 'ejecucion', 'optimizacion'],
      },
      {
         phaseId: 'contexto',
         label: 'Problem Context',
         description: 'Before writing a single line of Spark, you must understand the problem. Do data arrive in batches or as a continuous stream? What is the maximum acceptable latency? These answers condition ALL subsequent decisions.',
         visibleNodeIds: ['contexto', 'modo_procesamiento', 'slas_latencia', 'modo_streaming', 'trade_latency_throughput'],
      },
      {
         phaseId: 'datos',
         label: 'Data Characteristics',
         description: 'Dataset size, distribution, and format determine whether you can do a Broadcast Join, if you will suffer Data Skew, and how efficient your disk reads will be.',
         visibleNodeIds: ['datos', 'tamano_datos', 'distribucion_datos', 'formato_datos', 'candidato_broadcast', 'data_skew', 'pushdown_lectura'],
      },
      {
         phaseId: 'transformaciones',
         label: 'Transformation Types',
         description: 'Joins, GroupBys, and Window Functions are the operations that most impact performance. Each has an optimal physical strategy depending on what you defined in previous phases.',
         visibleNodeIds: ['transformaciones', 'diseno_joins', 'agregaciones', 'operaciones_ventana', 'estrategia_fisica_join', 'hash_vs_sort_aggregate', 'particionado_ventana'],
      },
      {
         phaseId: 'ejecucion',
         label: 'Execution Implications',
         description: 'The Spark engine materializes transformations into a DAG of stages. Here you understand how much shuffle your pipeline generates and where real bottlenecks are created.',
         visibleNodeIds: ['ejecucion', 'impacto_shuffle', 'analisis_dag', 'config_particiones_shuffle', 'recomputo_dataframe'],
      },
      {
         phaseId: 'optimizacion',
         label: 'Optimization Strategies',
         description: 'With a clear DAG diagnosis, you can apply concrete techniques: control partition counts, decide when to cache a DataFrame, and leverage AQE for automatic runtime adaptation.',
         visibleNodeIds: ['optimizacion', 'control_particiones', 'persistencia', 'aqe', 'repartition_vs_coalesce', 'cache_vs_checkpoint', 'capacidades_aqe'],
      }
    ]
  }
};
