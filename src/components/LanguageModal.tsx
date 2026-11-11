import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../context/I18nContext';
import type { LanguageMeta } from '../locales/languages';

export const LanguageModal: React.FC = () => {
  const {
    lang,
    setLang,
    supportedLanguages,
    t,
    isLanguageModalOpen,
    closeLanguageModal,
  } = useI18n();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isLanguageModalOpen) {
      setQuery('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
    }
  }, [isLanguageModalOpen]);

  useEffect(() => {
    if (!isLanguageModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeLanguageModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLanguageModalOpen, closeLanguageModal]);

  if (!isLanguageModalOpen) return null;

  const normalizedQuery = query.trim().toLowerCase();
  const filteredLanguages = supportedLanguages.filter((item: LanguageMeta) => {
    if (!normalizedQuery) return true;
    return (
      item.code.toLowerCase().includes(normalizedQuery) ||
      item.nativeName.toLowerCase().includes(normalizedQuery) ||
      item.englishName.toLowerCase().includes(normalizedQuery) ||
      item.spanishName.toLowerCase().includes(normalizedQuery) ||
      item.region.toLowerCase().includes(normalizedQuery)
    );
  });

  const handleSelectLanguage = (code: LanguageMeta['code']) => {
    setLang(code);
    closeLanguageModal();
  };

  return (
    <div
      className="modal-backdrop language-modal-backdrop"
      onClick={closeLanguageModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
    >
      <div
        className="modal-content language-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header language-modal-header">
          <div>
            <h2 id="language-modal-title" className="modal-title">
              🌐 {t.selectLanguageTitle}
            </h2>
            <p className="language-modal-subtitle">{t.selectLanguageSubtitle}</p>
          </div>
          <button
            type="button"
            className="close-button"
            onClick={closeLanguageModal}
            aria-label={t.closeLabel}
            title={`${t.closeLabel} (Esc)`}
          >
            &times;
          </button>
        </div>

        <div className="language-search-bar">
          <span className="language-search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            ref={inputRef}
            type="text"
            className="language-search-input"
            placeholder={t.searchLanguagePlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="language-search-clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="language-grid-container">
          {filteredLanguages.length === 0 ? (
            <div className="language-empty-state">{t.noLanguagesFound}</div>
          ) : (
            <div className="language-grid">
              {filteredLanguages.map((item) => {
                const isSelected = item.code === lang;
                return (
                  <button
                    key={item.code}
                    type="button"
                    className={`language-card ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectLanguage(item.code)}
                  >
                    <div className="language-card-top">
                      <span className="language-flag" aria-hidden="true">
                        {item.flag}
                      </span>
                      <span className="language-iso-code">
                        {item.code.toUpperCase()}
                      </span>
                      {item.dir === 'rtl' && (
                        <span className="language-rtl-badge" title="Right-to-Left script">
                          RTL
                        </span>
                      )}
                      {isSelected && (
                        <span className="language-active-pill">
                          ✓ {t.activeLanguageBadge}
                        </span>
                      )}
                    </div>

                    <div className="language-native-name">{item.nativeName}</div>
                    <div className="language-secondary-name">
                      {item.englishName} · {item.spanishName}
                    </div>

                    <div className="language-card-footer">
                      <span className="language-region">{item.region}</span>
                      <span className="language-speakers">
                        ~{item.speakers} {t.speakersLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
