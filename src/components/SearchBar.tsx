import React, { useState, useEffect, useRef } from 'react';
import type { SparkNode, ReferenceSection } from '../models/types';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'node' | 'reference';
  section?: ReferenceSection; // If it's a reference entry, we need the section to open the modal
}

interface SearchBarProps {
  nodes: SparkNode[];
  refSections: ReferenceSection[];
  onResultClick: (nodeId: string) => void;
  onReferenceClick: (section: ReferenceSection, entryId: string) => void;
  placeholder: string;
  emptyText: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  nodes, 
  refSections, 
  onResultClick, 
  onReferenceClick,
  placeholder, 
  emptyText 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    // 1. Search Nodes
    const nodeResults: SearchResult[] = nodes
      .filter(n => 
        n.nombre.toLowerCase().includes(lowerQuery) || 
        n.pregunta_guia?.toLowerCase().includes(lowerQuery)
      )
      .map(n => ({
        id: n.id,
        title: n.nombre,
        subtitle: n.tipo,
        type: 'node'
      }));

    // 2. Search Reference Entries
    const referenceResults: SearchResult[] = [];
    refSections.forEach(section => {
      section.entries.forEach(entry => {
        if (
          entry.title.toLowerCase().includes(lowerQuery) || 
          entry.subtitle.toLowerCase().includes(lowerQuery) ||
          section.title.toLowerCase().includes(lowerQuery)
        ) {
          referenceResults.push({
            id: entry.id,
            title: entry.title,
            subtitle: `Ref: ${section.title}`,
            type: 'reference',
            section: section
          });
        }
      });
    });

    setResults([...nodeResults, ...referenceResults].slice(0, 10));
    setIsOpen(true);
  }, [query, nodes, refSections]);

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

  return (
    <div className="search-container" ref={wrapperRef}>
      <div className="search-input-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if(query.length > 0) setIsOpen(true) }}
        />
        {query && (
          <button className="search-clear" onClick={() => { setQuery(''); setIsOpen(false); }}>×</button>
        )}
      </div>
      
      {isOpen && (
        <div className="search-dropdown fade-in">
          {results.length > 0 ? (
             <ul className="search-results">
              {results.map((res, i) => (
                <li key={`${res.type}-${res.id}-${i}`} className="search-result-item" onClick={() => handleItemClick(res)}>
                   <div style={{ display: 'flex', flexDirection: 'column' }}>
                     <div className="search-result-title">{res.title}</div>
                     <div className="search-result-subtitle" style={{ fontSize: '0.75rem', opacity: 0.6 }}>{res.subtitle}</div>
                   </div>
                   <div className="search-result-type">
                     <span className={`modal-badge small ${res.type}`}>{res.type.toUpperCase()}</span>
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
