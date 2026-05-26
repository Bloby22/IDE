import { useState, useRef, useEffect } from "react"
import { Trash2, X, ChevronRight } from "lucide-react"

interface TermLine {
  type: "input" | "output" | "error"
  text: string
}

interface Props {
  onClose: () => void
}

export default function Terminal({ onClose }: Props) {
  const [lines, setLines] = useState<TermLine[]>([])
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const [height, setHeight] = useState(200)
  const bottomRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startY: number; startH: number } | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [lines])

  const run = async (cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    setHistory((h) => [trimmed, ...h])
    setHistIdx(-1)
    setInput("")
    setLines((prev) => [...prev, { type: "input", text: trimmed }])

    try {
      const res = await fetch("http://localhost:8000/api/terminal/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: trimmed }),
      })
      const data = await res.json()
      setLines((prev) => [
        ...prev,
        { type: data.stderr ? "error" : "output", text: data.stdout || data.stderr || "" },
      ])
    } catch {
      setLines((prev) => [
        ...prev,
        { type: "error", text: "Cannot connect to backend (localhost:8000)" },
      ])
    }
  }

  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { startY: e.clientY, startH: height }
    const onMove = (ev: MouseEvent) => {
      const delta = dragRef.current!.startY - ev.clientY
      setHeight(Math.max(80, Math.min(600, dragRef.current!.startH + delta)))
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  return (
    <div className="terminal" style={{ height }}>
      <div className="terminal__resize-handle" onMouseDown={onMouseDown} />
      <div className="terminal__header">
        <span className="terminal__title">TERMINAL</span>
        <div className="terminal__actions">
          <button onClick={() => setLines([])} title="Clear">
            <Trash2 size={14} strokeWidth={1.6} />
          </button>
          <button onClick={onClose} title="Close">
            <X size={14} strokeWidth={1.6} />
          </button>
        </div>
      </div>
      <div className="terminal__body">
        {lines.map((l, i) => (
          <div key={i} className={`term-line term-line--${l.type}`}>
            {l.type === "input" && (
              <ChevronRight size={12} strokeWidth={2} className="term-prompt-icon" />
            )}
            {l.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="terminal__input-row">
        <ChevronRight size={13} strokeWidth={2} className="terminal__prompt-icon" />
        <input
          className="terminal__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") run(input)
            if (e.key === "ArrowUp") {
              const idx = Math.min(histIdx + 1, history.length - 1)
              setHistIdx(idx)
              setInput(history[idx] ?? "")
            }
            if (e.key === "ArrowDown") {
              const idx = Math.max(histIdx - 1, -1)
              setHistIdx(idx)
              setInput(idx === -1 ? "" : history[idx])
            }
          }}
          autoFocus
          spellCheck={false}
        />
      </div>
    </div>
  )
}
