import React, { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from '../context/ThemeContext';

interface MermaidChartProps {
  chart: string;
  id?: string;
}

export const MermaidChart: React.FC<MermaidChartProps> = ({ chart, id }) => {
  const { isLightMode } = useTheme();
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const renderDiagram = async () => {
      try {
        setRenderError(null);
        mermaid.initialize({
          startOnLoad: false,
          theme: isLightMode ? 'default' : 'dark',
          securityLevel: 'loose',
        });

        const uniqueDiagramId = `mermaid-${id ? id.replace(/[^a-zA-Z0-9]/g, '') : 'node'}-${reactId}-${isLightMode ? 'light' : 'dark'}-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueDiagramId, chart);

        if (!isCancelled) {
          setSvgContent(svg);
        }
      } catch (err) {
        if (!isCancelled) {
          setRenderError(err instanceof Error ? err.message : 'Error rendering diagram');
        }
      }
    };

    renderDiagram();

    return () => {
      isCancelled = true;
    };
  }, [chart, id, isLightMode, reactId]);

  if (renderError) {
    return (
      <div className="mermaid-container">
        <pre className="terminal-output" style={{ width: '100%' }}>
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  return (
    <div
      className="mermaid-container"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
