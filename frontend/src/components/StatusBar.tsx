import { TerminalSquare } from "lucide-react"
import type { FileTab } from "../App"

const LANG_LABEL: Record<string, string> = {
  python: "Python",
  typescript: "TypeScript",
  javascript: "JavaScript",
  toml: "TOML",
  cmake: "CMake",
  text: "Plain Text",
}

interface Props {
  file?: FileTab
  onToggleTerminal: () => void
}

export default function StatusBar({ file, onToggleTerminal }: Props) {
  return (
    <div className="status-bar">
      <div className="status-bar__left">
        <span className="status-item status-item--brand">⬡ BlobIDE</span>
        {file && (
          <>
            <span className="status-sep">›</span>
            <span className="status-item">{file.path}</span>
          </>
        )}
      </div>
      <div className="status-bar__right">
        {file && (
          <>
            <span className="status-item">{LANG_LABEL[file.language] ?? file.language}</span>
            <span className="status-sep">·</span>
            <span className="status-item">UTF-8</span>
            <span className="status-sep">·</span>
          </>
        )}
        <button className="status-item status-item--btn" onClick={onToggleTerminal} title="Toggle Terminal">
          <TerminalSquare size={13} strokeWidth={1.6} />
          Terminal
        </button>
      </div>
    </div>
  )
}
