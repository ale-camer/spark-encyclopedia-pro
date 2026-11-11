import type { LanguageCode } from './languages';

import enRef from './reference/en.json';
import esRef from './reference/es.json';
import zhRef from './reference/zh.json';
import hiRef from './reference/hi.json';
import ptRef from './reference/pt.json';
import frRef from './reference/fr.json';
import deRef from './reference/de.json';
import jaRef from './reference/ja.json';
import koRef from './reference/ko.json';
import ruRef from './reference/ru.json';
import arRef from './reference/ar.json';
import itRef from './reference/it.json';
import trRef from './reference/tr.json';
import nlRef from './reference/nl.json';
import plRef from './reference/pl.json';
import viRef from './reference/vi.json';
import idRef from './reference/id.json';
import thRef from './reference/th.json';
import ukRef from './reference/uk.json';
import svRef from './reference/sv.json';

export interface LocalizedSectionText {
  title: string;
  description: string;
}

export interface LocalizedEntryText {
  title: string;
  subtitle: string;
  description: string;
  when_to_use: string;
  edge_cases?: string[];
}

export interface ReferenceLocaleDictionary {
  sections?: Record<string, LocalizedSectionText>;
  entries?: Record<string, LocalizedEntryText>;
}

export const REFERENCE_LOCALES: Record<LanguageCode, ReferenceLocaleDictionary> = {
  en: enRef as ReferenceLocaleDictionary,
  es: esRef as ReferenceLocaleDictionary,
  zh: zhRef as ReferenceLocaleDictionary,
  hi: hiRef as ReferenceLocaleDictionary,
  pt: ptRef as ReferenceLocaleDictionary,
  fr: frRef as ReferenceLocaleDictionary,
  de: deRef as ReferenceLocaleDictionary,
  ja: jaRef as ReferenceLocaleDictionary,
  ko: koRef as ReferenceLocaleDictionary,
  ru: ruRef as ReferenceLocaleDictionary,
  ar: arRef as ReferenceLocaleDictionary,
  it: itRef as ReferenceLocaleDictionary,
  tr: trRef as ReferenceLocaleDictionary,
  nl: nlRef as ReferenceLocaleDictionary,
  pl: plRef as ReferenceLocaleDictionary,
  vi: viRef as ReferenceLocaleDictionary,
  id: idRef as ReferenceLocaleDictionary,
  th: thRef as ReferenceLocaleDictionary,
  uk: ukRef as ReferenceLocaleDictionary,
  sv: svRef as ReferenceLocaleDictionary,
};
