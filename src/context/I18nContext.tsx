import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_MAP,
  isValidLanguageCode,
} from '../locales/languages';
import type { LanguageCode, LanguageMeta } from '../locales/languages';
import { UI_DICTIONARIES } from '../locales/ui';
import type { UIDictionary } from '../locales/ui';
import { GRAPH_LOCALES } from '../locales/graphLocales';
import { REFERENCE_LOCALES } from '../locales/referenceLocales';
import { BASE_STEPS } from '../data/steps.structure';
import type { PipelineStep } from '../components/NarrativePanel';
import graphDataRaw from '../../spark_pipeline_architecture.json';
import referenceDataRaw from '../../spark_reference.json';
import type { SparkPipelineGraph, ReferenceLibrary } from '../models/types';

const baseGraphData = graphDataRaw as unknown as SparkPipelineGraph;
const baseReferenceData = referenceDataRaw as unknown as ReferenceLibrary;

interface I18nContextType {
  lang: LanguageCode;
  setLang: (code: LanguageCode) => void;
  currentLanguage: LanguageMeta;
  supportedLanguages: LanguageMeta[];
  t: UIDictionary;
  graphData: SparkPipelineGraph;
  referenceData: ReferenceLibrary;
  steps: PipelineStep[];
  isLanguageModalOpen: boolean;
  openLanguageModal: () => void;
  closeLanguageModal: () => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function detectInitialLanguage(): LanguageCode {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang')?.toLowerCase();
    if (isValidLanguageCode(urlLang)) {
      return urlLang;
    }

    const stored = localStorage.getItem('spark_lang')?.toLowerCase();
    if (isValidLanguageCode(stored)) {
      return stored;
    }

    const navLang = navigator.language?.split('-')[0]?.toLowerCase();
    if (isValidLanguageCode(navLang)) {
      return navLang;
    }
  }
  return 'en';
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LanguageCode>(detectInitialLanguage);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const setLang = (code: LanguageCode) => {
    if (!isValidLanguageCode(code)) return;
    setLangState(code);
    localStorage.setItem('spark_lang', code);
  };

  useEffect(() => {
    const meta = LANGUAGE_MAP[lang] || LANGUAGE_MAP.en;
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir;
    localStorage.setItem('spark_lang', lang);
  }, [lang]);

  const currentLanguage = LANGUAGE_MAP[lang] || LANGUAGE_MAP.en;
  const t = UI_DICTIONARIES[lang] || UI_DICTIONARIES.en;

  const graphData = useMemo<SparkPipelineGraph>(() => {
    const locale = GRAPH_LOCALES[lang];
    if (!locale || lang === 'en') return baseGraphData;

    return {
      ...baseGraphData,
      nodos: baseGraphData.nodos.map((node) => {
        const translatedNode = locale.nodes?.[node.id];
        if (!translatedNode) return node;
        return {
          ...node,
          nombre: translatedNode.nombre || node.nombre,
          pregunta_guia:
            translatedNode.pregunta_guia !== undefined
              ? translatedNode.pregunta_guia
              : node.pregunta_guia,
        };
      }),
      enlaces_transversales: baseGraphData.enlaces_transversales.map((edge) => {
        const translatedDesc = locale.edges?.[edge.id];
        if (!translatedDesc) return edge;
        return {
          ...edge,
          descripcion: translatedDesc,
        };
      }),
    };
  }, [lang]);

  const referenceData = useMemo<ReferenceLibrary>(() => {
    const locale = REFERENCE_LOCALES[lang];
    if (!locale || lang === 'en') return baseReferenceData;

    return {
      sections: baseReferenceData.sections.map((section) => {
        const translatedSection = locale.sections?.[section.id];
        return {
          ...section,
          title: translatedSection?.title || section.title,
          description: translatedSection?.description || section.description,
          entries: section.entries.map((entry) => {
            const translatedEntry = locale.entries?.[entry.id];
            if (!translatedEntry) return entry;
            return {
              ...entry,
              title: translatedEntry.title || entry.title,
              subtitle: translatedEntry.subtitle || entry.subtitle,
              description: translatedEntry.description || entry.description,
              when_to_use: translatedEntry.when_to_use || entry.when_to_use,
              edge_cases:
                translatedEntry.edge_cases && translatedEntry.edge_cases.length > 0
                  ? translatedEntry.edge_cases
                  : entry.edge_cases,
            };
          }),
        };
      }),
    };
  }, [lang]);

  const steps = useMemo<PipelineStep[]>(() => {
    const locale = GRAPH_LOCALES[lang];
    if (!locale?.steps || lang === 'en') return BASE_STEPS;

    return BASE_STEPS.map((step) => {
      const translatedStep = locale.steps?.[step.phaseId];
      if (!translatedStep) return step;
      return {
        ...step,
        label: translatedStep.label || step.label,
        description: translatedStep.description || step.description,
      };
    });
  }, [lang]);

  return (
    <I18nContext.Provider
      value={{
        lang,
        setLang,
        currentLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
        t,
        graphData,
        referenceData,
        steps,
        isLanguageModalOpen,
        openLanguageModal: () => setIsLanguageModalOpen(true),
        closeLanguageModal: () => setIsLanguageModalOpen(false),
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
};
