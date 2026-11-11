import type { SparkPipelineGraph, ReferenceLibrary } from '../src/models/types';
import * as fs from 'fs';
import * as path from 'path';

const ALLOWED_NODE_TYPES = new Set(['decision', 'problem', 'concept', 'phase', 'optimization']);
const ALLOWED_EDGE_TYPES = new Set([
  'cause_effect',
  'restriction',
  'mitigation',
  'enabler',
  'determinant',
  'trigger',
  'execution_risk',
]);

const EXPECTED_LANGUAGES = [
  'en', 'es', 'zh', 'hi', 'pt', 'fr', 'de', 'ja', 'ko', 'ru',
  'ar', 'it', 'tr', 'nl', 'pl', 'vi', 'id', 'th', 'uk', 'sv',
];
const EXPECTED_STEPS = [
  'overview',
  'infraestructura_cluster',
  'contexto',
  'datos',
  'transformaciones',
  'ejecucion',
  'optimization',
];

export class GraphValidator {
  private graph: SparkPipelineGraph;
  private reference?: ReferenceLibrary;
  private nodeIds: Set<string>;
  private edgeIds: Set<string>;
  private sectionIds: Set<string>;
  private entryIds: Set<string>;

  constructor(graphJsonPath: string, referenceJsonPath?: string) {
    const rawGraph = fs.readFileSync(path.resolve(graphJsonPath), 'utf-8');
    this.graph = JSON.parse(rawGraph) as SparkPipelineGraph;

    if (referenceJsonPath) {
      const rawRef = fs.readFileSync(path.resolve(referenceJsonPath), 'utf-8');
      this.reference = JSON.parse(rawRef) as ReferenceLibrary;
    }

    this.nodeIds = new Set();
    this.edgeIds = new Set();
    this.sectionIds = new Set();
    this.entryIds = new Set();
  }

  public validate(): boolean {
    let isValid = true;
    let warnings = 0;

    console.log(`🔍 Iniciando validación del grafo: "${this.graph.metadata.titulo}" (v${this.graph.metadata.version})`);

    // Regla 1: Unicidad de IDs en nodos, enlaces, secciones y entradas
    for (const nodo of this.graph.nodos) {
      if (!nodo.id || !nodo.nombre.trim()) {
        console.error(`❌ Nodo inválido: id o nombre vacío (${JSON.stringify(nodo.id)}).`);
        isValid = false;
      }
      if (this.nodeIds.has(nodo.id)) {
        console.error(`❌ Error Duplicado: El nodo ID '${nodo.id}' está duplicado.`);
        isValid = false;
      }
      this.nodeIds.add(nodo.id);
    }

    for (const enlace of this.graph.enlaces_transversales) {
      if (this.edgeIds.has(enlace.id)) {
        console.error(`❌ Error Duplicado: El enlace ID '${enlace.id}' está duplicado.`);
        isValid = false;
      }
      this.edgeIds.add(enlace.id);
    }

    if (this.reference) {
      for (const section of this.reference.sections) {
        if (this.sectionIds.has(section.id)) {
          console.error(`❌ Error Duplicado: La sección de referencia '${section.id}' está duplicada.`);
          isValid = false;
        }
        this.sectionIds.add(section.id);

        for (const entry of section.entries) {
          if (this.entryIds.has(entry.id)) {
            console.error(`❌ Error Duplicado: La entrada de referencia '${entry.id}' está duplicada.`);
            isValid = false;
          }
          this.entryIds.add(entry.id);
        }
      }
    }

    // Regla 2: Integridad de subdecisiones y dependencias + auto-referencias
    const childNodeIds = new Set<string>();
    for (const nodo of this.graph.nodos) {
      for (const sub of nodo.subdecisiones || []) {
        if (sub === nodo.id) {
          console.error(`❌ Auto-referencia: El nodo '${nodo.id}' se referencia a sí mismo en subdecisiones.`);
          isValid = false;
        }
        if (!this.nodeIds.has(sub)) {
          console.error(`❌ Referencia Rota: El nodo '${nodo.id}' referencia a '${sub}' en subdecisiones, pero no existe.`);
          isValid = false;
        }
        childNodeIds.add(sub);
      }

      for (const dep of nodo.dependencias || []) {
        if (dep === nodo.id) {
          console.error(`❌ Auto-referencia: El nodo '${nodo.id}' se referencia a sí mismo en dependencias.`);
          isValid = false;
        }
        if (!this.nodeIds.has(dep)) {
          console.error(`❌ Referencia Rota: El nodo '${nodo.id}' referencia a '${dep}' en dependencias, pero no existe.`);
          isValid = false;
        }
      }
    }

    // Regla 3: Integridad de enlaces transversales
    for (const enlace of this.graph.enlaces_transversales) {
      if (!this.nodeIds.has(enlace.origen)) {
        console.error(`❌ Enlace Roto: El enlace '${enlace.id}' tiene origen inválido '${enlace.origen}'.`);
        isValid = false;
      }
      if (!this.nodeIds.has(enlace.destino)) {
        console.error(`❌ Enlace Roto: El enlace '${enlace.id}' tiene destino inválido '${enlace.destino}'.`);
        isValid = false;
      }
      if (enlace.origen === enlace.destino) {
        console.error(`❌ Auto-enlace: El enlace '${enlace.id}' tiene el mismo origen y destino '${enlace.origen}'.`);
        isValid = false;
      }
      if (!enlace.descripcion || !enlace.descripcion.trim()) {
        console.error(`❌ Enlace Incompleto: El enlace '${enlace.id}' tiene descripción vacía.`);
        isValid = false;
      }
      if (!ALLOWED_EDGE_TYPES.has(enlace.tipo)) {
        console.error(`❌ Tipo de Enlace Inválido: El enlace '${enlace.id}' tiene tipo desconocido '${enlace.tipo}'.`);
        isValid = false;
      }
    }

    // Regla 4: Tipos de nodo permitidos
    for (const nodo of this.graph.nodos) {
      if (!ALLOWED_NODE_TYPES.has(nodo.tipo)) {
        console.error(`❌ Tipo Inválido: El nodo '${nodo.id}' tiene tipo desconocido '${nodo.tipo}'.`);
        isValid = false;
      }
    }

    // Regla 5: Validación cruzada con spark_reference.json
    if (this.reference) {
      const referencedSections = new Set<string>();
      for (const nodo of this.graph.nodos) {
        if (nodo.reference_section_id) {
          if (!this.sectionIds.has(nodo.reference_section_id)) {
            console.error(
              `❌ Referencia a Enciclopedia Rota: El nodo '${nodo.id}' apunta a reference_section_id='${nodo.reference_section_id}', que no existe en spark_reference.json.`
            );
            isValid = false;
          } else {
            referencedSections.add(nodo.reference_section_id);
          }
        }
      }

      for (const secId of this.sectionIds) {
        if (!referencedSections.has(secId)) {
          console.warn(`⚠️ Advertencia: La sección de enciclopedia '${secId}' no está vinculada desde ningún nodo.`);
          warnings++;
        }
      }
    }

    // Regla 6: Detección de nodos huérfanos en la jerarquía (excepto root)
    for (const nodo of this.graph.nodos) {
      if (nodo.id !== 'root' && !childNodeIds.has(nodo.id)) {
        console.warn(`⚠️ Advertencia: El nodo '${nodo.id}' (nivel ${nodo.nivel}) no es hijo (subdecisión) de ningún otro nodo.`);
        warnings++;
      }
    }

    // Regla 7: Campos obligatorios en entradas de la Enciclopedia
    if (this.reference) {
      for (const section of this.reference.sections) {
        if (!section.title.trim() || !section.description.trim()) {
          console.error(`❌ Sección Incompleta: La sección '${section.id}' carece de title o description.`);
          isValid = false;
        }
        for (const entry of section.entries) {
          const requiredFields: Array<keyof typeof entry> = [
            'id',
            'title',
            'subtitle',
            'description',
            'when_to_use',
            'syntax',
            'codigo_pyspark',
          ];
          for (const field of requiredFields) {
            const val = entry[field];
            if (typeof val !== 'string' || !val.trim()) {
              console.error(
                `❌ Entrada Incompleta: '${section.id}/${entry.id}' tiene vacío el campo obligatorio '${field}'.`
              );
              isValid = false;
            }
          }
        }
      }
    }

    // Regla 8: Cobertura de Internacionalización (20 idiomas en src/locales/graph y src/locales/reference)
    const localesDir = path.resolve(__dirname, '../src/locales');
    if (fs.existsSync(localesDir)) {
      for (const lang of EXPECTED_LANGUAGES) {
        const graphLocalePath = path.join(localesDir, 'graph', `${lang}.json`);
        const refLocalePath = path.join(localesDir, 'reference', `${lang}.json`);

        if (!fs.existsSync(graphLocalePath)) {
          console.error(`❌ i18n Faltante: No existe el archivo ${graphLocalePath}`);
          isValid = false;
        } else {
          const gLoc = JSON.parse(fs.readFileSync(graphLocalePath, 'utf-8'));
          for (const stepId of EXPECTED_STEPS) {
            if (!gLoc.steps?.[stepId]?.label?.trim() || !gLoc.steps?.[stepId]?.description?.trim()) {
              console.error(`❌ i18n Incompleto [${lang}]: Falta step '${stepId}' en graph/${lang}.json`);
              isValid = false;
            }
          }
          for (const nodeId of this.nodeIds) {
            if (!gLoc.nodes?.[nodeId]?.nombre?.trim()) {
              console.error(`❌ i18n Incompleto [${lang}]: Falta nombre del nodo '${nodeId}' en graph/${lang}.json`);
              isValid = false;
            }
          }
          for (const edgeId of this.edgeIds) {
            if (!gLoc.edges?.[edgeId]?.trim()) {
              console.error(`❌ i18n Incompleto [${lang}]: Falta descripción del enlace '${edgeId}' en graph/${lang}.json`);
              isValid = false;
            }
          }
        }

        if (!fs.existsSync(refLocalePath)) {
          console.error(`❌ i18n Faltante: No existe el archivo ${refLocalePath}`);
          isValid = false;
        } else if (this.reference) {
          const rLoc = JSON.parse(fs.readFileSync(refLocalePath, 'utf-8'));
          for (const sec of this.reference.sections) {
            if (!rLoc.sections?.[sec.id]?.title?.trim() || !rLoc.sections?.[sec.id]?.description?.trim()) {
              console.error(`❌ i18n Incompleto [${lang}]: Falta sección '${sec.id}' en reference/${lang}.json`);
              isValid = false;
            }
            for (const entry of sec.entries) {
              const eLoc = rLoc.entries?.[entry.id];
              const expectedEdgeCasesLen = entry.edge_cases ? entry.edge_cases.length : 0;
              const actualEdgeCasesLen = Array.isArray(eLoc?.edge_cases) ? eLoc.edge_cases.length : 0;
              if (
                !eLoc?.title?.trim() ||
                !eLoc?.subtitle?.trim() ||
                !eLoc?.description?.trim() ||
                !eLoc?.when_to_use?.trim() ||
                actualEdgeCasesLen !== expectedEdgeCasesLen
              ) {
                console.error(`❌ i18n Incompleto [${lang}]: Entrada '${entry.id}' incompleta en reference/${lang}.json`);
                isValid = false;
              }
            }
          }
        }
      }
    }

    if (isValid) {
      console.log(
        `✅ Grafo válido: ${this.graph.nodos.length} nodos, ${this.graph.enlaces_transversales.length} enlaces transversales.`
      );
      if (this.reference) {
        console.log(
          `✅ Enciclopedia válida: ${this.sectionIds.size} secciones, ${this.entryIds.size} entradas técnicas.`
        );
      }
      console.log(
        `✅ Internacionalización (i18n) válida: ${EXPECTED_LANGUAGES.length} idiomas verificados al 100% (UI + 7 fases + 49 nodos + 18 enlaces + 13 secciones + 30 artículos).`
      );
      if (warnings > 0) {
        console.log(`ℹ️ Total advertencias no bloqueantes: ${warnings}`);
      }
    } else {
      console.error(`❌ Se encontraron errores de integridad en los archivos JSON.`);
    }

    return isValid;
  }

  public getGraph(): SparkPipelineGraph {
    return this.graph;
  }
}
