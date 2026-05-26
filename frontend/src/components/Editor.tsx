import { useRef, useEffect, useState, useCallback } from "react"
import type { FileTab } from "../App"
import type { Diagnostic } from "./ProblemsPanel"
import { tokenize } from "../utils/tokenizer"

interface Props {
  file: FileTab
  onChange: (content: string) => void
  onDiagnostics: (diags: Diagnostic[]) => void
}

export default function Editor({ file, onChange, onDiagnostics }: Props) {
  const [lines, setLines] = useState(() => file.content.split("\n"))
  const [cursor, setCursor] = useState({ line: 0, col: 0 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lspTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLines(file.content.split("\n"))
    if (textareaRef.current) textareaRef.current.value = file.content
  }, [file.content])

  const runDiagnostics = useCallback((content: string) => {
    if (lspTimer.current) clearTimeout(lspTimer.current)
    lspTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("http://localhost:8000/api/lsp/diagnostics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: file.path,
            content,
            language: file.language,
          }),
        })
        const data: Omit<Diagnostic, "file">[] = await res.json()
        onDiagnostics(data.map((d) => ({ ...d, file: file.path })))
      } catch {
        onDiagnostics([])
      }
    }, 800)
  }, [file.path, file.language, onDiagnostics])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setLines(val.split("\n"))
    onChange(val)
    runDiagnostics(val)
  }, [onChange, runDiagnostics])

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
      runDiagnostics(newVal)
    }
  }, [onChange, runDiagnostics])

  const updateCursor = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    const before = ta.value.slice(0, ta.selectionStart)
    const lineIndex = before.split("\n").length - 1
    const colIndex = before.split("\n").pop()?.length ?? 0
    setCursor({ line: lineIndex, col: colIndex })
  }, [])

  return (
    <div className="editor">
      <div className="editor__inner">
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

        <div className="editor__highlight" aria-hidden>
          {lines.map((line, i) => (
            <div key={i} className="editor__line">
              <span dangerouslySetInnerHTML={{ __html: tokenize(line, file.language) || "&nbsp;" }} />
            </div>
          ))}
        </div>

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