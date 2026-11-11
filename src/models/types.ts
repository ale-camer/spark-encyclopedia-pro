export interface Metadata {
  titulo: string;
  version: string;
  descripcion: string;
  nivel_audiencia: string;
  convenciones?: {
    tipos_nodo: Record<string, string>;
    tipos_enlace: Record<string, string>;
  };
}

export type NodeType = 'phase' | 'decision' | 'problem' | 'concept' | 'optimization';

export type EdgeRelationType =
  | 'cause_effect'
  | 'restriction'
  | 'mitigation'
  | 'enabler'
  | 'determinant'
  | 'trigger'
  | 'execution_risk';

export const EDGE_RELATION_LABELS: Record<EdgeRelationType, string> = {
  cause_effect: 'Cause → Effect',
  restriction: 'Restriction',
  mitigation: 'Mitigation',
  enabler: 'Enabler',
  determinant: 'Determinant',
  trigger: 'Trigger',
  execution_risk: 'Execution Risk',
};

export const EDGE_RELATION_COLORS: Record<EdgeRelationType, string> = {
  cause_effect: '#f97316',
  restriction: '#ef4444',
  mitigation: '#10b981',
  enabler: '#06b6d4',
  determinant: '#a855f7',
  trigger: '#eab308',
  execution_risk: '#e11d48',
};

export interface SparkNode {
  id: string;
  nombre: string;
  tipo: NodeType;
  nivel: number;
  pregunta_guia: string | null;
  subdecisiones: string[];
  dependencias: string[];
  codigo_pyspark?: string;
  salida_consola?: string;
  diagrama_mermaid?: string;
  reference_section_id?: string; // Links to a section in the Reference Library
}

export interface TransversalLink {
  id: string;
  origen: string;
  destino: string;
  tipo: EdgeRelationType;
  descripcion: string;
}

export interface SparkPipelineGraph {
  metadata: Metadata;
  nodos: SparkNode[];
  enlaces_transversales: TransversalLink[];
}

// ─── Reference Library Types ──────────────────────────────────────────────────

export interface ReferenceEntry {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  when_to_use: string;
  syntax: string;
  codigo_pyspark: string;
  salida_consola?: string;
  diagrama_mermaid?: string;
  edge_cases?: string[];
  tags: string[];
}

export interface ReferenceSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  entries: ReferenceEntry[];
}

export interface ReferenceLibrary {
  sections: ReferenceSection[];
}
