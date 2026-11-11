# 🤝 Guía de Contribución (`CONTRIBUTING.md`)

¡Gracias por contribuir a **Spark Pipeline Architecture & Encyclopedia**! Esta guía detalla el flujo de trabajo en `dev`, las reglas de arquitectura de datos y las recetas paso a paso para agregar nodos, enlaces transversales y artículos de la Enciclopedia sin romper la integridad del grafo.

---

## 1. Flujo de Ramas y Entorno de Desarrollo

- **`dev` (Rama de trabajo):** Todo desarrollo, corrección o ampliación de contenido se realiza sobre la rama `dev` probando con `npm run dev`.
- **`main` (Rama de producción):** Cada `push` a `main` dispara automáticamente el workflow [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) que despliega la aplicación en **Google Cloud Run**. Nunca hagas push directo a `main` sin haber corrido antes `npm run validate` y `npm run build` en `dev`.

```bash
git checkout dev
npm install
npm run dev
```

---

## 2. Receta 1: Cómo agregar un nuevo Nodo al Grafo de Decisiones

Los nodos del grafo viven en [`spark_pipeline_architecture.json`](./spark_pipeline_architecture.json) (validado por [`schemas/spark_pipeline_architecture.schema.json`](./schemas/spark_pipeline_architecture.schema.json)).

### Paso 1: Definir el nodo en `nodos`
Agrega tu clave única en `snake_case` dentro del objeto `"nodos"`:

```json
"mi_nuevo_nodo": {
  "id": "mi_nuevo_nodo",
  "nombre": "Dynamic Partition Pruning (DPP)",
  "tipo": "optimization",
  "nivel": 3,
  "pregunta_guia": "Are you filtering a dimension table joined against a partitioned fact table?",
  "subdecisiones": [],
  "dependencias_previas": ["estrategia_fisica_join"],
  "codigo_pyspark": "spark.conf.set('spark.sql.optimizer.dynamicPartitionPruning.enabled', 'true')",
  "salida_consola": "PartitionFilters: [isnotnull(date_id#12), dynamicpruningexpression(date_id#12 IN dynamicpruning#99)]",
  "diagrama_mermaid": "graph LR\n  A[\"Dim Filter\"] --> B[\"Broadcast Pruning Filter\"]\n  B --> C[\"Skip Fact Partitions\"]",
  "reference_section_id": "storage_pushdown"
}
```

> **Tipos de nodo permitidos (`NodeType`):**
> - `"phase"`: Nodo raíz de una fase arquitectónica (nivel `1`).
> - `"decision"`: Decisión de diseño o configuración que debe tomar el ingeniero.
> - `"problem"`: Cuello de botella, riesgo o síntoma de fallo (ej. *Data Skew*, *Spill*, *OOM*).
> - `"concept"`: Mecanismo interno o abstracción de Spark (ej. *DAG*, *Stage Boundaries*).
> - `"optimization"`: Técnica de tuning u optimización física (ej. *AQE*, *Watermarking*).

### Paso 2: Conectar el nodo en la jerarquía
1. Si es hijo de otro nodo (por ejemplo `estrategia_fisica_join`), añade `"mi_nuevo_nodo"` dentro del arreglo `"subdecisiones"` del nodo padre.
2. Asegúrate de que cada ID en `"dependencias_previas"` y `"subdecisiones"` exista en `"nodos"`.

### Paso 3: Asignar el nodo a una Fase visible
En [`src/components/SparkFlow.tsx`](./src/components/SparkFlow.tsx) (arreglo `steps`), añade `"mi_nuevo_nodo"` al arreglo `visibleNodeIds` de la fase correspondiente para que se muestre durante el recorrido guiado (en el Paso 1 *The Complete Journey* se incluyen automáticamente todos los nodos con `Object.keys(graphData.nodos)`).

---

## 3. Receta 2: Cómo agregar un Enlace Transversal (`enlaces_transversales`)

Los enlaces transversales modelan relaciones de causa/efecto, restricciones o mitigaciones entre nodos que pueden pertenecer a la misma fase o a fases distintas.

Agrega un objeto al arreglo `"enlaces_transversales"` en [`spark_pipeline_architecture.json`](./spark_pipeline_architecture.json):

```json
{
  "id": "e19",
  "origen": "data_skew",
  "destino": "mi_nuevo_nodo",
  "tipo": "mitigacion",
  "descripcion": "Dynamic Partition Pruning avoids scanning skewed unreferenced partitions before the join stage."
}
```

> **Tipos de relación transversal permitidos (`EdgeRelationType`):**
> - `"causa_efecto"` (`Cause → Effect`)
> - `"restriccion"` (`Constraint`)
> - `"mitigacion"` (`Mitigation`)
> - `"habilitador"` (`Enabler`)
> - `"determinante"` (`Determines`)
> - `"disparador"` (`Triggers`)
> - `"riesgo_ejecucion"` (`Execution Risk`)

---

## 4. Receta 3: Cómo agregar una Sección o Entrada a la Enciclopedia

El contenido de la Enciclopedia vive en [`spark_reference.json`](./spark_reference.json) (validado por [`schemas/spark_reference.schema.json`](./schemas/spark_reference.schema.json)).

```json
{
  "id": "dynamic_partition_pruning",
  "title": "Dynamic Partition Pruning (DPP)",
  "subtitle": "Runtime Partition Skipping for Star-Schema Joins",
  "tags": ["#dpp", "#partitioning", "#star_schema", "#catalyst"],
  "syntax": "spark.conf.set('spark.sql.optimizer.dynamicPartitionPruning.enabled', 'true')",
  "description": "Explicación técnica detallada de cómo funciona a nivel Catalyst y físico...",
  "when_to_use": "Cuándo activarlo y en qué topologías de tablas hecho/dimensión aporta mayor beneficio...",
  "edge_cases": [
    "Requisito o límite técnico #1...",
    "Caso borde #2..."
  ],
  "codigo_pyspark": "# Ejemplo reproducible en PySpark 3.5\n...",
  "salida_consola": "== Physical Plan ==\n...",
  "diagrama_mermaid": "graph TD\n  A[\"Dimension Scan\"] --> B[\"Pruning Filter\"]"
}
```

### Reglas para diagramas Mermaid (`diagrama_mermaid`)
- Envuelve siempre entre comillas dobles los textos de nodos que contengan paréntesis, corchetes o caracteres especiales: `A["Executor (JVM Heap)"]` en lugar de `A[Executor (JVM Heap)]`.
- Evita etiquetas HTML (`<br/>`, `<b>`) dentro de los nodos Mermaid.

---

## 5. Validación Obligatoria Antes de Hacer Commit

El script [`scripts/parser.ts`](./scripts/parser.ts) verifica automáticamente **7 reglas de integridad cruzada**:
1. Coincidencia exacta entre la clave del mapa `nodos[key]` y `node.id`, y validación de `NodeType` y `nivel` (`1..4`).
2. Existencia de todos los IDs listados en `subdecisiones` y `dependencias_previas`.
3. Existencia de `origen` y `destino`, unicidad de `id`, `EdgeRelationType` válido y `descripcion` no vacía en todos los `enlaces_transversales`.
4. Detección de ciclos en la jerarquía de `subdecisiones` (garantía de DAG estricto).
5. Detección de nodos huérfanos no alcanzables desde los nodos raíz de fase (`nivel === 1`).
6. Existencia de todo `reference_section_id` apuntando a una sección real de `spark_reference.json`.
7. Integridad completa de todas las secciones y entradas de `spark_reference.json` (IDs únicos, código PySpark, diagramas y casos borde).

Ejecuta siempre:

```bash
npm run validate
npx tsc --noEmit
npm run build
```

Ambos comandos deben finalizar con código de salida `0` antes de abrir un Pull Request o fusionar cambios.
