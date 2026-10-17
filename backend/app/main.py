from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db

# Import routers
from app.api.routes_status import router as status_router
from app.api.routes_matlab import router as matlab_router
from app.api.routes_verilog import router as verilog_router
from app.api.routes_debug import router as debug_router
from app.api.routes_programs import router as programs_router
from app.api.routes_history import router as history_router
from app.api.routes_experiments import router as experiments_router
from app.api.routes_reports import router as reports_router

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Smart ECE Lab – Integrated Web-Based MATLAB and Verilog Compiler, Simulation, and Intelligent Debugging Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from local Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(status_router, prefix="/api")
app.include_router(matlab_router, prefix="/api")
app.include_router(verilog_router, prefix="/api")
app.include_router(debug_router, prefix="/api")
app.include_router(programs_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(experiments_router, prefix="/api")
app.include_router(reports_router, prefix="/api")

import os
from pathlib import Path
from fastapi import HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Locate built frontend static directory
dist_candidates = [
    Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",
    Path(__file__).resolve().parent.parent / "frontend" / "dist",
    Path("/app/frontend/dist")
]
dist_path = next((p for p in dist_candidates if p.exists() and (p / "index.html").exists()), None)

if dist_path:
    assets_path = dist_path / "assets"
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Exclude API, docs, redoc, openapi.json from SPA routing
        if full_path.startswith("api") or full_path in ("docs", "redoc", "openapi.json"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_target = dist_path / full_path
        if file_target.exists() and file_target.is_file():
            return FileResponse(file_target)
        return FileResponse(dist_path / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "message": "Welcome to Smart ECE Lab API",
            "documentation": "/docs",
            "system_status": "/api/status",
            "version": settings.VERSION
        }
