import { AlertCircle, AlertTriangle, Info, X } from "lucide-react"

export interface Diagnostic {
  file: string
  line: number
  col: number
  severity: "error" | "warning" | "info"
  message: string
}

interface Props {
  diagnostics: Diagnostic[]
  onClose: () => void
  onGotoLine: (file: string, line: number, col: number) => void
}

const ICON = {
  error:   <AlertCircle size={13} strokeWidth={2} style={{ color: "var(--red)", flexShrink: 0 }} />,
  warning: <AlertTriangle size={13} strokeWidth={2} style={{ color: "var(--yellow)", flexShrink: 0 }} />,
  info:    <Info size={13} strokeWidth={2} style={{ color: "var(--accent)", flexShrink: 0 }} />,
}

export default function ProblemsPanel({ diagnostics, onClose, onGotoLine }: Props) {
  const errors   = diagnostics.filter((d) => d.severity === "error").length
  const warnings = diagnostics.filter((d) => d.severity === "warning").length

  return (
    <div className="problems-panel">
      <div className="problems-panel__header">
        <div className="problems-panel__title">
          PROBLEMS
          {errors > 0 && (
            <span className="problems-badge problems-badge--error">
              <AlertCircle size={11} strokeWidth={2} /> {errors}
            </span>
          )}
          {warnings > 0 && (
            <span className="problems-badge problems-badge--warning">
              <AlertTriangle size={11} strokeWidth={2} /> {warnings}
            </span>
          )}
        </div>
        <button className="problems-panel__close" onClick={onClose}>
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>
      <div className="problems-panel__body">
        {diagnostics.length === 0 ? (
          <div className="problems-empty">No problems detected</div>
        ) : (
          diagnostics.map((d, i) => (
            <div
              key={i}
              className={`problem-item problem-item--${d.severity}`}
              onClick={() => onGotoLine(d.file, d.line, d.col)}
            >
              {ICON[d.severity]}
              <span className="problem-message">{d.message}</span>
              <span className="problem-location">
                {d.file.split("/").pop()} {d.line}:{d.col}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}