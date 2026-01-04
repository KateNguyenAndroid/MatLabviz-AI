import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathRendererProps {
  latex: string;
  block?: boolean;
  className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ latex, block = false, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(latex, containerRef.current, {
          throwOnError: false,
          displayMode: block,
        });
      } catch (e) {
        console.error("KaTeX render error:", e);
        containerRef.current.innerText = latex;
      }
    }
  }, [latex, block]);

  return <div ref={containerRef} className={`${className} ${block ? 'my-2' : 'inline-block'}`} />;
};

export default MathRenderer;