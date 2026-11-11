import React, { useState } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';

SyntaxHighlighter.registerLanguage('python', python);

interface CodeBlockProps {
  code: string;
  language?: string;
  label?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'python',
  label = 'PySpark',
}) => {
  const { isLightMode } = useTheme();
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-toolbar">
        <span className="code-block-lang">{label}</span>
        <button
          type="button"
          className={`code-copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title={t.copyBtn}
        >
          {copied ? t.copiedBtn : t.copyBtn}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={isLightMode ? oneLight : vscDarkPlus}
        className="code-block"
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};
