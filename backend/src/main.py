import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.terminal import router as terminal_router
from api.files import router as files_router
from api.search import router as search_router
from api.lsp import router as lsp_router
from api.git import router as git_router

app = FastAPI(
    title="CloudIDE",
    version="0.1.0",
    description="Custom IDE backend",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "tauri://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(terminal_router, prefix="/api/terminal", tags=["terminal"])
app.include_router(files_router, prefix="/api/files", tags=["files"])
app.include_router(search_router, prefix="/api/search", tags=["search"])
app.include_router(lsp_router, prefix="/api/lsp", tags=["lsp"])
app.include_router(git_router, prefix="/api/git", tags=["git"])


@app.get("/health", tags=["meta"])
async def health() -> dict:
    return {"status": "ok", "app": "CloudIDE", "version": "0.1.0"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )