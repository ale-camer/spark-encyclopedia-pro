import type { LanguageCode } from './languages';

import enGraph from './graph/en.json';
import esGraph from './graph/es.json';
import zhGraph from './graph/zh.json';
import hiGraph from './graph/hi.json';
import ptGraph from './graph/pt.json';
import frGraph from './graph/fr.json';
import deGraph from './graph/de.json';
import jaGraph from './graph/ja.json';
import koGraph from './graph/ko.json';
import ruGraph from './graph/ru.json';
import arGraph from './graph/ar.json';
import itGraph from './graph/it.json';
import trGraph from './graph/tr.json';
import nlGraph from './graph/nl.json';
import plGraph from './graph/pl.json';
import viGraph from './graph/vi.json';
import idGraph from './graph/id.json';
import thGraph from './graph/th.json';
import ukGraph from './graph/uk.json';
import svGraph from './graph/sv.json';

export interface LocalizedStepText {
  label: string;
  description: string;
}

export interface LocalizedNodeText {
  nombre: string;
  pregunta_guia?: string | null;
}

export interface GraphLocaleDictionary {
  steps?: Record<string, LocalizedStepText>;
  nodes?: Record<string, LocalizedNodeText>;
  edges?: Record<string, string>;
}

export const GRAPH_LOCALES: Record<LanguageCode, GraphLocaleDictionary> = {
  en: enGraph as GraphLocaleDictionary,
  es: esGraph as GraphLocaleDictionary,
  zh: zhGraph as GraphLocaleDictionary,
  hi: hiGraph as GraphLocaleDictionary,
  pt: ptGraph as GraphLocaleDictionary,
  fr: frGraph as GraphLocaleDictionary,
  de: deGraph as GraphLocaleDictionary,
  ja: jaGraph as GraphLocaleDictionary,
  ko: koGraph as GraphLocaleDictionary,
  ru: ruGraph as GraphLocaleDictionary,
  ar: arGraph as GraphLocaleDictionary,
  it: itGraph as GraphLocaleDictionary,
  tr: trGraph as GraphLocaleDictionary,
  nl: nlGraph as GraphLocaleDictionary,
  pl: plGraph as GraphLocaleDictionary,
  vi: viGraph as GraphLocaleDictionary,
  id: idGraph as GraphLocaleDictionary,
  th: thGraph as GraphLocaleDictionary,
  uk: ukGraph as GraphLocaleDictionary,
  sv: svGraph as GraphLocaleDictionary,
};
