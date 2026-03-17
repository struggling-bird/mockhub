import React, { useMemo, useRef } from 'react';

interface JsonCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  minHeightClassName?: string;
}

const tokenRegex =
  /("(?:[^"\\]|\\.)*"(?=\s*:))|("(?:[^"\\]|\\.)*")|(\btrue\b|\bfalse\b|null\b)|(\b-?\d+(?:\.\d+)?\b)|([{}\[\]:,])/g;

const JsonCodeEditor: React.FC<JsonCodeEditorProps> = ({
  value,
  onChange,
  onBlur,
  minHeightClassName = 'min-h-[320px]',
}) => {
  const highlightRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const highlightedLines = useMemo(() => {
    return value.split('\n').map((line, lineIndex) => {
      const nodes: React.ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      tokenRegex.lastIndex = 0;

      while ((match = tokenRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          nodes.push(
            <span key={`text-${lineIndex}-${lastIndex}`}>
              {line.slice(lastIndex, match.index)}
            </span>,
          );
        }

        const token = match[0];
        let className = 'text-slate-300';

        if (match[1]) {
          className = 'text-sky-300 font-semibold';
        } else if (match[2]) {
          className = 'text-emerald-300';
        } else if (match[3]) {
          className = 'text-violet-300';
        } else if (match[4]) {
          className = 'text-amber-300';
        } else if (match[5]) {
          className = 'text-slate-500';
        }

        nodes.push(
          <span key={`token-${lineIndex}-${match.index}`} className={className}>
            {token}
          </span>,
        );
        lastIndex = match.index + token.length;
      }

      if (lastIndex < line.length) {
        nodes.push(
          <span key={`tail-${lineIndex}-${lastIndex}`}>
            {line.slice(lastIndex)}
          </span>,
        );
      }

      return (
        <div key={`line-${lineIndex}`} className="min-h-[1.4em]">
          {nodes.length > 0 ? nodes : <span>&nbsp;</span>}
        </div>
      );
    });
  }, [value]);

  const syncScroll = () => {
    if (!highlightRef.current || !textareaRef.current) return;
    highlightRef.current.scrollTop = textareaRef.current.scrollTop;
    highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 ${minHeightClassName}`}
    >
      <pre
        ref={highlightRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-auto p-3 font-mono text-[11px] leading-6 text-slate-200"
      >
        {highlightedLines}
      </pre>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onScroll={syncScroll}
        spellCheck={false}
        wrap="off"
        className="absolute inset-0 resize-none overflow-auto bg-transparent p-3 font-mono text-[11px] leading-6 text-transparent caret-slate-100 selection:bg-blue-500/30 focus:outline-none"
      />
    </div>
  );
};

export default JsonCodeEditor;
