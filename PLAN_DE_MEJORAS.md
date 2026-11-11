# Plan Maestro de Mejoras: UX, Multilingüe (i18n) y Documentación

> **Proyecto:** Spark Pipeline Architecture & Encyclopedia (`spark_learning`)  
> **Versión cubierta:** Apache Spark 3.5 / PySpark  
> **Modalidad de ejecución:** Iterativa en entorno **DEV** (rama `dev` + servidor local `npm run dev`), ejecutando **un único cambio a la vez** y requiriendo **autorización explícita** antes de avanzar al siguiente.

---

## 0. Protocolo de Trabajo en DEV y Control de Avance

Dado que `.github/workflows/deploy.yml` ejecuta un despliegue automático a **Google Cloud Run** en cada `push` a la rama `main`, todo el trabajo iterativo se realizará bajo estas reglas:

1. **Aislamiento en DEV:** Se trabaja sobre la rama `dev` y se valida localmente con `npm run dev` (`http://localhost:5173`), `npx tsc --noEmit` y `npm run build`. Ningún cambio se fusiona a `main` hasta que decidas publicar una versión estable en producción.
2. **Ejecución secuencial 1 a 1:** Cada cambio numerado (`Cambio #01` a `Cambio #15`) es una unidad atómica, autocontenida y verificable que deja la aplicación compilando sin errores.
3. **Puerta de autorización:**
   - Antes de iniciar un cambio, se confirma tu autorización.
   - Al terminar el cambio `N`, se marca `[x]` en la tabla de seguimiento de este documento, se detallan los archivos tocados y los pasos exactos para probarlo en `http://localhost:5173`, y **se detiene la ejecución** hasta tu visto bueno para pasar al cambio `N + 1`.

### Tabla de Seguimiento Global

| ID | Bloque | Cambio | Impacto Principal | Esfuerzo | Estado |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **#01** | 1. Base & Bugs | Reparar y ampliar el validador de integridad (`scripts/`) | Calidad / Datos | Bajo | `[x] Completado` |
| **#02** | 1. Base & Bugs | Normalizar tipos (`phase`, `optimization`, aristas) y estilos CSS faltantes | Visual / Tipos | Bajo | `[x] Completado` |
| **#03** | 1. Base & Bugs | Corregir título dinámico del botón "Deep Dive" en `NodeModal` | Bug UX | Bajo | `[x] Completado` |
| **#04** | 1. Base & Bugs | Tema Claro/Oscuro unificado + Ícono (Favicon) y Logo local de Apache Spark | Bug Visual / UX | Medio | `[x] Completado` |
| **#05** | 2. Grafo & UX | Enriquecer `SparkNodeUI` (badges de contenido, cursor, estados visitado/activo) | Descubrimiento | Bajo-Medio | `[x] Completado` |
| **#06** | 2. Grafo & UX | Visibilizar los 18 `enlaces_transversales` (tooltips, modal y modo "Grafo Completo") | Arquitectura / UX | Medio | `[x] Completado` |
| **#07** | 2. Grafo & UX | Menú inteligente colapsable/interactivo + Leyenda en Canvas + Catálogo Enciclopedia | Orientación / UX | Medio | `[x] Completado` |
| **#08** | 2. Grafo & UX | Navegación cruzada clickeable, URL state y Auto-Fit View inteligente (Visión General 49 nodos) | Navegación / Canvas | Medio | `[x] Completado` |
| **#09** | 2. Grafo & UX | Botón "Copiar código", Búsqueda sin tildes + teclado, Atajos globales y Accesibilidad | Productividad / a11y | Medio | `[x] Completado` |
| **#10** | 3. Docs In-App | Modal de Ayuda (`?`): Guía de uso, Convenciones, Atajos y Glosario Spark (~25 términos) | Documentación UX | Medio | `[x] Completado` |
| **#11** | 3. Docs In-App | Tour interactivo guiado de primera visita (Onboarding) | Onboarding UX | Medio | `[x] Completado` |
| **#12** | 4. Docs Repo | `README.md`, `CONTRIBUTING.md`, `docs/ARCHITECTURE.md`, JSON Schemas y CI | Docs Dev / DevOps | Medio | `[x] Completado` |
| **#13** | 5. Multilingüe | Ventana Modal Selector de 20 Idiomas (`LanguageModal`) + Arquitectura i18n (`I18nContext` + `ui.ts`) | Infraestructura i18n | Medio | `[x] Completado` |
| **#14** | 5. Multilingüe | Traducción multilingüe (20 idiomas) de UI completa, Ayuda/Glosario y Grafo (7 fases, 49 nodos, 18 enlaces) | Contenido i18n | Alto | `[x] Completado` |
| **#15** | 5. Multilingüe | Traducción multilingüe (20 idiomas) de la Enciclopedia (13 secciones, 30 artículos) + Docs Spark 3.5 + Check CI | Contenido i18n | Alto | `[x] Completado` |

---

## Diagnóstico Técnico Inicial del Repositorio

Antes del desglose cambio por cambio, se deja constancia de los hallazgos exactos detectados en el código actual:

1. **Intento previo de i18n inconcluso y desfasado:**
   - `src/translations.ts` (126 líneas) **no está importado en ningún archivo**. Además, define solo 5 fases (omite `infraestructura_cluster`) y usa el ID `optimizacion` en lugar de `optimization`.
   - `spark_pipeline_architecture_es.json` y `spark_pipeline_architecture_en.json` tienen **32 nodos** y están huérfanos, mientras que `spark_pipeline_architecture.json` evolucionó a **49 nodos** (en inglés, pero con claves de propiedades en español: `nombre`, `pregunta_guia`, `subdecisiones`, `enlaces_transversales`).
   - `spark_reference.json` (13 secciones, 30 entradas, ~13.500 caracteres de prosa técnica) existe únicamente en inglés.
   - `index.html` declara `<html lang="es">`, pero toda la interfaz renderizada está hardcodeada en inglés en los componentes TSX.
2. **13 de los 18 enlaces transversales nunca se muestran al usuario:**
   - En `src/components/SparkFlow.tsx` (líneas 87–89), solo se filtran `enlaces_transversales` cuyos `origen` y `destino` pertenezcan simultáneamente a `step.visibleNodeIds`.
   - Como resultado, solo se dibujan `e01` (en `contexto`) y `e02`, `e04`, `e14`, `e15` (en `datos`). Los **13 enlaces restantes** (`e03`, `e05`–`e13`, `e16`–`e18`), que representan los trade-offs más valiosos entre fases (ej. *Data Skew → Sort Merge Join*, *Joins/Aggs/Windows → Shuffle*, *Recomputación → Persistencia*), jamás aparecen ni en el canvas, ni en `NarrativePanel`, ni en `NodeModal`.
   - Incluso en los 5 enlaces visibles, el campo `descripcion` se adjunta a `edge.data` en `src/core/layoutHelper.ts` (línea 80), pero ningún componente lo renderiza.
3. **Inconsistencias de tipos y estilos visuales:**
   - `infraestructura_cluster` tiene `"tipo": "phase"` y `watermarking` tiene `"tipo": "optimization"`, pero `NodeType` en `src/models/types.ts` solo contempla `'decision' | 'problem' | 'concept'`, y `src/index.css` carece de reglas para `.phase` y `.optimization`.
   - En `enlaces_transversales`, `e01` y `e17` usan `"tipo": "restriction"` (inglés) mientras el resto usa español sin tilde (`causa_efecto`, `mitigacion`, `riesgo_ejecucion`, etc.), mostrándose esa clave cruda como etiqueta sobre la línea roja.
4. **Bugs puntuales de UI y scripts:**
   - `src/components/NodeModal.tsx` (línea 62): botón hardcodeado con `📚 Deep Dive into Joins Reference →` para las 13 secciones distintas de referencia.
   - Modo claro (`data-theme="light"`) incompleto: `MermaidChart` fuerza `theme: 'dark'` y usa `mermaid.contentLoaded()` (que falla en re-renders dinámicos), `SyntaxHighlighter` fuerza `vscDarkPlus`, y React Flow `<Background color="#ffffff" />` queda blanco sobre blanco.
   - `scripts/index.ts` y `scripts/parser.ts` tienen rutas de `import` rotas (`./core/parser` y `../models/types`) y no compilan.

---

## Bloque 1: Corrección de Bugs, Integridad de Datos y Deuda Técnica

### Cambio #01 — Reparar y ampliar el validador de integridad de datos (`scripts/`)

#### Problema actual
- `scripts/index.ts` (línea 1) importa `{ GraphValidator } from './core/parser'`, pero el archivo real es `scripts/parser.ts`.
- `scripts/parser.ts` (línea 1) importa tipos desde `'../models/types'`, pero la ruta real es `'../src/models/types'`.
- El validador actual solo comprueba referencias de `subdecisiones`, `dependencias` y `enlaces_transversales`, ignorando `spark_reference.json` y los pasos de la UI. Tampoco existe comando en `package.json`.

#### Cambios detallados a realizar
1. **Corregir rutas e independizar la configuración de `ts-node` / `tsx`:**
   - Actualizar imports en `scripts/index.ts` (`./parser`) y `scripts/parser.ts` (`../src/models/types`).
   - Configurar ejecución limpia mediante `npm run validate` en `package.json`.
2. **Ampliar `GraphValidator` (`scripts/parser.ts`) con 7 reglas estrictas:**
   - **Regla 1:** Unicidad de `id` en `nodos`, en `enlaces_transversales`, en `sections` de referencia y en `entries` de referencia.
   - **Regla 2:** Existencia de todos los IDs listados en `subdecisiones` y `dependencias` (y detección de auto-referencias `nodo.id === dep`).
   - **Regla 3:** Existencia de `origen` y `destino` en `enlaces_transversales` y que `descripcion` no esté vacía.
   - **Regla 4:** Validación de `tipo` de nodo contra el conjunto permitido de `NodeType`.
   - **Regla 5:** Validación cruzada con `spark_reference.json`: todo `node.reference_section_id` debe existir en `reference.sections[].id`, y reportar advertencia si alguna sección de `spark_reference.json` queda huérfana.
   - **Regla 6:** Detección de nodos huérfanos en el grafo (todo nodo salvo `root` debe ser alcanzable o pertenecer a alguna fase).
   - **Regla 7:** Campos obligatorios no vacíos en cada `ReferenceEntry` (`id`, `title`, `description`, `when_to_use`, `syntax`, `codigo_pyspark`).

#### Archivos afectados
- Modificar: `scripts/index.ts`, `scripts/parser.ts`, `package.json`.

#### Cómo probarlo en DEV
- Ejecutar `npm run validate` en terminal y verificar el reporte detallado de nodos (49), enlaces (18) y entradas de referencia (30) con código de salida `0`.
- Probar introducir temporalmente un ID falso y comprobar que devuelve código de salida `1` indicando exactamente el nodo roto.

---

### Cambio #02 — Normalizar tipos de nodos y enlaces + Estilos CSS faltantes (`phase`, `optimization`)

#### Problema actual
- `infraestructura_cluster` (`"tipo": "phase"`) y `watermarking` (`"tipo": "optimization"`) no coinciden con `export type NodeType = 'decision' | 'problem' | 'concept'` en `src/models/types.ts` (línea 13), ni tienen estilos en `src/index.css` (líneas 21–60 y 545–594).
- En `spark_pipeline_architecture.json`, los enlaces `e01` y `e17` tienen `"tipo": "restriction"` mientras que el resto usa claves como `"causa_efecto"`, `"mitigacion"`, `"habilitador"`, `"determinante"`, `"disparador"`, `"riesgo_ejecucion"`.

#### Cambios detallados a realizar
1. **Tipado estricto en `src/models/types.ts`:**
   - Actualizar `NodeType`:
     ```ts
     export type NodeType = 'phase' | 'decision' | 'problem' | 'concept' | 'optimization';
     ```
   - Crear `EdgeRelationType`:
     ```ts
     export type EdgeRelationType =
       | 'cause_effect'
       | 'restriction'
       | 'mitigation'
       | 'enabler'
       | 'determinant'
       | 'trigger'
       | 'execution_risk';
     ```
   - Tipar `TransversalLink.tipo` como `EdgeRelationType`.
2. **Normalizar claves internas en `spark_pipeline_architecture.json`:**
   - Unificar `enlaces_transversales[].tipo` a identificadores canónicos en inglés (igual que `NodeType`: `decision`, `problem`, `concept`), de modo que los datos tengan claves limpias y la capa de UI/i18n las traduzca a etiquetas humanas (`"Causa → Efecto"` / `"Cause → Effect"`, `"Riesgo de ejecución"` / `"Execution Risk"`, etc.).
3. **Añadir tokens de diseño y reglas CSS en `src/index.css` (Dark y Light):**
   - **Tipo `optimization`** (Verde Esmeralda — acción de mejora/tuning):
     - Dark: `--type-optimization-bg: rgba(16, 185, 129, 0.15)`, `--type-optimization-border: #10b981`, `--type-optimization-text: #6ee7b7`.
     - Light: `--type-optimization-bg: rgba(16, 185, 129, 0.12)`, `--type-optimization-border: #059669`, `--type-optimization-text: #047857`.
   - **Tipo `phase`** (Ámbar/Índigo arquitectónico — hito estructural de etapa):
     - Dark: `--type-phase-bg: rgba(245, 158, 11, 0.15)`, `--type-phase-border: #f59e0b`, `--type-phase-text: #fcd34d`.
     - Light: `--type-phase-bg: rgba(245, 158, 11, 0.12)`, `--type-phase-border: #d97706`, `--type-phase-text: #b45309`.
   - Añadir las reglas correspondientes en `.spark-node.<type>`, `:root[data-theme="light"] .spark-node.<type>`, `:hover`, `.node-header`, `.modal-content.<type>` y `.modal-badge`.

#### Archivos afectados
- Modificar: `src/models/types.ts`, `spark_pipeline_architecture.json`, `src/index.css`, `scripts/parser.ts`.

#### Cómo probarlo en DEV
- En Paso 1 (*Overview*) y Paso 2 (*Infrastructure & Memory*), verificar que `Cluster Managers` (`phase`) se vea con su gradiente propio en modo oscuro y claro.
- En Paso 3 (*Problem Context*), verificar que `Watermarking (Late Data)` (`optimization`) luzca con estilo verde esmeralda tanto en el nodo como al abrir su modal.
- Ejecutar `npx tsc --noEmit` y `npm run validate`.

---

### Cambio #03 — Corregir título dinámico del botón "Deep Dive" en `NodeModal`

#### Problema actual
- En `src/components/NodeModal.tsx` (líneas 57–64):
  ```tsx
  {node.reference_section_id && onOpenReference && (
    <button className="deep-dive-btn" onClick={() => onOpenReference(node.reference_section_id!)}>
      📚 Deep Dive into Joins Reference →
    </button>
  )}
  ```
  Esto muestra "Joins Reference" en nodos de YARN, Kubernetes, Memoria, Parquet/Pushdown, Window Functions, Aggregations, Streaming, Gobernanza, Tipos Complejos, AQE, etc.

#### Cambios detallados a realizar
1. Pasar `referenceSection?: ReferenceSection | null` (resuelto en `SparkFlow.tsx` a partir de `node.reference_section_id` en `referenceData.sections`) como prop a `NodeModal`.
2. Renderizar en el botón el ícono real de la sección, su título dinámico y la cantidad de tópicos incluidos:
   - Ejemplo: `☸️ Deep Dive: Infrastructure & Deployment (2 topics) →` o `🪟 Deep Dive: Window Functions (2 topics) →`.
3. Añadir un pequeño subtítulo o `title` descriptivo con `referenceSection.description` para anticipar qué encontrará el usuario al hacer click.

#### Archivos afectados
- Modificar: `src/components/NodeModal.tsx`, `src/components/SparkFlow.tsx`.

#### Cómo probarlo en DEV
- Abrir `YARN`, `Unified Memory Manager`, `Watermarking`, `Columnar Formats` y `Physical Join Strategy` en el grafo y verificar que cada uno muestre el ícono, nombre y conteo exacto de su sección de referencia.

---

### Cambio #04 — Sincronizar tema Claro/Oscuro en toda la app (Mermaid, Código, Canvas, Persistencia y Logo local)

#### Problema actual
1. `isLightMode` es un `useState(false)` local en `NarrativePanel.tsx` (línea 55): ningún otro componente sabe en qué tema está la app y al recargar se pierde la preferencia.
2. `MermaidChart` está duplicado en `NodeModal.tsx` y `ReferenceModal.tsx`, inicializa siempre `theme: 'dark'` y usa `mermaid.contentLoaded()`, lo que provoca diagramas oscuros ilegibles en modo claro y fallos al cambiar rápido entre entradas de `ReferenceModal`.
3. `SyntaxHighlighter` usa fijo `vscDarkPlus` en ambos modales.
4. En `SparkFlow.tsx` (línea 154), `<Background color="#ffffff" gap={16} size={1} />` es invisible en modo claro y demasiado brillante en modo oscuro.
5. En `NarrativePanel.tsx` (línea 70), el logo depende de una petición externa a `upload.wikimedia.org`.

#### Cambios detallados a realizar
1. **Crear `src/context/ThemeContext.tsx`:**
   - Estado `'dark' | 'light'` inicializado desde `localStorage.getItem('spark_theme')` o, si no existe, `window.matchMedia('(prefers-color-scheme: light)')`.
   - Sincronización automática con `document.documentElement.setAttribute('data-theme', theme)` y `localStorage`.
2. **Crear componente único `src/components/MermaidChart.tsx`:**
   - Usar la API moderna asíncrona `mermaid.render(uniqueId, chart)` en lugar de `mermaid.contentLoaded()`.
   - Re-renderizar automáticamente cuando cambie `chart` **o** `theme` (`theme === 'light' ? 'default' : 'dark'`).
   - Incluir contenedor con zoom básico / scroll limpio y fallback elegante si hubiese error de sintaxis en algún diagrama.
3. **Adaptar bloques de código al tema:**
   - Alternar estilo de `PrismLight` entre `vscDarkPlus` (oscuro) y `oneLight` (claro), ajustando fondo y bordes de `.code-block` y `.terminal-output` en `src/index.css`.
4. **Adaptar `<Background>` y `<Controls>` de React Flow:**
   - Pasar `color={theme === 'light' ? '#94a3b8' : 'rgba(255,255,255,0.18)'}` a `<Background>` y ajustar estilos `.dark-controls` en modo claro.
5. **Guardar logo e ícono (favicon) de Apache Spark localmente:**
   - Colocar `public/spark-logo.svg` para la cabecera y `public/spark-icon.svg` vinculado con `<link rel="icon" type="image/svg+xml" href="/spark-icon.svg" />` en `index.html` para que la pestaña del navegador tenga el ícono de Spark y todo cargue 100% local sin depender de Wikimedia.

#### Archivos afectados
- Crear: `src/context/ThemeContext.tsx`, `src/components/MermaidChart.tsx`, `public/spark-logo.svg`, `public/spark-icon.svg`.
- Modificar: `index.html`, `src/App.tsx`, `src/components/NarrativePanel.tsx`, `src/components/SparkFlow.tsx`, `src/components/NodeModal.tsx`, `src/components/ReferenceModal.tsx`, `src/index.css`.

#### Cómo probarlo en DEV
- Alternar entre Dark y Light mode: verificar grilla del canvas, controles de zoom, código PySpark y diagramas Mermaid (tanto en `NodeModal` → *Under the Hood* como cambiando entre varias entradas en `ReferenceModal` → *Diagram*).
- Recargar el navegador (`F5`) y comprobar que recuerda el tema elegido.

---

## Bloque 2: Descubrimiento Visual, Interactividad del Grafo y Navegación

### Cambio #05 — Enriquecer `SparkNodeUI` con indicadores de contenido y estados visuales

#### Problema actual
- `src/components/SparkNodeUI.tsx` (29 líneas) solo muestra `data.tipo`, `L{data.nivel}` y `data.nombre`.
- No tiene `cursor: pointer`, ni indica qué nodos poseen código PySpark, diagrama de arquitectura o sección en la Enciclopedia, obligando al usuario a hacer "click a ciegas" nodo por nodo.

#### Cambios detallados a realizar
1. **Añadir fila de indicadores (badges compactos) en `SparkNodeUI.tsx`:**
   - `💻` si `Boolean(data.codigo_pyspark || data.salida_consola)` (con `title` descriptivo).
   - `📊` si `Boolean(data.diagrama_mermaid)`.
   - `📚` badge destacado si `Boolean(data.reference_section_id)` indicando acceso a Enciclopedia.
   - `🔗` contador si el nodo participa en enlaces transversales (`enlaces_transversales`).
2. **Estados de interacción claros:**
   - `cursor: pointer` explícito y micro-indicador visual al hacer hover (`Click para inspeccionar →`).
   - Estado **visitado** (`isVisited`): check sutil `✓` en los nodos que el usuario ya abrió durante su sesión (persistido en `localStorage`), ayudando a saber qué partes del grafo ya exploró.
   - Estado **seleccionado** (`isSelected`) cuando su modal está abierto o acaba de ser localizado desde el buscador.
3. **Ajuste de dimensiones en `src/core/layoutHelper.ts`:**
   - Calibrar `nodeWidth` (`245`) y `nodeHeight` (`104`) y `ranksep` en Dagre para que la fila extra de badges nunca provoque solapamiento entre cajas ni aristas.

#### Archivos afectados
- Modificar: `src/components/SparkNodeUI.tsx`, `src/components/SparkFlow.tsx`, `src/core/layoutHelper.ts`, `src/index.css`.

#### Cómo probarlo en DEV
- Recorrer las fases y verificar de un vistazo qué nodos tienen código (`💻`), diagrama (`📊`) y enciclopedia (`📚`).
- Abrir un par de nodos y comprobar que quedan marcados sutilmente como visitados sin recargar visualmente el grafo.

---

### Cambio #06 — Visibilizar los 18 `enlaces_transversales` (tooltips en canvas, sección en `NodeModal` y modo "Grafo Completo")

#### Problema actual
- 13 de las 18 relaciones transversales de `spark_pipeline_architecture.json` **jamás son visibles** porque conectan nodos de fases distintas (ej. `data_skew` en Fase 2 con `estrategia_fisica_join` en Fase 3 y `capacidades_aqe` en Fase 5).
- Las 5 relaciones que sí se dibujan muestran etiquetas crudas (`causa_efecto`, `restriction`) y ocultan por completo su `descripcion`.

#### Cambios detallados a realizar
1. **Etiquetas legibles y colores por tipo de relación en el canvas (`layoutHelper.ts`):**
   - Mapear cada `EdgeRelationType` a una etiqueta legible y color semántico (ej. `mitigation` en verde punteado, `execution_risk` / `restriction` en rojo/ámbar punteado, `enabler` / `determinant` en cian/violeta punteado).
2. **Popover / Panel de detalle al interactuar con una arista transversal en `SparkFlow.tsx`:**
   - Implementar `onEdgeClick` / hover tooltip en React Flow para mostrar una tarjeta flotante con: nodo origen → tipo de relación → nodo destino + la explicación completa (`link.descripcion`) y botones para saltar a cualquiera de los dos nodos.
3. **Nueva sección "Impactos y Relaciones Transversales" en `NodeModal.tsx` (pestaña Estrategia):**
   - Mostrar todas las aristas de `graphData.enlaces_transversales` donde `origen === node.id` (*"Impacta en →"*) o `destino === node.id` (*"Condicionado por ←"*), incluyendo su badge de tipo, su `descripcion` completa y un botón para navegar al nodo conectado aunque esté en otra fase. Así **las 18 relaciones son 100% accesibles** incluso en la vista por pasos.
4. **Toggle en la barra superior del Canvas: `Vista por Fase` vs `🗺️ Mapa Completo (49 nodos)`:**
   - Añadir un interruptor en el lienzo que permita alternar entre el grafo filtrado de la fase actual y el DAG completo de los 49 nodos con las 18 aristas transversales (con opción de mostrar/ocultar aristas transversales para evitar ruido visual si el usuario quiere ver solo la jerarquía).

#### Archivos afectados
- Modificar: `src/core/layoutHelper.ts`, `src/components/SparkFlow.tsx`, `src/components/NodeModal.tsx`, `src/index.css`.

#### Cómo probarlo en DEV
- Abrir el nodo `Data Skew` en Fase 2 y comprobar que en su modal aparecen sus relaciones transversales hacia `Physical Join Strategy`, `AQE Capabilities` y `Window Partitioning`, con sus explicaciones.
- Hacer click en una línea punteada del canvas y verificar el popover con su `descripcion`.
- Activar `🗺️ Mapa Completo` y comprobar el renderizado fluido de los 49 nodos con zoom/pan (`fitView`).

---

### Cambio #07 — Leyenda flotante colapsable en el Canvas + Acceso global e índice completo en `ReferenceModal`

#### Problema actual
- No hay ninguna explicación visual en pantalla sobre qué significan los colores de las tarjetas, las siglas `L1`–`L4` o los tipos de flechas.
- `ReferenceModal.tsx` solo muestra en su sidebar las entradas de **una sola sección** (`section.entries`), y no existe ningún botón en la interfaz principal para abrir la Enciclopedia directamente sin pasar antes por un nodo o adivinar un término en el buscador.

#### Cambios detallados a realizar
1. **Crear componente `src/components/CanvasLegend.tsx`:**
   - Panel flotante compacto en la esquina inferior derecha del canvas, colapsable a un botón `🏷️ Leyenda` (abierto por defecto en escritorio, colapsado por defecto en móvil `< 768px`).
   - Muestra:
     - Los 5 tipos de nodo con su punto de color (`Phase`, `Decision`, `Problem`, `Concept`, `Optimization`).
     - Niveles `L1` (Raíz/Fase) → `L4` (Decisión física / implementación).
     - Líneas continuas (jerarquía padre → hijo) vs líneas punteadas (trade-off transversal).
     - Significado de los íconos `💻`, `📊`, `📚`.
2. **Botón global `📚 Enciclopedia` + Selector de las 13 secciones en `ReferenceModal.tsx`:**
   - Añadir botón `📚 Enciclopedia (30)` en el header de `NarrativePanel` (o barra superior del canvas).
   - Evolucionar el sidebar izquierdo de `ReferenceModal.tsx` en un acordeón / índice agrupado con las **13 secciones** de `spark_reference.json` (`Join Types`, `Window Functions`, `Aggregations`, `Storage & Pushdown`, `Persistence & Caching`, `Core Optimization & AQE`, `Infrastructure & Deployment`, `Unified Memory Management`, `Structured Streaming`, `Data Governance & Security`, `Complex Data Types`, `Execution & Shuffle Internals`, `Advanced Optimization Tuning`).
   - Cuando se abre desde el botón "Deep Dive" de un nodo específico, se expande y selecciona automáticamente esa sección y entrada, pero el usuario puede seguir explorando libremente el resto de la enciclopedia sin tener que cerrar el modal.

#### Archivos afectados
- Crear: `src/components/CanvasLegend.tsx`.
- Modificar: `src/components/ReferenceModal.tsx`, `src/components/NarrativePanel.tsx`, `src/components/SparkFlow.tsx`, `src/index.css`.

#### Cómo probarlo en DEV
- Verificar en el canvas que la leyenda explica todos los elementos visuales y puede colapsarse/expandirse.
- Hacer click en `📚 Enciclopedia` desde cualquier pantalla y navegar por las 13 secciones y 30 entradas sin salir del modal.

---

### Cambio #08 — Navegación cruzada clickeable, salto inteligente desde Búsqueda y sincronización con URL

#### Problema actual
1. En `NarrativePanel.tsx` (líneas 118–126) y `NodeModal.tsx` (líneas 83–93), las listas de *Sub-Decisions* y *Previous Dependencies* son etiquetas `<li>` estáticas: el usuario ve el nombre de un nodo relacionado pero no puede hacerle click.
2. En `SparkFlow.tsx` (línea 138), `onSearchResultClick={(id) => setSelectedNodeId(id)}` abre el modal pero **no cambia `currentStep`**, dejando atrás un grafo que no corresponde al nodo buscado.
3. No hay sincronización con la URL: recargar vuelve al inicio y es imposible pasarle a un colega el enlace directo a un nodo o entrada de la enciclopedia.

#### Cambios detallados a realizar
1. **Listas interactivas en `NarrativePanel` y `NodeModal`:**
   - Pasar callbacks `onSelectNode(nodeId: string)` a ambos componentes.
   - Transformar cada ítem de `Sub-Decisions` y `Previous Dependencies` en un elemento interactivo con badge de tipo, flecha `→` y navegación directa.
2. **Salto automático de fase y enfoque en el grafo al seleccionar un nodo:**
   - Crear helper `findStepIndexForNode(nodeId, steps)` en `SparkFlow.tsx`: al elegir un nodo desde el buscador, desde una dependencia o desde un enlace transversal, si el nodo no está visible en la fase actual (y no está activo el modo Mapa Completo), cambiar `currentStep` a la fase donde habita ese nodo, resaltarlo y abrir su detalle.
3. **Sincronización bidireccional con URL (`URLSearchParams`):**
   - Reflejar en la URL: `?phase=<phaseId>&node=<nodeId>&ref=<sectionId>&entry=<entryId>&view=full`.
   - Leer parámetros al montar `SparkFlow` para restaurar exactamente la vista compartida.
   - Escuchar el evento `popstate` para que los botones **Atrás / Adelante** del navegador funcionen de forma natural al navegar entre nodos y fases.
   - Guardar en `localStorage` la última fase visitada cuando se entra a la raíz `/` sin parámetros.

#### Archivos afectados
- Modificar: `src/components/NarrativePanel.tsx`, `src/components/NodeModal.tsx`, `src/components/SparkFlow.tsx`, `src/index.css`.

#### Cómo probarlo en DEV
- Estando en Paso 1, buscar `"Broadcast"` o `"AQE"` en el buscador: comprobar que el stepper salta automáticamente a la fase correspondiente, resalta el nodo en el grafo y abre su modal.
- Dentro del modal, hacer click en sus dependencias o subdecisiones y luego pulsar el botón **Atrás** del navegador.
- Copiar la URL del navegador, abrirla en una pestaña nueva y verificar que abre exactamente el mismo estado.

---

### Cambio #09 — Botón "Copiar código", Búsqueda tolerante a tildes + teclado, Atajos globales y Accesibilidad (a11y)

#### Problema actual
1. Los bloques de PySpark en `NodeModal` y `ReferenceModal` obligan a seleccionar texto manualmente para copiarlo.
2. `SearchBar.tsx` usa `.toLowerCase().includes(lowerQuery)`:
   - No normaliza tildes (`"tamaño"` no matchea `"tamano"`, crítico para español).
   - En entradas de referencia solo busca en `title` y `subtitle`, ignorando `tags` (ej. `#oom`, `#catalyst`, `#spill`, `#salting`), `syntax`, `description` y `when_to_use`.
   - No soporta navegación con teclas `↑` / `↓` / `Enter`, y sus ítems son `<li>` sin soporte de foco.
3. Faltan atajos de teclado y atributos de accesibilidad (`role="dialog"`, `aria-modal="true"`, retorno de foco) en modales.

#### Cambios detallados a realizar
1. **Crear componente `src/components/CodeBlock.tsx`:**
   - Envuelve `SyntaxHighlighter` con cabecera de lenguaje (`PySpark`) y botón `📋 Copiar` que usa `navigator.clipboard.writeText(code)` mostrando confirmación visual `✓ Copiado` durante 2 segundos.
2. **Mejorar el motor y UX de `SearchBar.tsx`:**
   - Función `normalizeText(str)` con `.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()` para búsqueda insensible a tildes y mayúsculas.
   - Indexar en nodos: `nombre`, `pregunta_guia`, `id`, `codigo_pyspark`. Indexar en referencia: `title`, `subtitle`, `tags`, `syntax`, `description`, `when_to_use` (con ranking de relevancia: título > tags/sintaxis > descripción).
   - Soporte de teclado en el dropdown: `ArrowDown`, `ArrowUp`, `Enter` para abrir el resultado activo, `Escape` para cerrar.
   - Mostrar hint visual `Ctrl+K` / `/` dentro del input cuando está vacío.
3. **Atajos globales y Accesibilidad (a11y):**
   - `Ctrl+K` / `Cmd+K` o `/` (fuera de inputs) → enfoca `SearchBar`.
   - `ArrowLeft` / `ArrowRight` (cuando no hay modal ni input enfocado) → fase anterior / siguiente.
   - Atributos `role="dialog"`, `aria-modal="true"`, `aria-labelledby` en `NodeModal` y `ReferenceModal`, conversión de `<li onClick>` a `<button>` accesibles por `Tab`, y estilos `:focus-visible` nítidos en CSS.

#### Archivos afectados
- Crear: `src/components/CodeBlock.tsx`.
- Modificar: `src/components/SearchBar.tsx`, `src/components/NodeModal.tsx`, `src/components/ReferenceModal.tsx`, `src/components/SparkFlow.tsx`, `src/index.css`.

#### Cómo probarlo en DEV
- Presionar `/` o `Ctrl+K`, escribir `"salting"` o `"spill"` (que viven en `tags`/descripción), moverse con flechas `↓`/`↑` y presionar `Enter`.
- Probar el botón `📋 Copiar` en cualquier snippet PySpark y pegar el resultado.
- Navegar entre fases usando las flechas `←` y `→` del teclado.

---

## Bloque 3: Internacionalización Completa (Multilingüe ES / EN)

### Cambio #10 — Arquitectura i18n ("Estructura Única + Capas de Traducción") y limpieza de archivos obsoletos

#### Problema actual
- Existieron copias completas del JSON por idioma (`spark_pipeline_architecture_es.json` y `_en.json` con 32 nodos) que quedaron obsoletas apenas el grafo creció a 49 nodos en `spark_pipeline_architecture.json`.
- Si se duplican `spark_pipeline_architecture.json` y `spark_reference.json` enteros por idioma, cualquier cambio futuro en una dependencia, un snippet PySpark o un diagrama Mermaid obligaría a tocar múltiples archivos y volvería a desincronizarse.

#### Diseño arquitectónico detallado
Se separará la **estructura invariante al idioma** de los **diccionarios de texto traducible**, unificándolos en tiempo de ejecución con fallback garantizado:

```text
src/
├── data/
│   ├── graph.structure.json       # IDs, tipos, niveles, subdecisiones, dependencias,
│   │                              # enlaces (origen/destino/tipo), codigo_pyspark,
│   │                              # salida_consola, diagrama_mermaid, reference_section_id
│   ├── reference.structure.json   # secciones (id, icon) y entradas (id, syntax,
│   │                              # codigo_pyspark, salida_consola, diagrama_mermaid, tags)
│   └── steps.structure.ts         # Orden de las 7 fases y sus visibleNodeIds (en un único lugar)
├── locales/
│   ├── en/
│   │   ├── ui.json                # Textos de botones, pestañas, leyendas, buscador, tooltips
│   │   ├── graph.json             # Por ID: { steps, nodes: { [id]: { nombre, pregunta_guia } }, edges: { [id]: descripcion } }
│   │   └── reference.json         # Por ID: { sections: { [id]: { title, description } }, entries: { [id]: { title, subtitle, description, when_to_use, edge_cases } } }
│   └── es/
│       ├── ui.json
│       ├── graph.json
│       └── reference.json
└── context/
    └── I18nContext.tsx            # Hook useI18n(): { lang, setLang, t, graphData, referenceData, steps }
```

#### Cambios detallados a realizar
1. **Extraer `graph.structure.json`, `reference.structure.json` y `steps.structure.ts`** a partir de los JSON actuales sin perder un solo campo.
2. **Generar los diccionarios base `src/locales/en/*.json`** con el 100% del contenido actual en inglés, y la estructura inicial `src/locales/es/*.json` rescatando lo aprovechable de `src/translations.ts` y `spark_pipeline_architecture_es.json`.
3. **Implementar `src/context/I18nContext.tsx`:**
   - Idiomas soportados: `export type Language = 'es' | 'en'` (extensible a otros idiomas como `pt` añadiendo solo una carpeta en `src/locales/`).
   - Orden de detección inicial: query param `?lang=` → `localStorage.getItem('spark_lang')` → `navigator.language.startsWith('es') ? 'es' : 'en'`.
   - Sincronización automática de `document.documentElement.lang` y `document.title`.
   - Función `mergeLocalizedGraph(structure, localeDict, fallbackEnDict)` y `mergeLocalizedReference(...)`: si cualquier campo falta en el idioma elegido, hace fallback transparente a `en` sin romper jamás la UI.
4. **Añadir selector de idioma `ES | EN` en la barra superior (`NarrativePanel.tsx`).**
5. **Limpieza de deuda técnica:** Eliminar `src/translations.ts`, `spark_pipeline_architecture_es.json`, `spark_pipeline_architecture_en.json` y los JSON monolíticos antiguos una vez migrados y validados por `scripts/parser.ts`.

#### Archivos afectados
- Crear: `src/data/graph.structure.json`, `src/data/reference.structure.json`, `src/data/steps.structure.ts`, `src/locales/en/{ui,graph,reference}.json`, `src/locales/es/{ui,graph,reference}.json`, `src/context/I18nContext.tsx`.
- Eliminar: `src/translations.ts`, `spark_pipeline_architecture_es.json`, `spark_pipeline_architecture_en.json` (y reemplazar los monolíticos raíz o mantener re-export según convenga al validador).
- Modificar: `src/App.tsx`, `src/components/NarrativePanel.tsx`, `src/components/SparkFlow.tsx`, `scripts/parser.ts`.

#### Cómo probarlo en DEV
- Verificar que el botón `ES | EN` cambia instantáneamente el atributo `<html lang>`, se persiste en `localStorage` y en `?lang=`, y toda la estructura de nodos/referencias funciona idéntica a antes sin regresiones.

---

### Cambio #11 — Traducción completa ES/EN de toda la Interfaz (UI) y del Grafo de Decisiones (7 fases, 49 nodos, 18 enlaces)

#### Problema actual
- Todos los textos de los componentes (`NarrativePanel`, `NodeModal`, `ReferenceModal`, `SearchBar`, `CanvasLegend`, `CodeBlock`, popovers de enlaces) están en inglés fijo, y los 17 nodos nuevos + enlaces transversales nunca fueron traducidos al español.

#### Cambios detallados a realizar
1. **Conectar `useI18n()` en el 100% de los componentes TSX:**
   - Cero strings literales de usuario en los archivos `.tsx`: botones de paginación, pestañas (`Estrategia` / `Código PySpark` / `Bajo el Capó`), encabezados (`Pregunta Guía`, `Sub-decisiones`, `Dependencias Previas`, `Relaciones Transversales`), tipos de nodo (`DECISIÓN`, `PROBLEMA`, `CONCEPTO`, `FASE`, `OPTIMIZACIÓN`), tipos de enlace (`Causa → Efecto`, `Restricción`, `Mitigación`, `Habilitador`, `Determinante`, `Disparador`, `Riesgo de ejecución`), placeholders de búsqueda, estados vacíos, leyenda y botón copiar.
2. **Completar `src/locales/es/graph.json` con criterio de Ingeniería de Datos:**
   - Traducción cuidada de las **7 fases** (`label` y `description`), los **49 nodos** (`nombre` y `pregunta_guia`) y las **18 descripciones** de `enlaces_transversales`.
   - **Criterio terminológico:** Se conservan en inglés los términos técnicos canónicos de Apache Spark que en el mundo hispanohablante no se traducen (*Shuffle*, *Broadcast Hash Join*, *Sort Merge Join*, *Data Skew*, *Watermarking*, *Predicate Pushdown*, *Checkpoint*, *DAG*, *Stage*, *AQE*, *Coalesce*, *Repartition*), explicándolos con naturalidad en español técnico claro.

#### Archivos afectados
- Modificar: `src/locales/es/ui.json`, `src/locales/en/ui.json`, `src/locales/es/graph.json`, `src/locales/en/graph.json` y todos los componentes en `src/components/`.

#### Cómo probarlo en DEV
- Alternar `ES` ↔ `EN` en cualquier fase, con un nodo abierto y en el Mapa Completo: comprobar que el stepper, el panel narrativo, los títulos de los 49 nodos, las etiquetas de los enlaces transversales, la leyenda y todas las pestañas de `NodeModal` cambian de idioma al instante sin ningún texto mezclado.

---

### Cambio #12 — Traducción completa ES/EN de la Enciclopedia Spark (13 secciones, 30 entradas) + Enlaces Oficiales + Validador i18n

#### Problema actual
- Las 30 entradas técnicas de `spark_reference.json` (`description`, `when_to_use`, `edge_cases`, subtítulos y títulos de sección) están únicamente en inglés y no enlazan a la documentación oficial de Apache Spark 3.5.

#### Cambios detallados a realizar
1. **Traducir íntegramente `src/locales/es/reference.json`:**
   - Las **13 secciones** (`title`, `description`) y las **30 entradas** (`title`, `subtitle`, `description`, `when_to_use` y cada ítem de `edge_cases[]`).
2. **Añadir campo `official_docs_url` en `reference.structure.json`:**
   - Incluir en cada sección/entrada el enlace directo a la guía oficial de Apache Spark 3.5 (ej. *SQL Performance Tuning*, *Structured Streaming Programming Guide*, *Cluster Mode Overview*, *PySpark API Reference*), renderizado en `ReferenceModal` como enlace externo `↗ Docs oficiales de Spark 3.5`.
3. **Crear verificador estricto de cobertura i18n (`npm run i18n:check`):**
   - Ampliar `scripts/parser.ts` (o `scripts/check-i18n.ts`) para comprobar que **toda clave** de `ui.json`, **los 49 nodos**, **las 7 fases**, **los 18 enlaces**, **las 13 secciones** y **las 30 entradas** (con el mismo número de `edge_cases`) estén presentes y no vacías tanto en `en` como en `es`.

#### Archivos afectados
- Modificar: `src/data/reference.structure.json`, `src/locales/es/reference.json`, `src/locales/en/reference.json`, `src/components/ReferenceModal.tsx`, `scripts/parser.ts`, `package.json`.

#### Cómo probarlo en DEV
- Ejecutar `npm run i18n:check` y verificar cobertura `100%` en `es` y `en` con `0` claves faltantes.
- Abrir `📚 Enciclopedia` en español e inglés, revisar entradas complejas (Joins, Window Functions, Memory Management, Streaming, AQE) y probar los enlaces a la documentación oficial de Spark 3.5.

---

## Bloque 4: Documentación In-App (Experiencia de Aprendizaje Autosuficiente)

### Cambio #13 — Modal de Ayuda (`?`), Guía de Lectura del Grafo y Glosario Spark Bilingüe

#### Problema actual
- La aplicación asume que el usuario ya entiende la metodología del grafo de decisiones y toda la terminología interna de Spark. No existe sección de ayuda, ni glosario de consulta rápida, ni referencia de atajos.

#### Cambios detallados a realizar
1. **Crear `src/components/HelpModal.tsx` y botón `?` en la barra superior:**
   - Se abre haciendo click en `?` o pulsando la tecla `?`.
   - Organizado en **4 pestañas bilingües (ES / EN)**:
     1. **🧭 Cómo usar esta guía:** Explica la filosofía *Just-In-Time Learning* en 4 pasos (1. Recorrer las 6 fases en orden, 2. Inspeccionar nodos y sus preguntas guía, 3. Analizar trade-offs en enlaces punteados, 4. Profundizar con código y diagramas en la Enciclopedia).
     2. **🎨 Guía Visual del Grafo:** Explicación detallada con ejemplos visuales de qué diferencia a una *Fase*, una *Decisión*, un *Problema*, un *Concepto* y una *Optimización*, qué implica bajar de `L1` a `L4`, y el catálogo de los 7 tipos de relaciones transversales.
     3. **📖 Glosario Spark (~25 conceptos clave):** Buscable instantáneamente dentro del modal (incluye *Application, Driver, Executor, Cluster Manager, Job, Stage, Task, DAG, Narrow vs Wide Transformation, Shuffle, Partition, Data Skew, Salting, Broadcast, Spill, Catalyst Optimizer, Tungsten, AQE, Predicate Pushdown, Column Pruning, Lineage, Cache vs Persist, Checkpoint, Watermark, Trigger*), con botón para saltar al nodo o sección de enciclopedia relacionado.
     4. **⌨️ Atajos y Acerca de:** Tabla de atajos de teclado (`/`, `Ctrl+K`, `←`, `→`, `Esc`, `?`), versión objetivo (**Apache Spark 3.5 / PySpark**), y enlace al repositorio.
2. **Almacenar textos en `src/locales/{es,en}/help.json`** validados también por `npm run i18n:check`.

#### Archivos afectados
- Crear: `src/components/HelpModal.tsx`, `src/locales/en/help.json`, `src/locales/es/help.json`.
- Modificar: `src/context/I18nContext.tsx`, `src/components/NarrativePanel.tsx`, `src/components/SparkFlow.tsx`, `src/index.css`, `scripts/parser.ts`.

#### Cómo probarlo en DEV
- Pulsar `?` en el teclado o el botón de ayuda, recorrer las 4 pestañas en Español e Inglés, filtrar términos en el Glosario y saltar desde un término (ej. *Watermark* o *AQE*) directamente a su nodo del grafo.

---

### Cambio #14 — Tour Guiado Interactivo de Primera Visita (Onboarding Bilingüe)

#### Problema actual
- Quien abre la aplicación por primera vez se enfrenta a un panel lateral, un stepper, un lienzo interactivo y buscadores sin ningún recorrido introductorio.

#### Cambios detallados a realizar
1. **Crear componente ligero propio `src/components/OnboardingTour.tsx` (cero dependencias pesadas externas):**
   - Utiliza posicionamiento dinámico (`getBoundingClientRect()`) + máscara SVG con *spotlight* resaltando cada zona real de la interfaz en **5 pasos breves (~30 segundos)**:
     1. **Bienvenida & Idioma/Tema:** Presenta el objetivo de la herramienta y permite elegir idioma (`ES`/`EN`) y tema (`Dark`/`Light`) ahí mismo en el paso 1.
     2. **El Recorrido de 6 Fases (Stepper):** Explica cómo avanzar paso a paso desde Infraestructura hasta Optimización.
     3. **El Grafo de Decisiones (Canvas):** Muestra cómo leer los nodos, sus íconos (`💻`, `📊`, `📚`) y las líneas de trade-offs.
     4. **Enciclopedia & Buscador (`Ctrl+K`):** Enseña cómo acceder al catálogo de 30 artículos con código PySpark y diagramas bajo el capó.
     5. **Mapa Completo, Leyenda y Ayuda (`?`):** Indica dónde consultar el glosario o volver a lanzar el tour cuando quiera.
2. **Comportamiento respetuoso con el usuario:**
   - Se activa automáticamente solo si `localStorage.getItem('spark_onboarding_completed')` no existe.
   - Incluye contador `1 / 5`, botones `Anterior`, `Siguiente`, `Finalizar` y botón siempre visible `Saltar tour` (además de cerrar con `Escape`).
   - En `HelpModal.tsx` se añade el botón `🎯 Repetir tour de bienvenida` para poder lanzarlo manualmente en cualquier momento.

#### Archivos afectados
- Crear: `src/components/OnboardingTour.tsx`.
- Modificar: `src/components/HelpModal.tsx`, `src/components/SparkFlow.tsx`, `src/locales/{es,en}/ui.json`, `src/index.css`.

#### Cómo probarlo en DEV
- Borrar `spark_onboarding_completed` en `localStorage` (o abrir ventana de incógnito), verificar el spotlight en cada uno de los 5 pasos, cambiar de idioma en pleno tour, probar `Saltar tour` y luego relanzarlo desde el modal de Ayuda (`?`).

---

## Bloque 5: Documentación Técnica del Repositorio y Calidad en CI/CD

### Cambio #15 — Documentación del Repositorio (`README.md`, `README.en.md`, `CONTRIBUTING.md`, `docs/ARCHITECTURE.md`), JSON Schemas y CI

#### Problema actual
- `README.md` documenta rutas falsas (`src/models/spark_pipeline_architecture.json`), afirma que la Fase 1 de Streaming está pendiente (cuando ya fue implementada) y no menciona cómo validar datos ni el soporte bilingüe.
- No existe documentación para futuros colaboradores ni JSON Schemas que den autocompletado al editar nodos/referencias en VS Code.
- `.github/workflows/deploy.yml` construye la imagen Docker sin correr antes el validador de integridad/i18n, y `Dockerfile` deja un comentario pendiente sobre el puerto `$PORT` de Cloud Run en Nginx.

#### Cambios detallados a realizar
1. **Reescribir `README.md` (Español) y crear `README.en.md` (Inglés) enlazados entre sí en la cabecera:**
   - Descripción clara del producto, tabla actualizada de las 6 fases + vista global, características UX (Grafo interactivo, Enciclopedia de 30 tópicos, Búsqueda instantánea, Bilingüe ES/EN, Modo Claro/Oscuro, Glosario), requisitos, comandos (`npm run dev`, `npm run validate`, `npm run i18n:check`, `npm run build`), estructura real del proyecto y guía de despliegue.
2. **Crear `CONTRIBUTING.md`:**
   - Receta paso a paso con ejemplos reales para:
     - Añadir un nuevo nodo al grafo y vincularlo a una fase.
     - Añadir un enlace transversal entre nodos.
     - Añadir una nueva sección o artículo a la Enciclopedia con código PySpark y diagrama Mermaid.
     - Añadir traducciones en `src/locales/{es,en}/` o incorporar un tercer idioma.
     - Ejecutar `npm run validate` antes de abrir un Pull Request desde `dev` hacia `main`.
3. **Crear `docs/ARCHITECTURE.md`:**
   - Documentación técnica con diagramas Mermaid explicando: arquitectura de componentes React, modelo de datos del grafo dirigido + enlaces transversales, motor de layout Dagre + React Flow, y pipeline de fusión i18n con fallback.
4. **Crear JSON Schemas en `schemas/`:**
   - `schemas/graph.structure.schema.json` y `schemas/reference.structure.schema.json`, referenciables con `"$schema"` para tener validación en vivo y tooltips en VS Code.
5. **Blindar CI/CD y contenedor de producción:**
   - Asegurar que `npm run build` ejecute `npm run validate && tsc && vite build` (o añadir el step explícito de validación en `.github/workflows/deploy.yml`) para que jamás llegue a producción un JSON roto o una traducción incompleta.
   - Revisar configuración de Nginx/puerto en `Dockerfile` para Cloud Run si corresponde.

#### Archivos afectados
- Crear: `README.en.md`, `CONTRIBUTING.md`, `docs/ARCHITECTURE.md`, `schemas/graph.structure.schema.json`, `schemas/reference.structure.schema.json`.
- Modificar: `README.md`, `package.json`, `.github/workflows/deploy.yml`.

#### Cómo probarlo en DEV
- Ejecutar `npm run validate` y `npm run build` completos, verificar que los enlaces relativos entre `README.md`, `README.en.md`, `CONTRIBUTING.md` y `docs/ARCHITECTURE.md` resuelven correctamente y que VS Code reconoce los `$schema` en los archivos JSON.
