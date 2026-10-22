import React from 'react';

/**
 * High-performance, zero-dependency Markdown parser for educational text.
 * Converts bold (**text**), inline code (`code`), lists (- item, 1. item),
 * code fences (```), and paragraphs into clean React components.
 */
export const MarkdownView = ({ content, className = '' }) => {
  if (!content) return null;

  // Helper to parse inline markdown (bold, code, italic)
  const parseInline = (text) => {
    // Regex splits by code blocks `...`, bold **...**, and italic *...*
    const tokens = [];
    let current = text;
    let keyIdx = 0;

    // Pattern for inline code, bold, italic
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(current)) !== null) {
      // Plain text before match
      if (match.index > lastIndex) {
        tokens.push(current.substring(lastIndex, match.index));
      }

      const matchText = match[0];
      if (matchText.startsWith('`') && matchText.endsWith('`')) {
        tokens.push(
          <code key={keyIdx++} className="cyber-inline-code">
            {matchText.slice(1, -1)}
          </code>
        );
      } else if (matchText.startsWith('**') && matchText.endsWith('**')) {
        tokens.push(
          <strong key={keyIdx++} style={{ color: 'var(--neon-green)', fontWeight: 600 }}>
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
        tokens.push(
          <em key={keyIdx++} style={{ color: 'var(--neon-cyan)', fontStyle: 'italic' }}>
            {matchText.slice(1, -1)}
          </em>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < current.length) {
      tokens.push(current.substring(lastIndex));
    }

    return tokens.length > 0 ? tokens : text;
  };

  // Split lines into blocks
  const lines = content.trim().split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let currentList = [];
  let listType = null; // 'ul' or 'ol'

  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === 'ol') {
        elements.push(
          <ol key={`ol-${elements.length}`} style={{ paddingLeft: '22px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {currentList.map((item, i) => (
              <li key={i}>{parseInline(item)}</li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} style={{ paddingLeft: '22px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {currentList.map((item, i) => (
              <li key={i}>{parseInline(item)}</li>
            ))}
          </ul>
        );
      }
      currentList = [];
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Fenced Code Blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <pre key={`code-${elements.length}`} className="cyber-code-block" style={{ margin: '14px 0' }}>
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        // Start of code block
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Empty lines separate paragraphs / lists
    if (!trimmed) {
      flushList();
      continue;
    }

    // Unordered List (- item or * item)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      currentList.push(trimmed.slice(2));
      continue;
    }

    // Numbered List (1. item, 2. item)
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      currentList.push(olMatch[2]);
      continue;
    }

    // If it's a regular line, flush any active list
    flushList();

    // Headers (### Header)
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${elements.length}`} style={{ fontSize: '15px', color: 'var(--neon-cyan)', margin: '14px 0 8px 0', letterSpacing: '0.5px' }}>
          {parseInline(trimmed.slice(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${elements.length}`} style={{ fontSize: '17px', color: 'var(--neon-green)', margin: '16px 0 10px 0', letterSpacing: '0.5px' }}>
          {parseInline(trimmed.slice(3))}
        </h3>
      );
      continue;
    }

    // Standard Paragraph
    elements.push(
      <p key={`p-${elements.length}`} style={{ marginBottom: '12px', lineHeight: 1.75 }}>
        {parseInline(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className={`readable-prose ${className}`}>{elements}</div>;
};
