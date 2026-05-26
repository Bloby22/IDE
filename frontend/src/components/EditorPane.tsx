import { useEffect } from "react"
import { X } from "lucide-react"
import type { FileTab } from "../App"
import type { Diagnostic } from "./ProblemsPanel"
import Editor from "./Editor"

const LANG_ICON: Record<string, string> = {
  python: "py",
  typescript: "ts",
  javascript: "js",
  css: "css",
  json: "{}",
  toml: "tml",
  cmake: "cmake",
  cpp: "cpp",
  rust: "rs",
  markdown: "md",
  text: "txt",
}

interface Props {
  tabs: FileTab[]
  activeTab: string
  onSelectTab: (id: string) => void
  onCloseTab: (id: string) => void
  onChangeContent: (id: string, content: string) => void
  onDiagnostics: (diags: Diagnostic[]) => void
}

export default function EditorPane({ tabs, activeTab, onSelectTab, onCloseTab, onChangeContent, onDiagnostics }: Props) {
  const currentTab = tabs.find((t) => t.id === activeTab)

  useEffect(() => {
    if (!currentTab || currentTab.content !== "") return
    fetch(`http://localhost:8000/api/files/read?path=${encodeURIComponent(currentTab.path)}`)
      .then((r) => r.json())
      .then((d) => onChangeContent(currentTab.id, d.content ?? ""))
      .catch(() => onChangeContent(currentTab.id, ""))
  }, [currentTab?.id])

  if (tabs.length === 0) {
    return (
      <div className="editor-pane editor-pane--empty">
        <div className="editor-empty">
          <div className="editor-empty__logo">⬡</div>
          <div className="editor-empty__title">CloudIDE</div>
          <div className="editor-empty__hint">Open a file from the explorer</div>
        </div>
      </div>
    )
  }

  return (
    <div className="editor-pane">
      <div className="tab-bar">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTab ? "tab--active" : ""}`}
            onClick={() => onSelectTab(tab.id)}
          >
            <span className="tab__icon">{LANG_ICON[tab.language] ?? "txt"}</span>
            <span className="tab__name">{tab.name}</span>
            {tab.dirty && <span className="tab__dot" />}
            <button
              className="tab__close"
              onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id) }}
            >
              <X size={12} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>

      <div className="editor-breadcrumb">
        {currentTab?.path.split("/").map((seg, i, arr) => (
          <span key={i}>
            <span className={i === arr.length - 1 ? "breadcrumb-active" : "breadcrumb-seg"}>{seg}</span>
            {i < arr.length - 1 && <span className="breadcrumb-sep"> › </span>}
          </span>
        ))}
      </div>

      {currentTab && (
        <Editor
          key={currentTab.id}
          file={currentTab}
          onChange={(content) => onChangeContent(currentTab.id, content)}
          onDiagnostics={onDiagnostics}
        />
      )}
    </div>
  )
}