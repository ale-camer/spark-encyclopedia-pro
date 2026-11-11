import React, { useState, useEffect, useRef } from 'react';
import type { SparkNode, ReferenceSection } from '../models/types';
import { useI18n } from '../context/I18nContext';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'node' | 'reference';
  section?: ReferenceSection;
  score: number;
}

interface SearchBarProps {
  nodes: SparkNode[];
  refSections: ReferenceSection[];
  onResultClick: (nodeId: string) => void;
  onReferenceClick: (section: ReferenceSection, entryId: string) => void;
  placeholder: string;
  emptyText: string;
}

const normalizeText = (value?: string | null): string =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const SearchBar: React.FC<SearchBarProps> = ({
  nodes,
  refSections,
  onResultClick,
  onReferenceClick,
  placeholder,
  emptyText,
}) => {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setIsOpen(false);
      setActiveIndex(0);
      return;
    }

    const normQuery = normalizeText(query.trim());

    // 1. Search Nodes (title, guiding question, id, type)
    const nodeResults: SearchResult[] = [];
    nodes.forEach((n) => {
      const normName = normalizeText(n.nombre);
      const normQ = normalizeText(n.pregunta_guia);
      const normId = normalizeText(n.id);

      let score = 0;
      if (normName.includes(normQuery)) score = normName.startsWith(normQuery) ? 100 : 80;
      else if (normId.includes(normQuery)) score = 60;
      else if (normQ.includes(normQuery)) score = 50;

      if (score > 0) {
        nodeResults.push({
          id: n.id,
          title: n.nombre,
          subtitle: `${t.nodeTypes[n.tipo] ?? n.tipo.toUpperCase()} (L${n.nivel})`,
          type: 'node',
          score,
        });
      }
    });

    // 2. Search Reference Entries (title, subtitle, tags, syntax, description, when_to_use)
    const referenceResults: SearchResult[] = [];
    refSections.forEach((section) => {
      const normSecTitle = normalizeText(section.title);
      section.entries.forEach((entry) => {
        const normTitle = normalizeText(entry.title);
        const normSub = normalizeText(entry.subtitle);
        const normSyntax = normalizeText(entry.syntax);
        const normTags = (entry.tags || []).map((tag) => normalizeText(tag)).join(' ');
        const normDesc = normalizeText(entry.description);
        const normWhen = normalizeText(entry.when_to_use);

        let score = 0;
        if (normTitle.includes(normQuery)) score = normTitle.startsWith(normQuery) ? 95 : 75;
        else if (normTags.includes(normQuery)) score = 70;
        else if (normSyntax.includes(normQuery)) score = 65;
        else if (normSub.includes(normQuery) || normSecTitle.includes(normQuery)) score = 55;
        else if (normDesc.includes(normQuery) || normWhen.includes(normQuery)) score = 40;

        if (score > 0) {
          referenceResults.push({
            id: entry.id,
            title: entry.title,
            subtitle: `${section.icon} ${section.title} · ${entry.subtitle}`,
            type: 'reference',
            section,
            score,
          });
        }
      });
    });

    const combined = [...nodeResults, ...referenceResults]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setResults(combined);
    setActiveIndex(0);
    setIsOpen(true);
  }, [query, nodes, refSections, t.nodeTypes]);

  // Global keyboard shortcut: '/' or Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }

      if (!isInputFocused && e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (result: SearchResult) => {
    if (result.type === 'node') {
      onResultClick(result.id);
    } else if (result.type === 'reference' && result.section) {
      onReferenceClick(result.section, result.id);
    }
    setIsOpen(false);
    setQuery('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = results[activeIndex];
      if (chosen) {
        handleItemClick(chosen);
      }
    }
  };

  return (
    <div className="search-container" ref={wrapperRef}>
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
          aria-label={placeholder}
        />
        {query ? (
          <button
            type="button"
            className="search-clear"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            aria-label={t.closeLabel}
          >
            ×
          </button>
        ) : (
          <kbd className="search-shortcut-hint" title="Press / or Ctrl+K to search">
            /
          </kbd>
        )}
      </div>

      {isOpen && (
        <div className="search-dropdown fade-in" role="listbox">
          {results.length > 0 ? (
            <ul className="search-results">
              {results.map((res, i) => (
                <li
                  key={`${res.type}-${res.id}-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  className={`search-result-item ${i === activeIndex ? 'active' : ''}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => handleItemClick(res)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div className="search-result-title">{res.title}</div>
                    <div
                      className="search-result-subtitle"
                      style={{ fontSize: '0.75rem', opacity: 0.7 }}
                    >
                      {res.subtitle}
                    </div>
                  </div>
                  <div className="search-result-type">
                    <span className={`modal-badge small ${res.type}`}>
                      {res.type === 'node' ? t.graphNodeBadge : t.encyclopediaBadge}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="search-empty">{emptyText}</div>
          )}
        </div>
      )}
    </div>
  );
};
