import React from 'react';

/**
 * Renders text that may contain inline ($...$) or display ($$...$$) LaTeX math
 * via global KaTeX loaded in index.html, with graceful plain-text fallback.
 */
export function renderKatexHtml(expr, displayMode = false) {
  if (typeof window !== 'undefined' && window.katex && typeof window.katex.renderToString === 'function') {
    try {
      return window.katex.renderToString(expr, {
        displayMode,
        throwOnError: false,
        strict: false
      });
    } catch {
      return null;
    }
  }
  return null;
}

export default function MathText({ text, displayMode = false, className = '' }) {
  if (!text) return null;
  const str = String(text);

  // If explicitly flagged as pure math expression (no $ delimiters)
  if (!str.includes('$') && displayMode) {
    const html = renderKatexHtml(str, true);
    if (html) {
      return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
    }
    return <span className={className}>{str}</span>;
  }

  // Parse $$...$$ and $...$ tokens
  const regex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{str.slice(lastIndex, match.index)}</span>);
    }
    const token = match[0];
    const isDisplay = token.startsWith('$$') && token.endsWith('$$');
    const expr = isDisplay ? token.slice(2, -2).trim() : token.slice(1, -1).trim();
    const html = renderKatexHtml(expr, isDisplay);
    if (html) {
      parts.push(
        <span
          key={key++}
          className={isDisplay ? 'block my-2 overflow-x-auto' : 'inline-block align-middle'}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } else {
      parts.push(<code key={key++} className="font-mono text-amber-300">{expr}</code>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < str.length) {
    parts.push(<span key={key++}>{str.slice(lastIndex)}</span>);
  }

  return <span className={className}>{parts}</span>;
}
