import { useState } from "react"
import Sidebar from "./components/Sidebar"
import EditorPane from "./components/EditorPane"
import StatusBar from "./components/StatusBar"
import ActivityBar from "./components/ActivityBar"
import Terminal from "./components/Terminal"

export type Panel = "explorer" | "search" | "git" | "extensions"

export interface FileTab {
  id: string
  name: string
  path: string
  content: string
  language: string
  dirty: boolean
}

export default function App() {
  const [activePanel, setActivePanel] = useState<Panel>("explorer")
  const [tabs, setTabs] = useState<FileTab[]>([])
  const [activeTab, setActiveTab] = useState<string>("")
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const closeTab = (id: string) => {
    const next = tabs.filter((t) => t.id !== id)
    setTabs(next)
    if (activeTab === id) setActiveTab(next[next.length - 1]?.id ?? "")
  }

  const updateContent = (id: string, content: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, content, dirty: true } : t))
    )
  }

  const openFile = (file: FileTab) => {
    const exists = tabs.find((t) => t.id === file.id)
    if (!exists) setTabs((prev) => [...prev, file])
    setActiveTab(file.id)
  }

  const currentTab = tabs.find((t) => t.id === activeTab)

  return (
    <div className="ide-root">
      <ActivityBar
        active={activePanel}
        onChange={setActivePanel}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
      {sidebarOpen && (
        <Sidebar
          panel={activePanel}
          onOpenFile={openFile}
        />
      )}
      <div className="ide-main">
        <EditorPane
          tabs={tabs}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onCloseTab={closeTab}
          onChangeContent={updateContent}
        />
        {terminalOpen && (
          <Terminal onClose={() => setTerminalOpen(false)} />
        )}
      </div>
      <StatusBar
        file={currentTab}
        onToggleTerminal={() => setTerminalOpen((v) => !v)}
      />
    </div>
  )
}
