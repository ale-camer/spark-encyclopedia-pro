# ⚡ Spark Pipeline Architecture & Encyclopedia

> 🌐 **Idioma / Language:** **Español** | [English (`README.en.md`)](./README.en.md)  
> 📖 **Documentación técnica:** [Arquitectura (`docs/ARCHITECTURE.md`)](./docs/ARCHITECTURE.md) · [Guía de Contribución (`CONTRIBUTING.md`)](./CONTRIBUTING.md) · [Plan de Mejoras (`PLAN_DE_MEJORAS.md`)](./PLAN_DE_MEJORAS.md)

Una plataforma interactiva de arquitectura y enciclopedia técnica diseñada para dominar el diseño, optimización y resolución de cuellos de botella de pipelines en **Apache Spark 3.5 (PySpark)**.

El sistema combina dos pilares mediante una filosofía de **Aprendizaje Just-In-Time**:
1. **Grafo de Decisiones Guiado (49 nodos + 18 enlaces transversales):** Un recorrido estructurado por **6 fases secuenciales** (más una vista global completa) que modela las dependencias jerárquicas y los *trade-offs* reales entre infraestructura, datos, transformaciones, ejecución física y optimización.
2. **Enciclopedia Técnica de Spark (13 secciones · 30 guías Deep Dive):** Artículos técnicos embebidos en contexto dentro de cada nodo, equipados con fragmentos de código PySpark listos para copiar, salidas de consola/planes físicos (`explain()`) y diagramas de arquitectura **Mermaid.js** bajo el capó.

---

## ✨ Características Principales

- 🗺️ **Doble Modo de Exploración Visual (React Flow + Dagre):**
  - **Recorrido Guiado por Fase:** Filtra el grafo en cada etapa para enfocarse en las decisiones de esa fase sin ruido visual.
  - **Visión General Completa (49 Nodos):** Layout inteligente en cuadrícula de clústeres (`3×2`) con auto-encuadre (`Fit View`) que permite inspeccionar toda la arquitectura de punta a punta.
- 🔗 **Enlaces Transversales Interactivos (*Cross-Phase Trade-offs*):**
  - Visualización de las **18 relaciones transversales** (`causa_efecto`, `mitigacion`, `riesgo_ejecucion`, `restriccion`, `habilitador`, `determinante`, `disparador`) tanto sobre el lienzo (con popovers explicativos al hacer clic en una arista punteada) como dentro del modal de cada nodo, permitiendo saltar entre fases con un clic.
- 🧭 **Menú Lateral Inteligente, Colapsable e Interactivo:**
  - Stepper compactable con indicadores de progreso por fase, tarjetas interactivas para preguntas guía y sub-decisiones, y modo colapsado con *dock* flotante para maximizar el área del diagrama.
- 🔍 **Buscador Global Instantáneo (`/` o `Ctrl+K`):**
  - Búsqueda transversal insensible a mayúsculas y tildes sobre los **49 nodos** (títulos, preguntas guía, código PySpark) y las **30 entradas de la enciclopedia** (títulos, etiquetas `#oom`, `#skew`, `#catalyst`, sintaxis y casos de uso), con navegación completa por teclado (`↑`, `↓`, `Enter`, `Esc`).
- 📚 **Catálogo Completo de la Enciclopedia:**
  - Navegador lateral tipo acordeón con acceso directo a las **13 secciones** y **30 artículos técnicos**, casos borde (*Edge Cases & Pitfalls*) y botón de copiado rápido (`📋 Copy`) en todos los bloques PySpark.
- 🌗 **Tema Oscuro / Claro Unificado:**
  - Conmutador persistente (`Dark` / `Light`) sincronizado en toda la interfaz, incluyendo el lienzo de React Flow, resaltado de sintaxis PySpark (`vscDarkPlus` / `oneLight`) y re-renderizado dinámico de diagramas **Mermaid**.
- ❓ **Ayuda Integrada, Glosario Spark y Tour de Bienvenida:**
  - Modal de ayuda (`?`) con guía de uso, convenciones visuales, **Glosario filtrable de 18 conceptos clave de Spark** con salto directo a nodos, tabla de atajos de teclado y un **Tour Interactivo de 5 pasos** (*spotlight onboarding*).
- 🔗 **Estado Sincronizado en la URL:**
  - Cada fase, nodo, artículo de enciclopedia y modo de vista se refleja en query params (`?phase=...&node=...&ref=...&entry=...&view=full`), soportando enlaces compartibles y navegación nativa con los botones *Atrás / Adelante* del navegador.

---

## 🛣️ Las 6 Fases del Recorrido Arquitectónico

| Paso | Fase | Qué decide y aprende el ingeniero | Nodos Clave |
| :---: | :--- | :--- | :--- |
| **1** | **🌐 The Complete Journey** | Visión holística de las 6 fases y cómo las decisiones tempranas impactan la ejecución final. | **49 nodos** organizados en clústeres `3×2` |
| **2** | **Fase 0 · Infraestructura y Memoria** | Gestor de clúster, modo de despliegue y arquitectura del *Unified Memory Manager*. | `YARN` vs `K8s`, `Client` vs `Cluster`, `Execution vs Storage Memory` |
| **3** | **Fase 1 · Contexto del Problema** | Naturaleza del procesamiento, latencia objetivo, SLAs y semántica de streaming. | `Batch` vs `Streaming`, `Triggers`, `Watermarking` |
| **4** | **Fase 2 · Características de los Datos** | Volumen, distribución de claves (*Data Skew*), formatos columnares, tablas ACID y tipos complejos. | `Parquet/Delta/Iceberg`, `Predicate Pushdown`, `Data Skew`, `PII Governance` |
| **5** | **Fase 3 · Transformaciones** | Operaciones lógicas y físicas para cruzar, agrupar y ranquear datos a escala. | `Broadcast` vs `Sort-Merge Join`, `Hash` vs `Sort Agg`, `Window Functions` |
| **6** | **Fase 4 · Implicaciones en Ejecución** | Traducción del plan lógico al DAG físico, fronteras de *Stage* y costo de *Shuffle*. | `Narrow vs Wide`, `Shuffle Read/Write`, `Stage Boundaries`, `Spill to Disk` |
| **7** | **Fase 5 · Estrategias de Optimización** | Ajuste fino de particiones, persistencia en memoria/disco y optimización dinámica en runtime. | `Repartition vs Coalesce`, `Cache vs Checkpoint`, `AQE (Coalesce, Skew Join, Broadcast)` |

---

## 📚 Secciones de la Enciclopedia Spark (30 Deep Dives)

1. 🤝 **Join Types & Strategies** (`inner_join`, `left_outer_join`, `left_anti_join`, `left_semi_join`, `cross_join`)
2. 🪟 **Window Functions** (`ranking_functions`, `analytic_functions`, `window_frames`)
3. ∑ **Aggregations & Grouping** (`hash_aggregate`, `sort_aggregate`, `pivot_grouping_sets`)
4. 💾 **Storage Formats & Pushdown** (`parquet_delta`, `predicate_pushdown`, `partition_pruning`)
5. 🧠 **Memory Persistence & Caching** (`cache_vs_persist`, `checkpoint_vs_local`)
6. ⚡ **Core Optimization & AQE** (`aqe_overview`, `coalesce_ vs_repartition`, `salting_skew`)
7. 🏗️ **Infrastructure & Deployment** (`cluster_managers`, `deploy_modes`)
8. 🔋 **Unified Memory Management** (`memory_fractions`)
9. 🌊 **Structured Streaming** (`streaming_triggers`, `watermarking_state`)
10. 🛡️ **Data Governance & Security** (`pii_masking_hashing`, `acid_compaction`)
11. 🧬 **Complex Data Types** (`higher_order_functions`, `explode_vs_posexplode`)
12. ⚙️ **Execution & Shuffle Internals** (`catalyst_tungsten`, `shuffle_mechanics`)
13. 🚀 **Advanced Optimization Tuning** (`broadcast_join_tuning`, `bucketing_vs_partitioning`, `skew_salting_aqe`)

---

## 🗂️ Estructura del Proyecto

```text
spark_learning/
├── docs/
│   └── ARCHITECTURE.md                  # Arquitectura técnica, modelo de datos y diagramas Mermaid
├── public/
│   ├── spark-icon.svg                   # Favicon vectorial de Apache Spark
│   ├── spark-logo.svg                   # Logo principal para cabecera (modo oscuro)
│   └── spark-logo-dark.svg              # Logo principal para cabecera (modo claro)
├── schemas/
│   ├── spark_pipeline_architecture.schema.json  # JSON Schema del grafo de decisiones
│   └── spark_reference.schema.json              # JSON Schema de la enciclopedia técnica
├── scripts/
│   ├── index.ts                         # CLI ejecutor del validador de integridad
│   └── parser.ts                        # Validador de 7 reglas cross-domain (Grafo + Enciclopedia)
├── src/
│   ├── components/
│   │   ├── CanvasLegend.tsx             # Leyenda flotante colapsable del lienzo
│   │   ├── CodeBlock.tsx                # Bloque PySpark con resaltado y copiado al portapapeles
│   │   ├── HelpModal.tsx                # Modal de ayuda (4 pestañas + Glosario Spark)
│   │   ├── MermaidChart.tsx             # Renderizador asíncrono Mermaid reactivo al tema
│   │   ├── NarrativePanel.tsx           # Menú lateral colapsable, stepper y guía de fase
│   │   ├── NodeModal.tsx                # Modal de nodo (Estrategia, PySpark, Diagrama, Trade-offs)
│   │   ├── OnboardingTour.tsx           # Tour interactivo de bienvenida en 5 pasos (spotlight)
│   │   ├── ReferenceModal.tsx           # Modal de la Enciclopedia con catálogo acordeón (13 secciones)
│   │   ├── SearchBar.tsx                # Buscador unificado tolerante a tildes y con soporte de teclado
│   │   ├── SparkFlow.tsx                # Orquestador del grafo React Flow, URL sync y atajos globales
│   │   └── SparkNodeUI.tsx              # Tarjeta visual personalizada de cada nodo en el canvas
│   ├── context/
│   │   └── ThemeContext.tsx             # Contexto Dark/Light con persistencia en localStorage
│   ├── core/
│   │   └── layoutHelper.ts              # Motor de layout Dagre (por fase y cuadrícula 3×2 de 49 nodos)
│   ├── models/
│   │   └── types.ts                     # Tipos TypeScript del grafo, aristas y enciclopedia
│   ├── App.tsx                          # Punto de montaje de proveedores y flujo principal
│   ├── index.css                        # Sistema de diseño CSS (variables Dark/Light, componentes)
│   └── main.tsx                         # Entrada principal de React 19 + Vite
├── spark_pipeline_architecture.json     # Dataset del grafo (49 nodos + 18 enlaces transversales)
├── spark_reference.json                 # Dataset de la enciclopedia (13 secciones + 30 entradas)
├── CONTRIBUTING.md                      # Guía paso a paso para agregar nodos, enlaces y artículos
├── Dockerfile                           # Build multi-etapa (Node 20 Alpine + Nginx) para Cloud Run
└── package.json                         # Dependencias y scripts de desarrollo/validación/build
```

---

## 🚀 Requisitos y Ejecución Local

### Requisitos previos
- **Node.js** `>= 20.x`
- **npm** `>= 10.x`

### Instalación y servidor de desarrollo
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo (Vite HMR)
npm run dev
# → Disponible en http://localhost:5173
```

### Comandos de Calidad, Validación y Build
```bash
# Validar las 7 reglas de integridad cruzada del grafo (49 nodos, 18 enlaces) y enciclopedia (30 entradas)
npm run validate

# Verificar tipos TypeScript sin emitir archivos
npx tsc --noEmit

# Compilar bundle de producción (ejecuta automáticamente `npm run validate`, `tsc` y `vite build`)
npm run build

# Previsualizar localmente el bundle de producción
npm run preview
```

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
| :---: | :--- |
| `/` o `Ctrl + K` (`Cmd + K`) | Enfocar el buscador global instantáneamente |
| `↑` / `↓` y `Enter` | Navegar y abrir resultados en el menú del buscador |
| `←` / `→` | Avanzar o retroceder entre las fases del recorrido |
| `?` | Abrir / cerrar la Guía de Ayuda y Glosario Spark |
| `Esc` | Cerrar el modal activo, el tour o el desplegable de búsqueda |

---

## ☁️ Despliegue Automatizado (CI/CD)

El repositorio cuenta con despliegue continuo a **Google Cloud Run** mediante GitHub Actions ([`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)):
- Todo el desarrollo iterativo se realiza en la rama **`dev`**.
- Al hacer `push` o fusionar hacia la rama **`main`**, el pipeline ejecuta `npm run validate`, compila la aplicación dentro del contenedor multi-etapa ([`Dockerfile`](./Dockerfile)) y publica la nueva revisión en Cloud Run.
