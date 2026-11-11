# ⚡ Spark Pipeline Architecture & Encyclopedia

> 🌐 **Language / Idioma:** [Español (`README.md`)](./README.md) | **English**  
> 📖 **Technical Docs:** [Architecture (`docs/ARCHITECTURE.md`)](./docs/ARCHITECTURE.md) · [Contributing Guide (`CONTRIBUTING.md`)](./CONTRIBUTING.md) · [Improvement Plan (`PLAN_DE_MEJORAS.md`)](./PLAN_DE_MEJORAS.md)

An interactive architecture guide and technical encyclopedia designed to master the design, physical optimization, and bottleneck troubleshooting of **Apache Spark 3.5 (PySpark)** data pipelines.

Built around a **Just-In-Time Learning** philosophy, the platform fuses two core pillars:
1. **Guided Decision Graph (49 nodes + 18 cross-phase links):** A structured walk-through across **6 sequential architectural phases** (plus a complete 49-node overview) modeling hierarchical dependencies and real-world trade-offs across cluster infrastructure, data characteristics, transformations, physical execution, and runtime optimization.
2. **Spark Technical Encyclopedia (13 sections · 30 Deep Dive guides):** Contextually embedded reference articles inside key nodes, equipped with copy-ready PySpark snippets, physical execution plans (`explain()`), console outputs, and **Mermaid.js** under-the-hood architectural diagrams.

---

## ✨ Key Features

- 🗺️ **Dual Visual Exploration Modes (React Flow + Dagre):**
  - **Phase-by-Phase Guided Walkthrough:** Filters the graph at each step so engineers can focus on a single architectural stage without visual noise.
  - **Complete Overview (49 Nodes):** Smart `3×2` phase-cluster grid layout with automatic `Fit View` framing the entire pipeline architecture at a glance.
- 🔗 **Interactive Cross-Phase Trade-offs (`enlaces_transversales`):**
  - Full visibility into all **18 cross-phase relationships** (`causa_efecto`, `mitigacion`, `riesgo_ejecucion`, `restriccion`, `habilitador`, `determinante`, `disparador`) both directly on the canvas (with clickable dashed-edge popovers) and inside every node modal with one-click cross-phase navigation.
- 🧭 **Smart Collapsible & Interactive Left Panel:**
  - Compactable phase stepper with per-phase visited counters, interactive Guiding Question and Sub-Decision cards, and a collapsible mode with a floating top-left dock to maximize canvas space.
- 🔍 **Instant Unified Search (`/` or `Ctrl+K`):**
  - Accent-insensitive, full-text search across all **49 graph nodes** (titles, guiding questions, PySpark code) and **30 encyclopedia topics** (titles, `#oom` / `#skew` / `#catalyst` tags, syntax, and use cases), complete with keyboard navigation (`↑`, `↓`, `Enter`, `Esc`).
- 📚 **Full Encyclopedia Catalog:**
  - Accordion sidebar providing direct access to all **13 sections** and **30 technical deep-dives**, edge cases & pitfalls, and one-click code copying (`📋 Copy`).
- 🌗 **Unified Dark / Light Theme:**
  - Persistent theme switcher (`Dark` / `Light`) synchronized across the UI, React Flow canvas, PySpark syntax highlighting (`vscDarkPlus` / `oneLight`), and reactive **Mermaid** diagrams.
- ❓ **Built-in Help, Spark Glossary & Interactive Welcome Tour:**
  - Help modal (`?`) featuring a usage guide, visual conventions reference, a **filterable 18-term Spark Glossary** with direct node jump links, keyboard shortcuts table, and a **5-step Interactive Spotlight Tour**.
- 🔗 **URL State Synchronization:**
  - Every active phase, open node, encyclopedia entry, and canvas view mode syncs bidirectionally with URL query parameters (`?phase=...&node=...&ref=...&entry=...&view=full`), supporting shareable deep links and browser *Back / Forward* history.

---

## 🛣️ The 6-Phase Pipeline Journey

| Step | Phase | Core Architectural Decisions | Key Nodes |
| :---: | :--- | :--- | :--- |
| **1** | **🌐 The Complete Journey** | End-to-end macro view of how early infrastructure & data decisions shape final execution. | **49 nodes** arranged in a `3×2` cluster grid |
| **2** | **Phase 0 · Infrastructure & Memory** | Cluster resource managers, deployment topologies, and the *Unified Memory Manager*. | `YARN` vs `K8s`, `Client` vs `Cluster`, `Execution vs Storage Memory` |
| **3** | **Phase 1 · Problem Context** | Processing paradigm, latency SLAs, trigger intervals, and late-arriving data state management. | `Batch` vs `Streaming`, `Triggers`, `Watermarking` |
| **4** | **Phase 2 · Data Characteristics** | Volume, key distribution (*Data Skew*), columnar storage formats, ACID tables, and nested schemas. | `Parquet/Delta/Iceberg`, `Predicate Pushdown`, `Data Skew`, `PII Governance` |
| **5** | **Phase 3 · Transformations** | Logical and physical operators for joining, aggregating, and ranking datasets at scale. | `Broadcast` vs `Sort-Merge Join`, `Hash` vs `Sort Agg`, `Window Functions` |
| **6** | **Phase 4 · Execution Implications** | How Catalyst & Tungsten compile the DAG, stage boundaries, and network/disk shuffle mechanics. | `Narrow vs Wide`, `Shuffle Read/Write`, `Stage Boundaries`, `Spill to Disk` |
| **7** | **Phase 5 · Optimization Strategies** | Partition tuning, memory/disk persistence, and dynamic runtime re-optimization. | `Repartition vs Coalesce`, `Cache vs Checkpoint`, `AQE (Coalesce, Skew Join, Broadcast)` |

---

## 📚 Spark Encyclopedia Sections (30 Deep Dives)

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

## 🚀 Getting Started

### Prerequisites
- **Node.js** `>= 20.x`
- **npm** `>= 10.x`

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
# → App running at http://localhost:5173
```

### Validation & Production Build
```bash
# Run the 7-rule cross-domain integrity validator (49 nodes, 18 cross-links, 13 sections, 30 entries)
npm run validate

# Run TypeScript type checking
npx tsc --noEmit

# Build production bundle (automatically runs `npm run validate`, `tsc`, and `vite build`)
npm run build

# Preview production build locally
npm run preview
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :---: | :--- |
| `/` or `Ctrl + K` (`Cmd + K`) | Focus the global search bar immediately |
| `↑` / `↓` and `Enter` | Navigate and select search dropdown results |
| `←` / `→` | Move to the previous / next architectural phase |
| `?` | Open / close the Help Guide & Spark Glossary |
| `Esc` | Close active modal, onboarding tour, or search dropdown |
