from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

ROOT = Path(".").resolve()


def safe_path(path: str) -> Path:
    p = (ROOT / path).resolve()
    if not p.is_relative_to(ROOT):
        raise HTTPException(status_code=403, detail="Access denied")
    return p


class WriteRequest(BaseModel):
    path: str
    content: str


class RenameRequest(BaseModel):
    path: str
    new_path: str


class CreateRequest(BaseModel):
    path: str
    is_dir: bool = False


@router.get("/tree")
async def get_tree(path: str = "") -> dict:
    base = safe_path(path)
    if not base.exists():
        raise HTTPException(status_code=404, detail="Path not found")

    def build(p: Path) -> dict:
        node: dict = {"name": p.name, "path": str(p.relative_to(ROOT)).replace("\\", "/"), "type": "dir" if p.is_dir() else "file"}
        if p.is_dir():
            node["children"] = sorted(
                [build(child) for child in p.iterdir() if not child.name.startswith(".")],
                key=lambda n: (n["type"] == "file", n["name"].lower()),
            )
        return node

    return build(base)


@router.get("/read")
async def read_file(path: str) -> dict:
    p = safe_path(path)
    if not p.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    try:
        content = p.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"path": path, "content": content}


@router.post("/write")
async def write_file(req: WriteRequest) -> dict:
    p = safe_path(req.path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(req.content, encoding="utf-8")
    return {"path": req.path, "ok": True}


@router.delete("/delete")
async def delete_file(path: str) -> dict:
    p = safe_path(path)
    if not p.exists():
        raise HTTPException(status_code=404, detail="Path not found")
    if p.is_dir():
        import shutil
        shutil.rmtree(p)
    else:
        p.unlink()
    return {"path": path, "ok": True}


@router.post("/rename")
async def rename(req: RenameRequest) -> dict:
    src = safe_path(req.path)
    dst = safe_path(req.new_path)
    if not src.exists():
        raise HTTPException(status_code=404, detail="Source not found")
    dst.parent.mkdir(parents=True, exist_ok=True)
    src.rename(dst)
    return {"path": req.new_path, "ok": True}


@router.post("/create")
async def create(req: CreateRequest) -> dict:
    p = safe_path(req.path)
    if req.is_dir:
        p.mkdir(parents=True, exist_ok=True)
    else:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.touch(exist_ok=True)
    return {"path": req.path, "ok": True}