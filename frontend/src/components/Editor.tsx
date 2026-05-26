import { useRef, useEffect, useState, useCallback } from "react"
import type { FileTab } from "../App"
import { tokenize } from "../utils/tokenizer"

interface Props {
  file: FileTab
  onChange: (content: string) => void
}

export default function Editor({ file, onChange }: Props) {
  const [lines, setLines] = useState(() => file.content.split("\n"))
  const [cursor, setCursor] = useState({ line: 0, col: 0 })
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Sync lines from textarea (native editing)
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setLines(val.split("\n"))
    onChange(val)
  }, [onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget
    if (e.key === "Tab") {
      e.preventDefault()
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const val = ta.value
      const newVal = val.slice(0, start) + "    " + val.slice(end)
      ta.value = newVal
      ta.selectionStart = ta.selectionEnd = start + 4
      setLines(newVal.split("\n"))
      onChange(newVal)
    }
  }, [onChange])

  const updateCursor = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    const before = ta.value.slice(0, ta.selectionStart)
    const lineIndex = before.split("\n").length - 1
    const colIndex = before.split("\n").pop()?.length ?? 0
    setCursor({ line: lineIndex, col: colIndex })
  }, [])

  return (
    <div className="editor" ref={scrollRef}>
      <div className="editor__inner">
        {/* Line numbers */}
        <div className="editor__gutter">
          {lines.map((_, i) => (
            <div
              key={i}
              className={`editor__line-num ${i === cursor.line ? "editor__line-num--active" : ""}`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Syntax-highlighted overlay */}
        <div className="editor__highlight" aria-hidden>
          {lines.map((line, i) => (
            <div key={i} className="editor__line">
              <span dangerouslySetInnerHTML={{ __html: tokenize(line, file.language) || "&nbsp;" }} />
            </div>
          ))}
        </div>

        {/* Actual textarea (transparent, on top) */}
        <textarea
          ref={textareaRef}
          className="editor__textarea"
          defaultValue={file.content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={updateCursor}
          onClick={updateCursor}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  )
}
