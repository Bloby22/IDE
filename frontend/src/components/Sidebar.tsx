import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react"
import type { Panel, FileTab } from "../App"

const LANG_BY_EXT: Record<string, string> = {
  py: "python",
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  css: "css",
  json: "json",
  toml: "toml",
  md: "markdown",
  txt: "text",
  cmake: "cmake",
  cpp: "cpp",
  h: "cpp",
  c: "cpp",
  rs: "rust",
}

const LANG_COLORS: Record<string, string> = {
  python: "#3b82f6",
  typescript: "#06b6d4",
  javascript: "#f59e0b",
  css: "#ec4899",
  json: "#a78bfa",
  toml: "#f59e0b",
  cmake: "#a78bfa",
  cpp: "#60a5fa",
  rust: "#fb923c",
  markdown: "#94a3b8",
  text: "#64748b",
}

interface TreeNode {
  name: string
  path: string
  type: "file" | "dir"
  children?: TreeNode[]
}

function getLang(name: string): string {
  const ext = name.split(".").pop() ?? ""
  return LANG_BY_EXT[ext] ?? "text"
}

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
  const lang = getLang(node.name)

  return (
    <div>
      <div
        className={`tree-item ${!isDir ? "tree-item--file" : ""}`}
        style={{ paddingLeft: `${6 + depth * 12}px` }}
        onClick={() => {
          if (isDir) setOpen((v) => !v)
          else
            onOpen({
              id: node.path,
              name: node.name,
              path: node.path,
              content: "",
              language: lang,
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
            style={{ color: LANG_COLORS[lang] ?? "#64748b", flexShrink: 0 }}
          />
        )}
        <span className="tree-label">{node.name}</span>
      </div>
      {isDir && open && node.children?.map((child) => (
        <TreeItem key={child.path} node={child} depth={depth + 1} onOpen={onOpen} />
      ))}
    </div>
  )
}

interface Props {
  panel: Panel
  onOpenFile: (f: FileTab) => void
}

export default function Sidebar({ panel, onOpenFile }: Props) {
  const [tree, setTree] = useState<TreeNode | null>(null)
  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState<{ file: string; line: number; text: string }[]>([])
  const [gitFiles, setGitFiles] = useState<{ status: string; path: string }[]>([])

  useEffect(() => {
    if (panel === "explorer") {
      fetch("http://localhost:8000/api/files/tree")
        .then((r) => r.json())
        .then(setTree)
        .catch(() => setTree(null))
    }
    if (panel === "git") {
      fetch("http://localhost:8000/api/git/status")
        .then((r) => r.json())
        .then((d) => setGitFiles(d.files ?? []))
        .catch(() => setGitFiles([]))
    }
  }, [panel])

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return }
    const t = setTimeout(() => {
      fetch("http://localhost:8000/api/search/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: search, max_results: 50 }),
      })
        .then((r) => r.json())
        .then(setSearchResults)
        .catch(() => setSearchResults([]))
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div className="sidebar">
      {panel === "explorer" && (
        <>
          <div className="sidebar__header">EXPLORER</div>
          <div className="sidebar__tree">
            {tree
              ? tree.children?.map((node) => (
                  <TreeItem key={node.path} node={node} depth={0} onOpen={onOpenFile} />
                ))
              : <div className="sidebar__empty">Cannot connect to backend</div>
            }
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
            <div className="search-results">
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  className="search-result-item"
                  onClick={() =>
                    onOpenFile({
                      id: r.file,
                      name: r.file.split("/").pop() ?? r.file,
                      path: r.file,
                      content: "",
                      language: getLang(r.file),
                      dirty: false,
                    })
                  }
                >
                  <span className="search-result-file">{r.file}</span>
                  <span className="search-result-line">{r.line}: {r.text}</span>
                </div>
              ))}
              {search && searchResults.length === 0 && (
                <div className="sidebar__empty">No results</div>
              )}
            </div>
          </div>
        </>
      )}

      {panel === "git" && (
        <>
          <div className="sidebar__header">SOURCE CONTROL</div>
          <div className="sidebar__tree">
            {gitFiles.length === 0
              ? <div className="sidebar__empty">No changes</div>
              : gitFiles.map((f, i) => (
                  <div
                    key={i}
                    className="tree-item tree-item--file"
                    style={{ paddingLeft: "12px" }}
                    onClick={() =>
                      onOpenFile({
                        id: f.path,
                        name: f.path.split("/").pop() ?? f.path,
                        path: f.path,
                        content: "",
                        language: getLang(f.path),
                        dirty: false,
                      })
                    }
                  >
                    <span className="git-status-badge">{f.status}</span>
                    <span className="tree-label">{f.path}</span>
                  </div>
                ))
            }
          </div>
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
