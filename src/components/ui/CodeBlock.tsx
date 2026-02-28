import React from 'react'
import { cn } from '../../utils/cn'

export interface CodeBlockProps {
  code: string
  language?: string
  className?: string
  showLineNumbers?: boolean
  maxLines?: number
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'json',
  className,
  showLineNumbers = false,
  maxLines,
}) => {
  const lines = code.split('\n')
  const displayLines = maxLines ? lines.slice(0, maxLines) : lines
  const isTruncated = maxLines && lines.length > maxLines

  return (
    <div
      className={cn(
        'relative bg-dark-900 rounded-lg border border-dark-700 overflow-hidden',
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-700 bg-dark-800/50">
        <span className="text-xs text-dark-400 font-mono">{language}</span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
        >
          Copy
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-dark-300">
          {displayLines.map((line, i) => (
            <div key={i} className="flex">
              {showLineNumbers && (
                <span className="text-dark-600 select-none pr-4 w-8 text-right">
                  {i + 1}
                </span>
              )}
              <code>{line}</code>
            </div>
          ))}
        </pre>
        {isTruncated && (
          <div className="mt-2 text-center text-xs text-dark-500">
            ... {lines.length - maxLines} more lines
          </div>
        )}
      </div>
    </div>
  )
}
