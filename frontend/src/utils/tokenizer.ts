// Lightweight syntax highlighter – no deps, ~100 lines
// Returns HTML string with <span class="tok-*"> tokens

type Rule = { regex: RegExp; cls: string }

const RULES: Record<string, Rule[]> = {
  python: [
    { regex: /(#.*)/, cls: "tok-comment" },
    { regex: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|"""[\s\S]*?"""|'''[\s\S]*?''')/, cls: "tok-string" },
    { regex: /\b(def|class|import|from|return|if|elif|else|for|while|with|as|in|not|and|or|try|except|finally|pass|break|continue|lambda|yield|async|await|True|False|None|self)\b/, cls: "tok-keyword" },
    { regex: /\b([A-Z][a-zA-Z0-9_]*)\b/, cls: "tok-type" },
    { regex: /\b([a-z_][a-zA-Z0-9_]*)\s*(?=\()/, cls: "tok-func" },
    { regex: /\b(\d+\.?\d*)\b/, cls: "tok-number" },
    { regex: /(@[a-zA-Z_][a-zA-Z0-9_]*)/, cls: "tok-decorator" },
  ],
  typescript: [
    { regex: /(\/\/.*)/, cls: "tok-comment" },
    { regex: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/, cls: "tok-string" },
    { regex: /\b(import|export|from|default|const|let|var|function|return|if|else|for|while|class|interface|type|extends|implements|new|this|async|await|try|catch|finally|throw|typeof|instanceof|in|of|void|null|undefined|true|false)\b/, cls: "tok-keyword" },
    { regex: /\b([A-Z][a-zA-Z0-9_]*)\b/, cls: "tok-type" },
    { regex: /\b([a-z_][a-zA-Z0-9_]*)\s*(?=\()/, cls: "tok-func" },
    { regex: /\b(\d+\.?\d*)\b/, cls: "tok-number" },
  ],
  toml: [
    { regex: /(#.*)/, cls: "tok-comment" },
    { regex: /("(?:\\.|[^"\\])*")/, cls: "tok-string" },
    { regex: /(\[[^\]]*\])/, cls: "tok-keyword" },
    { regex: /([a-zA-Z_][a-zA-Z0-9_-]*)\s*=/, cls: "tok-func" },
    { regex: /\b(\d+\.?\d*)\b/, cls: "tok-number" },
    { regex: /\b(true|false)\b/, cls: "tok-keyword" },
  ],
  cmake: [
    { regex: /(#.*)/, cls: "tok-comment" },
    { regex: /("(?:\\.|[^"\\])*")/, cls: "tok-string" },
    { regex: /\b(cmake_minimum_required|project|add_executable|target_link_libraries|find_package|include_directories|set|if|else|endif|foreach|endforeach|function|endfunction|message|install)\b/i, cls: "tok-keyword" },
    { regex: /\$\{[^}]+\}/, cls: "tok-type" },
  ],
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export function tokenize(line: string, language: string): string {
  const rules = RULES[language]
  if (!rules) return escapeHtml(line)

  let result = ""
  let remaining = line

  while (remaining.length > 0) {
    let matched = false
    for (const { regex, cls } of rules) {
      const m = remaining.match(new RegExp("^([\\s\\S]*?)" + regex.source))
      if (m && m[0].length < remaining.length + 1) {
        const before = m[1]
        const token = m[2]
        if (before) result += escapeHtml(before)
        result += `<span class="${cls}">${escapeHtml(token)}</span>`
        remaining = remaining.slice(before.length + token.length)
        matched = true
        break
      }
    }
    if (!matched) {
      result += escapeHtml(remaining[0])
      remaining = remaining.slice(1)
    }
  }

  return result
}
