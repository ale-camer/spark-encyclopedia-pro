import { SparkPipelineGraph, SparkNode, TransversalLink } from '../models/types';
import * as fs from 'fs';
import * as path from 'path';

export class GraphValidator {
  private graph: SparkPipelineGraph;
  private nodeIds: Set<string>;

  constructor(jsonPath: string) {
    const rawData = fs.readFileSync(path.resolve(jsonPath), 'utf-8');
    this.graph = JSON.parse(rawData) as SparkPipelineGraph;
    this.nodeIds = new Set();
  }

  public validate(): boolean {
    let isValid = true;
    console.log(`Iniciando validación del grafo: ${this.graph.metadata.titulo}`);

    // Validación 1: Unicidad de IDs
    for (const nodo of this.graph.nodos) {
      if (this.nodeIds.has(nodo.id)) {
        console.error(`❌ Error Duplicado: El nodo ID '${nodo.id}' está duplicado.`);
        isValid = false;
      }
      this.nodeIds.add(nodo.id);
    }

    // Validación 2: Integridad de subdecisiones y dependencias
    for (const nodo of this.graph.nodos) {
      for (const sub of nodo.subdecisiones) {
        if (!this.nodeIds.has(sub)) {
          console.error(`❌ Referencia Rota: El nodo '${nodo.id}' referencia a '${sub}' en subdecisiones, pero no existe.`);
          isValid = false;
        }
      }

      for (const dep of nodo.dependencias) {
        if (!this.nodeIds.has(dep)) {
          console.error(`❌ Referencia Rota: El nodo '${nodo.id}' referencia a '${dep}' en dependencias, pero no existe.`);
          isValid = false;
        }
      }
    }

    // Validación 3: Integridad de enlaces transversales
    for (const enlace of this.graph.enlaces_transversales) {
      if (!this.nodeIds.has(enlace.origen)) {
        console.error(`❌ Enlace Roto: El enlace '${enlace.id}' tiene origen inválido '${enlace.origen}'.`);
        isValid = false;
      }
      if (!this.nodeIds.has(enlace.destino)) {
        console.error(`❌ Enlace Roto: El enlace '${enlace.id}' tiene destino inválido '${enlace.destino}'.`);
        isValid = false;
      }
    }

    if (isValid) {
      console.log(`✅ Grafo válido. Total nodos: ${this.graph.nodos.length}, Total enlaces: ${this.graph.enlaces_transversales.length}`);
    } else {
      console.error(`❌ Se encontraron errores de integridad en el JSON.`);
    }

    return isValid;
  }

  public getGraph(): SparkPipelineGraph {
    return this.graph;
  }
}
