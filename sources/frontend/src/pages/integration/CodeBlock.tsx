import React, { useMemo } from 'react';

interface CodeBlockProps {
  code: string;
}

const keywordRegex =
  /\b(const|let|var|import|from|export|async|await|function|return|if|else|try|catch|throw|new)\b/g;
const stringRegex = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
const commentRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;
const numberRegex = /\b\d+(\.\d+)?\b/g;

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const highlighted = useMemo(() => {
    const lines = code.split('\n');
    return lines.map((line, lineIndex) => {
      const segments: React.ReactNode[] = [];
      let index = 0;

      const patterns = [
        { regex: commentRegex, className: 'text-slate-500' },
        { regex: stringRegex, className: 'text-emerald-300' },
        { regex: keywordRegex, className: 'text-sky-300 font-semibold' },
        { regex: numberRegex, className: 'text-amber-300' },
      ];

      while (index < line.length) {
        let earliestMatch: RegExpExecArray | null = null;
        let matchClass = '';

        for (const { regex, className } of patterns) {
          regex.lastIndex = index;
          const match = regex.exec(line);
          if (match && (earliestMatch === null || match.index < earliestMatch.index)) {
            earliestMatch = match;
            matchClass = className;
          }
        }

        if (!earliestMatch) {
          segments.push(
            <span key={`text-${lineIndex}-${index}`}>{line.slice(index)}</span>,
          );
          break;
        }

        if (earliestMatch.index > index) {
          segments.push(
            <span key={`text-${lineIndex}-${index}`}>{line.slice(index, earliestMatch.index)}</span>,
          );
        }

        segments.push(
          <span
            key={`token-${lineIndex}-${earliestMatch.index}`}
            className={matchClass}
          >
            {earliestMatch[0]}
          </span>,
        );

        index = earliestMatch.index + earliestMatch[0].length;
      }

      if (segments.length === 0) {
        segments.push(<span key={`empty-${lineIndex}`}>&nbsp;</span>);
      }

      return (
        <div key={`line-${lineIndex}`} className="min-h-[1.2em]">
          {segments}
        </div>
      );
    });
  }, [code]);

  return (
    <pre className="p-3 text-[11px] font-mono text-slate-100 overflow-auto leading-5">
      {highlighted}
    </pre>
  );
};

export default CodeBlock;

