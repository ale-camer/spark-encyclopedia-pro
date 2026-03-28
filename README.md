# Spark Pipeline Architecture & Encyclopedia

## Descripción
Una experiencia educativa interactiva y exhaustiva para dominar el diseño de pipelines en Apache Spark 3.5. 
El sistema fusiona dos conceptos clave:
1. **Decision Graph Guiado**: Un hilo conductor de **6 fases secuenciales** que explica el razonamiento y los trade-offs detrás de cada decisión arquitectónica.
2. **Spark Encyclopedia**: Una librería de referencia profunda ("Deep Dives") embebida contextualmentente en cada nodo del grafo, con código PySpark, outputs de consola y explicaciones matemáticas/arquitectónicas.

## Filosofía de Diseño

### Aprendizaje Just-In-Time (Split-Screen + Modales)
El usuario no necesita saltar a la documentación oficial. La interfaz ofrece:
- **Panel Narrativo**: Guiando paso a paso la arquitectura.
- **Grafo Visual (React Flow)**: Mostrando dependencias y cuellos de botella.
- **Buscador Unificado**: Indexa tanto los nodos del grafo como los artículos de la Enciclopedia (ej. buscar "ranking" abre directamente la explicación de Window Functions).
- **Botón "Deep Dive"**: Disponible en los nodos clave para abrir modales interactivos con explicaciones a bajo nivel.

## The 6-Phase Pipeline Journey

El sistema ahora contempla la inicialización del clúster antes del código lógico:

| # | Fase | Qué aprende el usuario | Estado de la Enciclopedia |
|---|------|------------------------|---------------------------|
| 0 | **Infraestructura y Memoria** | YARN vs K8s, Client vs Cluster, Unified Memory Manager | **✅ Completado** |
| 1 | **Contexto del problema** | Batch vs Streaming, SLAs, latencia | **⏳ EN CURSO** (Falta Advanced Streaming) |
| 2 | **Características de los datos**| Tamaño, Data Skew, formato de almacenamiento | **✅ Completado** (Parquet/Delta, Pushdown) |
| 3 | **Tipo de transformaciones** | Joins, GroupBy, Window Functions | **✅ Completado** (Inner/Outer/Anti, Hash vs Sort Agg) |
| 4 | **Implicaciones en ejecución** | Shuffle, análisis del DAG, Stage boundaries | **✅ Completado** |
| 5 | **Estrategias de optimización**| Particiones, Cache vs Checkpoint, AQE (Adaptive Query Exec) | **✅ Completado** |

## Estado Actual y Próximos Pasos (Where we left off)

Actualmente, **hemos completado el Bloque 1 (Fase 0: Infraestructura y Memoria)**, añadiendo los nodos raíz y los primeros modales de referencia.
El motor de búsqueda unificado y la vinculación de modales están 100% operativos.

**👉 Siguiente paso a desarrollar:**
- **Bloque 2: Advanced Streaming (Fase 1)**
  - Expandir las decisiones de Streaming vs Batch.
  - Añadir soporte en la librería de referencia para: *Micro-batch vs Continuous processing, Watermarking para datos atrasados (late data), y Triggers*.

## Estructura del Proyecto

```text
src/
├── components/
│   ├── NarrativePanel.tsx   # Panel izquierdo y buscador unificado
│   ├── SparkFlow.tsx        # Grafo y orquestación de renderizado
│   ├── NodeModal.tsx        # Modal de detalle del nodo
│   ├── ReferenceModal.tsx   # Modal de "Deep Dive" de la enciclopedia
│   └── SearchBar.tsx        # Motor de búsqueda cross-domain
├── models/
│   ├── spark_pipeline_architecture.json # Grafo de decisiones (JSON)
│   └── spark_reference.json             # Contenido de la Enciclopedia (JSON)
```

## Cómo ejecutar

```bash
npm install
npm run dev
# → http://localhost:5173
```


---
🚀 **Production Deploy Check**: Initializing full pipeline automation for Spark Encyclopedia.
