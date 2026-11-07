import React, { useState } from 'react';
import { Copy, CheckCheck } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-sql';

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);

  const highlightCode = (raw, language) => {
    try {
      const l = (language || 'python').toLowerCase();
      const prismLang = l.includes('cpp') || l.includes('c++') ? 'cpp'
        : l.includes('java') && !l.includes('script') ? 'java'
        : l.includes('sql') ? 'sql'
        : l.includes('js') || l.includes('javascript') ? 'javascript'
        : 'python';
      const grammar = Prism.languages[prismLang] || Prism.languages.python;
      return Prism.highlight(raw, grammar, prismLang);
    } catch {
      return raw;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="my-3 rounded-lg border border-zinc-800/90 bg-[#09090b] overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#121216] border-b border-zinc-800/80 text-[10px] font-mono text-zinc-400">
        <span className="uppercase tracking-wider text-amber-400/90">{lang || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          {copied ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3.5 font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: highlightCode(code, lang) }} />
      </pre>
    </div>
  );
}

function renderInline(text) {
  if (!text) return null;
  // Tokenize inline code `...` and bold **...** and italic *...*
  const tokens = [];
  let remaining = text;
  let key = 0;

  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(<span key={key++}>{remaining.slice(lastIndex, match.index)}</span>);
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[11.5px] text-amber-300"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(
        <strong key={key++} className="font-semibold text-zinc-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      tokens.push(
        <em key={key++} className="italic text-zinc-200">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < remaining.length) {
    tokens.push(<span key={key++}>{remaining.slice(lastIndex)}</span>);
  }

  return tokens;
}

export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  const normalized = String(content)
    .replace(/\r\r\n/g, '\n')
    .replace(/\r\n/g, '\n');

  // Split by fenced code blocks first
  const segments = [];
  const fenceRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIdx = 0;
  let match;

  while ((match = fenceRegex.exec(normalized)) !== null) {
    if (match.index > lastIdx) {
      segments.push({ type: 'markdown', text: normalized.slice(lastIdx, match.index) });
    }
    segments.push({
      type: 'code',
      lang: match[1] || 'python',
      code: match[2].replace(/\n$/, '')
    });
    lastIdx = fenceRegex.lastIndex;
  }
  if (lastIdx < normalized.length) {
    segments.push({ type: 'markdown', text: normalized.slice(lastIdx) });
  }

  const renderMarkdownBlock = (blockText, segIdx) => {
    const lines = blockText.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        i++;
        continue;
      }

      // Horizontal Rule
      if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
        elements.push(<hr key={`${segIdx}-hr-${i}`} className="border-zinc-800/80 my-4" />);
        i++;
        continue;
      }

      // Headings
      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={`${segIdx}-h4-${i}`} className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold mt-4 mb-1.5">
            {renderInline(trimmed.slice(5))}
          </h4>
        );
        i++;
        continue;
      }
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={`${segIdx}-h3-${i}`} className="text-sm font-semibold text-zinc-100 mt-5 mb-2 tracking-tight flex items-center gap-2">
            <span className="w-1 h-3.5 bg-amber-400 rounded-full inline-block"></span>
            <span>{renderInline(trimmed.slice(4))}</span>
          </h3>
        );
        i++;
        continue;
      }
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={`${segIdx}-h2-${i}`} className="font-serif text-xl text-zinc-100 mt-5 mb-2">
            {renderInline(trimmed.slice(3))}
          </h2>
        );
        i++;
        continue;
      }
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={`${segIdx}-h1-${i}`} className="font-serif text-2xl text-zinc-100 mt-5 mb-2">
            {renderInline(trimmed.slice(2))}
          </h1>
        );
        i++;
        continue;
      }

      // Markdown Table
      if (trimmed.startsWith('|') && i + 1 < lines.length && /^\s*\|[\s:-]+\|/.test(lines[i + 1])) {
        const headerCells = trimmed
          .split('|')
          .map(c => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        i += 2; // Skip header & separator
        const rows = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          const rowCells = lines[i]
            .trim()
            .split('|')
            .map(c => c.trim())
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
          rows.push(rowCells);
          i++;
        }
        elements.push(
          <div key={`${segIdx}-tbl-${i}`} className="my-3 overflow-x-auto rounded-lg border border-zinc-800/90 bg-[#09090b]">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#121216] text-zinc-400 font-mono text-[10px] uppercase border-b border-zinc-800">
                <tr>
                  {headerCells.map((hc, hIdx) => (
                    <th key={hIdx} className="px-3.5 py-2.5 font-semibold">
                      {renderInline(hc)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {rows.map((r, rIdx) => (
                  <tr key={rIdx} className="hover:bg-zinc-900/40">
                    {r.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3.5 py-2.5 leading-relaxed">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('>')) {
        const quoteLines = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
          i++;
        }
        elements.push(
          <blockquote
            key={`${segIdx}-bq-${i}`}
            className="my-3 pl-3.5 py-2 border-l-2 border-amber-400 bg-amber-500/[0.04] rounded-r text-xs text-zinc-300 leading-relaxed"
          >
            {renderInline(quoteLines.join(' '))}
          </blockquote>
        );
        continue;
      }

      // Unordered List
      if (/^[-*]\s+/.test(trimmed)) {
        const listItems = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^[-*]\s+/, ''));
          i++;
        }
        elements.push(
          <ul key={`${segIdx}-ul-${i}`} className="my-2.5 space-y-1.5 pl-1">
            {listItems.map((li, lIdx) => (
              <li key={lIdx} className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed">
                <span className="text-amber-400 font-mono text-xs mt-0.5">•</span>
                <span>{renderInline(li)}</span>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered List
      if (/^\d+\.\s+/.test(trimmed)) {
        const listItems = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
          i++;
        }
        elements.push(
          <ol key={`${segIdx}-ol-${i}`} className="my-2.5 space-y-1.5 pl-1">
            {listItems.map((li, lIdx) => (
              <li key={lIdx} className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed">
                <span className="text-amber-400 font-mono text-[11px] font-semibold mt-0.5">
                  0{lIdx + 1}
                </span>
                <span>{renderInline(li)}</span>
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Standard Paragraph
      elements.push(
        <p key={`${segIdx}-p-${i}`} className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed my-2">
          {renderInline(trimmed)}
        </p>
      );
      i++;
    }

    return elements;
  };

  return (
    <div className="space-y-1">
      {segments.map((seg, idx) =>
        seg.type === 'code' ? (
          <CodeBlock key={idx} lang={seg.lang} code={seg.code} />
        ) : (
          <React.Fragment key={idx}>{renderMarkdownBlock(seg.text, idx)}</React.Fragment>
        )
      )}
    </div>
  );
}

