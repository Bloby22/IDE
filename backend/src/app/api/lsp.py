import asyncio
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class CompletionRequest(BaseModel):
    path: str
    content: str
    line: int
    col: int
    language: str


class CompletionItem(BaseModel):
    label: str
    kind: str
    detail: str | None = None


class DiagnosticsRequest(BaseModel):
    path: str
    content: str
    language: str


class Diagnostic(BaseModel):
    line: int
    col: int
    severity: str
    message: str


async def run(cmd: list[str], stdin: str | None = None) -> tuple[str, str, int]:
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdin=asyncio.subprocess.PIPE if stdin else None,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate(stdin.encode() if stdin else None)
    return stdout.decode(errors="replace"), stderr.decode(errors="replace"), proc.returncode or 0


@router.post("/diagnostics", response_model=list[Diagnostic])
async def diagnostics(req: DiagnosticsRequest) -> list[Diagnostic]:
    results: list[Diagnostic] = []

    if req.language == "python":
        tmp = Path("/tmp/_blobide_lint.py")
        tmp.write_text(req.content, encoding="utf-8")
        stdout, _, _ = await run(["python", "-m", "py_compile", str(tmp)])
        _, stderr, _ = await run(["python", "-m", "py_compile", str(tmp)])
        for line in stderr.splitlines():
            import re
            m = re.search(r"line (\d+)", line)
            ln = int(m.group(1)) if m else 1
            if "SyntaxError" in line or "Error" in line:
                results.append(Diagnostic(line=ln, col=1, severity="error", message=line.strip()))

    if req.language in ("typescript", "javascript"):
        tmp = Path(f"/tmp/_blobide_lint.{'ts' if req.language == 'typescript' else 'js'}")
        tmp.write_text(req.content, encoding="utf-8")
        _, stderr, _ = await run(["npx", "--yes", "tsc", "--noEmit", "--strict", str(tmp)])
        for line in stderr.splitlines():
            import re
            m = re.search(r"\((\d+),(\d+)\).*?error\s+TS\d+:\s+(.*)", line)
            if m:
                results.append(Diagnostic(
                    line=int(m.group(1)),
                    col=int(m.group(2)),
                    severity="error",
                    message=m.group(3).strip(),
                ))

    return results


@router.post("/completions", response_model=list[CompletionItem])
async def completions(req: CompletionRequest) -> list[CompletionItem]:
    items: list[CompletionItem] = []

    if req.language == "python":
        script = f"""
import jedi
script = jedi.Script(source={req.content!r}, path={req.path!r})
completions = script.complete({req.line}, {req.col})
for c in completions[:30]:
    print(c.name + "\\t" + c.type + "\\t" + (c.docstring()[:80] or ""))
"""
        stdout, _, _ = await run(["python", "-c", script])
        for line in stdout.splitlines():
            parts = line.split("\t")
            if len(parts) >= 2:
                items.append(CompletionItem(label=parts[0], kind=parts[1], detail=parts[2] if len(parts) > 2 else None))

    return items