import { useState } from "react"
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react"
import type { Panel, FileTab } from "../App"

const LANG_COLORS: Record<string, string> = {
  python: "#3b82f6",
  typescript: "#06b6d4",
  javascript: "#f59e0b",
  toml: "#f59e0b",
  cmake: "#a78bfa",
}

interface TreeNode {
  name: string
  type: "file" | "dir"
  lang?: string
  path?: string
  children?: TreeNode[]
}

const FILE_TREE: TreeNode[] = [
  {
    name: "backend",
    type: "dir",
    children: [
      {
        name: "src",
        type: "dir",
        children: [
          {
            name: "app",
            type: "dir",
            children: [
              { name: "main.py", type: "file", lang: "python", path: "backend/src/app/main.py" },
              { name: "pyproject.toml", type: "file", lang: "toml", path: "backend/pyproject.toml" },
            ],
          },
          {
            name: "api",
            type: "dir",
            children: [
              { name: "terminal.py", type: "file", lang: "python", path: "backend/src/app/api/terminal.py" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "frontend",
    type: "dir",
    children: [
      {
        name: "src",
        type: "dir",
        children: [
          { name: "App.tsx", type: "file", lang: "typescript", path: "frontend/src/App.tsx" },
          { name: "main.tsx", type: "file", lang: "typescript", path: "frontend/src/main.tsx" },
          { name: "routes.tsx", type: "file", lang: "typescript", path: "frontend/src/routes.tsx" },
          {
            name: "components",
            type: "dir",
            children: [
              { name: "ActivityBar.tsx", type: "file", lang: "typescript", path: "frontend/src/components/ActivityBar.tsx" },
              { name: "Sidebar.tsx",     type: "file", lang: "typescript", path: "frontend/src/components/Sidebar.tsx" },
              { name: "EditorPane.tsx",  type: "file", lang: "typescript", path: "frontend/src/components/EditorPane.tsx" },
              { name: "Editor.tsx",      type: "file", lang: "typescript", path: "frontend/src/components/Editor.tsx" },
              { name: "Terminal.tsx",    type: "file", lang: "typescript", path: "frontend/src/components/Terminal.tsx" },
              { name: "StatusBar.tsx",   type: "file", lang: "typescript", path: "frontend/src/components/StatusBar.tsx" },
            ],
          },
          {
            name: "styles",
            type: "dir",
            children: [
              { name: "global.css", type: "file", lang: "css", path: "frontend/src/styles/global.css" },
              { name: "ide.css",    type: "file", lang: "css", path: "frontend/src/styles/ide.css" },
            ],
          },
          {
            name: "utils",
            type: "dir",
            children: [
              { name: "tokenizer.ts", type: "file", lang: "typescript", path: "frontend/src/utils/tokenizer.ts" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "cpp",
    type: "dir",
    children: [
      { name: "CMakeLists.txt", type: "file", lang: "cmake", path: "cpp/CMakeLists.txt" },
    ],
  },
]

function TreeItem({
  node,
  depth,
  onOpen,
}: {
  node: TreeNode
  depth: number
  onOpen: (f: FileTab) => void
}) {
  const [open, setOpen] = useState(depth < 1)
  const isDir = node.type === "dir"

  return (
    <div>
      <div
        className={`tree-item ${!isDir ? "tree-item--file" : ""}`}
        style={{ paddingLeft: `${6 + depth * 12}px` }}
        onClick={() => {
          if (isDir) setOpen((v) => !v)
          else
            onOpen({
              id: node.path!,
              name: node.name,
              path: node.path!,
              content: "",
              language: node.lang ?? "text",
              dirty: false,
            })
        }}
      >
        {isDir ? (
          <>
            {open
              ? <ChevronDown size={12} strokeWidth={1.8} className="tree-chevron" />
              : <ChevronRight size={12} strokeWidth={1.8} className="tree-chevron" />
            }
            {open
              ? <FolderOpen size={14} strokeWidth={1.6} style={{ color: "#fbbf24", flexShrink: 0 }} />
              : <Folder size={14} strokeWidth={1.6} style={{ color: "#fbbf24", flexShrink: 0 }} />
            }
          </>
        ) : (
          <File
            size={14}
            strokeWidth={1.6}
            style={{ color: LANG_COLORS[node.lang ?? ""] ?? "#64748b", flexShrink: 0 }}
          />
        )}
        <span className="tree-label">{node.name}</span>
      </div>
      {isDir && open && node.children?.map((child) => (
        <TreeItem key={child.name + child.path} node={child} depth={depth + 1} onOpen={onOpen} />
      ))}
    </div>
  )
}

interface Props {
  panel: Panel
  onOpenFile: (f: FileTab) => void
}

export default function Sidebar({ panel, onOpenFile }: Props) {
  const [search, setSearch] = useState("")

  return (
    <div className="sidebar">
      {panel === "explorer" && (
        <>
          <div className="sidebar__header">EXPLORER</div>
          <div className="sidebar__tree">
            {FILE_TREE.map((node) => (
              <TreeItem key={node.name} node={node} depth={0} onOpen={onOpenFile} />
            ))}
          </div>
        </>
      )}
      {panel === "search" && (
        <>
          <div className="sidebar__header">SEARCH</div>
          <div className="sidebar__search">
            <input
              className="search-input"
              placeholder="Search in files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <div className="search-results">
                <div className="search-result-item">
                  <span className="search-result-file">main.py</span>
                  <span className="search-result-line">1: import uvicorn</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {panel === "git" && (
        <>
          <div className="sidebar__header">SOURCE CONTROL</div>
          <div className="sidebar__empty">No changes</div>
        </>
      )}
      {panel === "extensions" && (
        <>
          <div className="sidebar__header">EXTENSIONS</div>
          <div className="sidebar__empty">No extensions installed</div>
        </>
      )}
    </div>
  )
}