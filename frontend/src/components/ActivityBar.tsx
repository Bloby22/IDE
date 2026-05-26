import { Files, Search, GitBranch, Puzzle, Settings } from "lucide-react"
import type { Panel } from "../App"

const ICONS: { id: Panel; label: string; Icon: React.ElementType }[] = [
  { id: "explorer",   label: "Explorer",       Icon: Files     },
  { id: "search",     label: "Search",         Icon: Search    },
  { id: "git",        label: "Source Control", Icon: GitBranch },
  { id: "extensions", label: "Extensions",     Icon: Puzzle    },
]

interface Props {
  active: Panel
  onChange: (p: Panel) => void
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export default function ActivityBar({ active, onChange, sidebarOpen, onToggleSidebar }: Props) {
  return (
    <div className="activity-bar">
      <div className="activity-bar__top">
        {ICONS.map(({ id, label, Icon }) => (
          <button
            key={id}
            title={label}
            className={`activity-btn ${active === id && sidebarOpen ? "active" : ""}`}
            onClick={() => {
              if (active === id) onToggleSidebar()
              else { onChange(id); if (!sidebarOpen) onToggleSidebar() }
            }}
          >
            <Icon size={20} strokeWidth={1.6} />
          </button>
        ))}
      </div>
      <div className="activity-bar__bottom">
        <button className="activity-btn" title="Settings">
          <Settings size={20} strokeWidth={1.6} />
        </button>
      </div>
    </div>
  )
}
