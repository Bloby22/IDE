import re
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

ROOT = Path(".").resolve()

IGNORED_DIRS = {".git", ".venv", "node_modules", "__pycache__", "dist", "build", "target"}
TEXT_EXTENSIONS = {
    ".py", ".ts", ".tsx", ".js", ".jsx", ".json", ".toml", ".yaml", ".yml",
    ".md", ".txt", ".css", ".html", ".cpp", ".h", ".c", ".rs", ".cmake",
}


class SearchRequest(BaseModel):
    query: str
    path: str = ""
    case_sensitive: bool = False
    use_regex: bool = False
    max_results: int = 100


class SearchMatch(BaseModel):
    file: str
    line: int
    col: int
    text: str


@router.post("/files", response_model=list[SearchMatch])
async def search_files(req: SearchRequest) -> list[SearchMatch]:
    base = (ROOT / req.path).resolve()
    results: list[SearchMatch] = []

    flags = 0 if req.case_sensitive else re.IGNORECASE
    pattern = req.query if req.use_regex else re.escape(req.query)

    try:
        regex = re.compile(pattern, flags)
    except re.error:
        return []

    for file in base.rglob("*"):
        if any(part in IGNORED_DIRS for part in file.parts):
            continue
        if not file.is_file():
            continue
        if file.suffix not in TEXT_EXTENSIONS:
            continue

        try:
            lines = file.read_text(encoding="utf-8", errors="replace").splitlines()
        except Exception:
            continue

        for i, line in enumerate(lines):
            for m in regex.finditer(line):
                results.append(SearchMatch(
                    file=str(file.relative_to(ROOT)).replace("\\", "/"),
                    line=i + 1,
                    col=m.start() + 1,
                    text=line.strip(),
                ))
                if len(results) >= req.max_results:
                    return results

    return results